// ==========================================
// Acknowledge.js — ACKNOWLEDGE MODULE (Phase 4/5 Optimized)
// Handles article ingestion and local IndexedDB saving
// ==========================================

// SAFE MODULE FLAG (prevents redeclaration issues across reloads)
window.isAcknowledgeInitialized = window.isAcknowledgeInitialized || false;

function initAcknowledge() {

    // Prevent duplicate initialization
    if (window.isAcknowledgeInitialized) return;
    window.isAcknowledgeInitialized = true;

    console.log("[Module] Acknowledge Initialized");

    // ── ROOT SAFE BINDING ─────────────────────────────
    const root = document.querySelector(".main-frame");

    root?.addEventListener("click", (e) => {
        const parcelBtn = e.target.closest('#parcelCard');
        const speedBtn = e.target.closest('#speedPostCard');

        const grid = document.getElementById('article-categories-grid');
        const parcelSection = document.getElementById('parcel-section');
        const speedSection = document.getElementById('speedpost-section');

        if (parcelBtn) {
            if (grid) grid.style.display = 'none';
            if (parcelSection) parcelSection.style.display = 'block';
            if (speedSection) speedSection.style.display = 'none';
        }

        if (speedBtn) {
            if (grid) grid.style.display = 'none';
            if (speedSection) speedSection.style.display = 'block';
            if (parcelSection) parcelSection.style.display = 'none';
        }
    });

    // ── BACK BUTTONS (SAFE) ──────────────────────────
    const backParcel = document.getElementById('backFromParcel');
    if (backParcel) {
        backParcel.addEventListener('click', () => {
            const parcelSection = document.getElementById('parcel-section');
            const grid = document.getElementById('article-categories-grid');

            if (parcelSection) parcelSection.style.display = 'none';
            if (grid) grid.style.display = 'grid';
        });
    }

    const backSpeed = document.getElementById('backFromSpeedPost');
    if (backSpeed) {
        backSpeed.addEventListener('click', () => {
            const speedSection = document.getElementById('speedpost-section');
            const grid = document.getElementById('article-categories-grid');

            if (speedSection) speedSection.style.display = 'none';
            if (grid) grid.style.display = 'grid';
        });
    }

    // ── ACCEPT BUTTON (SAFE + MODAL) ─────────────────
    const acceptBtn = document.getElementById('acceptBtn');

    if (acceptBtn) {
        acceptBtn.addEventListener('click', async () => {

            acceptBtn.innerText = "Syncing with Database...";
            acceptBtn.style.backgroundColor = "#ffc107";

            const popup = document.createElement('div');
            popup.className = 'support-popup';

          // Calculate real article count
            const allArticles = await window.getAllArticles();
            const totalCount = allArticles.length;

            popup.innerHTML = `
                <div class="popup-content">
                    <h4>Article Receipt Confirmation</h4>
                    <p>Total Articles Received : ${totalCount}</p>
                    <button id="confirmReceiptBtn">Confirm</button>
                </div>
            `;

    
            const mainFrame = document.querySelector('.main-frame');

            if (mainFrame) {
                mainFrame.appendChild(popup);
            } else {
                document.body.appendChild(popup);
            }

            // ESC key closes popup (SAFE bind)
            const escHandler = (e) => {
                if (e.key === "Escape") {
                    popup.remove();
                    document.removeEventListener("keydown", escHandler);
                }
            };

            document.addEventListener("keydown", escHandler);

            const confirmBtn = document.getElementById('confirmReceiptBtn');

            if (confirmBtn) {
                confirmBtn.addEventListener('click', async () => {

                    popup.remove();
                    document.removeEventListener("keydown", escHandler);
// Get REAL articles from IndexedDB (not hardcoded)
const newArticles = await window.getAllArticles();

if (newArticles.length === 0) {
    alert("❌ No articles to acknowledge. Contact your postmaster.");
    popup.remove();
    return;
}

// Mark all as status "Pending" if not already set
newArticles.forEach(article => {
    if (!article.status) article.status = 'Pending';
    if (!article.synced) article.synced = false;
    if (!article.client_timestamp) {
        article.client_timestamp = new Date().toISOString();
    }
});
                    try {
                        // Save articles
for (const article of newArticles) {
    if (window.saveArticle) {
        await window.saveArticle(article);
    }
}

// Refresh Dashboard
if (typeof window.updateDashboardStats === "function") {
    await window.updateDashboardStats();
}

// Reset UI
const spans = document.querySelectorAll('#acknowledgement-section .stat-card span');
spans.forEach(span => span.innerText = "0");

const catSpans = document.querySelectorAll('#article-categories-grid .stat-card span');
catSpans.forEach(span => span.innerText = "0");

// Reset button
acceptBtn.innerText = "Accept Articles";
acceptBtn.style.backgroundColor = "";

// One success message
alert("Articles Acknowledged Successfully & Saved Offline!");

// Return to dashboard
window.showSection("dashboard");

                    } catch (error) {
                        console.error("Database Error:", error);
                        alert("Database Error: Failed to save to IndexedDB.");
                    }
                });
            }
        });
    }
}

// Global export
window.initAcknowledge = initAcknowledge;