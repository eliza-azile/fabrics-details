
document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.querySelector('.menu__btn-login');
    const loginModal = document.querySelector('.section__login');
    const registerModal = document.querySelector('.section__authorization');
    const closeButtons = document.querySelectorAll('.close__btn');
    const returnButton = document.querySelector('.return__btn');
    const registrationBtn = document.querySelector('.registration__btn');
    const body = document.body;

    // Инициализация AP
    if (!window.apiService) {
        console.error('API service not loaded!');
        return;
    }

    // Функция для открытия модалки
    function openModal(modal) {
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
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert('Заполните все поля');
            return;
        }

        const result = await apiService.login(email, password);
        if (result.success) {
            closeModal();
            // Обновить UI (показать имя пользователя вместо кнопки "Войти")
            updateUIAfterLogin(result.data.user);
        }
    };

    // Обработчик регистрации
    window.handleRegister = async function () {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const password2 = document.getElementById('register-password2').value;

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
        // Найти кнопку "Войти" и заменить её на приветствие
        const loginBtn = document.querySelector('.menu__btn-login');
        if (loginBtn) {
            loginBtn.innerHTML = `<span>👤 ${user.username}</span>
                                  <button onclick="logoutUser()" style="margin-left: 10px; background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">
                                    Выйти
                                  </button>`;
        }
    }

    // Функция выхода
    window.logoutUser = function () {
        apiService.logout();
        // Вернуть кнопку "Войти"
        const loginBtn = document.querySelector('.menu__btn-login');
        if (loginBtn) {
            loginBtn.innerHTML = 'Войти';
            loginBtn.onclick = function () {
                openModal(loginModal);
            };
        }
    };
    // Проверить авторизацию при загрузке
    if (apiService.isAuthenticated()) {
        // Загрузить профиль и обновить UI
        apiService.getProfile().then(result => {
            if (result.success) {
                updateUIAfterLogin(result.data);
            }
        });
    }

    // Открытие модалки входа по кнопке "Войти" в хедере
    loginButton.addEventListener('click', function () {
        openModal(loginModal);
    });

    // Переход к регистрации по клику на первую кнопку в options
    registrationBtn.addEventListener('click', function () {
        openModal(registerModal);
    });

    // Возврат ко входу по стрелке
    returnButton.addEventListener('click', function () {
        openModal(loginModal);
    });

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
});