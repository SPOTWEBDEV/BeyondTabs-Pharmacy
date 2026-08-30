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
$tagline = trim((string)($data['tagline'] ?? ''));
$price = (float)($data['price'] ?? 0);
$billingPeriod = trim((string)($data['billing_period'] ?? 'month'));
$features = is_array($data['features'] ?? null) ? array_values(array_filter($data['features'])) : [];
$isPopular = !empty($data['is_popular']) ? 1 : 0;
$sortOrder = (int)($data['sort_order'] ?? 0);

if ($name === '' || $price <= 0) {
    json_response(['success' => false, 'error' => 'Plan name and a price greater than zero are required.'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare(
    'INSERT INTO subscription_plans (name, tagline, price, billing_period, features, is_popular, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?)'
);
$stmt->execute([$name, $tagline, $price, $billingPeriod, json_encode($features), $isPopular, $sortOrder]);

json_response(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
