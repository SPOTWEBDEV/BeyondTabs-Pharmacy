# BeyondTabs — server/ (PHP backend)

This folder is a plain PHP + MySQL backend (no framework) for the forms on
the site: login, register, book consultation, contact, and newsletter.

## What's wired up vs. what isn't yet

**Connected to real AJAX endpoints (with a localStorage fallback if the
server isn't reachable):**
- `login.html`, `register.html` → `server/auth/login.php`, `register.php`
- `consultation.html` → `server/consultations/book.php`
- `contact.html` message form → `server/contact/submit.php`
- Homepage newsletter form → `server/newsletter/subscribe.php`
- `admin/login.html` → `server/auth/login.php` (with `admin_only: true`)
- `admin/index.html` topbar → `server/auth/session.php` (fetches the
  signed-in admin's real name/email/role from the database on every load)
- `admin/index.html` Customers panel → `server/auth/list_users.php`
  (real registered customer accounts, merged with demo rows)

**Still frontend-only (localStorage), not yet wired to this backend:**
- Admin dashboard's Products add/edit/delete, including product images
  (uses `assets/js/products-data.js`; images are resized client-side and
  stored as data URLs)
- Admin dashboard's Orders and Prescriptions (demo data, no table-backed CRUD yet)

The `products`, `orders`, and `prescriptions` tables exist in the schema,
and `server/products/*.php` (including `upload_image.php` for real
server-side image storage) are ready to use — the admin dashboard's
product table would just need its calls swapped from
`window.BeyondTabsProducts` (localStorage) to `fetch('server/products/...')`.

## Setup

1. **Requirements**: PHP 8+ with the `pdo_mysql` extension, and MySQL/MariaDB.
   Easiest local setup: [XAMPP](https://www.apachefriends.org/) or
   [Laragon](https://laragon.org/) on Windows, or `php -S` + a local MySQL
   install on Mac/Linux.

2. **Create the database and import the schema:**
   ```bash
   mysql -u root -p -e "CREATE DATABASE beyondtabs CHARACTER SET utf8mb4;"
   mysql -u root -p beyondtabs < server/schema.sql
   ```

3. **Set your DB credentials** in `server/config.php` (`DB_HOST`, `DB_NAME`,
   `DB_USER`, `DB_PASS`).

3b. **Make `server/uploads/products/` writable** by the web server (e.g.
   `chmod 755` or `775` depending on your host) — this is where
   `server/products/upload_image.php` will save product photos once the
   admin Products page is switched over to use it.

4. **Create your first admin account** — run this in a terminal (requires
   the `php` CLI):
   ```bash
   php -r "echo \"INSERT INTO users (full_name, email, phone, password_hash, role) VALUES ('BeyondTabs Admin', 'admin@beyondtabspharmacy.ng', '09031218118', '\" . password_hash('ChangeMe123!', PASSWORD_DEFAULT) . \"', 'admin');\" . PHP_EOL;"
   ```
   Copy the printed `INSERT` statement, run it against your database, then
   log in at `/admin/login.html` with that email and password — and change
   the password afterwards.

5. **Serve the whole project through PHP**, not by double-clicking the HTML
   files. From the project root:
   ```bash
   php -S localhost:8000
   ```
   Then visit `http://localhost:8000/` in your browser. Opening the HTML
   files directly (`file://…`) means the AJAX calls to `server/*.php` can't
   reach a PHP process, so every form automatically falls back to saving
   locally in the browser instead (clearly noted in the UI where relevant).

## Security notes before going live

- `config.php` sends a permissive `Access-Control-Allow-Origin: *` header for
  easy local development — tighten this to your real domain in production.
- Passwords are hashed with `password_hash()`/`password_verify()` (bcrypt) —
  never store or log plain-text passwords.
- All queries use PDO prepared statements to prevent SQL injection.
- `admin/login.html` currently checks the same `users` table with
  `role = 'admin'`. There's no rate-limiting or CSRF protection yet — add
  both before handling real customer data or real admin credentials.
