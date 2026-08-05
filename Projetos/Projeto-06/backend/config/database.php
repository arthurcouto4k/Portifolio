<?php
/**
 * PROJETO 06 — PLATAFORMA DE GESTÃO ACADÊMICA
 * Conexão com o banco via PDO. Ajuste as credenciais conforme
 * seu ambiente (Wamp/Xampp/Laragon).
 */

class Database
{
    private static ?PDO $instance = null;

    private string $host = '127.0.0.1';
    private string $dbName = 'gestao_academica';
    private string $user = 'root';
    private string $password = '';

    public static function getConnection(): PDO
    {
        if (self::$instance === null) {
            $self = new self();
            $dsn = "mysql:host={$self->host};dbname={$self->dbName};charset=utf8mb4";

            try {
                self::$instance = new PDO($dsn, $self->user, $self->password, [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                ]);
            } catch (PDOException $e) {
                http_response_code(500);
                echo json_encode(['erro' => 'Falha na conexão com o banco de dados.']);
                exit;
            }
        }

        return self::$instance;
    }
}
