// server.js

const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// NEW: Import the session library
const session = require('express-session');

// ... (existing DataManager and Customer imports) ...
// ... (existing DataManager.initializeData call) ...

// NEW: Session Configuration
// This MUST come before the routes (app.post, app.get)
app.use(session({
    secret: 'a-very-secret-key-that-should-be-long-and-random', // Required: Used to sign the session ID cookie
    resave: false, // Prevents unnecessary saving of the session back to the session store
    saveUninitialized: false, // Prevents saving a session that has nothing stored in it
    cookie: { maxAge: 3600000 } // Session lasts for 1 hour (3,600,000 milliseconds)
}));

// Import the modules we created
const DataManager = require('./DataManager');
const Customer = require('./Customer'); // Import the Customer class


// Middleware to read data from forms
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve all your HTML/CSS/JS files from the '.idea' directory
app.use(express.static(path.join(__dirname, '.idea')));


// Initialize the DataManager (load tables, create manager account, etc.)
DataManager.initializeData();


// =======================================================
// CUSTOMER SIGN UP ROUTE
// Handles POST requests from the signup.html form
// =======================================================
// server.js - Make sure this block is in your file!

// ... (existing imports, middleware, and static file setup) ...

// =======================================================
// CUSTOMER SIGN UP ROUTE
// =======================================================
app.post('/signup', (req, res) => {
    // 1. Extract data from the form
    const { email, username, password, confirmPassword } = req.body;

    // Quick server-side validation (Server-side validation is CRITICAL)
    if (!email || !username || !password || password !== confirmPassword) {
        // A simple error message, you can improve this later
        return res.send("Registration failed: Missing data or passwords do not match.");
    }

    // 2. Check if a customer with this username already exists
    const existingCustomer = DataManager.findCustomerByEmail(email);
    if (existingCustomer) {
        console.log(`Signup failed: Email ${email} already used.`);
        return res.send("This Email is already in use. Please choose another.");
    }

    // 3. Create and Save the new Customer Object
    const newCustomer = Customer.register(username, password, email, 'N/A');
    DataManager.saveCustomer(newCustomer);

    console.log(`SUCCESS: New Customer Registered: ${newCustomer.usernameCus}`);

    // 4. Redirect to the login page after successful registration
    res.redirect('/login.html');
});

// server.js - Add this new route

// =======================================================
// CUSTOMER LOGIN ROUTE
// Handles POST requests from the login.html form
// =======================================================
app.post('/login', (req, res) => {9
    // 1. Extract data from the form (using the 'name' attributes: email, password)
    const { email, password } = req.body; // <<< We now look for 'email'

    if (!email || !password) {
        return res.send("Login failed: Missing email or password.");
    }

    // 2. Find the customer object using the EMAIL
    const customer = DataManager.findCustomerByEmail(email); // <<< Using the new function

    if (!customer) {
        console.log(`Login failed: User with email ${email} not found.`);
        return res.send("Login failed: Invalid email or password.");
    }

    // 3. Verify the password using the Customer class login method
    if (customer.login(password,email)) {

       // NEW: Session Creation!
           // We store the customer's ID and Username in the session object.
           req.session.isLoggedIn = true;
           req.session.userId = customer.id;
           req.session.username = customer.usernameCus;

        console.log(`SUCCESS: Customer ${customer.usernameCus} logged in!`);

        // 4. Redirect to the Customer Dashboard on success
        return res.redirect('/CustomerDashboard.html');
    } else {
        console.log(`Login failed: Incorrect password for user ${customer.usernameCus}.`);
        return res.send("Login failed: Invalid email or password.");
    }
});

// ... (rest of server.js, including the temporary /book-reservation route and app.listen) ...


// server.js - REPLACE the existing app.post('/book-reservation', ...) block

// =======================================================
// RESERVATION BOOKING ROUTE
// Handles POST requests from the booking form
// =======================================================
app.post('/book-reservation', requireLogin, (req, res) => { // <<< ADDED requireLogin

    // 1. Authorization and Customer Identification (using the session)
    const customerId = req.session.userId;
    if (!customerId) {
        // This is a safety check; requireLogin should prevent this
        return res.redirect('/login.html');
    }

    // 2. Extract Data from the Booking Form
    const {
        name, surname, phone, email, guests, date, time, event, diet
    } = req.body;

    // We will use the 'guests' field as partySize, 'event' as preference, and 'diet' as comment.
    const partySize = parseInt(guests);
    const preference = event || 'ANY';
    const comment = diet || '';

    if (isNaN(partySize) || partySize < 1 || !date || !time) {
        return res.send("Booking failed: Missing or invalid date/time or number of guests.");
    }

    // 3. Call the Core Business Logic
    // We use the central DataManager function which handles availability, table assignment, and creation.
    const result = DataManager.makeReservation(
        { id: customerId }, // Pass a simple object with the necessary ID
        partySize,
        date,
        time,
        preference,
        comment
    );

    // 4. Handle Result and Respond
    if (result.success) {
        console.log(`BOOKING SUCCESS for Customer ${customerId}. Reservation ID: ${result.reservation.reservationId}.`);

        // Redirect to the payment page to finalize (as planned)
        return res.redirect('/PaymentPage.html');

    } else {
        console.log(`BOOKING FAILED: ${result.message}`);
        // Display a user-friendly error
        return res.send(`Booking failed: ${result.message} Please choose another time.`);
    }
});

// server.js - Add this new route before the app.listen block

// =======================================================
// PAYMENT PROCESSING ROUTE
// =======================================================
app.post('/process-payment', requireLogin, (req, res) => {
    // 1. Get current reservation (for this example, we'll assume the last one created by the user)
    // NOTE: In a real app, the reservation ID would be passed from the booking page.
    const lastReservation = DataManager.getAllReservations().find(
        r => r.customerId === req.session.userId && r.status === 'PENDING'
    );

    if (!lastReservation) {
        return res.send("Error: No pending reservation found to pay for.");
    }

    const depositAmount = parseFloat(req.body.depositAmount);

    // 2. Create the Payment object
    const newPayment = new Payment(
        lastReservation.reservationId, // The reservation being paid for
        depositAmount, // The amount from the form
        req.session.userId // The customer ID
    );

    // 3. Save Payment and Finalize Reservation Status
    DataManager.savePayment(newPayment);

    // Call the method on the Reservation object to update its internal status
    lastReservation.finalizeReservation(true); // Finalize with success=true

    console.log(`PAYMENT SUCCESS. Reservation ${lastReservation.reservationId} is CONFIRMED.`);

    // 4. Redirect to a success page
    res.redirect('/CustomerDashboard.html');
});

// server.js - Add this new function anywhere outside your routes

// NEW: Middleware to check if the user is logged in
function requireLogin(req, res, next) {
    if (req.session.isLoggedIn) {
        // User is logged in, continue to the next middleware or route handler
        next();
    } else {
        // User is not logged in, redirect them to the login page
        res.redirect('/login.html');
    }
}


// server.js - Add this NEW secured route block (Place right before app.listen)

// =======================================================
// SECURED ROUTES
// =======================================================

// Protects the booking page. Only logged-in users can see this page.
app.get('/BookATable.html', requireLogin, (req, res) => {
    // If we reach here, the user is logged in.
    res.sendFile(path.join(__dirname, '.idea', 'BookATable.html'));
});

// Protects the dashboard. Only logged-in users can see this page.
app.get('/CustomerDashboard.html', requireLogin, (req, res) => {
    // If we reach here, the user is logged in.
    // Send the actual HTML file from the .idea directory.
    res.sendFile(path.join(__dirname, '.idea', 'CustomerDashboard.html'));
});


// Add a Logout Route for cleanup
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.send("Error logging out.");
        }
        console.log(`User logged out. Session destroyed.`);
        res.redirect('/WelcomePage.html'); // Send them back to the welcome page
    });
});



// =======================================================
// START SERVER
// =======================================================
app.listen(port, () => {
    console.log('--------------------------------------------------');
    console.log(`Server is running! Open your browser to: http://localhost:${port}/WelcomePage.html`);
    console.log('--------------------------------------------------');
});