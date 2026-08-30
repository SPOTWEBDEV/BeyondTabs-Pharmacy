<?php
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
    json_response(['success' => false, 'error' => 'Admin session required.'], 401);
}

$pdo = get_pdo();
$rows = $pdo->query('SELECT * FROM newsletter_subscribers ORDER BY created_at DESC')->fetchAll();

json_response(['success' => true, 'subscribers' => $rows]);
