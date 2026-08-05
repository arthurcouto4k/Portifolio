<?php
/**
 * PROJETO 06 — API de Alunos
 * GET    /backend/api/alunos.php             -> lista alunos com média e situação
 * GET    /backend/api/alunos.php?id=5        -> detalha um aluno (com notas)
 * POST   /backend/api/alunos.php             -> cria aluno { nome, email, curso_id, status }
 * PUT    /backend/api/alunos.php?id=5        -> atualiza aluno
 * DELETE /backend/api/alunos.php?id=5        -> remove aluno
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/response.php';

$pdo = Database::getConnection();
$metodo = $_SERVER['REQUEST_METHOD'];
$id = isset($_GET['id']) ? (int) $_GET['id'] : null;

if ($metodo === 'OPTIONS') {
    sendJson(null, 204);
}

/** Calcula média e situação (Aprovado / Recuperação / Reprovado) a partir das notas. */
function calcularSituacao(array $notas): array
{
    if (empty($notas)) {
        return ['media' => 0.0, 'situacao' => 'Sem notas'];
    }

    $media = round(array_sum(array_column($notas, 'nota')) / count($notas), 1);

    if ($media >= 7) $situacao = 'Aprovado';
    elseif ($media >= 5) $situacao = 'Recuperação';
    else $situacao = 'Reprovado';

    return ['media' => $media, 'situacao' => $situacao];
}

if ($metodo === 'GET' && $id) {
    $stmt = $pdo->prepare(
        'SELECT a.*, c.nome AS curso_nome FROM alunos a
         JOIN cursos c ON c.id = a.curso_id WHERE a.id = :id'
    );
    $stmt->execute([':id' => $id]);
    $aluno = $stmt->fetch();

    if (!$aluno) sendJson(['erro' => 'Aluno não encontrado.'], 404);

    $stmtNotas = $pdo->prepare('SELECT id, disciplina, nota FROM notas WHERE aluno_id = :id ORDER BY id');
    $stmtNotas->execute([':id' => $id]);
    $aluno['notas'] = $stmtNotas->fetchAll();
    $aluno = array_merge($aluno, calcularSituacao($aluno['notas']));

    sendJson($aluno);
}

if ($metodo === 'GET') {
    $stmt = $pdo->query(
        'SELECT a.id, a.nome, a.email, a.status, c.nome AS curso_nome, a.curso_id
         FROM alunos a JOIN cursos c ON c.id = a.curso_id ORDER BY a.nome'
    );
    $alunos = $stmt->fetchAll();

    $stmtNotas = $pdo->prepare('SELECT disciplina, nota FROM notas WHERE aluno_id = :id');
    foreach ($alunos as &$aluno) {
        $stmtNotas->execute([':id' => $aluno['id']]);
        $aluno = array_merge($aluno, calcularSituacao($stmtNotas->fetchAll()));
    }

    sendJson($alunos);
}

if ($metodo === 'POST') {
    $dados = readJsonBody();

    foreach (['nome', 'email', 'curso_id'] as $campo) {
        if (empty($dados[$campo])) {
            sendJson(['erro' => "Campo obrigatório ausente: $campo"], 422);
        }
    }

    $stmt = $pdo->prepare(
        'INSERT INTO alunos (nome, email, curso_id, status) VALUES (:nome, :email, :curso_id, :status)'
    );
    $stmt->execute([
        ':nome' => $dados['nome'],
        ':email' => $dados['email'],
        ':curso_id' => $dados['curso_id'],
        ':status' => $dados['status'] ?? 'ativo',
    ]);

    sendJson(['id' => (int) $pdo->lastInsertId()], 201);
}

if ($metodo === 'PUT') {
    if (!$id) sendJson(['erro' => 'Informe o id do aluno na query string.'], 422);
    $dados = readJsonBody();

    $stmt = $pdo->prepare(
        'UPDATE alunos SET nome = :nome, email = :email, curso_id = :curso_id, status = :status WHERE id = :id'
    );
    $stmt->execute([
        ':nome' => $dados['nome'],
        ':email' => $dados['email'],
        ':curso_id' => $dados['curso_id'],
        ':status' => $dados['status'] ?? 'ativo',
        ':id' => $id,
    ]);

    sendJson(['atualizado' => $stmt->rowCount() > 0]);
}

if ($metodo === 'DELETE') {
    if (!$id) sendJson(['erro' => 'Informe o id do aluno na query string.'], 422);

    $stmt = $pdo->prepare('DELETE FROM alunos WHERE id = :id');
    $stmt->execute([':id' => $id]);

    sendJson(['removido' => $stmt->rowCount() > 0]);
}

sendJson(['erro' => 'Método não suportado.'], 405);
