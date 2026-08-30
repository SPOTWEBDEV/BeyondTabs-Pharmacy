<?php
require_once __DIR__ . '/../config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Method not allowed.'], 405);
}

$data = read_json_body();
$name = trim((string)($data['name'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$phone = trim((string)($data['phone'] ?? ''));
$specialistType = trim((string)($data['specialist_type'] ?? ''));
$service = trim((string)($data['service'] ?? ''));
$date = trim((string)($data['date'] ?? ''));
$time = trim((string)($data['time'] ?? ''));
$notes = trim((string)($data['notes'] ?? ''));

$validTypes = ['doctor', 'pharmacist', 'dentist', 'skin_specialist'];
if ($name === '' || $phone === '' || $service === '' || $date === '' || !in_array($specialistType, $validTypes, true)) {
    json_response(['success' => false, 'error' => 'Please choose who you\'d like to see and fill in your name, phone, and preferred date.'], 422);
}

$pdo = get_pdo();
$stmt = $pdo->prepare(
    'INSERT INTO consultations (name, email, phone, specialist_type, service, preferred_date, preferred_time, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, "Pending")'
);
$stmt->execute([$name, $email, $phone, $specialistType, $service, $date, $time, $notes]);

json_response(['success' => true, 'id' => (int)$pdo->lastInsertId()]);
