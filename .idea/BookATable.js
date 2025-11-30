 // Generate numbers dynamically
   document.addEventListener("DOMContentLoaded", () => {
           const dropdown = document.querySelector(".custom-dropdown");
           const selected = dropdown.querySelector(".selected");
           const list = dropdown.querySelector(".dropdown-list");
        for (let i = 1; i <= 20; i++) {
            let li = document.createElement("li");
            li.textContent = i;
            li.addEventListener("click", () => {
                selected.textContent = li.textContent;
                list.style.display = "none";
            });
            list.appendChild(li);
        }

        // Open / Close dropdown
        selected.addEventListener("click", () => {
            list.style.display = list.style.display === "block" ? "none" : "block";
        });

        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!dropdown.contains(e.target)) {
                list.style.display = "none";
            }
        });
    });
    document.getElementById("book-now").addEventListener("click", () => {
        window.location.href = "PaymentPage.html"; // redirect to Payment Page
    });
// BookATable.js

document.addEventListener("DOMContentLoaded", () => {
    // Custom dropdown
    const dropdown = document.querySelector(".custom-dropdown");
    const selected = dropdown.querySelector(".selected");
    const list = dropdown.querySelector(".dropdown-list");

    for (let i = 1; i <= 20; i++) {
        let li = document.createElement("li");
        li.textContent = i;
        li.addEventListener("click", () => {
            selected.textContent = li.textContent;
            list.style.display = "none";
        });
        list.appendChild(li);
    }

    selected.addEventListener("click", () => {
        list.style.display = list.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target)) {
            list.style.display = "none";
        }
    });

    // Form validation and redirect
    const form = document.getElementById("booking-form");
    form.addEventListener("submit", (e) => {
        e.preventDefault(); // prevent default submit

        const requiredFields = ["name", "surname", "phone", "email", "guests", "date", "time"];
        let valid = true;

        requiredFields.forEach(id => {
            const field = document.getElementById(id);
            if (field.tagName === "INPUT" && !field.value.trim()) valid = false;
            if (field.tagName === "SELECT" && field.value === "") valid = false;
        });

        if (!valid) {
            alert("Please fill in all required fields!");
            return;
        }

        // If valid, redirect
        window.location.href = "PaymentPage.html";
    });
});
