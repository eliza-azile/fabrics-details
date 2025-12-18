const API_BASE_URL = 'http://127.0.0.1:8000/api';

class ApiService {
    constructor() {
        this.token = localStorage.getItem('token');
        this.refreshTokenValue = localStorage.getItem('refreshToken'); // Переименовано
    }

    // Общие функции
    showNotification(message, type = 'success') {
        alert(`${type === 'success' ? '✅' : '❌'} ${message}`);
    }

    // 1. Регистрация
    async register(username, email, password, password2) {
        try {
            const response = await fetch(`${API_BASE_URL}/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password, password2 })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));

                this.token = data.access;
                this.refreshTokenValue = data.refresh;

                this.showNotification('Регистрация успешна!');
                return { success: true, data };
            } else {
                let errorMsg = 'Ошибка регистрации';
                if (data.email) errorMsg = `Email: ${data.email[0]}`;
                else if (data.password) errorMsg = `Пароль: ${data.password[0]}`;
                else if (data.username) errorMsg = `Имя: ${data.username[0]}`;
                else if (data.detail) errorMsg = data.detail;

                this.showNotification(errorMsg, 'error');
                return { success: false, error: data };
            }
        } catch (error) {
            this.showNotification('Ошибка сети: ' + error.message, 'error');
            return { success: false, error };
        }
    }

    // 2. Логин
    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/login/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access);
                localStorage.setItem('refreshToken', data.refresh);
                localStorage.setItem('user', JSON.stringify(data.user));

                this.token = data.access;
                this.refreshTokenValue = data.refresh;

                this.showNotification('Вход выполнен успешно!');
                return { success: true, data };
            } else {
                this.showNotification(data.error || 'Ошибка входа', 'error');
                return { success: false, error: data };
            }
        } catch (error) {
            this.showNotification('Ошибка сети: ' + error.message, 'error');
            return { success: false, error };
        }
    }

    // 3. Получить профиль
    async getProfile() {
        if (!this.token) {
            return { success: false, error: 'Нет токена' };
        }

        try {
            const response = await fetch(`${API_BASE_URL}/profile/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json',
                }
            });

            if (response.status === 401) {
                const refreshed = await this.refreshTokenFunc(); // Переименованный вызов
                if (refreshed) {
                    return this.getProfile();
                }
                return { success: false, error: 'Требуется авторизация' };
            }

            const data = await response.json();
            return response.ok
                ? { success: true, data }
                : { success: false, error: data };
        } catch (error) {
            console.error('Ошибка загрузки профиля:', error);
            return { success: false, error };
        }
    }

    // 4. Обновить токен (переименованный метод)
    async refreshTokenFunc() {
        if (!this.refreshTokenValue) {
            return false;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh: this.refreshTokenValue })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('token', data.access);
                this.token = data.access;
                return true;
            } else {
                this.logout();
                return false;
            }
        } catch (error) {
            console.error('Ошибка обновления токена:', error);
            this.logout();
            return false;
        }
    }

    // 5. Выход
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        this.token = null;
        this.refreshTokenValue = null;
        this.showNotification('Вы вышли из системы');
    }

    // 6. Проверить авторизацию
    isAuthenticated() {
        return !!this.token;
    }

    // 7. Получить данные пользователя
    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }
}

// Создаём глобальный экземпляр
window.apiService = new ApiService();