// ==========================================
// sync.js — Phase 5: Background Synchronization
// The "Store and Forward" Engine for Offline-First Architecture
// ==========================================

// Mutex lock + debounce control to prevent duplicate syncs
let isSyncing = false;
let onlineSyncTimeout = null;

// ==========================================
// CORE SYNC ENGINE
// ==========================================
async function syncOfflineData() {
    // 1. Network Detection: Abort immediately if the browser knows it is offline
    if (!navigator.onLine) {
        console.log("[Sync] Device is offline. Sync suspended.");
        return;
    }

    // 2. Mutex Lock: Abort if already syncing to prevent race conditions
    if (isSyncing) return;
    isSyncing = true;

    try {
        // 3. Fetch ONLY unsynced records from IndexedDB
      const unsyncedArticles =
    (await window.getUnsyncedArticles()) || [];

        if (unsyncedArticles.length === 0) {
            console.log("[Sync] Local queue is empty. System synchronized.");
            isSyncing = false; // Release lock
            return;
        }

        console.log(`[Sync] Found ${unsyncedArticles.length} offline records. Preparing batch payload...`);

        // 4. Build the Batch Payload for the Cloud Server
        const payload = {
            deviceId: localStorage.getItem("deviceId") || "GDS_001",
            syncTimestamp: new Date().toISOString(),
            updates: unsyncedArticles
        };

        const authToken = window.getAuthToken ? window.getAuthToken() : '';

        // 5. The Cloud Upload (now hits the correct, versioned endpoint)
        const response = await fetch('http://localhost:3000/api/v1/sync', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(payload)
        });
        
        // Protect against HTTP 500/404 Server Errors [Critical Guard]
        if (!response.ok) {
            throw new Error(`Server rejected upload: HTTP ${response.status}`);
        }

        console.log("[Sync] Upload successful. Updating local records to synced: true...");

        // 6. Mark records as synced in IndexedDB to prevent duplicate uploads
        for (const article of unsyncedArticles) {
            await window.updateArticleStatus(article.id, article.status, { synced: true });
        }

        console.log("[Sync] System synchronized successfully.");

        // 7. Refresh UI components instantly
        // Refresh the Hero Dashboard Numbers
        if (typeof window.updateDashboardStats === 'function') {
            await window.updateDashboardStats();
        }

        // Refresh Delivery List
        if (typeof window.renderDeliveryList === "function") {
            await window.renderDeliveryList();
        }

        // Dynamically refresh the Tracking screen if the user is currently viewing it
        const trackingSection = document.getElementById("tracking-section");
        if (typeof window.searchTracking === "function" && trackingSection && trackingSection.style.display === "block") {
            const input = document.getElementById("trackingInput");
            if (input && input.value.trim()) { 
                window.searchTracking(); 
            }
        }

    } catch (error) {
        // If the server crashes or internet drops mid-upload, data stays perfectly safe as synced: false!
        console.error("[Sync] Synchronization failed:", error);
    } finally {
        // 8. Always release the lock, even if there was an error
        isSyncing = false;
    }
}

// ==========================================
// INITIALIZATION ENGINE
// ==========================================
function initSync() {
    console.log("[Module] Sync Engine Initialized");

    // Debounced online listener: Waits 2 seconds after network returns to prevent flicker collision
    window.addEventListener('online', () => {
        console.log("[NETWORK] 🌐 Network restored, triggering sync...");
        clearTimeout(onlineSyncTimeout);
        onlineSyncTimeout = setTimeout(syncOfflineData, 2000);
    });

    window.addEventListener('offline', () => {
        console.log("[NETWORK] Offline mode active. Sync paused.");
    });
}

// ==========================================
// GLOBAL EXPORTS (Perfectly closed)
// ==========================================
window.syncOfflineData = syncOfflineData;
window.initSync = initSync;
