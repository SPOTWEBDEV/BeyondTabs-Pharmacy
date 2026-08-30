<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$data = read_json_body();
$name = trim((string)($data['name'] ?? ''));
$email = trim(strtolower((string)($data['email'] ?? '')));
$phone = trim((string)($data['phone'] ?? ''));
$password = (string)($data['password'] ?? '');

if ($name === '' || $email === '' || $password === '') {
    json_response(['success' => false, 'error' => 'Name, email and password are required.'], 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response(['success' => false, 'error' => 'Please enter a valid email address.'], 422);
}
if (strlen($password) < 6) {
    json_response(['success' => false, 'error' => 'Password must be at least 6 characters.'], 422);
}

$pdo = get_pdo();

$check = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$check->execute([$email]);
if ($check->fetch()) {
    json_response(['success' => false, 'error' => 'An account with this email already exists. Try logging in instead.'], 409);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare('INSERT INTO users (full_name, email, phone, password_hash, role) VALUES (?, ?, ?, ?, "customer")');
$stmt->execute([$name, $email, $phone, $hash]);

$userId = (int)$pdo->lastInsertId();
$_SESSION['user_id'] = $userId;
$_SESSION['user_name'] = $name;
$_SESSION['user_role'] = 'customer';

json_response([
    'success' => true,
    'user' => ['id' => $userId, 'name' => $name, 'email' => $email, 'role' => 'customer'],
]);
