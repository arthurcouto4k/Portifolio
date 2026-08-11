<?php
/**
 * API de Cadastro de Usuários — api.php
 * Arthur Ramos Couto | Portfólio
 *
 * Endpoints:
 *   POST   /api.php?action=register  — cadastrar usuário
 *   POST   /api.php?action=login     — autenticar usuário
 *   GET    /api.php?action=users     — listar usuários (sem senha)
 *   DELETE /api.php?action=delete&id=X — remover usuário
 *
 * Requer: PHP 8.0+, PDO + SQLite (ext-sqlite3 ou ext-pdo_sqlite)
 */


define('DB_FILE', __DIR__ . '/database.sqlite');

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(204); exit; }


function getDB(): PDO {
    $pdo = new PDO('sqlite:' . DB_FILE);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       TEXT    NOT NULL,
            email      TEXT    NOT NULL UNIQUE,
            password   TEXT    NOT NULL,
            created_at TEXT    DEFAULT (datetime('now','localtime'))
        )
    ");
    return $pdo;
}


function respond(array $data, int $status = 200): void {
    http_response_code($status);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function body(): array {
    $raw = file_get_contents('php://input');
    return json_decode($raw, true) ?? [];
}

function validateEmail(string $email): bool {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}


$action = $_GET['action'] ?? '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    $db = getDB();

    
    if ($action === 'register' && $method === 'POST') {
        $body = body();
        $name  = trim($body['name']  ?? '');
        $email = trim($body['email'] ?? '');
        $pass  = $body['password']   ?? '';

        if (!$name || !$email || !$pass) {
            respond(['error' => 'name, email e password são obrigatórios.'], 400);
        }
        if (!validateEmail($email)) {
            respond(['error' => 'E-mail inválido.'], 400);
        }
        if (strlen($pass) < 6) {
            respond(['error' => 'A senha deve ter pelo menos 6 caracteres.'], 400);
        }

        $hash = password_hash($pass, PASSWORD_BCRYPT);
        $stmt = $db->prepare('INSERT INTO users (name, email, password) VALUES (:n, :e, :p)');
        $stmt->execute([':n' => $name, ':e' => $email, ':p' => $hash]);

        respond([
            'success' => true,
            'message' => 'Usuário cadastrado com sucesso.',
            'id'      => (int) $db->lastInsertId(),
        ], 201);
    }

    
    if ($action === 'login' && $method === 'POST') {
        $body  = body();
        $email = trim($body['email'] ?? '');
        $pass  = $body['password']   ?? '';

        if (!$email || !$pass) {
            respond(['error' => 'email e password são obrigatórios.'], 400);
        }

        $stmt = $db->prepare('SELECT * FROM users WHERE email = :e LIMIT 1');
        $stmt->execute([':e' => $email]);
        $user = $stmt->fetch();

        if (!$user || !password_verify($pass, $user['password'])) {
            respond(['error' => 'Credenciais inválidas.'], 401);
        }

        
        respond([
            'success' => true,
            'message' => 'Login realizado.',
            'user'    => ['id' => $user['id'], 'name' => $user['name'], 'email' => $user['email']],
        ]);
    }

   
    if ($action === 'users' && $method === 'GET') {
        $rows = $db->query('SELECT id, name, email, created_at FROM users ORDER BY id DESC')->fetchAll();
        respond(['success' => true, 'total' => count($rows), 'users' => $rows]);
    }

    
    if ($action === 'delete' && $method === 'DELETE') {
        $id = (int) ($_GET['id'] ?? 0);
        if ($id <= 0) respond(['error' => 'ID inválido.'], 400);

        $stmt = $db->prepare('DELETE FROM users WHERE id = :id');
        $stmt->execute([':id' => $id]);

        if ($stmt->rowCount() === 0) {
            respond(['error' => 'Usuário não encontrado.'], 404);
        }
        respond(['success' => true, 'message' => "Usuário #$id removido."]);
    }

    respond(['error' => 'Ação inválida ou método não permitido.'], 400);

} catch (PDOException $e) {
    
    respond(['error' => 'Erro interno no servidor.'], 500);
}
