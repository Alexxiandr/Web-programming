const API_BASE = 'https://dummyjson.com/products';

async function fetchCategories() {
    const listElement = document.getElementById('categories-list');

    try {
        const res = await fetch(`${API_BASE}/categories`);
        const categories = await res.json();

        listElement.innerHTML = '';

        categories.forEach(cat => {
            const slug = typeof cat === 'string' ? cat : cat.slug;
            const name = typeof cat === 'string' ? cat : cat.name;

            const li = document.createElement('li');
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.textContent = name;
            btn.dataset.slug = slug;

            btn.addEventListener('click', () => {
                setActiveCategory(slug);
                fetchProductsByCategory(slug, name);
            });

            li.appendChild(btn);
            listElement.appendChild(li);
        });
    } catch (error) {
        console.error('Помилка завантаження категорій:', error);
        listElement.innerHTML = '<li>Не вдалося завантажити категорії</li>';
    }
}

async function fetchProducts() {
    const grid = document.getElementById('products-grid');
    const title = document.getElementById('catalog-title');
    grid.innerHTML = '<div class="status-msg">Завантаження всіх товарів...</div>';
    setActiveCategory(null);

    try {
        const res = await fetch(API_BASE);
        const data = await res.json();

        title.textContent = 'All products';
        renderProducts(data.products);
    } catch (error) {
        console.error('Помилка завантаження товарів:', error);
        grid.innerHTML = '<div class="status-msg">Помилка при отриманні даних із сервера.</div>';
    }
}

async function fetchProductsByCategory(categorySlug, categoryName) {
    const grid = document.getElementById('products-grid');
    const title = document.getElementById('catalog-title');
    grid.innerHTML = '<div class="status-msg">Завантаження товарів категорії...</div>';

    try {
        const res = await fetch(`${API_BASE}/category/${categorySlug}`);
        const data = await res.json();

        title.textContent = `Products in category: ${categoryName || categorySlug}`;
        renderProducts(data.products);
    } catch (error) {
        console.error('Помилка завантаження категорії:', error);
        grid.innerHTML = '<div class="status-msg">Не вдалося завантажити товари цієї категорії.</div>';
    }
}

async function fetchProductById(id) {
    const modal = document.getElementById('product-modal');
    const modalBody = document.getElementById('modal-body');

    modal.style.display = 'flex';
    modalBody.innerHTML = '<p>Завантаження інформації про товар...</p>';

    try {
        const res = await fetch(`${API_BASE}/${id}`);
        const product = await res.json();

        modalBody.innerHTML = `
            <img src="${product.thumbnail}" alt="${product.title}">
            <span class="cat-badge">${product.category}</span>
            <h3>${product.title}</h3>
            <p>${product.description}</p>
            <div class="modal-specs">
                <span>Ціна: $${product.price}</span>
                <span>Залишок: ${product.stock} шт.</span>
                <span>Рейтинг: ★ ${product.rating}</span>
            </div>
        `;
    } catch (error) {
        console.error('Помилка завантаження товару за ID:', error);
        modalBody.innerHTML = '<p>Не вдалося завантажити деталі товару.</p>';
    }
}

function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    const countBadge = document.getElementById('products-count');
    countBadge.textContent = `Товарів: ${products.length}`;

    if (!products || products.length === 0) {
        grid.innerHTML = '<div class="status-msg">У цій категорії товарів не знайдено.</div>';
        return;
    }

    grid.innerHTML = products.map(product => `
        <div class="product-card">
            <div>
                <img src="${product.thumbnail}" alt="${product.title}">
                <span class="cat-badge">${product.category}</span>
                <h4>${product.title}</h4>
            </div>
            <div>
                <div class="product-meta">
                    <span class="product-price">$${product.price}</span>
                    <span class="product-rating">★ ${product.rating}</span>
                </div>
                <button class="btn-details" onclick="fetchProductById(${product.id})">
                    Детальніше
                </button>
            </div>
        </div>
    `).join('');
}

function setActiveCategory(activeSlug) {
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        if (btn.dataset.slug === activeSlug) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

function closeModal(event) {
    if (event.target.id === 'product-modal') {
        document.getElementById('product-modal').style.display = 'none';
    }
}

fetchCategories();
fetchProducts();