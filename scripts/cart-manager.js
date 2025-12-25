class CartManager {
    constructor() {
        this.cart = this.loadCart();
    }

    // Загрузить корзину из localStorage
    loadCart() {
        try {
            const cartJson = localStorage.getItem('cart');
            return cartJson ? JSON.parse(cartJson) : [];
        } catch (e) {
            console.error('Error loading cart:', e);
            return [];
        }
    }

    // Сохранить корзину в localStorage
    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCounter();
    }

    // Добавить товар
    addItem(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                id: product.id,
                title: product.title,
                price: product.price,
                image: product.image || '/images/product-placeholder.jpg',
                quantity: quantity
            });
        }

        this.saveCart();
        this.showNotification(`Товар "${product.title}" добавлен в корзину!`);
        return this.cart;
    }

    // Удалить товар
    removeItem(productId) {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.saveCart();
        return this.cart;
    }

    // Обновить количество
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
        }
        return this.cart;
    }

    // Получить общее количество товаров
    getTotalCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Получить общую сумму
    getTotalPrice() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Очистить корзину
    clearCart() {
        this.cart = [];
        localStorage.removeItem('cart');
        this.updateCartCounter();
    }

    // Обновить счётчик в шапке
    updateCartCounter() {
        const count = this.getTotalCount();
        const cartButtons = document.querySelectorAll('.menu__btn-cart');

        cartButtons.forEach(btn => {
            // Удаляем старый счётчик
            const oldCounter = btn.querySelector('.cart-counter');
            if (oldCounter) oldCounter.remove();

            // Добавляем новый если есть товары
            if (count > 0) {
                const counter = document.createElement('span');
                counter.className = 'cart-counter';
                counter.textContent = count > 99 ? '99+' : count;
                btn.appendChild(counter);
            }
        });

        // Отправляем событие об обновлении
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { count, cart: this.cart }
        }));
    }

    // Показать уведомление
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
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

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);

        // Добавляем стили для анимации если их нет
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
}

// Создаём глобальный экземпляр
window.cartManager = new CartManager();

// Инициализируем счётчик при загрузке
document.addEventListener('DOMContentLoaded', () => {
    window.cartManager.updateCartCounter();
});