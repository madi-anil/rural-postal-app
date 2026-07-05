// ==========================================
// tracking.js — Tracking Module
// Handles offline article tracking, verification, and timeline UI.
// ==========================================

/**
 * Main function to search for an article
 */
async function searchTracking() {
    const trackingInput = document.getElementById('trackingInput');
    const trackingResult = document.getElementById('trackingResult');
    const searchBtn = document.getElementById('searchTrackingBtn'); // Ensure your HTML button has this ID

    if (!trackingInput || !trackingResult) return;

    // Normalize the searched ID by removing accidental spaces
    const articleId = trackingInput.value
        .trim()
        .replace(/\s+/g, "")
        .toUpperCase();

    if (!articleId) {
        alert("Please enter a tracking number.");
        return;
    }

    // Prevent accidental double-click searches
    if (searchBtn) {
        searchBtn.disabled = true;
    }

    // Show loading state
    trackingResult.innerHTML = '<p style="text-align:center; color:#555;">Searching secure local database...</p>';
    trackingResult.style.display = 'block';

    try {
        // Fast lookup using getArticleById() from IndexedDB
        const article = await window.getArticleById(articleId);

        if (article) {
            displayTrackingResult(article, trackingResult);
            // Clear the input field for a cleaner UX
            trackingInput.value = "";
        } else {
            // Show the user exactly what ID failed
            trackingResult.innerHTML = `<p style="color:red; text-align:center; font-weight:bold;">❌ No article found for: ${articleId}</p>`;
        }
    } catch (error) {
        console.error("Error searching article:", error);
        trackingResult.innerHTML = '<p style="color:red; text-align:center;">Database error occurred.</p>';
    } finally {
        // Re-enable the button safely after the query finishes
        if (searchBtn) {
            searchBtn.disabled = false;
        }
    }
}

/**
 * Updates the UI with the found article data
 */
function displayTrackingResult(article, resultDiv) {
    // Prevent crash if status is missing (Defensive Programming)
    const status = (article.status || 'Pending').toLowerCase();

    let statusColor = '#f0ad4e'; // Default: Pending (Orange)
    let statusIcon = '⏳';
    let extraDetailsHTML = '';

    if (status === 'delivered') {
        statusColor = '#28a745'; // Green
        statusIcon = '✅';
        
        extraDetailsHTML = `
            <p><strong>Received By:</strong> ${article.receivedBy || 'Unknown'} (${article.relation || 'N/A'})</p>
            <p><strong>Delivery Time:</strong> ${article.deliveryTime || 'Unknown Time'}</p>
            ${article.signature ? `
            <div style="margin-top:15px;">
                <strong>Recipient Signature:</strong><br>
                <img src="${article.signature}" alt="Recipient Signature" style="max-width:100%; border:1px solid #ccc; border-radius:8px; margin-top:8px; background:white;">
            </div>` : ''}
        `;
    } else if (status === 'returned') {
        statusColor = '#dc3545'; // Red
        statusIcon = '❌';
        
        extraDetailsHTML = `
            <p style="color: #dc3545;"><strong>Return Reason:</strong> ${article.reason || 'Not Specified'}</p>
            ${article.pincode ? `<p><strong>Redirect Pincode:</strong> ${article.pincode}</p>` : ''}
        `;
    }

    // Displays exactly what data has been stored locally vs. pushed up to the cloud 
    const syncBadge = article.synced === true
        ? `<span style="background:#28a745; color:white; padding:3px 8px; border-radius:12px; font-size:0.75rem; margin-left:10px;">Synced</span>`
        : `<span style="background:#ffc107; color:black; padding:3px 8px; border-radius:12px; font-size:0.75rem; margin-left:10px; animation: pulse 2s infinite;">Pending Sync</span>`;

    const html = `
        <div class="status-header">
            <div>
                <strong>Current Status</strong> ${syncBadge}<br>
                <span style="color:${statusColor}; font-size:1.3rem; font-weight:bold;">
                    ${(article.status || 'Pending').toUpperCase()}
                </span>
            </div>
            <div style="text-align:right;">
                <span style="background:${statusColor}; color:white; padding:8px 12px; border-radius:50%; font-size: 1.2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                    ${statusIcon}
                </span>
            </div>
        </div>
        
        <div class="tracking-detail" style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 20px;">
            <h5 style="color:#bd0000; margin-bottom:10px;">Item Details</h5>
            <p><strong>Article ID:</strong> ${article.id}</p>
            <p><strong>Recipient:</strong> ${article.recipientName || 'Unknown'}</p>
            <p><strong>Address:</strong> ${article.address || 'No Address Provided'}</p>
            ${article.articleType ? `<p><strong>Type:</strong> ${article.articleType}</p>` : ''}
        </div>

        ${extraDetailsHTML ? `
        <div class="tracking-detail" style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 15px; border-left: 4px solid ${statusColor};">
            <h5 style="color:${statusColor}; margin-bottom:10px;">Action Details</h5>
            ${extraDetailsHTML}
        </div>` : ''}
    `;

    resultDiv.innerHTML = html;
}

// Auto-search on "Enter" key press
function initTracking() {
    const input = document.getElementById("trackingInput");
    
    if (input) {
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                searchTracking();
            }
        });
    }
    
    console.log("[Module] Tracking Initialized");
}

// Global Exports
window.searchTracking = searchTracking;
window.initTracking = initTracking;
