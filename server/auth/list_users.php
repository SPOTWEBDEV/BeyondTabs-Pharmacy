<?php
/**
 * server/auth/list_users.php
 * Returns registered customer accounts for the admin dashboard's
 * Customers panel. Requires an active admin session.
 */
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
    json_response(['success' => false, 'error' => 'Admin session required.'], 401);
}

$pdo = get_pdo();
$rows = $pdo->query(
    'SELECT id, full_name AS name, email, phone, created_at FROM users WHERE role = "customer" ORDER BY created_at DESC'
)->fetchAll();

json_response(['success' => true, 'users' => $rows]);
