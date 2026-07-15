// ==========================================
// app.js — 
// Coordinates navigation and initializes all modules
// ==========================================

// ── 1. Global Utility Functions & Routing ─────────────────────────────

function returnToHome() {
    console.log("🛡️ Safety Net: Returning to Dashboard");
    showSection('dashboard');
}
window.returnToHome = returnToHome;


function showSection(sectionId) {
    // Hide all main sections EXCEPT the navigation bar
    document.querySelectorAll('main').forEach(section => {
        if (section.id !== 'nav-shell') {
            section.style.display = 'none';
        }
    });

    const target = document.getElementById(sectionId);
    if (target) {
        target.style.display = 'block';
    } else {
        console.error(`showSection: no element with id "${sectionId}"`);
    }
    
    // Ensure nav-shell remains visible
    const nav = document.getElementById('nav-shell');
    if (nav) nav.style.display = 'block';
}
window.showSection = showSection;

document.addEventListener('click', (e) => {
    const popup = document.getElementById('profilePopup');
    const profileIcon = document.getElementById('profileIcon');
    
    if (popup && profileIcon && !profileIcon.contains(e.target) && !popup.contains(e.target)) {
        popup.style.display = 'none';
    }
});

// ── 2. Network Status Management ────────────────────────────────────

function showStatus(message, color) {
    const statusBar = document.getElementById('network-status');
    if (statusBar) {
        statusBar.innerText = message;
        statusBar.style.backgroundColor = color;
        statusBar.style.color = "white"; 
        statusBar.style.display = 'block';

        statusBar.classList.add('show'); 
         setTimeout(() => {
            statusBar.classList.remove('show');
        }, 3000);
    }
    
}

function updateNetworkStatus() {
    if (navigator.onLine) {
        showStatus('🟢 ONLINE', '#28a745');
    } else {
        showStatus('🔴 OFFLINE', '#dc3545');
    }
}


window.addEventListener('online', updateNetworkStatus);
window.addEventListener('offline', updateNetworkStatus);


// ── 3. Global Event Binding & Initialization ───────────────────────

document.addEventListener('DOMContentLoaded', async () => {
    console.log("App initializing... [System Ready -step 1-]");

    // Initialize Database and Seed Data
    // (This MUST happen before the UI tries to load data when login  )
    if (typeof window.initDB === 'function') {
        await window.initDB();      
        if (typeof window.seedDatabase === 'function') {
            await window.seedDatabase(); 
        }
    }

    // 3.2 Initialize All Feature Modules
    if (typeof window.initLogin === 'function') window.initLogin();
    if (typeof window.initDashboard === 'function') window.initDashboard();
    if (typeof window.initAcknowledge === 'function') window.initAcknowledge(); 
    if (typeof window.initDelivery === 'function') window.initDelivery();
    if (typeof window.initTracking === 'function') window.initTracking();
    if (typeof window.initReport === 'function') window.initReport();
    if (typeof window.initSync === 'function') window.initSync();

    // 3.3 Centralized Navigation Map (Event Delegation)
    const navMap = {
        'homeBtn': 'dashboard',
        'trackingBtn': 'tracking-section',
        'navDeliveryBtn': 'delivery-section',        
        'dashboardDeliveryBtn': 'delivery-section',  
        'acknowledgeBtn': 'acknowledgement-section',
        'pendingBtn': 'delivery-section',
        'reportBtn': 'report-section',
        'backFromTrackingBtn': 'dashboard',          
        'backFromReportBtn': 'dashboard'             
    };

   
    Object.keys(navMap).forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener('click', async () => {
               
                showSection(navMap[btnId]);

                
                 if (btnId === 'navDeliveryBtn' || btnId === 'dashboardDeliveryBtn' || btnId === 'pendingBtn') {
                    if (typeof window.renderDeliveryList === 'function') {
                        await window.renderDeliveryList();
                    }
                } 
                else if (btnId === 'reportBtn') {
                    if (typeof window.generateReport === 'function') {
                        await window.generateReport();
                    }
                }
            });
        }
    });


    // 3.4 Support Button (Popup, not a section switch)
    document.getElementById('supportBtn')?.addEventListener('click', () => {
        alert("Contact your postmaster or supervisor.");
    });

    // network status on load
    updateNetworkStatus();

    await updateDashboardStats();
});
