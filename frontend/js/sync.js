// ==========================================
// sync.js —
// The "Store and Forward" Engine for Offline-First Architecture
// ==========================================

let isSyncing = false;
let onlineSyncTimeout = null;

// ==========================================
// CORE SYNC ENGINE
// ==========================================
async function syncOfflineData() {
    if (!navigator.onLine) {
        console.log("[Sync]🎏 Device is offline. Sync suspended.");
        return;
    }

    if (isSyncing) return;
    isSyncing = true;

    try {
      const unsyncedArticles =
    (await window.getUnsyncedArticles()) || [];

        if (unsyncedArticles.length === 0) {
            console.log("[Sync]:-O(•ˋ _ ˊ•) Local queue is empty. System synchronized.");
            isSyncing = false; 
            return;
        }

        console.log(`[Sync] Found ${unsyncedArticles.length} offline records. Preparing batch payload...`);

        //  Build the Batch Payload for the Cloud Server
        const payload = {
            deviceId: localStorage.getItem("deviceId") || "GDS_001",
            syncTimestamp: new Date().toISOString(),
            updates: unsyncedArticles
        };

        const authToken = window.getAuthToken ? window.getAuthToken() : '';

        const response = await fetch('http://localhost:3000/api/v1/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Server rejected upload: HTTP ${response.status}`);
        }

        console.log("[Sync] Upload successful. Updating local records to synced: true...");

        for (const article of unsyncedArticles) {
            await window.updateArticleStatus(article.id, article.status, { synced: true });
        }

        console.log("[Sync] System synchronized successfully.");

        if (typeof window.updateDashboardStats === 'function') {
            await window.updateDashboardStats();
        }

        if (typeof window.renderDeliveryList === "function") {
            await window.renderDeliveryList();
        }

        const trackingSection = document.getElementById("tracking-section");
        if (typeof window.searchTracking === "function" && trackingSection && trackingSection.style.display === "block") {
            const input = document.getElementById("trackingInput");
            if (input && input.value.trim()) { 
                window.searchTracking(); 
            }
        }

    } catch (error) {
        console.error("[Sync] Synchronization failed:", error);
    } finally {
        isSyncing = false;
    }
}

// ==========================================
// INITIALIZATION ENGINE
// ==========================================
function initSync() {
    console.log("[Module] Sync Engine Initialized");

    window.addEventListener('online', () => {
        console.log("[NETWORK] 🌐 Network restored, triggering sync...");
        clearTimeout(onlineSyncTimeout);
        onlineSyncTimeout = setTimeout(syncOfflineData, 2000);
    });

    window.addEventListener('offline', () => {
        console.log("[NETWORK] 📴 Offline mode active. Sync paused.");
    });
}

// ==========================================
// GLOBAL EXPORTS (Perfectly closed)
// ==========================================
window.syncOfflineData = syncOfflineData;
window.initSync = initSync;
