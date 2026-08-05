"""
PROJETO 06 — PLATAFORMA DE GESTÃO ACADÊMICA
Script de automação de relatórios.

Lê diretamente do banco MySQL (mesmo schema usado pela API em PHP,
ver backend/database/schema.sql) e gera um relatório de desempenho
em CSV, além de um resumo no terminal.

Requisitos:
    pip install mysql-connector-python

Uso:
    python relatorio_desempenho.py
    python relatorio_desempenho.py --saida relatorio_2026_01.csv
"""

import argparse
import csv
import sys
from dataclasses import dataclass, field
from datetime import datetime

import mysql.connector
from mysql.connector import Error as MySQLError

DB_CONFIG = {
    "host": "127.0.0.1",
    "user": "root",
    "password": "",
    "database": "gestao_academica",
}


@dataclass
class Aluno:
    id: int
    nome: str
    email: str
    curso: str
    status: str
    notas: list = field(default_factory=list)

    @property
    def media(self) -> float:
        if not self.notas:
            return 0.0
        return round(sum(self.notas) / len(self.notas), 1)

    @property
    def situacao(self) -> str:
        media = self.media
        if media >= 7:
            return "Aprovado"
        if media >= 5:
            return "Recuperação"
        return "Reprovado"


def conectar():
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except MySQLError as erro:
        print(f"Erro ao conectar ao banco: {erro}", file=sys.stderr)
        sys.exit(1)


def carregar_alunos(conexao) -> list[Aluno]:
    cursor = conexao.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT a.id, a.nome, a.email, a.status, c.nome AS curso
        FROM alunos a
        JOIN cursos c ON c.id = a.curso_id
        ORDER BY a.nome
        """
    )
    linhas = cursor.fetchall()

    alunos = [
        Aluno(id=l["id"], nome=l["nome"], email=l["email"], curso=l["curso"], status=l["status"])
        for l in linhas
    ]

    cursor.execute("SELECT aluno_id, nota FROM notas")
    notas_por_aluno: dict[int, list[float]] = {}
    for linha in cursor.fetchall():
        notas_por_aluno.setdefault(linha["aluno_id"], []).append(float(linha["nota"]))

    for aluno in alunos:
        aluno.notas = notas_por_aluno.get(aluno.id, [])

    cursor.close()
    return alunos


def gerar_csv(alunos: list[Aluno], caminho_saida: str) -> None:
    with open(caminho_saida, "w", newline="", encoding="utf-8") as arquivo:
        escritor = csv.writer(arquivo)
        escritor.writerow(["Nome", "E-mail", "Curso", "Media", "Situacao", "Status"])
        for aluno in alunos:
            escritor.writerow([aluno.nome, aluno.email, aluno.curso, aluno.media, aluno.situacao, aluno.status])


def imprimir_resumo(alunos: list[Aluno]) -> None:
    total = len(alunos)
    aprovados = sum(1 for a in alunos if a.situacao == "Aprovado")
    recuperacao = sum(1 for a in alunos if a.situacao == "Recuperação")
    reprovados = sum(1 for a in alunos if a.situacao == "Reprovado")
    media_geral = round(sum(a.media for a in alunos) / total, 1) if total else 0.0

    print("=" * 50)
    print(f"Relatório de desempenho — {datetime.now():%d/%m/%Y %H:%M}")
    print("=" * 50)
    print(f"Total de alunos:     {total}")
    print(f"Média geral:         {media_geral}")
    print(f"Aprovados:           {aprovados}")
    print(f"Em recuperação:      {recuperacao}")
    print(f"Reprovados:          {reprovados}")
    print("-" * 50)

    criticos = [a for a in alunos if a.situacao == "Reprovado"]
    if criticos:
        print("Alunos em situação crítica:")
        for aluno in criticos:
            print(f"  - {aluno.nome} ({aluno.curso}) — média {aluno.media}")
    else:
        print("Nenhum aluno em situação crítica.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Gera o relatório de desempenho acadêmico.")
    parser.add_argument(
        "--saida",
        default="relatorio_desempenho.csv",
        help="Caminho do arquivo CSV de saída (padrão: relatorio_desempenho.csv)",
    )
    args = parser.parse_args()

    conexao = conectar()
    try:
        alunos = carregar_alunos(conexao)
    finally:
        conexao.close()

    if not alunos:
        print("Nenhum aluno encontrado no banco.")
        return

    gerar_csv(alunos, args.saida)
    imprimir_resumo(alunos)
    print(f"\nRelatório salvo em: {args.saida}")


if __name__ == "__main__":
    main()
