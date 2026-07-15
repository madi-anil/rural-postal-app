// ==========================================
// login.js — 
// ==========================================

// 1. Mock Database for Auth
const POSTMEN = [
    // { id: "791120", password: "Password@123", name: "Ramesh Kumar", office: "KL University PO" },
    { id: "123456", password: "123", name: "Demo Postman", office: "Rural Branch PO" } // Demo credentials only 
];

function initLogin() {
    const loginForm = document.getElementById('loginForm');

    if (!loginForm) {
        console.error("❌ initLogin: loginForm not found in DOM");
        return;
    }

    const savedSession = localStorage.getItem('indiaPostSession');
    if (savedSession) {
        let staff;
        try {
            staff = JSON.parse(savedSession);
            console.log('⚡ Active session found. Auto-logging in:', staff.name);
            updateDashboardUI(staff);
            window.showSection('dashboard');
            return;
        } catch (e) {
            console.warn("⚠️ Corrupted session data found. Clearing session.");
            localStorage.removeItem('indiaPostSession');
            sessionStorage.clear();
        }
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const btn = document.getElementById('loginBtn');
        const originalBtnText = btn.innerText;
        btn.innerText = "Authenticating...";
        btn.disabled = true;

        const employeeId = document.getElementById('employeeId').value.trim();
        const password = document.getElementById('password').value.trim();

        // 2. ADVANCED SECURITY: Regular Expression (Regex) Validation
        const idRegex = /^\d{6}$/; // user id Forces exactly 6 numbers

        if (!employeeId || !password) {
            alert('⚠️ Security Check: Please enter both User ID and Password.');
            resetBtn(btn, originalBtnText);
            return;
        }

        if (!idRegex.test(employeeId)) {
            alert('⚠️ Invalid Format: Employee ID must be exactly 6 digits.');
            resetBtn(btn, originalBtnText);
            return;
        }

        // Simulate a tiny network delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 600));

        const staff = POSTMEN.find(p => p.id === employeeId && p.password === password);

        if (!staff) {
            alert('❌ Access Denied: Invalid User ID or Password.');
            resetBtn(btn, originalBtnText);
            return;
        }

        console.log('✅ Login successful for:', staff.name);


        // 3. ADVANCED FEATURE: Secure Session Persistence
        localStorage.setItem('indiaPostSession', JSON.stringify(staff));
        updateDashboardUI(staff);
        await loadArticlesFromBackend();

        window.showSection('dashboard');
        
        loginForm.reset();

        resetBtn(btn, originalBtnText);
    });
}

function resetBtn(btn, text) {
    if(btn) {
        btn.innerText = text;
        btn.disabled = false;
    }
}

function updateDashboardUI(staff) {
    const nameDisplay = document.getElementById('user-name-display');
    if (nameDisplay) nameDisplay.textContent = staff.name;
    
}
// NEW: Load Articles from Backend After Login
async function loadArticlesFromBackend() {
    try {
        console.log('📥 Loading articles from backend...');
        
        // Fetch articles from backend
        const response = await fetch('http://localhost:3000/api/v1/sync/articles', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer bhartiya_dak_demo_token_1010` 
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success || !Array.isArray(result.data)) {
            throw new Error('Invalid response format');
        }
        
        console.log(`✅ Received ${result.data.length} articles from backend`);
        
        // Save  article to IndexedDB
        for (const article of result.data) {
            if (!article.client_timestamp) {
                article.client_timestamp = new Date().toISOString();
            }
            if (!article.synced) {
                article.synced = false;
            }
            
            await window.saveArticle(article);
        }
        
        console.log('✅ All articles saved to IndexedDB');
        return true;
        
    } catch (error) {
        console.error('❌ Failed to load articles:', error);
        alert('⚠️ Warning: Could not load articles from server. App is offline.');
        // Continue anyway - offline-first means app still works with cached data because it is offline first
        return false;
    }
}

window.loadArticlesFromBackend = loadArticlesFromBackend;

// 4. Forgot Password Logic
function showForgotPassword() {
    alert('🔒 Security Notice: Please contact your Sub-Post Office Administrator to reset your password via the central portal.');
}

// 5. Secure Logout Logic
function logoutUser() {
    if (!confirm('Are you sure you want to securely logout?')) return;

    console.log('🚪 Terminating secure session...');

    localStorage.removeItem('indiaPostSession');

    window.showSection('login-section');
     // . Hide all main content sections
    document.querySelectorAll('main').forEach(section => {
        section.style.display = 'none';
    });

    
    const nav = document.getElementById('nav-shell');
    if (nav) nav.style.display = 'none';

    const loginWrapper = document.getElementById('login-section');
    if (loginWrapper) loginWrapper.style.display = 'block';

    const popup = document.getElementById('profilePopup');
    if (popup) {
         popup.style.display = 'none';
        popup.remove(); 
        console.log("🧹 Profile popup memory cleared");
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) loginForm.reset();

    console.log('✅ User logged out. Interface reset.');
}

// 6. Global Exports
window.initLogin = initLogin;
window.showForgotPassword = showForgotPassword;
window.logoutUser = logoutUser;