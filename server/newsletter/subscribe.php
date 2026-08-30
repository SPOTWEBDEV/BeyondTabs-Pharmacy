<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$data = read_json_body();
$email = trim(strtolower((string)($data['email'] ?? '')));

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['success' => false, 'error' => 'Please enter a valid email address.'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)');
$stmt->execute([$email]);

json_response(['success' => true]);
