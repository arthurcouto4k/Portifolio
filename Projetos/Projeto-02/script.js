const STORAGE_KEY = 'kanban-tasks-arc';


let tasks = loadTasks();
let draggedId = null;

/* ---- Elementos ---- */
const taskInput      = document.getElementById('taskInput');
const prioritySelect = document.getElementById('prioritySelect');
const addBtn         = document.getElementById('addBtn');
const clearDoneBtn   = document.getElementById('clearDone');
const themeBtn       = document.getElementById('themeBtn');
const statsEl        = document.getElementById('stats');

const COLS = ['todo', 'doing', 'done'];


const savedTheme = localStorage.getItem('kanban-theme') || 'light';
if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    themeBtn.textContent = '☀️';
}
themeBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
        document.documentElement.removeAttribute('data-theme');
        themeBtn.textContent = '🌙';
        localStorage.setItem('kanban-theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeBtn.textContent = '☀️';
        localStorage.setItem('kanban-theme', 'dark');
    }
});

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

function addTask() {
    const text = taskInput.value.trim();
    if (!text) { taskInput.focus(); return; }

    const task = {
        id:       crypto.randomUUID(),
        text,
        priority: prioritySelect.value,
        status:   'todo',
        createdAt: Date.now(),
    };

    tasks.push(task);
    saveTasks();
    render();
    taskInput.value = '';
    taskInput.focus();
}


clearDoneBtn.addEventListener('click', () => {
    tasks = tasks.filter(t => t.status !== 'done');
    saveTasks();
    render();
});


function render() {
    COLS.forEach(status => {
        const list  = document.getElementById(`list-${status}`);
        const count = document.getElementById(`count-${status}`);
        const col   = tasks.filter(t => t.status === status);

        count.textContent = col.length;
        list.innerHTML = '';

        col.forEach(task => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.setAttribute('draggable', 'true');
            card.setAttribute('data-id', task.id);
            card.setAttribute('data-status', task.status);
            card.setAttribute('role', 'listitem');
            card.innerHTML = `
                <div class="priority-dot ${task.priority}" aria-label="Prioridade ${task.priority}"></div>
                <span class="task-text">${escapeHtml(task.text)}</span>
                <button class="btn-del" data-id="${task.id}" aria-label="Remover tarefa" title="Remover">✕</button>
            `;

            
            card.addEventListener('dragstart', e => {
                draggedId = task.id;
                card.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                draggedId = null;
                document.querySelectorAll('.kanban-col').forEach(c => c.classList.remove('drag-over'));
            });

            
            card.querySelector('.btn-del').addEventListener('click', () => {
                tasks = tasks.filter(t => t.id !== task.id);
                saveTasks();
                render();
            });

            list.appendChild(card);
        });
    });

    
    document.querySelectorAll('.kanban-col').forEach(col => {
        col.ondragover = e => {
            e.preventDefault();
            col.classList.add('drag-over');
        };
        col.ondragleave = () => col.classList.remove('drag-over');
        col.ondrop = e => {
            e.preventDefault();
            col.classList.remove('drag-over');
            if (!draggedId) return;
            const newStatus = col.dataset.status;
            const task = tasks.find(t => t.id === draggedId);
            if (task && task.status !== newStatus) {
                task.status = newStatus;
                saveTasks();
                render();
            }
        };
    });

    
    const total = tasks.length;
    const done  = tasks.filter(t => t.status === 'done').length;
    const pct   = total ? Math.round((done / total) * 100) : 0;
    statsEl.innerHTML = `
        Total: <span>${total}</span>
        &nbsp;·&nbsp; Concluídas: <span>${done}</span>
        &nbsp;·&nbsp; Progresso: <span>${pct}%</span>
    `;
}

function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function loadTasks() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultTasks(); }
    catch { return defaultTasks(); }
}
function defaultTasks() {
    return [
        { id: crypto.randomUUID(), text: 'Estudar JavaScript avançado', priority: 'alta',  status: 'todo',  createdAt: Date.now() },
        { id: crypto.randomUUID(), text: 'Criar portfólio no GitHub',   priority: 'media', status: 'doing', createdAt: Date.now() },
        { id: crypto.randomUUID(), text: 'Ler Clean Code cap. 1',       priority: 'baixa', status: 'done',  createdAt: Date.now() },
    ];
}


function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}


render();
