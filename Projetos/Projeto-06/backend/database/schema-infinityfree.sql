
CREATE TABLE IF NOT EXISTS cursos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL,
    carga_horaria   INT NOT NULL,
    professor       VARCHAR(150) NOT NULL,
    criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS alunos (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    curso_id        INT NOT NULL,
    status          ENUM('ativo', 'trancado', 'concluido') NOT NULL DEFAULT 'ativo',
    criado_em       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_alunos_curso FOREIGN KEY (curso_id) REFERENCES cursos(id)
        ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;


CREATE TABLE IF NOT EXISTS notas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    aluno_id        INT NOT NULL,
    disciplina      VARCHAR(120) NOT NULL,
    nota            DECIMAL(4,2) NOT NULL CHECK (nota >= 0 AND nota <= 10),
    lancado_em      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notas_aluno FOREIGN KEY (aluno_id) REFERENCES alunos(id)
        ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB;


INSERT INTO cursos (nome, carga_horaria, professor) VALUES
('Desenvolvimento Web Full Stack', 180, 'Profa. Camila Reis'),
('Banco de Dados Aplicado', 120, 'Prof. Eduardo Lima'),
('Engenharia de Software', 160, 'Profa. Renata Souza'),
('Sistemas Distribuídos', 140, 'Prof. Marcos Silva');

INSERT INTO alunos (nome, email, curso_id, status) VALUES
('Beatriz Andrade', 'beatriz.andrade@email.com', 1, 'ativo'),
('Caio Ferreira', 'caio.ferreira@email.com', 2, 'ativo'),
('Daniela Martins', 'daniela.martins@email.com', 1, 'ativo'),
('Eduardo Pires', 'eduardo.pires@email.com', 3, 'ativo'),
('Fernanda Costa', 'fernanda.costa@email.com', 4, 'trancado'),
('Gustavo Almeida', 'gustavo.almeida@email.com', 2, 'ativo'),
('Helena Rocha', 'helena.rocha@email.com', 3, 'concluido'),
('Igor Santos', 'igor.santos@email.com', 1, 'ativo');

INSERT INTO notas (aluno_id, disciplina, nota) VALUES
(1, 'HTML & CSS', 8.5), (1, 'JavaScript', 7.8), (1, 'Projeto Final', 9.0),
(2, 'Modelagem de Dados', 6.2), (2, 'SQL Avançado', 5.4),
(3, 'HTML & CSS', 9.4), (3, 'JavaScript', 8.9), (3, 'Projeto Final', 9.6),
(4, 'Requisitos', 7.0), (4, 'Arquitetura de Software', 6.8),
(5, 'Computação em Nuvem', 4.5), (5, 'Mensageria', 3.8),
(6, 'Modelagem de Dados', 8.1), (6, 'SQL Avançado', 7.9),
(7, 'Requisitos', 9.1), (7, 'Arquitetura de Software', 8.7), (7, 'TCC', 9.3),
(8, 'HTML & CSS', 5.0), (8, 'JavaScript', 4.6);
