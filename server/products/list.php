<?php
require_once __DIR__ . '/../config.php';

$pdo = get_pdo();
$rows = $pdo->query('SELECT * FROM products ORDER BY created_at DESC')->fetchAll();

foreach ($rows as &$r) {
    $r['id'] = (int)$r['id'];
    $r['price'] = (float)$r['price'];
    $r['stock'] = (int)$r['stock'];
    $r['rx'] = (bool)$r['rx'];
    $r['image'] = $r['image_path'];
    $r['status'] = $r['stock'] <= 0 ? 'Out of Stock' : ($r['stock'] <= 10 ? 'Low Stock' : 'In Stock');
}
unset($r);

json_response(['success' => true, 'products' => $rows]);
