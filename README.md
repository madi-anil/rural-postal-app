# 🏤 Bhartiya Dak — Offline-First Rural Postal Delivery System
A Single Page Application for Uninterrupted Postal Operations in Connectivity-Challenged Areas

- **Academic Session:** 2026
- **Project Type**: BCA Internship sem III
- **Developed By**: Madikonda Anil (id: 24923030057)
- **GUDIE:** Rajeev Kudari

##  1.Project Overview

**Bhartiya Dak** is an offline-first Single Page Application designed to enable rural postal workers (Gramin Dak Sevaks/Postmen) to perform complete delivery operations without internet connectivity, with automatic data synchronization to a central server once connectivity is restored.
This project demonstrates practical skills in distributed systems, offline-first architecture, real-time data synchronization, and problem-solving in resource-constrained environments.

## Problem Statement

- Rural postal employees frequently work in areas with poor or zero network coverage.
- Conventional online delivery apps fail or freeze without internet, forcing a fallback to manual paperwork.
- That causes delayed updates, data loss, duplicate entries, and general inefficiency.
- Critical need: A system that ensures uninterrupted operations regardless of connectivity

## Core Solution
An offline-first architecture that:

    => Operates completely without internet
    => Automatically synchronizes data when connectivity returns
    => Preserves data integrity with precise timestamps
    => Provides real-time network status monitoring
    => Stores all data locally in browser using IndexedDB
    
## Core Mission

**"Work without internet. Sync when the internet returns — automatically."**


##  2. Key Features

| Feature                    |Description                               |
|----------------------------|------------------------------------------|
| **Offline Operations**     | Full functionality without internet      |
| **Local Data Storage**     | IndexedDB for persistent offline storage |
| **Automatic Sync**         | Background sync when network returns     |
| **Digital Signatures**     | Canvas-based signature capture           |
| **Article Acknowledgment** | Bulk intake of parcels/articles          |
| **Delivery Recording**     | Track delivery status per article        | 
| **Network Status**         | Real-time online/offline indicators      |
| **Daily Reports**          | End-of-day summary                       |
| **User Authentication**    | Login & session management               |
| **Tracking**               | Individual article tracking by ID        |



## 3.Technology Stack
______________________________________________________________
|Layer       | Technology                                     |
|------------|------------------------------------------------|
| Frontend   | HTML5, CSS3, vanilla JavaScript                |
| Local data | IndexedDB (browser-based )                     |
| Backend    | Node.js, Express                               |
| Storage    | JSON files (`articles.json`, `sync_logs.json`) |
|API Auth    |Bearer Token (API key)                          |

```
*Description*

**Frontend (browser app):**
- HTML5, CSS3, vanilla JavaScript — User interface & logic.
- Uses IndexedDB as a local database...


**Backend (central server):**
- Node.js + Express, simulating India Post's central system...

```

## 📁 4.Project Directory Structure

```
rural-postal-app/
│
├── frontend/                          # Single Page Application
│   ├── po_index.html                  # Main HTML shell & UI
│   ├── css/
│   │   └── po-styles.css              # Responsive styling
│   └── js/
│       ├── app.js                     # Navigation & network monitoring
│       ├── login.js                   # Authentication & session management
│       ├── db.js                      # IndexedDB interface
│       ├── dashboard.js               # Dashboard, stats & user profile
│       ├── Acknowledge.js             # Article intake workflow
│       ├── delivery.js                # Delivery operations & signatures capture
│       ├── tracking.js                # Article tracking module
│       ├── report.js                  # Daily reports
│       └── sync.js                    # Background sync engine
│
└── backend/                           # Central Sync Server
    ├── server.js                      # Express API server (Port 3000)
    ├── database.js                    # JSON database utilities
    ├── seed.js                        # Sample data generator
    ├── routes/
    │   └── sync.js                    # Sync API handlers
    ├── data/
    │   ├── articles.json              # Central article ledger
    │   └── sync_logs.json             # Sync audit trail
    ├── .env                           # Environment configuration
    └── package.json                   #  Node.js Dependencies

```

## 5.Running It

### **Backend**
**Step 1:** Booting the Server Engine
Open a terminal instance inside the backend/ directory path and run:

```bash
cd backend
npm install
npm start          
```

Starts on `http://localhost:3000` (see `.env` for `PORT`, `FRONTEND_URL`, `API_KEY`).

=> seed the server-side ledger with 5 demo articles:

```bash
node seed.js
```

### **Frontend**

```
Open `liveserver(http://localhost:5500/po_index.html)` Golive.
```
```
**Demo login:** Employee ID `123456`, Password `123`.
```

## 6.App Workflow

### Daily Operations

1. **Morning Login**
   - Postman logs in via WiFi/mobile data
   - System downloads assigned/invocied articles from backend
   - Article stored locally in IndexdDB

2. **Offline Delivery Operations**
   - Record delivery status (Pending → Delivered/Returned)
   - Capture digital signature on canvas
   - All data stored locally in IndexedDB with timestamps and function without internet

3. **Network Detection**
   - App continuously monitors connectivity
   - Shows network status: 🟢 ONLINE / 🔴 OFFLINE
   - Status bar shows real-time connection state

4. **Automatic Synchronization**
   - When internet returns, background sync activates
   - Collects all unsynced records from IndexedDB
   - Sends batch update to backend via `/api/v1/sync`

5. **Server Processing**
   - Backend receives and merges updates
   - Resolves conflicts using Last-Write-Wins (LWW)
   - Updates central `articles.json`
   - Returns success response

6. **Local Cleanup**
   - Frontend clears synced records from IndexedDB
   - Maintains operational continuity


## Key Features

- Offline-first architecture — full functionality with no internet.
- Login and session persistence (demo-grade, see "Known Issues" below).
- Parcel acknowledgment (bulk intake) and per-article status updates.
- Digital signature capture on a touch/mouse canvas.
- Local persistent storage via IndexedDB.
- Background sync engine.
- Article tracking by ID and an end-of-day report.
- Responsive layout for mobile, tablet.



## 7.API Reference

| Method | Endpoint                 | Auth | Description                            |
|--------|--------------------------|------|----------------------------------------|
| GET    | `/`                      | No   | Health check                           |
| GET    | `/api/v1/sync/articles`  | Yes  | Fetch all articles                     |
| POST   | `/api/v1/sync`           | Yes  | Upload a batch of offline updates      |

All non-root endpoints require `Authorization: Bearer <API_KEY>`.

### Health Check
```
GET /
```
Returns server status, uptime, and memory usage.

### Fetch Articles
```
GET /api/v1/sync/articles
Headers: Authorization: Bearer <API_KEY>
```
Returns all articles from the central ledger.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ART001",
      "recipient_name": "John Doe",
      "status": "Delivered",
      "delivery_timestamp": "2026-07-05T10:30:00Z",
      "signature_base64": "data:image/png;base64,..."
    }
  ]
}
```

### Sync Offline Updates
```
POST /api/v1/sync
Headers: 
  Authorization: Bearer <API_KEY>
  Content-Type: application/json

Body: 
{
  "updates": [
    {
      "id": "ART002",
      "status": "Returned",
      "reason": "Address not found",
      "client_timestamp": "2026-07-05T09:15:00Z"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "2 records synced successfully",
  "synced_count": 2
}
```
## API Authentication

All API endpoints (except health check) require Bearer token authentication:

```javascript
const headers = {
  'Authorization': 'Bearer bhartiya_dak_demo_token_1010',
  'Content-Type': 'application/json'
};
```

Token Configuration in backend/.env:

```
API_KEY=bhartiya_dak_demo_token_1010
```

## 8. Configuration

Edit `backend/.env` to customize:

```
PORT=3000                                  # Server port
NODE_ENV=development                       # Environment
FRONTEND_URL=http://localhost:5500         # CORS origin
API_KEY=bhartiya_dak_demo_token_1010      # Authentication token
```
## 9. Data Models

### Article (stored in IndexedDB & backend)
```javascript
{
  id: "ART001",                              // Unique identifier
  recipient_name: "John Doe",                // Delivery recipient
  address: "123 Main St, Village",           // Delivery address
  status: "Pending|Delivered|Returned",      // Current status
  delivery_timestamp: "2026-07-05T10:30Z",   // Delivery time
  signature_base64: "data:image/png;base64...", // Digital signature
  return_reason: "Address not found",        // If returned
  synced: false,                             // Sync status
  client_timestamp: "2026-07-05T10:15Z"      // Client-side timestamp
}
```

## **10. Features by Module**

### `app.js` — Master Orchestrator
- Centralized SPA navigation
- Network status monitoring
- Global event binding
- Module initialization

### `login.js` — Authentication
- User login & validation
- Session persistence in localStorage
- Auto-login on page reload
- Secure logout with session clearing

### `db.js` — IndexedDB Interface
- Create/read/update articles locally
- Save and retrieve offline records
- Track sync status

### `dashboard.js` — Metrics & Profile
- Display user profile
- Show delivery statistics (Total, Pending, Delivered, %)
- Quick-access buttons

### `Acknowledge.js` — Article Intake
- Bulk add articles to local store
- Assign articles to postman
- Display acknowledgment status

### `delivery.js` — Core Operations
- Mark articles as delivered/returned
- Canvas-based signature capture
- Save delivery records with timestamps
- Signature image to Base64 conversion

### `sync.js` — Background Synchronization
- Monitor network status
- Queue offline updates
- Batch send to backend on reconnection
- Handle sync success/failure

### `tracking.js` — Article Search
- Search articles by ID
- View delivery history
- Check current status

### `report.js` — Daily Reporting
- Generate end-of-day summary report
- Filter articles by delivery status
- Calculate daily statistics
- View detailed delivery logs
- update to server


## 11.Testing the Offline-First Architecture

1. **Start both backend & frontend**

```
  bash
    # Terminal 1: Backend
   cd backend && npm start
   
   # Terminal 2: Frontend
   cd frontend && npx serve -l 5500
   
```

2. **Log in** with demo credentials
 
Open (local server or by Clicking on Go live) http://localhost:5500/po_index.html
Use demo credentials (ID: 123456, Password: 123)

3. **Create test articles:**

Navigate to Acknowledge section
Add articles with different recipients

4. **Perform deliveries offline:**

Disconnect network (DevTools → Network → Offline)
Mark articles as delivered
Capture signatures on canvas
Verify data saves locally without internet

5. **Reconnect and sync:**

Restore network connection
Watch network indicator turn 🟢 ONLINE
Observe automatic sync trigger
Data will batch-send to backend

6. **Verify synchronization:**

Check browser DevTools → Application → IndexedDB
Articles should show synced: true
Check backend/data/articles.json
Verify all deliveries appear with timestamps


##  12. Current Limitations

As focused on internship project, the following are development-phase considerations:


**Authentication:** Uses demo credentials for testing 
**IndexedDB Management:** Manual clearing available via browser DevTools
**Error Recovery:** Basic error handling; production version would include retry logic
**API Responses:** Development-focused messages; production would use standardized formats
**Signature Storage:** Currently stored as Base64 in JSON; production would use file storage


<!-- 
- Demo login credentials used (not for production)
- No password hashing implemented
- IndexedDB cleanup is manual (clear from browser DevTools)
- Limited error recovery in sync failures
- Development-focused API responses

- **`app.js` nav handler still checks for the wrong button IDs.** The line
  `if (btnId === 'deliveryBtn' || btnId === 'deliverybtn' || btnId === 'pendingBtn')` never
  matches, because the actual keys in `navMap` are `navDeliveryBtn` and `dashboardDeliveryBtn`.
  Fix: change the condition to check those two IDs instead.
- **`updateArticleStatus()` in `db.js`** only adds fields via `Object.assign` and never clears
  the previous status's fields — an article flipped between Delivered and Returned keeps both
  sets of fields (delivery signature info *and* a return reason) at once.
- **`database.js` and `datastore.js`** are two separate, overlapping JSON-file helpers —
  `database.js` backs the live API, `datastore.js` is only used by `seed.js`.
- **`server.js`** still stacks three separate `cors()` calls (redundant) and imports
  `initializeDatabase` from `database.js`, which doesn't export any such function.
- **`backend/uploads/signatures/`** is an empty folder — scaffolded for saving signatures as
  files but not wired up anywhere; signatures are currently stored as base64 strings directly
  inside `articles.json`.
- **`backend/data/sync_logs.json`** exists but nothing reads or writes to it.
- Leftover development comments (`🟢 THE FIX`, `✅ Fix N`, `💡 Improvement N`) are still present
  in several files (`db.js`, `Acknowledge.js`, `server.js`, `login.js`, `tracking.js`).
- Demo login and seed data are for local testing only — no real authentication or password
  hashing, so this isn't production-ready as-is. -->

  ##  13.Testing Checklist

- Login and logout functions smoothly
- Offline data storage in IndexedDB functional
- Signature capture on canvas works correctly
- Network status indicators display accurately
- Automatic sync triggers on reconnection
- Data persists after page refresh
- Backend receives and processes sync updates
- Articles.json updates correctly on server
- Responsive design works on mobile devices and tablets
- No data loss during offline operations
- Timestamps remain accurate across sync

## Objectives

- Uninterrupted postal operations regardless of network status.
- Reduced dependence on unreliable rural internet.
- Fewer manual-paperwork errors and duplicate entries.
- A lightweight, demonstrable offline-first + sync architecture.
