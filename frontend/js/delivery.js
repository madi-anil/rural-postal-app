// ==========================================
// delivery.js — Delivery Module 
// ==========================================


let activeArticleId = null;
let activeAction = null;

// --- Canvas & Signature  ---
document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    if (canvas && ctx) {
        let isDrawing = false;
        
        //  canvas styling
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000080';

        function getPos(e) {
            const rect = canvas.getBoundingClientRect();
            //for mobile devices
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            return { x: clientX - rect.left, y: clientY - rect.top };
        }

        function startDrawing(e) {
            if (e.touches) e.preventDefault(); 
            isDrawing = true;
            const pos = getPos(e);
            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
        }

        function draw(e) {
            if (!isDrawing) return;
            if (e.touches) e.preventDefault();
            const pos = getPos(e);
            ctx.lineTo(pos.x, pos.y);
            ctx.stroke();
        }

        function stopDrawing() {
            isDrawing = false;
        }

        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('mousemove', draw);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('mouseout', stopDrawing);

        
        canvas.addEventListener('touchstart', startDrawing, { passive: false });
        canvas.addEventListener('touchmove', draw, { passive: false });
        canvas.addEventListener('touchend', stopDrawing);
        canvas.addEventListener('touchcancel', stopDrawing);
    }
});

function clearSignature() {
    const canvas = document.getElementById('signatureCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    if (ctx && canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

function getSignatureData() {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return null;
    return canvas.toDataURL('image/png'); // sign Export to Base64 String 
}

// ── 2. LIST RENDERING & DYNAMIC STATS ──────────────────────
async function renderDeliveryList() {
    const container = document.getElementById('delivery-list');
    if (!container) return;

    try {
        const allArticles = await window.getAllArticles();
        
        // Dynamic Stats Calculation
        const deliveredCount = allArticles.filter(a => (a.status || '').toLowerCase() === 'delivered').length;
        const pendingArticles = allArticles.filter(a => (a.status || 'Pending').toLowerCase() === 'pending');
        
        const deliveredEl = document.getElementById('delivered-count');
        const pendingEl = document.getElementById('pending-count');
        
        if (deliveredEl) deliveredEl.innerText = deliveredCount;
        if (pendingEl) pendingEl.innerText = pendingArticles.length;

        container.innerHTML = ''; 

        if (pendingArticles.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#666;">No pending articles for today.</p>';
            return;
        }

        pendingArticles.forEach(article => {
            const card = document.createElement('div');
            card.className = 'delivery-card';
            card.innerHTML = `
                <h4>${article.id}</h4>
                <p><strong>${article.recipientName || 'Unknown'}</strong></p>
                <p><small>${article.address || ''}</small></p>
                <button class="nav-button" onclick="markDelivered('${article.id}')" style="background:#28a745; margin-right:5px;">Delivered ✅</button>
                <button class="nav-button" onclick="markNotDelivered('${article.id}')" style="background:#dc3545;">Returned ❌</button>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Error loading delivery list:", error);
        container.innerHTML = '<p style="color:red; text-align:center;">Failed to load data.</p>';
    }
}

// ── 3. MODAL LOGIC & BACKDROP TOGGLES ──────────────────────
function markDelivered(articleId) {
    activeArticleId = articleId;
    activeAction = 'Delivered';
    document.getElementById('modalTitle').innerText = "Delivery Confirmation";
    document.getElementById('modalTitle').style.color = '#28a745';
    document.getElementById('deliveryInputs').style.display = 'block';
    document.getElementById('returnInputs').style.display = 'none';
    
    document.getElementById('deliveryFormModal').style.display = 'block';
    
    const backdrop = document.getElementById('modalBackdrop');
    if (backdrop) backdrop.style.display = 'block';
    
    clearSignature();
}

function markNotDelivered(articleId) {
    activeArticleId = articleId;
    activeAction = 'Returned';
    document.getElementById('modalTitle').innerText = "Return Reason";
    document.getElementById('modalTitle').style.color = '#dc3545';
    document.getElementById('deliveryInputs').style.display = 'none';
    document.getElementById('returnInputs').style.display = 'block';
    
    document.getElementById('deliveryFormModal').style.display = 'block';
    
    const backdrop = document.getElementById('modalBackdrop');
    if (backdrop) backdrop.style.display = 'block';
}

function closeDeliveryModal() {
    document.getElementById('deliveryFormModal').style.display = 'none';
    const backdrop = document.getElementById('modalBackdrop');
    if (backdrop) backdrop.style.display = 'none';
    
    activeArticleId = null;
    activeAction = null;
}

// ── 4. DATABASE UPDATE LOGIC ───────────────────────────────
async function submitModal() {
    if (!activeArticleId) return;

    let extraData = { synced: false }; 

    if (activeAction === 'Delivered') {
        const name = document.getElementById('deliveryName').value.trim();
        if (!name) {
            alert("Please enter recipient name");
            return;
        }
        extraData.receivedBy = name;
        extraData.relation = document.getElementById('deliveryRelation').value;
        extraData.signature = getSignatureData();
        extraData.deliveryTime = new Date().toLocaleString();
    } else {
        const reason = document.getElementById('reasonDropdown').value;
        if (!reason) {
            alert("Please select a return reason");
            return;
        }
        extraData.reason = reason;
        extraData.pincode = document.getElementById('returnPincode').value;
        extraData.returnTime = new Date().toLocaleString();
    }

    try {
        // Only write to IndexedDB here. Do NOT push to a local queue.
        await window.updateArticleStatus(activeArticleId, activeAction, extraData);

     
        closeDeliveryModal();

    
        document.getElementById('deliveryName').value = '';
        document.getElementById('deliveryRelation').value = '';
        document.getElementById('returnPincode').value = '';
        document.getElementById('reasonDropdown').value = '';
        clearSignature();

  
        await renderDeliveryList();

        if (navigator.onLine && typeof window.syncOfflineData === 'function') {
            window.syncOfflineData();
        }

    } catch (error) {
        console.error("Failed to update article:", error);
        alert("Database Error: Could not save the record.");
    }
}

// ── 5. EXPORTS & INITIALIZATION ────────────────────────────
window.renderDeliveryList = renderDeliveryList;
window.markDelivered = markDelivered;
window.markNotDelivered = markNotDelivered;
window.submitModal = submitModal;
window.closeDeliveryModal = closeDeliveryModal;
window.clearSignature = clearSignature;
window.getSignatureData = getSignatureData;

function initDelivery() {
    window.addEventListener('online', () => { 
        console.log('[Delivery] Online status restored.'); 
    });

    const clearBtn = document.getElementById('clearPadBtn');
    const confirmBtn = document.getElementById('confirmDeliveryBtn');
    const cancelBtn = document.getElementById('cancelDeliveryBtn');
    
    if (clearBtn) clearBtn.addEventListener('click', clearSignature);
    if (confirmBtn) confirmBtn.addEventListener('click', submitModal);
    if (cancelBtn) cancelBtn.addEventListener('click', closeDeliveryModal);
}
window.initDelivery = initDelivery;