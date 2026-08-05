// =========================================================
// PROJETO 06 — PLATAFORMA DE GESTÃO ACADÊMICA
// Módulo desktop complementar (C# / .NET).
//
// Aplicação de console que se conecta ao mesmo banco MySQL usado
// pela API em PHP e pelo script Python, e lista rapidamente os
// alunos em situação crítica (média < 5), útil para coordenadores
// que preferem uma consulta local sem abrir o navegador.
//
// Pacote NuGet necessário: MySql.Data
//   dotnet add package MySql.Data
//
// Execução:
//   dotnet run
// =========================================================

using System;
using System.Collections.Generic;
using MySql.Data.MySqlClient;

namespace ControleAcademicoDesktop
{
    internal record Aluno(int Id, string Nome, string Curso, string Status, double Media);

    internal static class Program
    {
        private const string ConnectionString =
            "Server=127.0.0.1;Database=gestao_academica;Uid=root;Pwd=;";

        private static void Main()
        {
            Console.OutputEncoding = System.Text.Encoding.UTF8;
            Console.WriteLine("=========================================");
            Console.WriteLine(" Plataforma de Gestão Acadêmica — Desktop");
            Console.WriteLine("=========================================\n");

            try
            {
                var alunos = CarregarAlunosComMedia();
                ExibirResumo(alunos);
                ExibirAlunosCriticos(alunos);
            }
            catch (MySqlException ex)
            {
                Console.WriteLine($"Não foi possível conectar ao banco de dados: {ex.Message}");
            }

            Console.WriteLine("\nPressione qualquer tecla para sair...");
            Console.ReadKey();
        }

        private static List<Aluno> CarregarAlunosComMedia()
        {
            const string sql = @"
                SELECT a.id, a.nome, c.nome AS curso, a.status,
                       COALESCE(AVG(n.nota), 0) AS media
                FROM alunos a
                JOIN cursos c ON c.id = a.curso_id
                LEFT JOIN notas n ON n.aluno_id = a.id
                GROUP BY a.id, a.nome, c.nome, a.status
                ORDER BY media ASC";

            var alunos = new List<Aluno>();

            using var conexao = new MySqlConnection(ConnectionString);
            conexao.Open();

            using var comando = new MySqlCommand(sql, conexao);
            using var leitor = comando.ExecuteReader();

            while (leitor.Read())
            {
                alunos.Add(new Aluno(
                    Id: leitor.GetInt32("id"),
                    Nome: leitor.GetString("nome"),
                    Curso: leitor.GetString("curso"),
                    Status: leitor.GetString("status"),
                    Media: leitor.GetDouble("media")
                ));
            }

            return alunos;
        }

        private static string Situacao(double media) =>
            media >= 7 ? "Aprovado" : media >= 5 ? "Recuperação" : "Reprovado";

        private static void ExibirResumo(List<Aluno> alunos)
        {
            if (alunos.Count == 0)
            {
                Console.WriteLine("Nenhum aluno cadastrado.");
                return;
            }

            double mediaGeral = 0;
            foreach (var aluno in alunos) mediaGeral += aluno.Media;
            mediaGeral /= alunos.Count;

            Console.WriteLine($"Total de alunos:  {alunos.Count}");
            Console.WriteLine($"Média geral:      {mediaGeral:F1}\n");
        }

        private static void ExibirAlunosCriticos(List<Aluno> alunos)
        {
            Console.WriteLine("Alunos em situação crítica (média < 5):");
            Console.WriteLine("----------------------------------------");

            bool algumCritico = false;

            foreach (var aluno in alunos)
            {
                if (aluno.Media >= 5) continue;
                algumCritico = true;
                Console.WriteLine($"  {aluno.Nome,-22} | {aluno.Curso,-32} | média {aluno.Media:F1} | {Situacao(aluno.Media)}");
            }

            if (!algumCritico)
            {
                Console.WriteLine("  Nenhum aluno em situação crítica no momento.");
            }
        }
    }
}
