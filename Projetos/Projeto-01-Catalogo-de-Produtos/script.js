/* =========================================================
   CATÁLOGO DE PRODUTOS — script.js
   Dados fictícios + busca + filtro por categoria
   ========================================================= */

const PRODUCTS = [
    { id: 1, name: 'Fone Bluetooth XB900', category: 'eletronicos', price: 349.90, desc: 'Som imersivo com cancelamento de ruído ativo e 30h de bateria.', emoji: '🎧' },
    { id: 2, name: 'Smartphone S23 Ultra', category: 'eletronicos', price: 4799.00, desc: 'Câmera de 200MP, tela AMOLED 6.8" e caneta S-Pen inclusa.', emoji: '📱' },
    { id: 3, name: 'Notebook Slim 15', category: 'eletronicos', price: 3299.00, desc: 'Intel i5, 16 GB RAM, SSD 512 GB e tela Full HD IPS.', emoji: '💻' },
    { id: 4, name: 'Smartwatch Fit Pro', category: 'eletronicos', price: 599.90, desc: 'Monitor cardíaco, SpO2, GPS e 7 dias de autonomia.', emoji: '⌚' },
    { id: 5, name: 'Camiseta Básica Premium', category: 'roupas', price: 59.90, desc: 'Algodão 100% penteado, corte regular, 8 cores disponíveis.', emoji: '👕' },
    { id: 6, name: 'Jaqueta Puffer Nylon', category: 'roupas', price: 239.90, desc: 'Impermeável, leve e dobrável. Ideal para dias frios.', emoji: '🧥' },
    { id: 7, name: 'Tênis Running Air', category: 'roupas', price: 429.00, desc: 'Solado com amortecimento extra e cabedal em mesh respirável.', emoji: '👟' },
    { id: 8, name: 'Moletom Comfort Fit', category: 'roupas', price: 149.90, desc: 'Fleece interno macio, bolso canguru e capuz regulável.', emoji: '🧣' },
    { id: 9, name: 'Clean Code — R. Martin', category: 'livros', price: 89.90, desc: 'O guia definitivo para escrever código limpo e manutenível.', emoji: '📗' },
    { id: 10, name: 'Design Patterns', category: 'livros', price: 94.00, desc: 'Gang of Four: os 23 padrões de projeto explicados com exemplos.', emoji: '📘' },
    { id: 11, name: 'O Programador Apaixonado', category: 'livros', price: 49.90, desc: 'Como construir uma carreira notável em desenvolvimento de software.', emoji: '📙' },
    { id: 12, name: 'Cafeteira French Press', category: 'casa', price: 119.90, desc: 'Vidro borossilicato 1 L, filtro inox e design minimalista.', emoji: '☕' },
    { id: 13, name: 'Luminária LED Smart', category: 'casa', price: 189.00, desc: 'Compatível com Alexa e Google Home. 16 milhões de cores.', emoji: '💡' },
    { id: 14, name: 'Mesa Articulada Monitor', category: 'casa', price: 279.90, desc: 'Suporte de mesa com braço articulado para monitor até 32".', emoji: '🖥️' },
];

// Estado
let activeCategory = 'all';
let searchQuery = '';

// Elementos
const grid       = document.getElementById('productGrid');
const emptyMsg   = document.getElementById('emptyMsg');
const countBadge = document.getElementById('countBadge');
const searchInput = document.getElementById('searchInput');
const filterBtns  = document.querySelectorAll('.filter-btn');

/* ---- Renderiza os cards ---- */
function render() {
    const q = searchQuery.toLowerCase();

    const filtered = PRODUCTS.filter(p => {
        const matchCat  = activeCategory === 'all' || p.category === activeCategory;
        const matchText = p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q);
        return matchCat && matchText;
    });

    grid.innerHTML = '';

    if (filtered.length === 0) {
        emptyMsg.hidden = false;
        countBadge.textContent = '0 produtos';
        return;
    }

    emptyMsg.hidden = true;
    countBadge.textContent = `${filtered.length} produto${filtered.length !== 1 ? 's' : ''}`;

    filtered.forEach(p => {
        const card = document.createElement('article');
        card.className = 'product-card';
        card.setAttribute('role', 'listitem');
        card.innerHTML = `
            <div class="product-img" aria-hidden="true">${p.emoji}</div>
            <div class="product-body">
                <p class="product-name">${p.name}</p>
                <p class="product-desc">${p.desc}</p>
                <div class="product-footer">
                    <span class="product-price">R$ ${p.price.toFixed(2).replace('.', ',')}</span>
                    <span class="product-tag">${p.category}</span>
                </div>
                <button class="btn-cart" data-id="${p.id}">🛒 Adicionar ao carrinho</button>
            </div>
        `;
        grid.appendChild(card);
    });

    // Feedback visual no botão de carrinho
    grid.querySelectorAll('.btn-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.textContent = '✅ Adicionado!';
            btn.classList.add('added');
            setTimeout(() => {
                btn.textContent = '🛒 Adicionar ao carrinho';
                btn.classList.remove('added');
            }, 1500);
        });
    });
}

/* ---- Filtros ---- */
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeCategory = btn.dataset.cat;
        render();
    });
});

/* ---- Busca com debounce leve ---- */
let debounceTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        searchQuery = searchInput.value;
        render();
    }, 200);
});

/* ---- Init ---- */
render();
