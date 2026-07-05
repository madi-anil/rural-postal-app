// ==========================================
// dashboard.js 
// ==========================================
let isDashboardInitialized = false; // <-- The Guard Variable

function initDashboard() {
    if (isDashboardInitialized) return; // <-- Prevents duplicate listeners
    isDashboardInitialized = true;

    const profileIcon = document.getElementById('profileIcon');

    if (profileIcon) {
        profileIcon.addEventListener('click', function () {
            let popup = document.getElementById('profilePopup');
            let staffName = "Unknown";
            let staffId = "N/A";

            try {
                const sessionData = localStorage.getItem("indiaPostSession");

                if (sessionData) {
                    const parsedSession = JSON.parse(sessionData);
                    staffName = parsedSession.name || "Unknown";
                    staffId = parsedSession.id || "N/A";
                }
            } catch (error) {
                console.error("Session data corrupted, clearing...", error);
                localStorage.removeItem("indiaPostSession");
            }

            if (!popup) {
                popup = document.createElement('div');
                popup.id = 'profilePopup';
                popup.className = 'profile-popup';
                document.body.appendChild(popup);
            }

            popup.innerHTML = `
            <div style="text-align:center; margin-bottom:15px;">
                <i class="fa-solid fa-circle-user" style="font-size:3rem; color:#bd0000;"></i>
            </div>
            <h4 style="text-align:center;">Postman Profile</h4>
            <div class="profile-info">
                <p><strong>Name:</strong> ${staffName}</p>
                <p><strong>ID:</strong> ${staffId}</p>
                <p><strong>Office:</strong> KL University PO</p>
            </div>
            <button onclick="logoutUser()" class="nav-button"
            style="background:#dc3545;color:white;width:100%;margin-top:10px;">
            Logout
            </button>
            `;

            popup.style.display = popup.style.display === "block" ? "none" : "block";
        });
    }

    document.addEventListener('click', function (e) {
        const popup = document.getElementById('profilePopup');
        if (popup && profileIcon && !profileIcon.contains(e.target) && !popup.contains(e.target)) {
            popup.style.display = 'none';
        }
    });

    console.log("Dashboard initialized.");
}

window.initDashboard = initDashboard;
// ==========================================
// DYNAMIC DASHBOARD STATS (Reads from db.js)
// ==========================================
async function updateDashboardStats() {
    try {
        // 1. Fetch all records directly from IndexedDB
        const allArticles = await window.getAllArticles() || [];

        // 2. Calculate Metrics Safely
        const totalCount = allArticles.length;
        const deliveredCount = allArticles.filter(a => (a.status || '').toLowerCase() === 'delivered').length;
        const returnedCount = allArticles.filter(a => (a.status || '').toLowerCase() === 'returned').length;
        const pendingCount = allArticles.filter(a => (a.status || '').toLowerCase() === 'pending').length;

        // Calculate Success Percentage
        const completed = deliveredCount + returnedCount;
        const successRate = completed === 0 ? 0 : Math.round((deliveredCount / completed) * 100); 

        // 3. Update the delivery-section stat cards
        const totalEl = document.getElementById('total-count'); 

        const pendingEl = document.getElementById('pending-count');
        const deliveredEl = document.getElementById('delivered-count');
        const percentageEl = document.getElementById('success-percentage');

        if (totalEl) totalEl.innerText = totalCount;
        if (pendingEl) pendingEl.innerText = pendingCount;
        if (deliveredEl) deliveredEl.innerText = deliveredCount;
        if (percentageEl) percentageEl.innerText = successRate + "%";

          // 4. Update the dashboard homepage hero boxes
        const heroTotalEl = document.getElementById('hero-total-count');
        const heroPendingEl = document.getElementById('hero-pending-count');
        const heroDeliveredEl = document.getElementById('hero-delivered-count');
        const heroPercentageEl = document.getElementById('hero-percentage-val');

        if (heroTotalEl) heroTotalEl.innerText = totalCount;
        if (heroPendingEl) heroPendingEl.innerText = pendingCount;
        if (heroDeliveredEl) heroDeliveredEl.innerText = deliveredCount;
        if (heroPercentageEl) heroPercentageEl.innerText = successRate + "%";

    } catch (error) {
        console.error("❌ Error updating dashboard stats:", error);
    }
}

// Export globally so other modules can trigger the refresh
window.updateDashboardStats = updateDashboardStats;