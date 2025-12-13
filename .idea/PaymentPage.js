document.addEventListener('DOMContentLoaded', () => {
    const paymentForm = document.getElementById('payment-form');
    const cardInput = document.getElementById('card-number');
    const secureKeyInput = document.getElementById('secure-key');
    const expiryDateInput = document.getElementById('expiration-date');

    // Auto-format card number (add spaces every 4 digits)
    cardInput.addEventListener('input', () => {
        let value = cardInput.value.replace(/\D/g, ''); // remove non-digits
        value = value.substring(0, 16); // limit to 16 digits

        // add spaces every 4 digits
        const formatted = value.replace(/(.{4})/g, '$1 ').trim();
        cardInput.value = formatted;
    });

    paymentForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Remove spaces before validation
        const cardNumber = cardInput.value.replace(/\s/g, '');
        const secureKey = secureKeyInput.value.trim();
        const expiryDate = expiryDateInput.value.trim();

        // Empty check
        if (!cardNumber || !secureKey || !expiryDate) {
            alert("Please fill in all required fields.");
            return;
        }

        // Card number: exactly 16 digits (spaces ignored)
        if (!/^\d{16}$/.test(cardNumber)) {
            alert("Credit card number must be 16 digits.");
            return;
        }

        // Secure key: exactly 3 digits
        if (!/^\d{3}$/.test(secureKey)) {
            alert("Secure key must be 3 digits.");
            return;
        }

        // Optional: expiration date validation
        const today = new Date();
        const selectedDate = new Date(expiryDate);

        if (selectedDate < today) {
            alert("Card is expired.");
            return;
        }

        // Success
        alert("Payment information valid! Processing payment...");
        // window.location.href = "SuccessPage.html";
    });
});
