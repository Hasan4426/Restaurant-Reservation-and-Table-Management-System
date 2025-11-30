document.addEventListener('DOMContentLoaded', () => {
    const passwordInput = document.getElementById('password');
    const togglePassword = document.querySelector('.toggle-password');
    const loginForm = document.querySelector('.login-form');


    togglePassword.addEventListener('click', () => {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            togglePassword.textContent = '👁️';
        } else {
            passwordInput.type = 'password';
            togglePassword.textContent = '🙈';
        }
    });


    loginForm.addEventListener('submit', (e) => {
        if (passwordInput.value.length < 6) {
            alert("Password must be at least 6 characters");
            e.preventDefault();
        }
    });
});
