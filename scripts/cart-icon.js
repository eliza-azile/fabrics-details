// [file name]: cart-icon.js
document.addEventListener('DOMContentLoaded', function () {
    // Функция для обновления счётчика товаров в корзине
    function updateCartCounter() {
        const cartButtons = document.querySelectorAll('.menu__btn-cart');
        const cartCount = getCartItemCount(); // Получаем количество из localStorage или API

        cartButtons.forEach(btn => {
            // Убираем старый счётчик если есть
            const oldCounter = btn.querySelector('.cart-counter');
            if (oldCounter) {
                oldCounter.remove();
            }

            // Добавляем новый если есть товары
            if (cartCount > 0) {
                const counter = document.createElement('span');
                counter.className = 'cart-counter';
                counter.textContent = cartCount;
                btn.appendChild(counter);
            }
        });
    }

    // Получаем количество товаров (пока из localStorage, потом из API)
    function getCartItemCount() {
        // Проверяем localStorage
        const cart = localStorage.getItem('cart');
        if (cart) {
            try {
                const cartData = JSON.parse(cart);
                return cartData.reduce((total, item) => total + item.quantity, 0);
            } catch (e) {
                return 0;
            }
        }
        return 0;
    }

    // Инициализация
    updateCartCounter();

    // Обновляем при изменении localStorage (если другая вкладка изменила корзину)
    window.addEventListener('storage', function (e) {
        if (e.key === 'cart') {
            updateCartCounter();
        }
    });

    // Для отладки: кнопка добавления товара в корзину на главной
    document.querySelectorAll('.product-card__cart-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            addToCartFromMain();
        });
    });

    function addToCartFromMain() {
        // Получаем данные товара
        const productCard = this.closest('.product-card');
        const title = productCard.querySelector('.product-card__title').textContent;
        const price = parseInt(productCard.querySelector('.product-card__current-price').textContent.replace(/[^\d]/g, ''));

        // Добавляем в корзину
        let cart = JSON.parse(localStorage.getItem('cart') || '[]');

        // Проверяем, есть ли уже такой товар
        const existingItem = cart.find(item => item.title === title);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: Date.now(), // Временный ID
                title: title,
                price: price,
                quantity: 1,
                image: '/images/product-placeholder.jpg'
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartCounter();

        // Показываем уведомление
        alert(`Товар "${title}" добавлен в корзину!`);
    }
});