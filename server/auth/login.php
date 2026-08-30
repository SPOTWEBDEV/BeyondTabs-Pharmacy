<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$data = read_json_body();
$email = trim(strtolower((string)($data['email'] ?? '')));
$password = (string)($data['password'] ?? '');
$requireAdmin = !empty($data['admin_only']); // set by admin/login.html

if ($email === '' || $password === '') {
    json_response(['success' => false, 'error' => 'Email and password are required.'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare('SELECT id, full_name, email, password_hash, role FROM users WHERE email = ?');
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($password, $user['password_hash'])) {
    json_response(['success' => false, 'error' => 'Incorrect email or password.'], 401);
}

if ($requireAdmin && $user['role'] !== 'admin') {
    json_response(['success' => false, 'error' => 'This account does not have staff access.'], 403);
}

$_SESSION['user_id'] = (int)$user['id'];
$_SESSION['user_name'] = $user['full_name'];
$_SESSION['user_role'] = $user['role'];

json_response([
    'success' => true,
    'user' => [
        'id' => (int)$user['id'],
        'name' => $user['full_name'],
        'email' => $user['email'],
        'role' => $user['role'],
    ],
]);
