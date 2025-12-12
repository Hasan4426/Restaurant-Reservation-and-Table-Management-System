// server.js

// 1. Import the necessary tools (Express.js and 'path' to handle file paths)
const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// 2. MIDDLEWARE: Allows Express to read incoming data from forms (req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 3. STATIC FILES: Tells the server to serve all your HTML/CSS/JS/Image files
// from your current '.idea' directory. This is how the browser sees the pages.
app.use(express.static(path.join(__dirname, '.idea')));

// 4. ROUTE: This handles the form submission from BookATable.html
app.post('/book-reservation', (req, res) => {
    // We will add the database and availability logic here later!
    console.log('--- Received a new reservation request ---');
    console.log('Customer Data:', req.body);

    // TEMPORARY: Redirect to the payment page after receiving data
    res.redirect('/PaymentPage.html');
});

// 5. Start the server on port 3000
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/WelcomePage.html`);
});