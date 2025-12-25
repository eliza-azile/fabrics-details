document.addEventListener('DOMContentLoaded', function () {
    const productsGrid = document.querySelector('.products-grid');

    if (!productsGrid || !window.productsData) return;

    // Очищаем старые карточки (если есть)
    productsGrid.innerHTML = '';

    // Генерируем карточки товаров
    window.productsData.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });

    // Добавляем обработчики событий
    addProductCardEventListeners();
});

function createProductCard(product) {
    const article = document.createElement('article');
    article.className = 'product-card';
    article.dataset.id = product.id;

    // Используем для форматирования с одной цифрой после запятой
    function formatRating(rating) {
        if (typeof rating === 'string') {
            rating = rating.replace('.', ',');
        }

        const numRating = parseFloat(rating.toString().replace(',', '.'));

        if (!isNaN(numRating)) {
            return numRating.toFixed(1).replace('.', ',');
        }

        return '5,0';
    }

    article.innerHTML = `
        <div class="product-card__image">
            
        </div>
        <div class="product-card__info">
            <div class="product-card__price">
                <span class="product-card__current-price">${formatPrice(product.price)} ₽</span>
            </div>
            <div class="product-card__content">
                <h3 class="product-card__title">${product.title}</h3>
                <div class="product-card__meta">
                    <span class="product-card__category"></span>
                    <span class="product-card__stock"></span>
                </div>
            </div>
            <div class="product-card__rating" aria-label="Рейтинг: ${formatRating(product.rating)} из 5 звезд">
                <img class="rating__star" alt="Звезда рейтинга" src="/images/star_filled.svg">
                <span class="rating__value">${formatRating(product.rating)}</span>
            </div>
        </div>
        <button class="product-card__cart-btn" data-product-id="${product.id}">Добавить в корзину</button>
    `;

    return article;
}

function addProductCardEventListeners() {
    // Обработчик кнопок "Добавить в корзину"
    document.querySelectorAll('.product-card__cart-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const productId = parseInt(this.dataset.productId);
            const product = window.productsData.find(p => p.id === productId);

            if (product) {
                addToCart(product);
            }
        });
    });

    // Обработчик клика по карточке (для перехода на страницу товара)
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // Если кликнули не по кнопке "Добавить в корзину"
            if (!e.target.closest('.product-card__cart-btn')) {
                const productId = parseInt(this.dataset.id);
                // window.location.href = `/product.html?id=${productId}`;
                console.log('Переход на страницу товара:', productId);
            }
        });
    });
}

function addToCart(product) {
    if (window.cartManager) {
        window.cartManager.addItem({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image
        });

        // Показываем уведомление
        showNotification(`Товар "${product.title}" добавлен в корзину!`, 'success');
    } else {
        // Локальное сохранение
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItem = cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        showNotification(`Товар "${product.title}" добавлен в корзину!`, 'success');

        // Обновляем счётчик
        if (window.cartManager) {
            window.cartManager.updateCartCounter();
        }
    }
}

function showNotification(message, type = 'success') {
    // Создаём уведомление
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Стили для уведомления
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        background: ${type === 'success' ? '#4CAF50' : '#f44336'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Удаляем через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);

    // Добавляем стили для анимации
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}