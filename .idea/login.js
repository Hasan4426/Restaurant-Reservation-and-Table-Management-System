document.addEventListener("DOMContentLoaded", () => {
    const passwordInput = document.getElementById("password");
    const togglePassword = document.querySelector(".toggle-password");
    const loginForm = document.querySelector(".login-form");
    const emailInput = document.getElementById("email");

    // Toggle password visibility
    togglePassword.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            togglePassword.textContent = "👁️";
        } else {
            passwordInput.type = "password";
            togglePassword.textContent = "🙈";
        }
    });

    // Form submission
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Basic frontend validation
        if (!emailInput.value.trim() || passwordInput.value.trim().length < 6) {
            alert("Please enter valid email and password (min 6 characters)");
            return;
        }

        // Send login request to backend
        try {
            const response = await fetch("http://localhost:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    email: emailInput.value.trim(),
                    password: passwordInput.value.trim()
                })
            });

            const data = await response.json();
            alert(data.message);

            if (response.ok) {
                window.location.href = "CustomerDashboard.html"; // redirect on success
            }
        } catch (error) {
            alert("Error connecting to server. Try again.");
            console.error(error);
        }
    });
});
