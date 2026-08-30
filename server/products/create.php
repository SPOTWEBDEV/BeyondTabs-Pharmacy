<?php
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
    json_response(['success' => false, 'error' => 'Admin session required.'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$data = read_json_body();
$name = trim((string)($data['name'] ?? ''));
$category = trim((string)($data['category'] ?? ''));
$price = (float)($data['price'] ?? 0);
$stock = (int)($data['stock'] ?? 0);
$blurb = trim((string)($data['blurb'] ?? ''));
$rx = !empty($data['rx']) ? 1 : 0;
$image = trim((string)($data['image'] ?? '')) ?: null; // path returned by upload_image.php

if ($name === '' || $category === '') {
    json_response(['success' => false, 'error' => 'Name and category are required.'], 422);
}

$pdo = get_pdo();

// Auto-generate an SKU like BT-SUP-004 from the category + how many
// products already exist in it, mirroring the frontend demo's logic.
$countStmt = $pdo->prepare('SELECT COUNT(*) FROM products WHERE category = ?');
$countStmt->execute([$category]);
$seq = (int)$countStmt->fetchColumn() + 1;
$code = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $category), 0, 3)) ?: 'GEN';
$sku = sprintf('BT-%s-%03d', $code, $seq);

$stmt = $pdo->prepare(
    'INSERT INTO products (sku, name, category, price, stock, blurb, rx, image_path) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([$sku, $name, $category, $price, $stock, $blurb, $rx, $image]);

json_response(['success' => true, 'id' => (int)$pdo->lastInsertId(), 'sku' => $sku]);
