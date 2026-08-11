<?php


header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();
$metodo = $_SERVER['REQUEST_METHOD'];

if ($metodo === 'OPTIONS') {
    sendJson(null, 204);
}

if ($metodo === 'POST') {
    $dados = readJsonBody();

    foreach (['aluno_id', 'disciplina', 'nota'] as $campo) {
        if (!isset($dados[$campo]) || $dados[$campo] === '') {
            sendJson(['erro' => "Campo obrigatório ausente: $campo"], 422);
        }
    }

    if ($dados['nota'] < 0 || $dados['nota'] > 10) {
        sendJson(['erro' => 'A nota deve estar entre 0 e 10.'], 422);
    }

    $stmt = $pdo->prepare(
        'INSERT INTO notas (aluno_id, disciplina, nota) VALUES (:aluno_id, :disciplina, :nota)'
    );
    $stmt->execute([
        ':aluno_id' => $dados['aluno_id'],
        ':disciplina' => $dados['disciplina'],
        ':nota' => $dados['nota'],
    ]);

    sendJson(['id' => (int) $pdo->lastInsertId()], 201);
}

if ($metodo === 'DELETE') {
    $id = isset($_GET['id']) ? (int) $_GET['id'] : null;
    if (!$id) sendJson(['erro' => 'Informe o id da nota na query string.'], 422);

    $stmt = $pdo->prepare('DELETE FROM notas WHERE id = :id');
    $stmt->execute([':id' => $id]);

    sendJson(['removido' => $stmt->rowCount() > 0]);
}

sendJson(['erro' => 'Método não suportado.'], 405);
