<?php
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
    json_response(['success' => false, 'error' => 'Admin session required.'], 401);
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$data = read_json_body();

$pdo = get_pdo();
$stmt = $pdo->prepare(
    'UPDATE store_settings SET store_name = ?, phone = ?, hours_weekday = ?, address = ? WHERE id = 1'
);
$stmt->execute([
    trim((string)($data['storeName'] ?? '')),
    trim((string)($data['phone'] ?? '')),
    trim((string)($data['hoursWeekday'] ?? '')),
    trim((string)($data['address'] ?? '')),
]);

json_response(['success' => true]);
