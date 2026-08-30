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
    json_response(['success' => false, 'error' => 'Plan id is required.'], 422);
}

$features = is_array($data['features'] ?? null) ? array_values(array_filter($data['features'])) : [];

$pdo = get_pdo();
$stmt = $pdo->prepare(
    'UPDATE subscription_plans SET name = ?, tagline = ?, price = ?, billing_period = ?, features = ?, is_popular = ?, sort_order = ? WHERE id = ?'
);
$stmt->execute([
    trim((string)($data['name'] ?? '')),
    trim((string)($data['tagline'] ?? '')),
    (float)($data['price'] ?? 0),
    trim((string)($data['billing_period'] ?? 'month')),
    json_encode($features),
    !empty($data['is_popular']) ? 1 : 0,
    (int)($data['sort_order'] ?? 0),
    $id,
]);

json_response(['success' => true]);
