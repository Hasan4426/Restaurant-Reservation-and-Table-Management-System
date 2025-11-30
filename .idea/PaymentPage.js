document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('payment-form');

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault(); // prevent default submission

        const cardNumber = document.getElementById('card-number').value.trim();
        const secureKey = document.getElementById('secure-key').value.trim();
        const expiryDate = document.getElementById('expiry-date').value.trim();

        // Validate fields
        if (!cardNumber || !secureKey || !expiryDate) {
            alert("Please fill in all required fields before paying.");
            return false;
        }

        // Credit Card Number: must be 16 digits
        const cardRegex = /^[0-9]{16}$/;
        if (!cardRegex.test(cardNumber)) {
            alert("Please enter a valid 16-digit credit card number.");
            return false;
        }

        // Secure Key: must be 3 digits
        const secureKeyRegex = /^[0-9]{3}$/;
        if (!secureKeyRegex.test(secureKey)) {
            alert("Please enter a valid 3-digit secure key.");
            return false;
        }

        // Expiration Date: must not be empty (optional: you can check if it's in the future)
        if (!expiryDate) {
            alert("Please enter the expiration date.");
            return false;
        }

        // All validation passed, you can now proceed with payment
        alert("Payment information valid! Processing payment...");
        // You can then redirect or process payment
        // window.location.href = "SuccessPage.html";
    });
});