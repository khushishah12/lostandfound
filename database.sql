-- ====================================================================
-- Campus Lost-and-Found Portal Database Schema & Seed Data
-- Database: campus_lost_and_found
-- Compatible with MySQL 8.0+ and MariaDB (XAMPP default port 3306)
-- ====================================================================

CREATE DATABASE IF NOT EXISTS campus_lost_and_found CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campus_lost_and_found;

-- --------------------------------------------------------------------
-- 1. Categories Table
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50) NOT NULL DEFAULT 'bi-tag',
  description VARCHAR(255) NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------------------
-- 2. Items Table
-- --------------------------------------------------------------------
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

-- --------------------------------------------------------------------
-- 3. Initial Seed Categories
-- --------------------------------------------------------------------
INSERT IGNORE INTO categories (id, name, icon, description) VALUES
(1, 'Electronics & Gadgets', 'bi-laptop', 'Laptops, chargers, phones, headphones, calculators, USB drives'),
(2, 'Student IDs & Cards', 'bi-person-badge', 'Campus ID cards, driver licenses, transit cards, credit/debit cards'),
(3, 'Keys & Access Badges', 'bi-key', 'Dorm room keys, vehicle keys, lanyards, RFID fobs'),
(4, 'Books & Notebooks', 'bi-book', 'Textbooks, course binders, spiral notebooks, sketchbooks'),
(5, 'Wallets & Bags', 'bi-wallet2', 'Wallets, purses, backpacks, gym duffels, pencil pouches'),
(6, 'Clothing & Apparel', 'bi-tag', 'Jackets, hoodies, caps, scarves, umbrellas, sunglasses'),
(7, 'Bottles & Personal Items', 'bi-cup-straw', 'Water bottles, thermos flasks, glasses, jewelry, watches'),
(8, 'Other Campus Items', 'bi-box-seam', 'Musical instruments, lab equipment, miscellaneous belongings');

-- --------------------------------------------------------------------
-- 4. Initial Realistic Campus Seed Items
-- --------------------------------------------------------------------
INSERT INTO items (
  title, category, item_type, status, description, location_name,
  latitude, longitude, date_occurred, contact_name, contact_email, contact_phone,
  image_url, resolved_notes
) VALUES
(
  'Apple Airpods',
  'Electronics & Gadgets',
  'lost',
  'reported',
  'White AirPods Pro in a matte black case with a Naruto cloud sticker. Misplaced during the afternoon CS301 lecture.',
  'Science Complex B - Room 204',
  19.076090, 72.877426,
  CURDATE() - INTERVAL 1 DAY,
  'Aarav Sharma',
  'aarav.sharma@campus.edu',
  '+91 98765 43210',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVuP4nyIGoaxX2GVZKZ4i1p3jq4indIM_V-sdWbz-8rA&s=10',
  NULL
),
(
  'bottle',
  'Bottles & Personal Items',
  'found',
  'reported',
  'Found on the second floor silent study zone next to window cubicle 14. Has several stickers and a slight dent on the base.',
  'Central Campus Library - 2nd Floor',
  19.076800, 72.878100,
  CURDATE() - INTERVAL 2 DAY,
  'Campus Security Desk',
  'security.lostfound@campus.edu',
  '+91 98200 11223',
  'https://share.google/esyqjP4XFK7zn4CWM',
  NULL
),
(
  'Student id card',
  'Student IDs & Cards',
  'found',
  'pending_claim',
  'Official University Student Identity Card belonging to Priyanshu Patel (Roll No: 22BCSE104). Left at the cafeteria payment counter.',
  'Student Union Cafeteria',
  19.075400, 72.876500,
  CURDATE() - INTERVAL 1 DAY,
  'Cafeteria Manager',
  'cafeteria@campus.edu',
  '+91 98111 22334',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQ6NzZyPkMn0RLZ_LfkfaDVgxvYAx36DAqf615Cy3R7w&s=10',
  'Student contacted via college email; awaiting pickup.'
),
(
  'casio calculator',
  'Electronics & Gadgets',
  'lost',
  'reported',
  'Black scientific calculator with slide-on cover. Left behind after Math examination. Has student initials "R.K." written on back.',
  'Engineering Hall - Exam Room 12',
  19.077200, 72.879000,
  CURDATE() - INTERVAL 3 DAY,
  'Rohan Kulkarni',
  'rohan.k@campus.edu',
  '+91 97654 32109',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTWmEXSk-qgcu4NWNen0lnyVtDxq5-Qf_l7_yzDRQ-QoQ&s=10',
  NULL
),
(
  'keys',
  'Keys & Access Badges',
  'found',
  'reported',
  'Set of 3 brass keys and an electronic RFID access fob attached to a maroon "Campus Hostel Block C" lanyard.',
  'Hostel Block C Entrance Lawn',
  19.074500, 72.875200,
  CURDATE(),
  'Warden Office Block C',
  'warden.c@campus.edu',
  '+91 98333 44556',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7jJrQ2_Px0yp5FM9fmL7hPu6jFmMWgzUE3QKeR0MUWw&s=10',
  NULL
),
(
  'bag',
  'Wallets & Bags',
  'lost',
  'pending_claim',
  'Black water-resistant backpack containing 2 spiral notebooks and a blue pencil pouch. No electronic items inside.',
  'Campus Transit Center - Bus Stop A',
  19.073900, 72.874100,
  CURDATE() - INTERVAL 4 DAY,
  'Ananya Iyer',
  'ananya.i@campus.edu',
  '+91 99887 76655',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQw3Y8LUfNdYsl64SB-OLfQJ31tDBsc2PSZE-ppEi_yVA&s=10',
  'Reported seeing bag with shuttle driver; verifying identification.'
),
(
  'hoodie',
  'Clothing & Apparel',
  'found',
  'resolved',
  'Heather gray hooded sweatshirt with university crest printed on front chest. Recovered from bleachers after evening basketball game.',
  'Indoor Sports Complex & Gymnasium',
  19.078100, 72.876900,
  CURDATE() - INTERVAL 5 DAY,
  'Coach Verma',
  'sports.desk@campus.edu',
  '+91 98222 33445',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzUZEp-tvSarAw18j1SKuFvNTSQ90HcCxN9oRYm1A-yw&s=10',
  'Claimed and returned to owner Tanvi Joshi on verification of laundry tag name.'
);
