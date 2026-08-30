<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$data = read_json_body();
$name = trim((string)($data['name'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$phone = trim((string)($data['phone'] ?? ''));
$message = trim((string)($data['message'] ?? ''));

if ($name === '' || $message === '') {
    json_response(['success' => false, 'error' => 'Name and message are required.'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('INSERT INTO contact_messages (name, email, phone, message, status) VALUES (?, ?, ?, ?, "New")');
$stmt->execute([$name, $email, $phone, $message]);

json_response(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
