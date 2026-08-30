<?php
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
    json_response(['success' => false, 'error' => 'Admin session required.'], 401);
}

$pdo = get_pdo();
$row = $pdo->query('SELECT * FROM store_settings WHERE id = 1')->fetch();

json_response(['success' => true, 'settings' => $row ?: []]);
