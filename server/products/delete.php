<?php
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
    json_response(['success' => false, 'error' => 'Admin session required.'], 401);
}

$data = read_json_body();
$id = (int)($data['id'] ?? ($_GET['id'] ?? 0));
if (!$id) {
    json_response(['success' => false, 'error' => 'Product id is required.'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('DELETE FROM products WHERE id = ?');
$stmt->execute([$id]);

json_response(['success' => true]);
