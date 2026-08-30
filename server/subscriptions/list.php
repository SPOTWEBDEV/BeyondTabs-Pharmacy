<?php
require_once __DIR__ . '/../config.php';

$pdo = get_pdo();
$rows = $pdo->query('SELECT * FROM subscription_plans ORDER BY sort_order ASC, price ASC')->fetchAll();

foreach ($rows as &$r) {
    $r['id'] = (int)$r['id'];
    $r['price'] = (float)$r['price'];
    $r['is_popular'] = (bool)$r['is_popular'];
    $r['features'] = json_decode($r['features'], true) ?: [];
}
unset($r);

json_response(['success' => true, 'plans' => $rows]);
