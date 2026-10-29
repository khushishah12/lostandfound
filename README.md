# Campus Lost-and-Found Portal (CampusFinder)

An authentic, responsive university web portal for tracking, reporting, and recovering lost and found belongings across campus facilities.

Built strictly in accordance with project requirements using:
- **Frontend:** HTML5, CSS3, Bootstrap 5.3, Vanilla JavaScript, Fetch API, Native HTML5 Drag and Drop API, Geolocation API, and FileReader API.
- **Backend:** Plain Node.js using the built-in `http`, `fs`, `path`, and `url` modules (Strictly **No Express**).
- **Database:** `mysql2/promise` with parameterized prepared queries connecting to MySQL/MariaDB (XAMPP default port 3306). Includes a high-fidelity memory-backed fallback mode so all interactive features, drag-and-drop, and forms function even when MySQL is offline.

---

## 📁 Project Architecture

```
c:\sem5\FSD\lpw\finallostandfound\
├── REFERENCES.md           # Source research & verified web/Google references
├── package.json            # Node.js project configuration (only 'mysql2' dependency)
├── database.sql            # Complete MySQL database schema & sample seed data
├── db.js                   # MySQL connection pool, auto-migration & prepared statements
├── server.js               # Plain Node.js HTTP server, REST API router, & static file serving
├── public/                 # Client-side static root
│   ├── index.html          # Campus single-page application with responsive views & modals
│   ├── css/
│   │   └── style.css       # Collegiate styling, drag-and-drop board, badge hierarchy
│   ├── js/
│   │   └── app.js          # Pure Vanilla JS: Fetch API, DND Kanban, Geolocation, FileReader
│   └── uploads/            # Server directory storing uploaded item photos
└── README.md               # Setup, running, and testing documentation
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v22)
- **XAMPP / MySQL** (optional for local database persistence):
  - Open the **XAMPP Control Panel**.
  - Click **Start** beside the **MySQL** module.
  - Default connection: `host: localhost`, `port: 3306`, `user: root`, `password: ''` (blank).

### 2. Running the Server

In the project root folder, start the server:

```bash
node server.js
```

You should see:
```text
======================================================
🎓 Campus Lost-and-Found Portal Server Running
   URL: http://localhost:3000/
   Database Status: MySQL Connected (or Fallback Store)
   Static Directory: C:\sem5\FSD\lpw\finallostandfound\public
======================================================
```

Open your web browser and navigate to:
👉 **[http://localhost:3000/](http://localhost:3000/)**

---

## 🛠️ Key Features & Native Browser APIs

### 1. Catalog Grid View
- Responsive 3-to-4 column grid modeled after Start Bootstrap's catalog layout with Bootswatch Zephyr typography.
- Status badges: **LOST** (Crimson `#DC2626`), **FOUND** (Emerald `#059669`), and **RESOLVED** (Slate `#4B5563`).
- Category icon tags, campus location badges, formatted dates, and "Details" modal triggers.

### 2. Interactive Drag-and-Drop Resolution Board
- Implemented using the native **HTML5 Drag and Drop API** (`draggable="true"`, `dragstart`, `dragover`, `drop`).
- Drag item cards across 3 columns:
  1. *Newly Reported*
  2. *Under Review / Claim Pending*
  3. *Claimed / Resolved*
- Dropping an item triggers a background `PUT /api/items/:id/status` request via the Fetch API, immediately persisting the status change in MySQL without page reload.

### 3. Native Geolocation with Campus Landmark Mapping
- Uses the native **HTML5 Geolocation API** (`navigator.geolocation.getCurrentPosition`).
- Clicking **"Auto-Detect"** on the report modal:
  - Prompts for browser permission.
  - Extracts device coordinates (`latitude`, `longitude`, accuracy).
  - Automatically maps the coordinates to the nearest campus landmark (e.g. Central Library, Science Complex B, Student Union Cafeteria, Sports Gym).
  - Provides an accessible manual location input fallback if permission is denied.

### 4. Drag-and-Drop Photo Upload with FileReader Preview
- Drag and drop an image file directly into the dotted upload area or click to browse.
- Uses the HTML5 `FileReader` API (`readAsDataURL`) to render an instant thumbnail preview with a removal button before form submission.
- Photos are streamed and saved on the server in `/uploads/` without external storage services.

### 5. Plain Node.js REST API (No Express)
- `GET /api/categories`: Returns campus item categories.
- `GET /api/stats`: Returns live counts (total, lost, found, resolved, categories breakdown).
- `GET /api/items`: Search and filter items (`?q=...&category=...&item_type=...`).
- `GET /api/items/:id`: Detailed record for a single item.
- `POST /api/items`: Submits new lost or found report with server-side validation.
- `PUT /api/items/:id/status`: Updates item status (used by drag-and-drop board).
- `DELETE /api/items/:id`: Removes item record with confirmation.

---

## 🔒 Verification & Compliance
- **Zero Express.js**: Built with native Node.js `http.createServer()`.
- **Zero Forbidden Frameworks**: Pure HTML5, CSS3, Bootstrap 5, and Vanilla JS.
- **SQL Injection Prevention**: All MySQL queries utilize prepared statements (`pool.execute(sql, params)`).
- **Directory Traversal Defense**: All static asset requests are sanitized against `PUBLIC_DIR`.
