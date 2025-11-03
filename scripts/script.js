document.addEventListener('DOMContentLoaded', function () {
    const loginButton = document.querySelector('.button__login');
    const loginModal = document.querySelector('.section__login');
    const registerModal = document.querySelector('.section__authorization');
    const closeButtons = document.querySelectorAll('.close__btn');
    const returnButton = document.querySelector('.return__btn');
    const registrationBtn = document.querySelector('.registration__btn');
    const body = document.body;

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