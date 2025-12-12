document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".signup-form");
    const email = document.getElementById("email");
    const password = document.getElementById("password");
    const confirmPassword = document.getElementById("confirmPassword");
    const inputs = document.querySelectorAll(".input-wrapper input");
    const eyeIcons = document.querySelectorAll(".toggle-password");


    eyeIcons.forEach(icon => {
        icon.addEventListener("click", () => {
            const input = icon.previousElementSibling;

            if (input.type === "password") {
                input.type = "text";
                icon.textContent = "👁️";
            } else {
                input.type = "password";
                icon.textContent = "🙈";
            }
        });
    });
// signup.js - Replace the entire form event listener with this:

form.addEventListener("submit", (e) => {
    let valid = true;

    // Reset old errors
    document.querySelectorAll(".error-message").forEach(msg => {
        msg.style.visibility = "hidden";
        msg.textContent = "";
    });

    // 1. Check empty fields
    inputs.forEach(input => {
        const errorMsg = input.parentElement.querySelector(".error-message");

        if (input.value.trim() === "") {
            errorMsg.textContent = "This field is required";
            errorMsg.style.visibility = "visible";
            valid = false;
        }
    });

    // 2. Check Password Length
    if (password.value.length < 6) { // Changed check to 6 based on HTML attribute
        alert("Password must be at least 6 characters");
        valid = false;
    }

    // 3. Check Password Match
    if (password.value !== confirmPassword.value) {
        alert("Passwords do not match!");
        valid = false;
    }

    // If any validation failed, stop the submission to the server
    if (!valid) {
        e.preventDefault();
    }
    // If 'valid' is true, the default action (submitting to the '/signup' route) will run!
});
});