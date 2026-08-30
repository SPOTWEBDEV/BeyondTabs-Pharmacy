<?php
/**
 * server/config.php
 * Central database connection + small shared helpers.
 * Every endpoint in server/ starts with: require_once __DIR__ . '/../config.php';
 *
 * SETUP: update the four constants below to match your MySQL database,
 * then import server/schema.sql to create the required tables.
 */

declare(strict_types=1);

error_reporting(E_ALL);
ini_set('display_errors', '0'); // keep off in production — errors are returned as JSON instead

// ---- Database credentials — EDIT THESE for your environment ----
define('DB_HOST', 'localhost');
define('DB_NAME', 'beyondtabs');
define('DB_USER', 'root');
define('DB_PASS', '');

/**
 * Returns a shared PDO connection, creating it on first use.
 */
function get_pdo(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $dsn = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            ]);
        } catch (PDOException $e) {
            json_response(['success' => false, 'error' => 'Database connection failed. Check server/config.php credentials.'], 500);
        }
    }
    return $pdo;
}

/**
 * Sends a JSON response and stops execution — every endpoint ends by calling this.
 */
function json_response($data, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit;
}

/**
 * Reads a JSON request body (what fetch() sends) and falls back to $_POST
 * so endpoints work whether the frontend sends JSON or a normal form post.
 */
function read_json_body(): array
{
    $raw = file_get_contents('php://input');
    if (!$raw) return $_POST;
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : $_POST;
}

// Permissive CORS for local development (e.g. testing the frontend from a
// different port/tool than the PHP server). Same-origin production requests
// don't need this — tighten or remove it once you deploy to a single domain.
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

session_start();
