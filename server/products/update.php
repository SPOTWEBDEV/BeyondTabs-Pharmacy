<?php
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
    json_response(['success' => false, 'error' => 'Admin session required.'], 401);
}

if (!in_array($_SERVER['REQUEST_METHOD'], ['POST', 'PUT'], true)) {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$data = read_json_body();
$id = (int)($data['id'] ?? 0);
if (!$id) {
    json_response(['success' => false, 'error' => 'Product id is required.'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare(
    'UPDATE products SET name = ?, category = ?, price = ?, stock = ?, blurb = ?, rx = ?, image_path = COALESCE(?, image_path) WHERE id = ?'
);
$stmt->execute([
    trim((string)($data['name'] ?? '')),
    trim((string)($data['category'] ?? '')),
    (float)($data['price'] ?? 0),
    (int)($data['stock'] ?? 0),
    trim((string)($data['blurb'] ?? '')),
    !empty($data['rx']) ? 1 : 0,
    trim((string)($data['image'] ?? '')) ?: null,
    $id,
]);

json_response(['success' => true]);
