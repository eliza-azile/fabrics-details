document.addEventListener('DOMContentLoaded', function () {
    // Находим элементы
    const loginButton = document.querySelector('.menu__btn-login');
    const loginModal = document.querySelector('.section__login');
    const registerModal = document.querySelector('.section__authorization');
    const closeButtons = document.querySelectorAll('.close__btn');
    const returnButton = document.querySelector('.return__btn');
    const registrationBtn = document.querySelector('.registration__btn');
    const body = document.body;

    // Проверяем API
    if (!window.apiService) {
        console.error('API service not loaded!');
        return;
    }

    // Функция для открытия модалки
    function openModal(modal) {
        if (!modal) return;

        document.querySelectorAll('.modal').forEach(m => {
            m.style.display = 'none';
        });

        modal.style.display = 'block';
        body.classList.add('body--blurred');
    }

    // Функция для закрытия модалки
    function closeModal() {
        document.querySelectorAll('.modal').forEach(m => {
            m.style.display = 'none';
        });

        body.classList.remove('body--blurred');
    }

    // Обработчик логина
    window.handleLogin = async function () {
        const email = document.getElementById('text__to__log__in__to_current_account')?.value;
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            alert('Заполните все поля');
            return;
        }

        try {
            const result = await apiService.login(email, password);

            if (result.success) {
                closeModal();
                // Обновляем кнопку в хедере
                updateHeaderButton();
            } else {
                alert('Ошибка входа: ' + (result.error?.message || 'Неверные данные'));
            }
        } catch (error) {
            alert('Ошибка сети. Проверьте подключение к серверу.');
        }
    };

    // Обработчик регистрации
    window.handleRegister = async function () {
        const username = document.getElementById('register-username')?.value;
        const email = document.getElementById('register-email')?.value;
        const password = document.getElementById('register-password')?.value;
        const password2 = document.getElementById('register-password2')?.value;

        if (!username || !email || !password || !password2) {
            alert('Заполните все поля');
            return;
        }

        if (password !== password2) {
            alert('Пароли не совпадают');
            return;
        }

        // Проверяем чекбокс согласия
        const checkbox = document.querySelector('#register-form input[type="checkbox"]');
        if (checkbox && !checkbox.checked) {
            alert('Необходимо согласиться с условиями');
            return;
        }

        try {
            const result = await apiService.register(username, email, password, password2);

            if (result.success) {
                closeModal();
                // Обновляем кнопку в хедере
                updateHeaderButton();
            } else {
                alert('Ошибка регистрации: ' + (result.error?.message || 'Попробуйте другие данные'));
            }
        } catch (error) {
            alert('Ошибка сети. Проверьте подключение к серверу.');
        }
    };

    // Обновить кнопку в хедере (меняем "Войти" на "Личный кабинет")
    function updateHeaderButton() {
        const loginBtn = document.querySelector('.menu__btn-login');
        if (!loginBtn) return;

        // Просто меняем текст
        const textSpan = loginBtn.querySelector('.menu__btn-text');
        if (textSpan) {
            textSpan.textContent = 'Личный кабинет';
        }

        // Обновляем title/alt если нужно
        const img = loginBtn.querySelector('.menu__btn-img');
        if (img) {
            img.alt = 'Личный кабинет';
        }

        // Сохраняем информацию, что пользователь вошел
        loginBtn.dataset.loggedIn = 'true';
    }

    // Функция выхода (если понадобится)
    window.logoutUser = function () {
        apiService.logout();

        const loginBtn = document.querySelector('.menu__btn-login');
        if (loginBtn) {
            // Возвращаем "Войти"
            const textSpan = loginBtn.querySelector('.menu__btn-text');
            if (textSpan) {
                textSpan.textContent = 'Войти';
            }

            const img = loginBtn.querySelector('.menu__btn-img');
            if (img) {
                img.alt = 'Войти в аккаунт';
            }

            // Удаляем флаг
            delete loginBtn.dataset.loggedIn;
        }

        alert('Вы вышли из системы');
    };

    // Проверить авторизацию при загрузке и обновить кнопку если нужно
    if (apiService.isAuthenticated()) {
        updateHeaderButton();
    }

    // Открытие модалки входа по кнопке "Войти" в хедере
    if (loginButton) {
        loginButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            // Если пользователь уже вошел ("Личный кабинет"), не открываем модалку
            // (или можно сделать переход на страницу кабинета)
            if (this.dataset.loggedIn === 'true') {
                // Здесь можно сделать переход на страницу личного кабинета
                // window.location.href = '/profile.html';
                console.log('Переход в личный кабинет');
                return;
            }

            openModal(loginModal);
        });
    }

    // Переход к регистрации
    if (registrationBtn) {
        registrationBtn.addEventListener('click', function () {
            openModal(registerModal);
        });
    }

    // Возврат ко входу
    if (returnButton) {
        returnButton.addEventListener('click', function () {
            openModal(loginModal);
        });
    }

    // Закрытие модалок по крестику
    closeButtons.forEach(btn => {
        btn.addEventListener('click', closeModal);
    });

    // Закрытие по Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });

    // Закрытие по клику вне модалки
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal') ||
            e.target.classList.contains('body--blurred')) {
            closeModal();
        }
    });
});