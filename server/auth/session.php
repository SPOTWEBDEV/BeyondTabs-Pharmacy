<?php
require_once __DIR__ . '/../config.php';

if (!empty($_SESSION['user_id'])) {
    json_response([
        'success' => true,
        'user' => [
            'id' => $_SESSION['user_id'],
            'name' => $_SESSION['user_name'] ?? '',
            'role' => $_SESSION['user_role'] ?? 'customer',
        ],
    ]);
}

json_response(['success' => false], 401);
