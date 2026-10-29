/**
 * db.js - MySQL Connection Pool & Auto-Initialization Module
 *
 * REFERENCES:
 * MySQL2 documentation:
 * https://sidorares.github.io/node-mysql2/docs
 *
 * MySQL2 Promise API:
 * https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper
 *
 * Node.js Modules:
 * https://nodejs.org/api/modules.html
 *
 * Node.js File System:
 * https://nodejs.org/api/fs.html
 *
 * Node.js Path:
 * https://nodejs.org/api/path.html
 *
 * Uses 'mysql2/promise' as required by project specifications.
 * Compatible with XAMPP MySQL / MariaDB.
 */

const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

// REFERENCE: Node.js environment variables
// https://nodejs.org/api/process.html#processenv
//
// REFERENCE: MySQL connection options
// https://sidorares.github.io/node-mysql2/docs
//
// REFERENCE: MySQL CREATE DATABASE
// https://dev.mysql.com/doc/refman/8.4/en/create-database.html

const DB_CONFIG = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'campus_lost_and_found',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000
};

let pool = null;
let isConnected = false;
let useFallbackStore = false;

// REFERENCE: JavaScript arrays and objects
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects
//
// These in-memory categories are used when MySQL is unavailable.

let fallbackCategories = [
  { id: 1, name: 'Electronics & Gadgets', icon: 'bi-laptop', description: 'Laptops, chargers, phones, headphones, calculators, USB drives' },
  { id: 2, name: 'Student IDs & Cards', icon: 'bi-person-badge', description: 'Campus ID cards, driver licenses, transit cards, credit/debit cards' },
  { id: 3, name: 'Keys & Access Badges', icon: 'bi-key', description: 'Dorm room keys, vehicle keys, lanyards, RFID fobs' },
  { id: 4, name: 'Books & Notebooks', icon: 'bi-book', description: 'Textbooks, course binders, spiral notebooks, sketchbooks' },
  { id: 5, name: 'Wallets & Bags', icon: 'bi-wallet2', description: 'Wallets, purses, backpacks, gym duffels, pencil pouches' },
  { id: 6, name: 'Clothing & Apparel', icon: 'bi-tag', description: 'Jackets, hoodies, caps, scarves, umbrellas, sunglasses' },
  { id: 7, name: 'Bottles & Personal Items', icon: 'bi-cup-straw', description: 'Water bottles, thermos flasks, glasses, jewelry, watches' },
  { id: 8, name: 'Other Campus Items', icon: 'bi-box-seam', description: 'Musical instruments, lab equipment, miscellaneous belongings' }
];

// REFERENCE: JavaScript arrays and objects
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
//
// Sample records used to initialize the database or as fallback data.

let fallbackItems = [
  {
    id: 1,
    title: 'Apple Airpods',
    category: 'Electronics & Gadgets',
    item_type: 'lost',
    status: 'reported',
    description: 'White AirPods Pro in a matte black case with a Naruto cloud sticker. Misplaced during the afternoon CS301 lecture.',
    location_name: 'Science Complex B - Room 204',
    latitude: 19.076090,
    longitude: 72.877426,
    date_occurred: '2026-10-27',
    contact_name: 'Aarav Sharma',
    contact_email: 'aarav.sharma@campus.edu',
    contact_phone: '+91 98765 43210',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVuP4nyIGoaxX2GVZKZ4i1p3jq4indIM_V-sdWbz-8rA&s=10',
    resolved_notes: null,
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 2,
    title: 'bottle',
    category: 'Bottles & Personal Items',
    item_type: 'found',
    status: 'reported',
    description: 'Found on the second floor silent study zone next to window cubicle 14. Has several stickers and a slight dent on the base.',
    location_name: 'Central Campus Library - 2nd Floor',
    latitude: 19.076800,
    longitude: 72.878100,
    date_occurred: '2026-10-26',
    contact_name: 'Campus Security Desk',
    contact_email: 'security.lostfound@campus.edu',
    contact_phone: '+91 98200 11223',
    image_url: 'https://share.google/esyqjP4XFK7zn4CWM',
    resolved_notes: null,
    created_at: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: 3,
    title: 'Student id card',
    category: 'Student IDs & Cards',
    item_type: 'found',
    status: 'pending_claim',
    description: 'Official University Student Identity Card belonging to Priyanshu Patel (Roll No: 22BCSE104). Left at the cafeteria payment counter.',
    location_name: 'Student Union Cafeteria',
    latitude: 19.075400,
    longitude: 72.876500,
    date_occurred: '2026-10-27',
    contact_name: 'Cafeteria Manager',
    contact_email: 'cafeteria@campus.edu',
    contact_phone: '+91 98111 22334',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQ6NzZyPkMn0RLZ_LfkfaDVgxvYAx36DAqf615Cy3R7w&s=10',
    resolved_notes: 'Student contacted via college email; awaiting pickup.',
    created_at: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 4,
    title: 'casio calculator',
    category: 'Electronics & Gadgets',
    item_type: 'lost',
    status: 'reported',
    description: 'Black scientific calculator with slide-on cover. Left behind after Math examination. Has student initials "R.K." written on back.',
    location_name: 'Engineering Hall - Exam Room 12',
    latitude: 19.077200,
    longitude: 72.879000,
    date_occurred: '2026-10-25',
    contact_name: 'Rohan Kulkarni',
    contact_email: 'rohan.k@campus.edu',
    contact_phone: '+91 97654 32109',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWmEXSk-qgcu4NWNen0lnyVtDxq5-Qf_l7_yzDRQ-QoQ&s=10',
    resolved_notes: null,
    created_at: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: 5,
    title: 'keys',
    category: 'Keys & Access Badges',
    item_type: 'found',
    status: 'reported',
    description: 'Set of 3 brass keys and an electronic RFID access fob attached to a maroon "Campus Hostel Block C" lanyard.',
    location_name: 'Hostel Block C Entrance Lawn',
    latitude: 19.074500,
    longitude: 72.875200,
    date_occurred: '2026-10-28',
    contact_name: 'Warden Office Block C',
    contact_email: 'warden.c@campus.edu',
    contact_phone: '+91 98333 44556',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7jJrQ2_Px0yp5FM9fmL7hPu6jFmMWgzUE3QKeR0MUWw&s=10',
    resolved_notes: null,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    title: 'bag',
    category: 'Wallets & Bags',
    item_type: 'lost',
    status: 'pending_claim',
    description: 'Black water-resistant backpack containing 2 spiral notebooks and a blue pencil pouch. No electronic items inside.',
    location_name: 'Campus Transit Center - Bus Stop A',
    latitude: 19.073900,
    longitude: 72.874100,
    date_occurred: '2026-10-24',
    contact_name: 'Ananya Iyer',
    contact_email: 'ananya.i@campus.edu',
    contact_phone: '+91 99887 76655',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw3Y8LUfNdYsl64SB-OLfQJ31tDBsc2PSZE-ppEi_yVA&s=10',
    resolved_notes: 'Reported seeing bag with shuttle driver; verifying identification.',
    created_at: new Date(Date.now() - 345600000).toISOString()
  },
  {
    id: 7,
    title: 'hoodie',
    category: 'Clothing & Apparel',
    item_type: 'found',
    status: 'resolved',
    description: 'Heather gray hooded sweatshirt with university crest printed on front chest. Recovered from bleachers after evening basketball game.',
    location_name: 'Indoor Sports Complex & Gymnasium',
    latitude: 19.078100,
    longitude: 72.876900,
    date_occurred: '2026-10-23',
    contact_name: 'Coach Verma',
    contact_email: 'sports.desk@campus.edu',
    contact_phone: '+91 98222 33445',
    image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzUZEp-tvSarAw18j1SKuFvNTSQ90HcCxN9oRYm1A-yw&s=10',
    resolved_notes: 'Claimed and returned to owner Tanvi Joshi on verification of laundry tag name.',
    created_at: new Date(Date.now() - 432000000).toISOString()
  }
];

let nextItemId = 8;

/**
 * Initializes MySQL database and tables automatically.
 *
 * REFERENCES:
 * MySQL2 createConnection:
 * https://sidorares.github.io/node-mysql2/docs
 *
 * MySQL CREATE DATABASE:
 * https://dev.mysql.com/doc/refman/8.4/en/create-database.html
 *
 * MySQL CREATE TABLE:
 * https://dev.mysql.com/doc/refman/8.4/en/create-table.html
 *
 * MySQL connection pooling:
 * https://sidorares.github.io/node-mysql2/docs
 *
 * JavaScript async functions:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 */
async function initDatabase() {
  try {
    console.log(`[Database] Attempting connection to MySQL at ${DB_CONFIG.host}:${DB_CONFIG.port}...`);

    // REFERENCE: MySQL2 Promise API — createConnection()
    // https://sidorares.github.io/node-mysql2/docs/documentation/promise-wrapper
    //
    // Connect without selecting a database so it can be created if missing.

    const rootConnection = await mysql.createConnection({
      host: DB_CONFIG.host,
      port: DB_CONFIG.port,
      user: DB_CONFIG.user,
      password: DB_CONFIG.password
    });

    // REFERENCE: MySQL CREATE DATABASE IF NOT EXISTS
    // https://dev.mysql.com/doc/refman/8.4/en/create-database.html

    await rootConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_CONFIG.database}\`
       CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );

    await rootConnection.end();

    // REFERENCE: MySQL2 connection pools
    // https://sidorares.github.io/node-mysql2/docs
    //
    // A pool reuses database connections instead of creating a new
    // connection for every query.

    pool = mysql.createPool(DB_CONFIG);

    pool.on('error', (err) => {
      console.warn('[MySQL Pool Warning]', err.message);
    });

    // REFERENCE: MySQL2 getConnection()
    // https://sidorares.github.io/node-mysql2/docs

    const testConn = await pool.getConnection();
    console.log(`[Database] Connected successfully to MySQL database "${DB_CONFIG.database}".`);
    testConn.release();

    // REFERENCE: MySQL CREATE TABLE IF NOT EXISTS
    // https://dev.mysql.com/doc/refman/8.4/en/create-table.html
    //
    // REFERENCE: MySQL data types
    // https://dev.mysql.com/doc/refman/8.4/en/data-types.html
    //
    // REFERENCE: MySQL indexes
    // https://dev.mysql.com/doc/refman/8.4/en/optimization-indexes.html

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL UNIQUE,
        icon VARCHAR(50) NOT NULL DEFAULT 'bi-tag',
        description VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // REFERENCE: MySQL ENUM type
    // https://dev.mysql.com/doc/refman/8.4/en/enum.html
    //
    // REFERENCE: MySQL DATE and TIMESTAMP types
    // https://dev.mysql.com/doc/refman/8.4/en/datetime.html
    //
    // REFERENCE: MySQL CREATE TABLE and indexes
    // https://dev.mysql.com/doc/refman/8.4/en/create-table.html

    await pool.execute(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        category VARCHAR(100) NOT NULL,
        item_type ENUM('lost', 'found') NOT NULL DEFAULT 'lost',
        status ENUM('reported', 'pending_claim', 'resolved') NOT NULL DEFAULT 'reported',
        description TEXT NOT NULL,
        location_name VARCHAR(200) NOT NULL,
        latitude DECIMAL(10, 8) NULL,
        longitude DECIMAL(11, 8) NULL,
        date_occurred DATE NOT NULL,
        contact_name VARCHAR(100) NOT NULL,
        contact_email VARCHAR(150) NOT NULL,
        contact_phone VARCHAR(50) NULL,
        image_url LONGTEXT NULL,
        resolved_notes TEXT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_category (category),
        INDEX idx_item_type (item_type),
        INDEX idx_status (status),
        INDEX idx_date (date_occurred)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // REFERENCE: MySQL SELECT and COUNT()
    // https://dev.mysql.com/doc/refman/8.4/en/counting-rows.html
    //
    // REFERENCE: MySQL INSERT
    // https://dev.mysql.com/doc/refman/8.4/en/insert.html
    //
    // REFERENCE: Parameterized queries with MySQL2
    // https://sidorares.github.io/node-mysql2/docs

    const [existingCategories] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM categories'
    );

    if (existingCategories[0].cnt === 0) {
      console.log('[Database] Seeding default campus categories...');

      // REFERENCE: JavaScript for...of
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of

      for (const cat of fallbackCategories) {
        // REFERENCE: Parameterized SQL queries
        // https://sidorares.github.io/node-mysql2/docs

        await pool.execute(
          'INSERT INTO categories (name, icon, description) VALUES (?, ?, ?)',
          [cat.name, cat.icon, cat.description]
        );
      }
    }

    // REFERENCE: MySQL SELECT COUNT()
    // https://dev.mysql.com/doc/refman/8.4/en/counting-rows.html

    const [existingItems] = await pool.query(
      'SELECT COUNT(*) AS cnt FROM items'
    );

    if (existingItems[0].cnt === 0) {
      console.log('[Database] Seeding sample campus lost & found records...');

      // REFERENCE: MySQL INSERT statement
      // https://dev.mysql.com/doc/refman/8.4/en/insert.html

      for (const item of fallbackItems) {
        await pool.execute(`
          INSERT INTO items (
            title, category, item_type, status, description, location_name,
            latitude, longitude, date_occurred, contact_name, contact_email,
            contact_phone, image_url, resolved_notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          item.title, item.category, item.item_type, item.status, item.description,
          item.location_name, item.latitude, item.longitude, item.date_occurred,
          item.contact_name, item.contact_email, item.contact_phone,
          item.image_url, item.resolved_notes
        ]);
      }
    }

    isConnected = true;
    useFallbackStore = false;
    return true;

  } catch (err) {
    // REFERENCE: JavaScript try...catch error handling
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch

    console.warn('\n================================================================');
    console.warn('⚠️  [MySQL Notice] Could not connect to local MySQL service.');
    console.warn(`    Error: ${err.message}`);
    console.warn('    If using XAMPP, open XAMPP Control Panel and start "MySQL".');
    console.warn('    The portal will run in high-fidelity memory-backed mode');
    console.warn('    so all features, forms, and drag-and-drop can be tested.');
    console.warn('================================================================\n');

    isConnected = false;
    useFallbackStore = true;
    return false;
  }
}

/**
 * Returns all categories.
 *
 * REFERENCES:
 * MySQL SELECT:
 * https://dev.mysql.com/doc/refman/8.4/en/select.html
 *
 * JavaScript async functions:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
 */
async function getCategories() {
  if (isConnected && pool) {
    const [rows] = await pool.query(
      'SELECT * FROM categories ORDER BY id ASC'
    );
    return rows;
  }

  return fallbackCategories;
}

/**
 * Get items with optional search and filters.
 *
 * REFERENCES:
 * MySQL SELECT:
 * https://dev.mysql.com/doc/refman/8.4/en/select.html
 *
 * MySQL LIKE operator:
 * https://dev.mysql.com/doc/refman/8.4/en/string-comparison-functions.html
 *
 * MySQL2 execute() and parameterized queries:
 * https://sidorares.github.io/node-mysql2/docs
 *
 * JavaScript Array.filter():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 *
 * JavaScript Array.sort():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
 */
async function getItems(filters = {}) {
  const { q, category, item_type, status } = filters;

  if (isConnected && pool) {
    let sql = 'SELECT * FROM items WHERE 1=1';
    const params = [];

    if (q) {
      sql += ' AND (title LIKE ? OR description LIKE ? OR location_name LIKE ?)';
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    if (category && category !== 'all') {
      sql += ' AND category = ?';
      params.push(category);
    }

    if (item_type && item_type !== 'all') {
      sql += ' AND item_type = ?';
      params.push(item_type);
    }

    if (status && status !== 'all') {
      sql += ' AND status = ?';
      params.push(status);
    }

    sql += ' ORDER BY created_at DESC';

    // REFERENCE: MySQL2 execute() with parameters
    // https://sidorares.github.io/node-mysql2/docs

    const [rows] = await pool.execute(sql, params);
    return rows;
  }

  // REFERENCE: JavaScript Array.filter()
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
  //
  // REFERENCE: String.toLowerCase() and String.includes()
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String

  return fallbackItems.filter(item => {
    if (category && category !== 'all' && item.category !== category) return false;
    if (item_type && item_type !== 'all' && item.item_type !== item_type) return false;
    if (status && status !== 'all' && item.status !== status) return false;

    if (q) {
      const query = q.toLowerCase();

      const match =
        item.title.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location_name.toLowerCase().includes(query);

      if (!match) return false;
    }

    return true;

  // REFERENCE: JavaScript Array.sort() and Date
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date

  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Get item by ID.
 *
 * REFERENCES:
 * MySQL SELECT:
 * https://dev.mysql.com/doc/refman/8.4/en/select.html
 *
 * JavaScript parseInt() and isNaN():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/isNaN
 *
 * JavaScript Array.find():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/find
 */
async function getItemById(id) {
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) return null;

  if (isConnected && pool) {
    // REFERENCE: MySQL2 parameterized SELECT query
    // https://sidorares.github.io/node-mysql2/docs

    const [rows] = await pool.execute(
      'SELECT * FROM items WHERE id = ?',
      [numericId]
    );

    return rows[0] || null;
  }

  return fallbackItems.find(i => i.id === numericId) || null;
}

/**
 * Create a new item report.
 *
 * REFERENCES:
 * MySQL INSERT:
 * https://dev.mysql.com/doc/refman/8.4/en/insert.html
 *
 * MySQL2 execute() and parameterized queries:
 * https://sidorares.github.io/node-mysql2/docs
 *
 * JavaScript object destructuring:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring
 *
 * JavaScript parseFloat():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseFloat
 */
async function createItem(data) {
  const {
    title,
    category,
    item_type = 'lost',
    status = 'reported',
    description,
    location_name,
    latitude = null,
    longitude = null,
    date_occurred,
    contact_name,
    contact_email,
    contact_phone = '',
    image_url = null
  } = data;

  if (isConnected && pool) {
    // REFERENCE: MySQL INSERT statement
    // https://dev.mysql.com/doc/refman/8.4/en/insert.html

    const [result] = await pool.execute(`
      INSERT INTO items (
        title, category, item_type, status, description, location_name,
        latitude, longitude, date_occurred, contact_name, contact_email,
        contact_phone, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      title,
      category,
      item_type,
      status,
      description,
      location_name,
      latitude ? parseFloat(latitude) : null,
      longitude ? parseFloat(longitude) : null,
      date_occurred,
      contact_name,
      contact_email,
      contact_phone,
      image_url
    ]);

    return await getItemById(result.insertId);
  }

  // REFERENCE: JavaScript objects and spread syntax
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
  //
  // REFERENCE: JavaScript Date and ISO string conversion
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toISOString

  const newItem = {
    id: nextItemId++,
    title,
    category,
    item_type,
    status,
    description,
    location_name,
    latitude: latitude ? parseFloat(latitude) : null,
    longitude: longitude ? parseFloat(longitude) : null,
    date_occurred,
    contact_name,
    contact_email,
    contact_phone,
    image_url,
    resolved_notes: null,
    created_at: new Date().toISOString()
  };

  fallbackItems.unshift(newItem);
  return newItem;
}

/**
 * Update an item.
 *
 * REFERENCES:
 * MySQL UPDATE:
 * https://dev.mysql.com/doc/refman/8.4/en/update.html
 *
 * MySQL2 parameterized queries:
 * https://sidorares.github.io/node-mysql2/docs
 *
 * JavaScript Array.findIndex():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
 *
 * JavaScript spread syntax:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax
 */
async function updateItem(id, data) {
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) return null;

  if (isConnected && pool) {
    const existing = await getItemById(numericId);

    if (!existing) return null;

    const fields = [
      'title', 'category', 'item_type', 'status', 'description',
      'location_name', 'latitude', 'longitude', 'date_occurred',
      'contact_name', 'contact_email', 'contact_phone', 'image_url', 'resolved_notes'
    ];

    const updates = [];
    const params = [];

    // REFERENCE: JavaScript for...of and conditional statements
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/if...else

    for (const key of fields) {
      if (data[key] !== undefined) {
        updates.push(`${key} = ?`);
        params.push(data[key]);
      }
    }

    if (updates.length === 0) return existing;

    params.push(numericId);

    // REFERENCE: MySQL UPDATE statement
    // https://dev.mysql.com/doc/refman/8.4/en/update.html

    await pool.execute(
      `UPDATE items SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    return await getItemById(numericId);
  }

  // REFERENCE: JavaScript Array.findIndex() and spread syntax
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findIndex
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax

  const index = fallbackItems.findIndex(i => i.id === numericId);

  if (index === -1) return null;

  fallbackItems[index] = {
    ...fallbackItems[index],
    ...data,
    id: numericId,
    updated_at: new Date().toISOString()
  };

  return fallbackItems[index];
}

/**
 * Update item status (for Drag and Drop and Quick Resolution).
 *
 * REFERENCES:
 * JavaScript Array.includes():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/includes
 *
 * JavaScript Error objects:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
 */
async function updateItemStatus(id, newStatus, resolvedNotes = null) {
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) return null;

  const validStatuses = ['reported', 'pending_claim', 'resolved'];

  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid status: ${newStatus}`);
  }

  return await updateItem(numericId, {
    status: newStatus,
    resolved_notes: resolvedNotes || (
      newStatus === 'resolved'
        ? 'Marked as resolved by user/admin'
        : null
    )
  });
}

/**
 * Delete an item.
 *
 * REFERENCES:
 * MySQL DELETE:
 * https://dev.mysql.com/doc/refman/8.4/en/delete.html
 *
 * MySQL2 execute():
 * https://sidorares.github.io/node-mysql2/docs
 *
 * JavaScript Array.filter():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 */
async function deleteItem(id) {
  const numericId = parseInt(id, 10);

  if (isNaN(numericId)) return false;

  if (isConnected && pool) {
    // REFERENCE: MySQL DELETE statement
    // https://dev.mysql.com/doc/refman/8.4/en/delete.html

    const [result] = await pool.execute(
      'DELETE FROM items WHERE id = ?',
      [numericId]
    );

    return result.affectedRows > 0;
  }

  // REFERENCE: JavaScript Array.filter()
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter

  const initialLen = fallbackItems.length;

  fallbackItems = fallbackItems.filter(
    i => i.id !== numericId
  );

  return fallbackItems.length < initialLen;
}

/**
 * Get statistical overview for dashboard cards.
 *
 * REFERENCES:
 * JavaScript Array.filter():
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter
 *
 * JavaScript Array.reduce() / array processing:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array
 *
 * JavaScript objects:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects
 */
async function getStats() {
  const items = await getItems();

  const total = items.length;

  const lost = items.filter(
    i => i.item_type === 'lost' && i.status !== 'resolved'
  ).length;

  const found = items.filter(
    i => i.item_type === 'found' && i.status !== 'resolved'
  ).length;

  const resolved = items.filter(
    i => i.status === 'resolved'
  ).length;

  const pending = items.filter(
    i => i.status === 'pending_claim'
  ).length;

  // REFERENCE: JavaScript objects and property access
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects

  const categoryCounts = {};

  for (const item of items) {
    categoryCounts[item.category] =
      (categoryCounts[item.category] || 0) + 1;
  }

  return {
    total,
    lost,
    found,
    resolved,
    pending,
    categoryCounts,
    databaseStatus: isConnected
      ? 'MySQL (Connected)'
      : 'Fallback Store (XAMPP Offline)'
  };
}

/**
 * REFERENCE: Node.js CommonJS module exports
 * https://nodejs.org/api/modules.html#moduleexports
 *
 * These functions are made available to other files,
 * such as the application's routes and server modules.
 */
module.exports = {
  initDatabase,
  getCategories,
  getItems,
  getItemById,
  createItem,
  updateItem,
  updateItemStatus,
  deleteItem,
  getStats,
  isDatabaseConnected: () => isConnected
};