
(() => {
    'use strict';

   
    let cursos = [
        { id: 1, nome: 'Desenvolvimento Web Full Stack', cargaHoraria: 180, professor: 'Profa. Camila Reis' },
        { id: 2, nome: 'Banco de Dados Aplicado', cargaHoraria: 120, professor: 'Prof. Eduardo Lima' },
        { id: 3, nome: 'Engenharia de Software', cargaHoraria: 160, professor: 'Profa. Renata Souza' },
        { id: 4, nome: 'Sistemas Distribuídos', cargaHoraria: 140, professor: 'Prof. Marcos Silva' }
    ];

    let alunos = [
        { id: 1, nome: 'Beatriz Andrade', email: 'beatriz.andrade@email.com', cursoId: 1, status: 'ativo',
          notas: [{ disciplina: 'HTML & CSS', nota: 8.5 }, { disciplina: 'JavaScript', nota: 7.8 }, { disciplina: 'Projeto Final', nota: 9.0 }] },
        { id: 2, nome: 'Caio Ferreira', email: 'caio.ferreira@email.com', cursoId: 2, status: 'ativo',
          notas: [{ disciplina: 'Modelagem de Dados', nota: 6.2 }, { disciplina: 'SQL Avançado', nota: 5.4 }] },
        { id: 3, nome: 'Daniela Martins', email: 'daniela.martins@email.com', cursoId: 1, status: 'ativo',
          notas: [{ disciplina: 'HTML & CSS', nota: 9.4 }, { disciplina: 'JavaScript', nota: 8.9 }, { disciplina: 'Projeto Final', nota: 9.6 }] },
        { id: 4, nome: 'Eduardo Pires', email: 'eduardo.pires@email.com', cursoId: 3, status: 'ativo',
          notas: [{ disciplina: 'Requisitos', nota: 7.0 }, { disciplina: 'Arquitetura de Software', nota: 6.8 }] },
        { id: 5, nome: 'Fernanda Costa', email: 'fernanda.costa@email.com', cursoId: 4, status: 'trancado',
          notas: [{ disciplina: 'Computação em Nuvem', nota: 4.5 }, { disciplina: 'Mensageria', nota: 3.8 }] },
        { id: 6, nome: 'Gustavo Almeida', email: 'gustavo.almeida@email.com', cursoId: 2, status: 'ativo',
          notas: [{ disciplina: 'Modelagem de Dados', nota: 8.1 }, { disciplina: 'SQL Avançado', nota: 7.9 }] },
        { id: 7, nome: 'Helena Rocha', email: 'helena.rocha@email.com', cursoId: 3, status: 'concluido',
          notas: [{ disciplina: 'Requisitos', nota: 9.1 }, { disciplina: 'Arquitetura de Software', nota: 8.7 }, { disciplina: 'TCC', nota: 9.3 }] },
        { id: 8, nome: 'Igor Santos', email: 'igor.santos@email.com', cursoId: 1, status: 'ativo',
          notas: [{ disciplina: 'HTML & CSS', nota: 5.0 }, { disciplina: 'JavaScript', nota: 4.6 }] }
    ];

    let proximoAlunoId = alunos.length + 1;
    let alunoSelecionadoBoletim = alunos[0]?.id ?? null;
    let alunoEmEdicao = null;

    
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => document.querySelectorAll(sel);

    function nomeCurso(cursoId) {
        const curso = cursos.find((c) => c.id === cursoId);
        return curso ? curso.nome : '—';
    }

    function media(notas) {
        if (!notas.length) return 0;
        const soma = notas.reduce((acc, n) => acc + n.nota, 0);
        return soma / notas.length;
    }

    function situacao(mediaAluno) {
        if (mediaAluno >= 7) return { texto: 'Aprovado', classe: 'aprovado' };
        if (mediaAluno >= 5) return { texto: 'Recuperação', classe: 'recuperacao' };
        return { texto: 'Reprovado', classe: 'reprovado' };
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"']/g, (c) => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        }[c]));
    }

    
    function initThemeToggle() {
        const toggleBtn = $('#themeToggle');
        if (!toggleBtn) return;
        const STORAGE_KEY = 'portfolio-theme';
        const saved = localStorage.getItem(STORAGE_KEY);
        applyTheme(saved || 'dark');

        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
            const next = current === 'light' ? 'dark' : 'light';
            applyTheme(next);
            localStorage.setItem(STORAGE_KEY, next);
        });

        function applyTheme(theme) {
            if (theme === 'light') document.documentElement.setAttribute('data-theme', 'light');
            else document.documentElement.removeAttribute('data-theme');
        }
    }

    
    function initTabs() {
        $$('.tab-btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                $$('.tab-btn').forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-selected', 'false'); });
                $$('.tab-panel').forEach((p) => p.classList.remove('active'));

                btn.classList.add('active');
                btn.setAttribute('aria-selected', 'true');
                $('#tab-' + btn.dataset.tab).classList.add('active');
            });
        });
    }

    
    function renderDashboard() {
        const medias = alunos.map((a) => media(a.notas));
        const mediaGeral = medias.length ? medias.reduce((a, b) => a + b, 0) / medias.length : 0;
        const aprovados = alunos.filter((a) => situacao(media(a.notas)).texto === 'Aprovado').length;
        const taxa = alunos.length ? Math.round((aprovados / alunos.length) * 100) : 0;

        $('#statAlunos').textContent = alunos.length;
        $('#statCursos').textContent = cursos.length;
        $('#statMedia').textContent = mediaGeral.toFixed(1);
        $('#statAprovacao').textContent = taxa + '%';
    }

    
    function renderAlunos() {
        const termo = ($('#buscaAluno').value || '').toLowerCase().trim();
        const corpo = $('#corpoTabelaAlunos');
        const vazio = $('#alunosVazio');

        const filtrados = alunos.filter((a) =>
            a.nome.toLowerCase().includes(termo) || a.email.toLowerCase().includes(termo)
        );

        corpo.innerHTML = filtrados.map((a) => {
            const m = media(a.notas);
            const sit = situacao(m);
            return `
                <tr>
                    <td>${escapeHtml(a.nome)}</td>
                    <td>${escapeHtml(a.email)}</td>
                    <td>${escapeHtml(nomeCurso(a.cursoId))}</td>
                    <td>${m.toFixed(1)}</td>
                    <td><span class="badge ${sit.classe}">${sit.texto}</span></td>
                    <td><span class="badge ${a.status}">${a.status}</span></td>
                    <td>
                        <div class="row-actions">
                            <button class="icon-btn" data-editar-aluno="${a.id}" aria-label="Editar aluno" type="button">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>
                            </button>
                            <button class="icon-btn danger" data-excluir-aluno="${a.id}" aria-label="Excluir aluno" type="button">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0l-1 14a2 2 0 01-2 2H7a2 2 0 01-2-2L4 6"></path></svg>
                            </button>
                        </div>
                    </td>
                </tr>`;
        }).join('');

        vazio.hidden = filtrados.length !== 0;
        atualizarSelectAlunoBoletim();
        atualizarSelectCursos();
    }

    function atualizarSelectCursos() {
        const select = $('#alunoCurso');
        select.innerHTML = cursos.map((c) => `<option value="${c.id}">${escapeHtml(c.nome)}</option>`).join('');
    }

    function abrirModalAluno(aluno = null) {
        alunoEmEdicao = aluno ? aluno.id : null;
        $('#modalAlunoTitulo').textContent = aluno ? 'Editar aluno' : 'Novo aluno';
        $('#alunoId').value = aluno ? aluno.id : '';
        $('#alunoNome').value = aluno ? aluno.nome : '';
        $('#alunoEmail').value = aluno ? aluno.email : '';
        $('#alunoCurso').value = aluno ? aluno.cursoId : (cursos[0]?.id ?? '');
        $('#alunoStatus').value = aluno ? aluno.status : 'ativo';
        abrirModal('modalAluno');
    }

    function initAlunos() {
        $('#buscaAluno').addEventListener('input', renderAlunos);
        $('#btnNovoAluno').addEventListener('click', () => abrirModalAluno());

        $('#corpoTabelaAlunos').addEventListener('click', (e) => {
            const editId = e.target.closest('[data-editar-aluno]')?.dataset.editarAluno;
            const delId = e.target.closest('[data-excluir-aluno]')?.dataset.excluirAluno;

            if (editId) {
                const aluno = alunos.find((a) => a.id === Number(editId));
                if (aluno) abrirModalAluno(aluno);
            }
            if (delId) {
                if (confirm('Remover este aluno da plataforma?')) {
                    alunos = alunos.filter((a) => a.id !== Number(delId));
                    renderAlunos();
                    renderBoletim();
                    renderCursos();
                    renderDashboard();
                }
            }
        });

        $('#formAluno').addEventListener('submit', (e) => {
            e.preventDefault();
            const dados = {
                nome: $('#alunoNome').value.trim(),
                email: $('#alunoEmail').value.trim(),
                cursoId: Number($('#alunoCurso').value),
                status: $('#alunoStatus').value
            };

            if (alunoEmEdicao) {
                const aluno = alunos.find((a) => a.id === alunoEmEdicao);
                Object.assign(aluno, dados);
            } else {
                alunos.push({ id: proximoAlunoId++, notas: [], ...dados });
            }

            fecharModal('modalAluno');
            renderAlunos();
            renderCursos();
            renderDashboard();
        });
    }

    
    function renderCursos() {
        $('#gradeCursos').innerHTML = cursos.map((c) => {
            const matriculados = alunos.filter((a) => a.cursoId === c.id).length;
            return `
                <div class="course-card">
                    <h3>${escapeHtml(c.nome)}</h3>
                    <p>Carga horária: ${c.cargaHoraria}h</p>
                    <p>Responsável: ${escapeHtml(c.professor)}</p>
                    <div class="course-count">${matriculados} aluno(s) matriculado(s)</div>
                </div>`;
        }).join('');
    }

    function initCursos() {
        $('#btnNovoCurso').addEventListener('click', () => {
            $('#formCurso').reset();
            abrirModal('modalCurso');
        });

        $('#formCurso').addEventListener('submit', (e) => {
            e.preventDefault();
            const novoId = cursos.length ? Math.max(...cursos.map((c) => c.id)) + 1 : 1;
            cursos.push({
                id: novoId,
                nome: $('#cursoNome').value.trim(),
                cargaHoraria: Number($('#cursoCarga').value),
                professor: $('#cursoProfessor').value.trim()
            });
            fecharModal('modalCurso');
            renderCursos();
            atualizarSelectCursos();
            renderDashboard();
        });
    }

    
    function atualizarSelectAlunoBoletim() {
        const select = $('#selectAlunoBoletim');
        const atual = select.value;
        select.innerHTML = alunos.map((a) => `<option value="${a.id}">${escapeHtml(a.nome)}</option>`).join('');

        if (alunos.some((a) => a.id === Number(atual))) {
            select.value = atual;
            alunoSelecionadoBoletim = Number(atual);
        } else if (alunos.length) {
            alunoSelecionadoBoletim = alunos[0].id;
            select.value = alunoSelecionadoBoletim;
        } else {
            alunoSelecionadoBoletim = null;
        }
    }

    function renderBoletim() {
        const aluno = alunos.find((a) => a.id === alunoSelecionadoBoletim);
        const corpo = $('#corpoTabelaBoletim');
        const resumo = $('#boletimResumo');

        if (!aluno) {
            corpo.innerHTML = '';
            resumo.innerHTML = '';
            return;
        }

        corpo.innerHTML = aluno.notas.map((n, i) => `
            <tr>
                <td>${escapeHtml(n.disciplina)}</td>
                <td>${n.nota.toFixed(1)}</td>
                <td>
                    <div class="row-actions">
                        <button class="icon-btn danger" data-excluir-nota="${i}" aria-label="Remover nota" type="button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                        </button>
                    </div>
                </td>
            </tr>`).join('');

        const m = media(aluno.notas);
        const sit = situacao(m);
        resumo.innerHTML = `
            <span>Média atual: <strong>${m.toFixed(1)}</strong></span>
            <span>Situação: <strong class="badge ${sit.classe}">${sit.texto}</strong></span>
            <span>Disciplinas lançadas: <strong>${aluno.notas.length}</strong></span>
        `;
    }

    function initBoletim() {
        $('#selectAlunoBoletim').addEventListener('change', (e) => {
            alunoSelecionadoBoletim = Number(e.target.value);
            renderBoletim();
        });

        $('#corpoTabelaBoletim').addEventListener('click', (e) => {
            const idx = e.target.closest('[data-excluir-nota]')?.dataset.excluirNota;
            if (idx === undefined) return;
            const aluno = alunos.find((a) => a.id === alunoSelecionadoBoletim);
            if (!aluno) return;
            aluno.notas.splice(Number(idx), 1);
            renderBoletim();
            renderAlunos();
            renderDashboard();
        });

        $('#btnLancarNota').addEventListener('click', () => {
            if (!alunoSelecionadoBoletim) {
                alert('Cadastre um aluno antes de lançar notas.');
                return;
            }
            $('#formNota').reset();
            abrirModal('modalNota');
        });

        $('#formNota').addEventListener('submit', (e) => {
            e.preventDefault();
            const aluno = alunos.find((a) => a.id === alunoSelecionadoBoletim);
            if (!aluno) return;

            aluno.notas.push({
                disciplina: $('#notaDisciplina').value.trim(),
                nota: Number($('#notaValor').value)
            });

            fecharModal('modalNota');
            renderBoletim();
            renderAlunos();
            renderDashboard();
        });
    }

   
    function initRelatorio() {
        $('#btnGerarRelatorio').addEventListener('click', () => {
            const linhas = [['Nome', 'E-mail', 'Curso', 'Media', 'Situacao', 'Status']];

            alunos.forEach((a) => {
                const m = media(a.notas);
                linhas.push([a.nome, a.email, nomeCurso(a.cursoId), m.toFixed(1), situacao(m).texto, a.status]);
            });

            const csv = linhas.map((linha) => linha.map((campo) => `"${String(campo).replace(/"/g, '""')}"`).join(',')).join('\n');
            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'relatorio_desempenho.csv';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        });
    }

    
    function abrirModal(id) { $('#' + id).hidden = false; }
    function fecharModal(id) { $('#' + id).hidden = true; }

    function initModais() {
        $$('[data-close-modal]').forEach((btn) => {
            btn.addEventListener('click', () => fecharModal(btn.dataset.closeModal));
        });
        $$('.modal-overlay').forEach((overlay) => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.hidden = true;
            });
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') $$('.modal-overlay').forEach((o) => { o.hidden = true; });
        });
    }

   
    document.addEventListener('DOMContentLoaded', () => {
        initThemeToggle();
        initTabs();
        initModais();
        initAlunos();
        initCursos();
        initBoletim();
        initRelatorio();

        atualizarSelectCursos();
        renderAlunos();
        renderCursos();
        renderBoletim();
        renderDashboard();
    });
})();
