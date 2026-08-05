/* =========================================================
   PORTFÓLIO — SCRIPT PRINCIPAL
   Organizado por funcionalidade. Cada bloco é independente
   e só é ativado se os elementos correspondentes existirem
   na página (evita erros caso o HTML seja editado depois).
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
    initThemeToggle();
    initMobileMenu();
    initScrollReveal();
    initProjectFilters();
    initBackToTop();
});

/* ---------------------------------------------------------
   1. TEMA CLARO / ESCURO
   Salva a preferência do usuário em localStorage e respeita
   a preferência do sistema operacional na primeira visita.
   --------------------------------------------------------- */
function initThemeToggle() {
    const toggleBtn = document.getElementById('themeToggle');
    if (!toggleBtn) return;

    const STORAGE_KEY = 'portfolio-theme';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const savedTheme = localStorage.getItem(STORAGE_KEY);

    // Define o tema inicial: preferência salva > preferência do sistema > escuro (padrão)
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'dark');
    applyTheme(initialTheme);

    toggleBtn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
        const next = current === 'light' ? 'dark' : 'light';
        applyTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
    });

    function applyTheme(theme) {
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }
}

/* ---------------------------------------------------------
   2. MENU MOBILE (HAMBÚRGUER)
   --------------------------------------------------------- */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    if (!hamburger || !navMenu) return;

    hamburger.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('open');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
        hamburger.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
    });

    // Fecha o menu ao clicar em um link (melhora a navegação mobile)
    navMenu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('open');
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
            hamburger.setAttribute('aria-label', 'Abrir menu');
        });
    });
}

/* ---------------------------------------------------------
   3. SCROLL REVEAL
   Revela elementos com a classe .reveal conforme entram na
   viewport, usando IntersectionObserver (mais performático
   que escutar o evento de scroll diretamente).
   --------------------------------------------------------- */
function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;

    // Se o navegador não suportar IntersectionObserver, apenas mostra tudo
    if (!('IntersectionObserver' in window)) {
        revealEls.forEach((el) => el.classList.add('is-visible'));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealEls.forEach((el) => observer.observe(el));
}

/* ---------------------------------------------------------
   4. FILTRO DE PROJETOS POR CATEGORIA
   Cada card de projeto tem data-category com uma ou mais
   categorias separadas por espaço (ex: "web frontend").
   --------------------------------------------------------- */
function initProjectFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const emptyMsg = document.getElementById('filterEmpty');
    if (!filterBtns.length || !projectCards.length) return;

    filterBtns.forEach((btn) => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;

            filterBtns.forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');

            let visibleCount = 0;

            projectCards.forEach((card) => {
                const categories = (card.dataset.category || '').split(' ');
                const matches = filter === 'all' || categories.includes(filter);
                card.classList.toggle('is-hidden', !matches);
                if (matches) visibleCount++;
            });

            if (emptyMsg) {
                emptyMsg.hidden = visibleCount !== 0;
            }
        });
    });
}

/* ---------------------------------------------------------
   5. BOTÃO VOLTAR AO TOPO
   Aparece após rolar uma certa distância da página.
   --------------------------------------------------------- */
function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const SHOW_AFTER_PX = 420;

    window.addEventListener('scroll', () => {
        btn.classList.toggle('visible', window.scrollY > SHOW_AFTER_PX);
    });

    btn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

