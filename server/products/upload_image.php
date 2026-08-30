<?php
/**
 * server/products/upload_image.php
 * Accepts a single image file (multipart/form-data, field name "image"),
 * validates it, saves it to server/uploads/products/, and returns a
 * relative path to store in the product's image_path column.
 *
 * Not yet called by the admin dashboard's Products page — that UI still
 * stores images as resized data URLs in localStorage (see assets/js/admin.js).
 * This endpoint exists so the site is ready to switch to real server-side
 * storage once Products CRUD is wired to the PHP backend.
 */
require_once __DIR__ . '/../config.php';

if (empty($_SESSION['user_id']) || ($_SESSION['user_role'] ?? '') !== 'admin') {
    json_response(['success' => false, 'error' => 'Admin session required.'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

if (empty($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
    json_response(['success' => false, 'error' => 'No valid image file was uploaded.'], 422);
}

$file = $_FILES['image'];

$allowed = [
    'image/jpeg' => 'jpg',
    'image/png' => 'png',
    'image/webp' => 'webp',
];

$finfo = finfo_open(FILEINFO_MIME_TYPE);
$mime = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!isset($allowed[$mime])) {
    json_response(['success' => false, 'error' => 'Only JPG, PNG, or WEBP images are allowed.'], 422);
}

$maxBytes = 4 * 1024 * 1024; // 4MB
if ($file['size'] > $maxBytes) {
    json_response(['success' => false, 'error' => 'Image is too large (max 4MB).'], 422);
}

$uploadDir = __DIR__ . '/../uploads/products/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$filename = 'product_' . bin2hex(random_bytes(8)) . '.' . $allowed[$mime];
$destination = $uploadDir . $filename;

if (!move_uploaded_file($file['tmp_name'], $destination)) {
    json_response(['success' => false, 'error' => 'Could not save the uploaded image.'], 500);
}

// Relative path the frontend can use directly as an <img src>, and that
// gets stored in products.image_path.
json_response(['success' => true, 'path' => 'server/uploads/products/' . $filename]);
