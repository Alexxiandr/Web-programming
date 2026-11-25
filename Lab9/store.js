class Product {
    constructor(name, category, amount, image) {
        this.name = name;
        this.category = category;
        this.amount = amount;
        this.image = image;
    }

    addToBasket() {
        console.log(`Product with name ${this.name} has been added to the basket`);
    }
}

class Shoe extends Product {
    constructor(name, amount, image) {
        super(name, 'shoe', amount, image);
    }
}

class Grocerie extends Product {
    constructor(name, amount, image) {
        super(name, 'grocerie', amount, image);
    }
}

function productFactory(item) {
    if (item.category === 'shoe') {
        return new Shoe(item.name, item.amount, item.image);
    } else if (item.category === 'grocerie') {
        return new Grocerie(item.name, item.amount, item.image);
    }
    throw new Error(`Невідома категорія товару: ${item.category}`);
}

class Basket {
    products = [];

    add(product) {
        const addedTime = new Date().toLocaleTimeString('uk-UA');
        const productWithTime = Object.assign(
            Object.create(Object.getPrototypeOf(product)),
            product,
            { addedAt: addedTime }
        );

        this.products.push(productWithTime);
        this.renderBasket();
    }

    remove(basketIndex) {
        const removed = this.products.splice(basketIndex, 1)[0];
        this.renderBasket();
        return removed;
    }

    renderBasket() {
        const basketList = document.getElementById('basket-list');
        const basketCount = document.getElementById('basket-count');
        basketCount.textContent = this.products.length;

        if (this.products.length === 0) {
            basketList.innerHTML = '<p class="empty-msg">Кошик порожній. Оберіть товари з каталогу.</p>';
            return;
        }

        basketList.innerHTML = this.products.map((item, idx) => `
            <div class="basket-item">
                <img src="${item.image}" alt="${item.name}">
                <div class="basket-info">
                    <div class="basket-name">${idx + 1}. ${item.name}</div>
                    <div class="basket-meta">
                        <span class="cat-tag">${item.category}</span>
                        <span class="time-tag">Додано о: <b>${item.addedAt}</b></span>
                    </div>
                </div>
                <button class="btn-remove" onclick="store.removeProductFromBasket(${idx})" title="Прибрати з кошика">Видалити</button>
            </div>
        `).join('');
    }
}

class Store {
    products = [];

    constructor() {
        this.basket = new Basket();
    }

    fillStoreWithProducts(dataFromJson) {
        this.products = dataFromJson.map(item => productFactory(item));
    }

    addProductToBasket(productIndex) {
        const product = this.products[productIndex];
        if (!product || product.amount <= 0) {
            alert('Товар закінчився на складі магазину!');
            return;
        }

        product.amount -= 1;
        product.addToBasket();
        this.basket.add(product);
        this.renderProducts();
    }

    removeProductFromBasket(basketIndex) {
        const removedItem = this.basket.remove(basketIndex);
        if (removedItem) {
            const storeProduct = this.products.find(p => p.name === removedItem.name);
            if (storeProduct) {
                storeProduct.amount += 1;
            }
            this.renderProducts();
        }
    }

    renderProducts() {
        const grid = document.getElementById('products-grid');
        grid.innerHTML = this.products.map((product, index) => `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <span class="category-badge">${product.category}</span>
                <h4>${product.name}</h4>
                <p class="stock-info">В наявності: <b>${product.amount} шт.</b></p>
                <button 
                    class="btn-add" 
                    onclick="store.addProductToBasket(${index})"
                    ${product.amount === 0 ? 'disabled' : ''}>
                    ${product.amount === 0 ? 'Немає в наявності' : 'Додати у кошик'}
                </button>
            </div>
        `).join('');
    }
}

const fallbackProducts = [
    {
        name: "Сухий повнораціонний корм для котів 1.5 кг",
        category: "grocerie",
        amount: 5,
        image: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&h=300&fit=crop"
    },
    {
        name: "М'ясний раціон для собак малих порід",
        category: "grocerie",
        amount: 4,
        image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop"
    },
    {
        name: "Зернові ласощі та вітаміни для гризунів",
        category: "grocerie",
        amount: 6,
        image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400&h=300&fit=crop"
    },
    {
        name: "Прогулянковий комплект для активних собак",
        category: "shoe",
        amount: 3,
        image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=400&h=300&fit=crop"
    },
    {
        name: "Захисні черевички та амуніція для вигулу",
        category: "shoe",
        amount: 2,
        image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop"
    },
    {
        name: "Домашні антиковзкі шкарпетки для тварин",
        category: "shoe",
        amount: 4,
        image: "https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?w=400&h=300&fit=crop"
    }
];

const store = new Store();

async function initApp() {
    let data;
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('Помилка завантаження JSON');
        }
        data = await response.json();
    } catch (e) {
        data = fallbackProducts;
    }

    store.fillStoreWithProducts(data);
    store.renderProducts();
    store.basket.renderBasket();
}

window.addEventListener('DOMContentLoaded', initApp);