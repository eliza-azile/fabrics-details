document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.querySelector('.menu__btn-login');
    const loginModal = document.querySelector('.section__login');

    console.log('Кнопка Войти:', loginButton);
    console.log('Модалка входа:', loginModal);
    console.log('ID поля email:', document.getElementById('text__to__log__in__to_current_account'));
    console.log('ID поля пароля:', document.getElementById('login-password'));

    // Проверим, открывается ли модалка
    if (loginButton) {
        loginButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            if (loginModal) {
                loginModal.style.display = 'block';
                document.body.classList.add('body--blurred');
                console.log('Модалка display:', loginModal.style.display);
            } else {
                console.log('❌ Модалка не найдена!');
            }
        });
    } else {
        console.log('❌ Кнопка Войти не найдена!');
    }

    // Находим все необходимые элементы
    const registerModal = document.querySelector('.section__authorization');
    const closeButtons = document.querySelectorAll('.close__btn');
    const returnButton = document.querySelector('.return__btn');
    const registrationBtn = document.querySelector('.registration__btn');
    const emailField = document.getElementById('text__to__log__in__to_current_account');
    const loginEmailField = document.getElementById('login-email');
    const body = document.body;

    console.log('Кнопка входа:', loginButton);
    console.log('Модалка входа:', loginModal);
    console.log('Поле email (ID: text__to__log__in__to_current_account):', emailField);
    console.log('Поле email (ID: login-email):', loginEmailField);


    // Проверяем, есть ли модальные окна на странице
    if (!loginModal) {
        console.log('Модалка входа не найдена на этой странице');
        return;
    }

    // Инициализация API
    if (!window.apiService) {
        console.error('API service not loaded!');
        return;
    }

    // Функция для открытия модалки
    function openModal(modal) {
        // Сначала проверяем, что модалка существует
        if (!modal) {
            console.error('Модальное окно не найдено');
            return;
        }

        // Скрываем все модальные окна
        document.querySelectorAll('.modal').forEach(m => {
            m.style.display = 'none';
        });

        // Показываем нужную модалку
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
        console.log('=== handleLogin ВЫЗВАН ===');
        const email = document.getElementById('text__to__log__in__to_current_account')?.value;
        const password = document.getElementById('login-password')?.value;

        if (!email || !password) {
            alert('Заполните все поля');
            return;
        }

        console.log('Отправляю запрос на вход...');

        const result = await apiService.login(email, password);

        console.log('Результат API:', result);

        if (result.success) {
            closeModal();
            updateUIAfterLogin(result.data.user);
        } else {
            console.log('Ошибка входа:', result.error);
            alert('Ошибка входа: ' + (result.error?.message || 'Неверные данные'));
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

        const result = await apiService.register(username, email, password, password2);
        if (result.success) {
            closeModal();
            updateUIAfterLogin(result.data.user);
        }
    };

    // Обновить UI после входа
    function updateUIAfterLogin(user) {
        const loginBtn = document.querySelector('.menu__btn-login');
        if (!loginBtn) return;

        // Сохраняем оригинальные классы
        const originalClasses = loginBtn.className;
        const originalHTML = loginBtn.innerHTML;

        // Создаем новое содержимое
        loginBtn.innerHTML = `
            <img class="menu__btn-img" alt="Профиль пользователя" src="/images/icon-enter.svg">
            <span class="menu__btn-text">👤 ${user.username}</span>
        `;

        // Добавляем кнопку выхода как отдельный элемент рядом
        if (!document.querySelector('.logout-btn')) {
            const logoutBtn = document.createElement('button');
            logoutBtn.className = 'logout-btn';
            logoutBtn.textContent = 'Выйти';
            logoutBtn.style.cssText = `
                background: #dc3545;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                margin-left: 10px;
                font-size: 12px;
            `;
            logoutBtn.onclick = function (e) {
                e.stopPropagation();
                logoutUser();
            };

            // Вставляем кнопку выхода после кнопки входа
            loginBtn.parentNode.insertBefore(logoutBtn, loginBtn.nextSibling);
        }

        // Обновляем обработчик клика на кнопку входа
        loginBtn.onclick = function (e) {
            e.stopPropagation();
            openModal(loginModal);
        };
    }

    // Функция выхода
    window.logoutUser = function () {
        apiService.logout();

        const loginBtn = document.querySelector('.menu__btn-login');
        const logoutBtn = document.querySelector('.logout-btn');

        if (logoutBtn) {
            logoutBtn.remove();
        }

        if (loginBtn) {
            // Восстанавливаем оригинальную кнопку
            loginBtn.innerHTML = `
                <img class="menu__btn-img" alt="Войти в аккаунт" src="/images/icon-enter.svg">
                <span class="menu__btn-text">Войти</span>
            `;

            // Восстанавливаем обработчик
            loginBtn.onclick = function () {
                openModal(loginModal);
            };
        }
    };

    // Проверить авторизацию при загрузке
    if (apiService.isAuthenticated()) {
        apiService.getProfile().then(result => {
            if (result.success) {
                updateUIAfterLogin(result.data);
            }
        });
    }

    // Открытие модалки входа по кнопке "Войти" в хедере
    if (loginButton) {
        loginButton.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
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

    // Также закрытие по клику вне модалки
    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('modal') ||
            e.target.classList.contains('body--blurred')) {
            closeModal();
        }
    });
});