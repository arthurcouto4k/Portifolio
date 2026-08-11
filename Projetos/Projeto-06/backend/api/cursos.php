<?php


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'OPTIONS') {
    sendJson(null, 204);
}

if ($metodo === 'GET') {
    $sql = "SELECT c.id, c.nome, c.carga_horaria, c.professor,
                   COUNT(a.id) AS total_alunos
            FROM cursos c
            LEFT JOIN alunos a ON a.curso_id = c.id
            GROUP BY c.id
            ORDER BY c.nome";

    $stmt = $pdo->query($sql);
    sendJson($stmt->fetchAll());
}

if ($metodo === 'POST') {
    $dados = readJsonBody();

    if (empty($dados['nome']) || empty($dados['carga_horaria']) || empty($dados['professor'])) {
        sendJson(['erro' => 'Informe nome, carga_horaria e professor.'], 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO cursos (nome, carga_horaria, professor) VALUES (:nome, :carga_horaria, :professor)'
    );
    $stmt->execute([
        ':nome' => $dados['nome'],
        ':carga_horaria' => $dados['carga_horaria'],
        ':professor' => $dados['professor'],
    ]);

    sendJson(['id' => (int) $pdo->lastInsertId()], 201);
}

sendJson(['erro' => 'Método não suportado.'], 405);
