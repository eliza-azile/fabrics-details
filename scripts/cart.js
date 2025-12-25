document.addEventListener('DOMContentLoaded', function () {
    console.log('Cart page loaded');

    // Используем cartManager для получения данных
    let cartData = window.cartManager ? window.cartManager.cart : [];
    console.log('Cart data from manager:', cartData);

    // Получаем элемент заголовка
    const cartTitle = document.querySelector('.cart-title');

    // Функция для скрытия/показа заголовка
    function toggleCartTitleVisibility() {
        const cartItems = document.querySelectorAll('.cart-item');

        if (cartTitle) {
            cartTitle.style.display = cartItems.length === 0 ? 'none' : 'block';
        }
    }

    // Инициализация корзины
    function initCart() {
        console.log('Initializing cart with', cartData.length, 'items');

        if (cartData.length > 0) {
            showCartContent();
            renderCartItems();
        } else {
            showEmptyCart();
        }

        updateCartSummary();
        toggleCartTitleVisibility();
    }

    // Показать содержимое корзины
    function showCartContent() {
        const cartContent = document.querySelector('.cart-content');
        const cartEmpty = document.querySelector('.cart-empty');

        if (cartContent) cartContent.style.display = 'flex';
        if (cartEmpty) cartEmpty.style.display = 'none';
    }

    // Показать пустую корзину
    function showEmptyCart() {
        const cartContent = document.querySelector('.cart-content');
        const cartEmpty = document.querySelector('.cart-empty');

        if (cartContent) cartContent.style.display = 'none';
        if (cartEmpty) cartEmpty.style.display = 'flex';
    }

    // Отрисовка товаров
    function renderCartItems() {
        const cartItemsContainer = document.querySelector('.cart-items');
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';

        cartData.forEach((item, index) => {
            const cartItem = createCartItemElement(item, index);
            cartItemsContainer.appendChild(cartItem);
        });

        // Навешиваем обработчики
        attachEventListeners();
    }

    // Создание элемента товара
    function createCartItemElement(item, index) {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.dataset.id = item.id;

        div.innerHTML = `
            <div class="cart-item__image">
                <img src="${item.image || '/images/product-placeholder.jpg'}" alt="${item.title}">
            </div>
            <div class="cart-item__info">
                <h3 class="cart-item__title">${item.title}</h3>
                <div class="cart-item__details">
                    <span class="cart-item__seller">Продавец: F&D</span>
                </div>
                <div class="cart-item__actions">
                    <div class="quantity-selector">
                        <button class="quantity-btn minus">−</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="99">
                        <button class="quantity-btn plus">+</button>
                    </div>
                    <button class="remove-btn">Удалить</button>
                </div>
            </div>
            <div class="cart-item__price">
                <div class="price-current">${formatPrice(item.price * item.quantity)} ₽</div>
                <div class="price-per-item">${formatPrice(item.price)} ₽/шт</div>
            </div>
        `;

        return div;
    }

    // Навешивание обработчиков
    function attachEventListeners() {
        // Управление количеством
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const cartItem = this.closest('.cart-item');
                const itemId = parseInt(cartItem.dataset.id);
                const input = cartItem.querySelector('.quantity-input');
                let value = parseInt(input.value);

                if (this.classList.contains('minus') && value > 1) {
                    input.value = value - 1;
                    updateCartItemQuantity(itemId, value - 1);
                } else if (this.classList.contains('plus') && value < 99) {
                    input.value = value + 1;
                    updateCartItemQuantity(itemId, value + 1);
                }
            });
        });

        // Прямой ввод количества
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', function () {
                const cartItem = this.closest('.cart-item');
                const itemId = parseInt(cartItem.dataset.id);
                let value = parseInt(this.value);

                if (isNaN(value) || value < 1) {
                    this.value = 1;
                    value = 1;
                } else if (value > 99) {
                    this.value = 99;
                    value = 99;
                }

                updateCartItemQuantity(itemId, value);
            });
        });

        // Удаление товара
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', function () {
                const cartItem = this.closest('.cart-item');
                const itemId = parseInt(cartItem.dataset.id);

                cartItem.style.animation = 'fadeOut 0.3s ease';

                setTimeout(() => {
                    removeCartItem(itemId);
                    cartItem.remove();
                    checkCartEmpty();
                    updateCartSummary();
                }, 300);
            });
        });
    }

    // Обновить количество товара
    function updateCartItemQuantity(itemId, quantity) {
        if (window.cartManager) {
            window.cartManager.updateQuantity(itemId, quantity);
            cartData = window.cartManager.cart;
        } else {
            // Локальная логика
            const item = cartData.find(item => item.id === itemId);
            if (item) {
                item.quantity = quantity;
                localStorage.setItem('cart', JSON.stringify(cartData));
            }
        }
        updateCartItemUI(itemId);
        updateCartSummary();
    }

    // Удалить товар
    function removeCartItem(itemId) {
        if (window.cartManager) {
            window.cartManager.removeItem(itemId);
            cartData = window.cartManager.cart;
        } else {
            cartData = cartData.filter(item => item.id !== itemId);
            localStorage.setItem('cart', JSON.stringify(cartData));
        }
    }

    // Обновить UI товара
    function updateCartItemUI(itemId) {
        const item = cartData.find(item => item.id === itemId);
        const cartItem = document.querySelector(`.cart-item[data-id="${itemId}"]`);

        if (item && cartItem) {
            cartItem.querySelector('.price-current').textContent =
                `${formatPrice(item.price * item.quantity)} ₽`;
            cartItem.querySelector('.quantity-input').value = item.quantity;
        }
    }

    // Обновить итоговую сумму
    function updateCartSummary() {
        let totalItems = 0;
        let totalPrice = 0;

        if (window.cartManager) {
            totalItems = window.cartManager.getTotalCount();
            totalPrice = window.cartManager.getTotalPrice();
        } else {
            cartData.forEach(item => {
                totalItems += item.quantity;
                totalPrice += item.price * item.quantity;
            });
        }

        // Обновляем UI
        const itemsCountElement = document.querySelector('.items-count');
        const itemsPriceElement = document.querySelector('.items-total');
        const totalPriceElement = document.querySelector('.total-price');

        if (itemsCountElement && itemsPriceElement && totalPriceElement) {
            itemsCountElement.textContent = `Товары (${totalItems})`;
            itemsPriceElement.textContent = formatPrice(totalPrice) + ' ₽';
            totalPriceElement.textContent = formatPrice(totalPrice) + ' ₽';
        }

        checkCartEmpty();
    }

    // Проверить, пуста ли корзина
    function checkCartEmpty() {
        const hasItems = cartData.length > 0;

        if (hasItems) {
            showCartContent();
        } else {
            showEmptyCart();
        }

        toggleCartTitleVisibility();
    }

    // Форматирование цены
    function formatPrice(price) {
        return price.toLocaleString('ru-RU');
    }

    // Применение промокода
    const promoBtn = document.querySelector('.promo-btn');
    if (promoBtn) {
        promoBtn.addEventListener('click', function () {
            const promoInput = document.querySelector('.promo-input');
            const promoCode = promoInput.value.trim();

            if (promoCode) {
                alert(`Промокод "${promoCode}" применён!`);
                promoInput.value = '';
            } else {
                alert('Введите промокод');
            }
        });
    }

    // Оформление заказа
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
            if (cartData.length === 0) {
                alert('Добавьте товары в корзину перед оформлением заказа');
                return;
            }

            if (!window.apiService || !window.apiService.isAuthenticated()) {
                alert('Для оформления заказа необходимо войти в систему');
                return;
            }

            alert('Переход к оформлению заказа');
        });
    }

    // Перейти в каталог
    const continueBtn = document.querySelector('.empty-cart-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', function () {
            window.location.href = '/';
        });
    }

    // Слушаем обновления корзины с других вкладок
    window.addEventListener('storage', function (e) {
        if (e.key === 'cart') {
            cartData = window.cartManager ? window.cartManager.loadCart() : JSON.parse(e.newValue || '[]');
            renderCartItems();
            updateCartSummary();
        }
    });

    // Инициализация
    initCart();

    // Добавляем стиль для анимации
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeOut {
            from { opacity: 1; transform: translateY(0); }
            to { opacity: 0; transform: translateY(-20px); }
        }
    `;
    document.head.appendChild(style);
});