// [file name]: cart-data.js
window.cartManager = {
    // Получить все товары
    getCart: function () {
        const cartJson = localStorage.getItem('cart');
        return cartJson ? JSON.parse(cartJson) : [];
    },

    // Добавить товар
    addItem: function (item) {
        let cart = this.getCart();
        const existingItem = cart.find(i => i.id === item.id);

        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            cart.push({
                ...item,
                quantity: item.quantity || 1
            });
        }

        this.saveCart(cart);
        this.updateCartCounter();
        return cart;
    },

    // Удалить товар
    removeItem: function (itemId) {
        let cart = this.getCart();
        cart = cart.filter(item => item.id !== itemId);
        this.saveCart(cart);
        this.updateCartCounter();
        return cart;
    },

    // Обновить количество
    updateQuantity: function (itemId, quantity) {
        let cart = this.getCart();
        const item = cart.find(i => i.id === itemId);

        if (item) {
            item.quantity = quantity;
            this.saveCart(cart);
            this.updateCartCounter();
        }

        return cart;
    },

    // Очистить корзину
    clearCart: function () {
        localStorage.removeItem('cart');
        this.updateCartCounter();
    },

    // Получить общее количество
    getTotalCount: function () {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + item.quantity, 0);
    },

    // Получить общую сумму
    getTotalPrice: function () {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    },

    // Сохранить корзину
    saveCart: function (cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
        // Отправляем событие об обновлении
        window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    },

    // Обновить счётчик во всех кнопках
    updateCartCounter: function () {
        const count = this.getTotalCount();
        const cartButtons = document.querySelectorAll('.menu__btn-cart');

        cartButtons.forEach(btn => {
            let counter = btn.querySelector('.cart-counter');

            if (count > 0) {
                if (!counter) {
                    counter = document.createElement('span');
                    counter.className = 'cart-counter';
                    btn.appendChild(counter);
                }
                counter.textContent = count;
            } else if (counter) {
                counter.remove();
            }
        });
    }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function () {
    window.cartManager.updateCartCounter();
});

// Слушаем события обновления корзины
window.addEventListener('cartUpdated', function (e) {
    window.cartManager.updateCartCounter();
});