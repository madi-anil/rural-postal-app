// ==========================================
// report.js — Report Module (Phase 6 - Analytics & EOD)
// Generates EOD stats securely from IndexedDB.
// Features O(N) single-pass scanning, strict type-safety, and Safe CSV Export.
// ==========================================

// Module-scoped variable to hold pending count for submission validation
let currentPendingCount = 0;

async function generateReport() {
    console.log("[Duty] Generating Delivery Report securely from IndexedDB...");
    
    const reportGrid = document.getElementById('reportGrid');
    if (!reportGrid) return;

    reportGrid.innerHTML = '<p style="text-align:center; width:100%; color:#555;">Calculating secure statistics...</p>';

    try {
        const allArticles = await window.getAllArticles();

        let delivered = 0;
        let returned = 0;
        let pending = 0;
        let syncedCount = 0;
        let pendingSyncCount = 0;

        allArticles.forEach(article => {
            const status = (article.status || '').toLowerCase();

            switch(status) {
                case 'delivered': delivered++; break;
                case 'returned': returned++; break;
                default: pending++;
            }

            if (article.synced === true) {
                syncedCount++;
            } else {
                pendingSyncCount++;
            }
        });

        currentPendingCount = pending;

        const completed = delivered + returned;
        const successRate = completed === 0 ? 0 : Math.round((delivered / completed) * 100);

        reportGrid.innerHTML = '';

        const reportData = [
            { title: "Articles Received", count: allArticles.length, color: "#555" },
            { title: "Delivered", count: delivered, color: "#28a745" },
            { title: "Returned", count: returned, color: "#dc3545" },
            { title: "Pending", count: pending, color: "#f0ad4e" },
            { title: "Synced to Cloud", count: syncedCount, color: "#17a2b8" },
            { title: "Pending Sync", count: pendingSyncCount, color: "#ffc107" },
            { title: "Delivery Success Rate", count: successRate + "%", color: "#bd0000", fullWidth: true }
        ];

        reportData.forEach(item => {
            const card = document.createElement('div');
            card.className = 'stat-card';
            if (item.fullWidth) card.style.gridColumn = "1 / -1";

            card.innerHTML = `
                <span style="color:${item.color};">${item.count}</span>
                <p style="margin-top:5px; font-weight:bold;">${item.title}</p>
            `;
            reportGrid.appendChild(card);
        });

        // ✅ ISO TIMESTAMP FIX (IMPORTANT)
        const isoTime = new Date().toISOString().split("T")[0]; 
        const readableTime = new Date().toISOString();

        const timeStampEl = document.createElement('p');
        timeStampEl.style.gridColumn = "1 / -1";
        timeStampEl.style.textAlign = "center";
        timeStampEl.style.fontSize = "0.8rem";
        timeStampEl.style.color = "#777";

        timeStampEl.innerText = `Report generated locally at: ${readableTime}`;
        reportGrid.appendChild(timeStampEl);

        // store ISO date for export safety
        reportGrid.dataset.isoDate = isoTime;

    } catch (error) {
        console.error("Failed to generate report:", error);
        reportGrid.innerHTML = '<p style="color:red; width:100%; text-align:center;">Database error. Cannot generate report.</p>';
    }
}

// ==========================================
// CSV Data Export Logic (Safe Encoding)
// ==========================================
function csvEscape(value) {
    return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

async function exportToCSV() {
    try {
        const articles = await window.getAllArticles();
        if (articles.length === 0) {
            alert("No data available to export.");
            return;
        }

        const isoDate = new Date().toISOString().split("T")[0];

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Article ID,Recipient,Address,Status,Sync Status,Action Time\n";

        articles.forEach(a => {
            const syncStatus = a.synced ? "Synced" : "Pending Sync";
            const time = a.deliveryTime || "N/A";

            const row = [
                csvEscape(a.id),
                csvEscape(a.recipientName),
                csvEscape(a.address),
                csvEscape(a.status || "Pending"),
                csvEscape(syncStatus),
                csvEscape(time)
            ].join(",");

            csvContent += row + "\n";
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);

        // ✅ FIXED: ISO SAFE FILE NAME (NO LOCALE BUGS)
        link.setAttribute("download", `EOD_Delivery_Report_${isoDate}.csv`);

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("CSV Export Failed:", error);
        alert("Failed to export report data.");
    }
}

// ==========================================
// Initialization & Guardrails
// ==========================================
function initReport() {
    console.log("[Module] Report & Analytics Initialized");

    document.getElementById("submitAccountBtn")?.addEventListener("click", () => {
        if (typeof currentPendingCount !== "number") {
            currentPendingCount = 0;
        }

        if (currentPendingCount > 0) {
            alert(`Cannot submit account. ${currentPendingCount} article(s) still pending.`);
            return;
        }

        alert("Day-End Account Submitted Successfully! Ready for server sync.");

        currentPendingCount = 0;

        if (typeof window.showSection === "function") {
            window.showSection("dashboard");
        }
    });
}

// Global Exports
window.initReport = initReport;
window.generateReport = generateReport;
window.exportToCSV = exportToCSV;