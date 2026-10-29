# References & Source Verification: Campus Lost-and-Found Portal
*(Web & Google References Edition — Excluding GitHub Links)*

This document catalogs verified website templates, working UI examples, interactive components, official Google web standards, and documentation references for building the **Campus Lost-and-Found Portal**. 

Every reference has been selected to comply strictly with the project's mandatory technology stack:
- **Frontend:** HTML5, CSS3, Bootstrap 5, Vanilla JavaScript, Fetch API, Native HTML Drag-and-Drop and Geolocation APIs.
- **Backend:** Plain Node.js using the core `http` module (no Express), `mysql2` driver connecting to MySQL/MariaDB (XAMPP).
- **Prohibited:** Express.js, React, Next.js, Angular, Tailwind CSS, Bootstrap 4, MongoDB, Firebase, Supabase, ORMs, or third-party cloud form services.

---

## 1. Verified Website Templates & Working Code References (Non-GitHub)

### 1.1 Start Bootstrap – Shop Homepage (Live Portal Template)
- **Template Name:** Start Bootstrap Shop Homepage
- **Exact URL:** [https://startbootstrap.com/template/shop-homepage](https://startbootstrap.com/template/shop-homepage)
- **Reference Type:** Complete Website Template (Catalog / Directory Layout)
- **Technologies Used:** HTML5, CSS3, Bootstrap 5.2.3, Vanilla JavaScript
- **Source Code Accessibility:** Direct downloadable template ZIP and inspectable live preview
- **Relevant Features & Components:**
  - Responsive navigation bar with mobile hamburger collapse.
  - Hero header container (`bg-dark py-5`) with high-contrast call-to-action text.
  - Responsive card grid system (`row gx-4 gx-lg-5 row-cols-2 row-cols-md-3 row-cols-xl-4 justify-content-center`).
  - Item cards with image header, floating badge overlays (`badge bg-dark text-white position-absolute`), title, description, and footer button.
- **Campus Portal Features Supported:** Public report listing card grid, responsive page layout, item badge overlays (LOST / FOUND), responsive navigation.
- **Adaptation Required:** Convert product sales cards into Lost/Found item cards with campus metadata (Category badge, Date Reported, Campus Location, Status pill, and "View Details" modal trigger).
- **Prohibited Dependencies:** None.
- **License / Attribution:** MIT License. Copyright (c) Start Bootstrap LLC.

---

### 1.2 Start Bootstrap – SB Admin (Live Dashboard Template)
- **Template Name:** Start Bootstrap SB Admin (Bootstrap 5 Edition)
- **Exact URL:** [https://startbootstrap.com/template/sb-admin](https://startbootstrap.com/template/sb-admin)
- **Reference Type:** Complete Admin Dashboard Template
- **Technologies Used:** HTML5, CSS3, Bootstrap 5, Vanilla JavaScript
- **Source Code Accessibility:** Inspectable live demo and downloadable standalone archive
- **Relevant Features & Components:**
  - Responsive administration top navbar with integrated live keyword search input group.
  - Metric summary cards with colored accents (`card bg-primary text-white`, `card bg-warning text-white`, `card bg-success text-white`, `card bg-danger text-white`).
  - Responsive table and card listings for administrative item management.
  - Modal confirmation dialogs for approving claims and deleting listings.
- **Campus Portal Features Supported:** Admin management dashboard, live search bar, statistical overview cards (Total Reports, Active Lost, Active Found, Resolved), confirmation modals.
- **Adaptation Required:** Extract compiled HTML5/Bootstrap 5 markup without Pug/SCSS dependencies. Bind metric cards and search bar to `/api/stats` and `/api/items` JSON endpoints.
- **Prohibited Dependencies:** None in compiled distribution.
- **License / Attribution:** MIT License. Copyright (c) Start Bootstrap LLC.

---

### 1.3 BootstrapMade – NiceAdmin (Bootstrap 5)
- **Template Name:** NiceAdmin Bootstrap Admin Template
- **Exact URL:** [https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/](https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/)
- **Reference Type:** Complete Admin & Management UI Template
- **Technologies Used:** HTML5, CSS3, Bootstrap 5, Vanilla JavaScript
- **Source Code Accessibility:** Inspectable live demo and downloadable free package
- **Relevant Features & Components:**
  - `forms-elements.html`: Clean form input groups, floating labels, select dropdowns, file input styling.
  - `components-modal.html`: Vertically centered modal dialogs for item resolution.
  - `components-alerts.html`: Dismissible status alert banners (`alert alert-success`, `alert alert-danger`).
  - `tables-data.html`: Status pill badges (`badge rounded-pill bg-success`, `bg-warning`, `bg-secondary`).
- **Campus Portal Features Supported:** Report submission form styling, inline user feedback alerts, status pill badges, item resolution confirmation modals.
- **Adaptation Required:** Discard third-party charting libraries (ApexCharts, Chart.js) and proprietary table plugins; adapt only clean Bootstrap 5 form, modal, and alert markup.
- **Prohibited Dependencies:** None in core layout.
- **License / Attribution:** BootstrapMade Free License (Personal/educational use with attribution).

---

### 1.4 Bootswatch – Zephyr & Flatly Themes
- **Theme Names:** Bootswatch Zephyr & Bootswatch Flatly
- **Exact URLs:** 
  - Zephyr: [https://bootswatch.com/zephyr/](https://bootswatch.com/zephyr/)
  - Flatly: [https://bootswatch.com/flatly/](https://bootswatch.com/flatly/)
- **Reference Type:** Bootstrap 5 Visual Theme and Component Reference
- **Technologies Used:** CSS3, Bootstrap 5 (compiled drop-in CSS replacement)
- **Source Code Accessibility:** Direct CDN links via jsDelivr and downloadable minified CSS
- **Relevant Features & Components:**
  - Deep academic navy/slate primary branding palette (`#1B365D` / `#2C3E50`), crisp typography, rounded cards, refined badge styles, modern button states.
- **Campus Portal Features Supported:** Replaces default generic Bootstrap look with a polished university portal aesthetic; distinct visual color coding for Lost (Crimson/Danger), Found (Teal/Success), and Resolved (Muted Slate).
- **Adaptation Required:** Direct drop-in replacement for standard Bootstrap 5 CSS via CDN or local vendor stylesheet.
- **Prohibited Dependencies:** None.
- **License / Attribution:** MIT License. Copyright (c) Thomas Park.

---

### 1.5 Google web.dev – Native HTML5 Drag and Drop Guide
- **Resource Name:** Native HTML5 Drag and Drop on the Modern Web
- **Exact URL:** [https://web.dev/articles/drag-and-drop](https://web.dev/articles/drag-and-drop)
- **Publisher:** Google Web Developers (web.dev)
- **Reference Type:** Working Implementation Guide & Architectural Best Practice
- **Technologies Used:** HTML5 Drag and Drop API, Vanilla JavaScript, CSS3
- **Source Code Accessibility:** Fully accessible interactive tutorial with source snippets
- **Relevant Features & Components:**
  - Setting elements as draggable (`draggable="true"`).
  - Event listeners: `dragstart`, `dragend`, `dragover` (with mandatory `e.preventDefault()`), `drop`.
  - Data transfer mechanism: `e.dataTransfer.setData('text/plain', id)` and `e.dataTransfer.getData('text/plain')`.
  - Managing visual drag states: CSS `.dragging` opacity and drop-target hover highlight.
- **Campus Portal Features Supported:** Interactive status progression allowing students and administrators to drag item cards between status columns ("Reported", "Pending Claim", "Resolved").
- **Adaptation Required:** On drop, trigger a background `fetch('/api/items/' + id + '/status', { method: 'PUT', ... })` to persist the new item state into MySQL in real time.
- **Prohibited Dependencies:** None (Zero external libraries).
- **License / Attribution:** Creative Commons Attribution 4.0 / Apache 2.0.

---

### 1.6 Google web.dev – User Location & Geolocation Best Practices
- **Resource Name:** User Location (Geolocation API)
- **Exact URL:** [https://web.dev/articles/user-location](https://web.dev/articles/user-location)
- **Publisher:** Google Web Developers (web.dev)
- **Reference Type:** Working Implementation Guide & Security Standard
- **Technologies Used:** Native HTML5 Geolocation API, Vanilla JavaScript
- **Source Code Accessibility:** Fully accessible practical code samples
- **Relevant Features & Components:**
  - Responsible permission requesting (triggering location check only on explicit user click, never on page load).
  - `navigator.geolocation.getCurrentPosition(success, error, options)`.
  - Secure context requirements (HTTPS or localhost).
  - Robust error handling: `PERMISSION_DENIED`, `POSITION_UNAVAILABLE`, `TIMEOUT`.
- **Campus Portal Features Supported:** "Auto-Detect My Campus Location" button inside the item report form; pre-fills coordinates and maps them to nearest campus zones (e.g. Main Library, Student Center, Science Quad).
- **Adaptation Required:** Map GPS coordinates to campus building boundary presets and provide an accessible manual dropdown fallback if geolocation is denied or unavailable.
- **Prohibited Dependencies:** None.
- **License / Attribution:** Creative Commons Attribution 4.0 / Apache 2.0.

---

### 1.7 CodePen – Native HTML5 Drag and Drop Kanban Board
- **Project Name:** Kanban Board Drag and Drop API (Vanilla JS)
- **Author:** C. Davison
- **Exact URL:** [https://codepen.io/CDavison27/pen/jOXQxWx](https://codepen.io/CDavison27/pen/jOXQxWx)
- **Reference Type:** Working Code Component
- **Technologies Used:** Native HTML5 Drag and Drop API (`draggable="true"`), CSS3, Vanilla JavaScript
- **Source Code Accessibility:** Open on CodePen
- **Relevant Features & Components:**
  - Multi-column container structure: "Reported Lost", "Found / Under Review", "Claimed / Resolved".
  - Event listeners: `dragstart`, `dragend`, `dragover`, `dragenter`, `dragleave`, `drop`.
  - Direct DOM node reparenting on drop.
- **Campus Portal Features Supported:** Kanban-style visual status board for campus lost-and-found items.
- **Adaptation Required:** Integrate with Vanilla JS `fetch()` to update database record on drop.
- **Prohibited Dependencies:** None.
- **License / Attribution:** MIT License / CodePen Public Sharing.

---

### 1.8 CodePen – Geolocation API with Coordinate Fallback
- **Project Name:** Geolocation API Demo with Fallback
- **Author:** Geoff Graham
- **Exact URL:** [https://codepen.io/geoffgraham/pen/oNxBv](https://codepen.io/geoffgraham/pen/oNxBv)
- **Reference Type:** Working Code Component
- **Technologies Used:** HTML5 Geolocation API, Vanilla JavaScript
- **Source Code Accessibility:** Open on CodePen
- **Relevant Features & Components:**
  - UI button trigger with dynamic status message ("Locating...").
  - Coordinate extraction (`coords.latitude`, `coords.longitude`, `coords.accuracy`).
  - Clear user-facing error feedback.
- **Campus Portal Features Supported:** Instant campus coordinate detection on the item submission form.
- **Adaptation Required:** Add campus building proximity calculations and wire to the submission form payload.
- **Prohibited Dependencies:** None.
- **License / Attribution:** MIT License / CodePen Public Sharing.

---

### 1.9 MDN – Node.js Static Server Without Framework
- **Project Name:** MDN Node.js Server Without a Framework Guide
- **Exact URL:** [https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Node_server_without_framework](https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Server-side/Node_server_without_framework)
- **Reference Type:** Working Implementation Reference & Source Guide
- **Technologies Used:** Plain Node.js core modules (`http`, `fs`, `path`)
- **Source Code Accessibility:** Complete runnable code published in guide
- **Relevant Features & Components:**
  - Pure `http.createServer()` handling requests without Express.
  - Path normalization and directory traversal defense (`filePath.startsWith(PUBLIC_DIR)`).
  - Extension-to-MIME-type dictionary mapping (`.html`, `.css`, `.js`, `.json`, `.png`, `.jpg`, `.svg`).
  - Asynchronous static file reading/streaming with 404 fallback handling.
- **Campus Portal Features Supported:** Serving frontend assets (`index.html`, CSS, Vanilla JS, uploaded photos) directly from the plain Node.js HTTP server.
- **Adaptation Required:** Integrate static file serving as the fallback route handler for any GET request not matching `/api/*`.
- **Prohibited Dependencies:** None (Node.js built-ins only).
- **License / Attribution:** CC0 1.0 Universal / MDN Open Documentation.

---

### 1.10 NPM Official Registry – mysql2 Driver & Connection Pool
- **Package Name:** mysql2
- **Exact URL:** [https://www.npmjs.com/package/mysql2](https://www.npmjs.com/package/mysql2)
- **Reference Type:** Official Package Documentation & Working Implementation Examples
- **Technologies Used:** Node.js, `mysql2`, MySQL/MariaDB
- **Source Code Accessibility:** Fully accessible package documentation and runnable examples
- **Relevant Features & Components:**
  - `mysql.createPool()` configuration (`host`, `user`, `password`, `database`, `waitForConnections`, `connectionLimit: 10`).
  - `pool.promise()` async/await API.
  - Parameterized prepared queries: `pool.execute('SELECT * FROM items WHERE category = ?', [cat])` and `pool.execute('INSERT INTO items (...) VALUES (?, ?)', [...])` preventing SQL injection.
- **Campus Portal Features Supported:** Database connection pooling, prevention of SQL injection, transactional status updates, CRUD persistence.
- **Adaptation Required:** Configure for local XAMPP MySQL defaults (host: `localhost`, user: `root`, password: ``, database: `campus_lost_and_found`).
- **Prohibited Dependencies:** None (`mysql2` is explicitly allowed).
- **License / Attribution:** MIT License.

---

### 1.11 W3Schools – Node.js MySQL CRUD Tutorial & Working Examples
- **Resource Name:** W3Schools Node.js MySQL Tutorial
- **Exact URL:** [https://www.w3schools.com/nodejs/nodejs_mysql.asp](https://www.w3schools.com/nodejs/nodejs_mysql.asp)
- **Reference Type:** Practical Implementation Tutorial & Working Code Examples
- **Technologies Used:** Node.js, MySQL, SQL
- **Source Code Accessibility:** Complete runnable examples with "Try it Yourself" editor
- **Relevant Features & Components:**
  - Creating databases and tables (`CREATE TABLE IF NOT EXISTS items (...)`).
  - Parameterized `INSERT INTO`, `SELECT ... WHERE`, `UPDATE ... SET`, and `DELETE FROM` statements.
  - Handling query callbacks and error states.
- **Campus Portal Features Supported:** Plain Node.js SQL CRUD query structures for items, categories, and audit logs.
- **Adaptation Required:** Modernize from callback-based queries to `mysql2/promise` async/await syntax.
- **Prohibited Dependencies:** None.
- **License / Attribution:** Educational reference / W3Schools.

---

### 1.12 Google Fonts – Academic & Modern UI Typography
- **Resource Name:** Google Fonts (Inter & Plus Jakarta Sans)
- **Exact URL:** [https://fonts.google.com/specimen/Inter](https://fonts.google.com/specimen/Inter)
- **Publisher:** Google Fonts
- **Reference Type:** Design Asset & Component Styling Reference
- **Technologies Used:** CSS3 `@import` / `<link rel="stylesheet">`
- **Source Code Accessibility:** Free open-source web fonts
- **Relevant Features & Components:**
  - High-legibility neutral sans-serif typography tailored for UI interfaces, data tables, and form inputs.
- **Campus Portal Features Supported:** Professional, university-grade visual polish across badges, headers, and card content.
- **Adaptation Required:** Link stylesheet in `index.html` header; set `font-family: 'Inter', system-ui, sans-serif;`.
- **Prohibited Dependencies:** None.
- **License / Attribution:** SIL Open Font License 1.1.

---

## 2. Official Documentation References

These official documentation sources verify technical syntax, security practices, and API specifications:

1. **Bootstrap 5.3 Official Documentation:** [https://getbootstrap.com/docs/5.3/](https://getbootstrap.com/docs/5.3/)
   - *Components Verified:* Grid system, Cards, Modal dialogs, Alerts, Badges, Input groups, Form validation styles (`.was-validated`, `.is-invalid`).
2. **Google web.dev Learn Forms Guide:** [https://web.dev/learn/forms/](https://web.dev/learn/forms/)
   - *Specifications Verified:* Accessible forms, input attributes (`required`, `minlength`, `type="file"`), client-side validation best practices.
3. **MDN Fetch API:** [https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
   - *Specifications Verified:* Asynchronous JSON requests, error response parsing (`response.ok`), custom headers (`Content-Type: application/json`).
4. **MDN HTML Drag and Drop API:** [https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
   - *Specifications Verified:* Event flow (`dragstart`, `dragover`, `drop`), `DataTransfer` methods, mandatory `e.preventDefault()` inside `dragover`.
5. **MDN Geolocation API:** [https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
   - *Specifications Verified:* `PositionOptions` (`enableHighAccuracy`, `timeout`, `maximumAge`), GeolocationPositionError codes, HTTPS security requirements.
6. **Node.js HTTP Core API:** [https://nodejs.org/api/http.html](https://nodejs.org/api/http.html)
   - *Specifications Verified:* `http.createServer()`, `req.url`, `req.method`, `res.writeHead()`, `res.end()`, stream pipe handling.
7. **Node.js Introduction & HTTP Guide:** [https://nodejs.org/en/learn/getting-started/introduction-to-nodejs](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs)
   - *Specifications Verified:* Plain Node.js event-driven server architecture.
8. **MySQL 8.4 Reference Manual:** [https://dev.mysql.com/doc/refman/8.4/en/](https://dev.mysql.com/doc/refman/8.4/en/)
   - *Specifications Verified:* Data types (`INT AUTO_INCREMENT`, `VARCHAR`, `TEXT`, `ENUM`, `DATETIME`), indexes, parameterized SQL syntax.

---

## 3. Mandatory Reference-to-Feature Mapping Matrix

| Required feature | Actual template or code reference | Exact URL | Relevant source file/component | Adaptation required |
|---|---|---|---|---|
| **Navbar and page layout** | Start Bootstrap – Shop Homepage | `https://startbootstrap.com/template/shop-homepage` | Top navbar and responsive container markup | Adapt brand to "Campus Lost & Found", add portal navigation links (Browse, Report Item, Interactive Board). |
| **Report submission form** | BootstrapMade – NiceAdmin | `https://bootstrapmade.com/nice-admin-bootstrap-admin-html-template/` | `forms-elements.html` form controls and floating labels | Add required fields (Title, Category, Type, Location, Date, Contact, Image); wire to Fetch API. |
| **Report listing cards** | Start Bootstrap – Shop Homepage & Bootswatch Zephyr | `https://startbootstrap.com/template/shop-homepage` | Card grid layout (`.card`, `.card-img-top`, `.card-body`) | Add status badges ("LOST" in warning/red, "FOUND" in teal/success), category tag, and date formatting. |
| **Search and filters** | Start Bootstrap – SB Admin | `https://startbootstrap.com/template/sb-admin` | Top search bar in navbar & filter dropdowns | Connect input event listeners to Vanilla JS filter function filtering client-side or querying `/api/items?q=...`. |
| **Create/edit/delete** | W3Schools Node.js MySQL & MDN HTTP Server | `https://www.w3schools.com/nodejs/nodejs_mysql.asp` | Parameterized SQL queries & pure HTTP handlers | Handle `GET`, `POST`, `PUT`, `DELETE` routes on `/api/items` with `mysql2` prepared statements. |
| **Database connection** | NPM mysql2 Package Documentation | `https://www.npmjs.com/package/mysql2` | Connection pool & promise wrapper configuration | Configure for local XAMPP MySQL credentials; export reusable promise pool module. |
| **Drag-and-drop resolution** | Google web.dev & CodePen Kanban (C. Davison) | `https://web.dev/articles/drag-and-drop` | `dragstart`, `dragover`, `drop` event handlers | On card drop into "Resolved" column, trigger `PUT /api/items/:id/status` to update MySQL record. |
| **Geolocation** | Google web.dev & CodePen Geolocation (G. Graham) | `https://web.dev/articles/user-location` | `navigator.geolocation.getCurrentPosition` wrapper | Map user coordinates to campus building coordinates; provide manual campus location fallback dropdown. |
| **Confirmation and feedback** | BootstrapMade – NiceAdmin & Bootstrap 5 Docs | `https://getbootstrap.com/docs/5.3/components/modal/` | Modal dialog markup (`modal-dialog-centered`) & dismissible alerts | Show feedback toast/alert on report submission; show confirmation modal before deleting or resolving an item. |

---

## 4. Incompatible Templates and Dependencies Rejected

The following candidates were evaluated and rejected due to direct conflicts with project technology restrictions:

1. **upes-open / OSoC Lost-And-Found Portal**
   - *Technologies:* React.js, Express.js, MongoDB, Mongoose
   - *Reason for Rejection:* Express, React, and MongoDB are strictly prohibited. The architecture cannot be adapted without a complete rewrite.
2. **Lakshay-Rewani Campus Lost-and-Found**
   - *Technologies:* Firebase Authentication, Firestore NoSQL Database, React
   - *Reason for Rejection:* Relies on external proprietary Firebase cloud services and React, both prohibited.
3. **Flowbite Directory & Item Cards** ([flowbite.com](https://flowbite.com/))
   - *Technologies:* Tailwind CSS, Flowbite JS
   - *Reason for Rejection:* Heavily dependent on Tailwind utility classes and Tailwind build plugins, violating the Bootstrap 5 requirement.
4. **Start Bootstrap – SB Admin 2** ([startbootstrap.com/theme/sb-admin-2](https://startbootstrap.com/theme/sb-admin-2))
   - *Technologies:* Bootstrap 4, jQuery
   - *Reason for Rejection:* Built on legacy Bootstrap 4 and jQuery; rejected in favor of the modern Bootstrap 5 version.
5. **FormBold Form Templates** ([formbold.com/templates](https://formbold.com/templates))
   - *Technologies:* Proprietary external hosted backend endpoint (`formbold.com/s/...`)
   - *Reason for Rejection:* Depends on an external third-party form ingestion service; the portal requires self-contained plain Node.js submission handling.
6. **Web3Forms Examples** ([web3forms.com](https://web3forms.com/))
   - *Technologies:* Cloud form routing API
   - *Reason for Rejection:* Requires external API key and third-party email routing service; violates self-contained local backend requirement.

---

## 5. Proposed UI Design Direction

Based on the verified web references (Start Bootstrap Shop Homepage, Bootswatch Zephyr/Flatly, NiceAdmin, and Google web.dev standards):

1. **Collegiate Visual Hierarchy & Brand Palette:**
   - **Primary Tone:** Academic Oxford Navy (`#1B365D`) for headers, brand accents, and main controls.
   - **Secondary Accent:** University Amber/Gold (`#EAAA00` or `#D97706`) for key action highlights.
   - **Canvas Background:** Soft light gray (`#F8F9FA`) preventing harsh glare and distinguishing white cards.
   - **Typography:** Google Fonts Inter / Plus Jakarta Sans for crisp, modern legibility.
   - **Status Distinctions:**
     - **LOST Items:** Warm Crimson badge (`bg-danger`), visually distinct card header.
     - **FOUND Items:** Rich Emerald badge (`bg-success`), visually distinct card header.
     - **RESOLVED Items:** Muted Slate badge (`bg-secondary`), opacity softened.
2. **Portal Architecture & Views:**
   - **Header & Navbar:** Sticky Bootstrap 5 navbar featuring the campus insignia, view switchers ("Browse Catalog", "Status Board", "Submit Report"), and real-time search.
   - **Hero Action Banner:** Welcoming title, brief campus lost-and-found guidelines, and two instant action buttons: `+ Report Lost Item` and `+ Report Found Item`.
   - **Filter Toolbar:** Sticky/prominent horizontal bar with instant keyword search, item type pill toggle (All, Lost, Found), category dropdown, and campus building filter.
   - **Dual Content Views:**
     1. **Catalog View (Default):** Responsive 3-to-4 column card grid displaying photo thumbnail, item title, date, campus location, status badge, and "View Details" trigger.
     2. **Interactive Drag-and-Drop Board:** 3 columns ("Reported", "Pending Claim", "Resolved") where items can be dragged to transition status with instant persistence to MySQL following Google web.dev Drag-and-Drop patterns.
   - **Report Modal:** Accessible modal dialog containing the report form, live image preview via `FileReader`, and "Auto-detect My Campus Location" geolocation button following Google web.dev Geolocation patterns with a manual building fallback.
3. **Feedback & Interactions:**
   - Toast/Alert banners for all network transactions (creating, updating, resolving items).
   - Centered confirmation modals for irreversible actions.
   - Zero layout shifts, accessible semantic elements, and fully responsive from mobile to desktop.
