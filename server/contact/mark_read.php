<?php
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
    json_response(['success' => false, 'error' => 'Admin session required.'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$data = read_json_body();
$id = (int)($data['id'] ?? 0);
if (!$id) {
    json_response(['success' => false, 'error' => 'Message id is required.'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('UPDATE contact_messages SET status = "Read" WHERE id = ?');
$stmt->execute([$id]);

json_response(['success' => true]);
