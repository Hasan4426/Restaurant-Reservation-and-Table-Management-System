// DataManager.js

// Import all object classes
const Customer = require('./Customer');
const Manager = require('./Manager');
const Table = require('./Table');
const Reservation = require('./Reservation');
const Payment = require('./Payment');

// Storage Arrays
const customers = [];
const managers = [];
const tables = [];
const reservations = [];
const payments = [];

// INITIALIZATION
function initializeData() {
    // Standard table setup
    for (let i = 1; i <= 20; i++) {
        let capacity = (i % 5 === 0) ? 8 : (i % 3 === 0) ? 6 : (i % 2 === 0) ? 2 : 4;
        tables.push(new Table(`T-${i}`, capacity));
    }

    managers.push(new Manager('Boss (Wo)Man', '12345678', 'Manager@Eden.org'));
    console.log(`DataManager initialized with ${tables.length} tables and ${managers.length} manager account.`);
}

function saveCustomer(customer) {
    customers.push(customer);
}

function findCustomerByEmail(email) {
    return customers.find(C => C.email === email);
}

function findManagerByEmail(email) {
    return managers.find(m => m.email === email);
}

function saveReservation(reservation) {
    reservations.push(reservation);
}

// RESERVATION MANAGEMENT

/**
 * Creates a new reservation and marks the table as RESERVED
 *
 */
function makeReservation(customer, partySize, date, time, comment) {
    // 1. Find a table with enough capacity that is AVAILABLE
    const availableTable = tables.find(t =>
        t.Capacity >= partySize && t.Tablestatus === 'AVAILABLE'
    );

    if (!availableTable) {
        return { success: false, message: "No tables available for this time/size." };
    }

    // 2. Create the Reservation (Status starts as PENDING)
    const newRes = new Reservation(
        customer.id,
        availableTable.TableID,
        partySize,
        date,
        time,
        comment
    );

    // 3. Save and Update Status
    reservations.push(newRes);
    availableTable.Tablestatus = 'RESERVED';

    return { success: true, reservation: newRes };
}

/**
 * Handles editing an existing reservation.
 * FIXED: Temporarily frees current table to prevent "No table available" error.
 */
function editReservation(reservationId, newDetails) {
    const reservation = reservations.find(r => r.reservationId === reservationId);
    if (!reservation) return { success: false, message: "Reservation not found." };

    // 1. Find the current table assigned to this reservation
    const currentTable = tables.find(t => t.TableID === reservation.tableId);

    // 2. Temporarily mark it AVAILABLE so the search logic can see it as an option
    if (currentTable) currentTable.Tablestatus = 'AVAILABLE';

    // 3. Try to find a table for the NEW requirements
    const partySize = parseInt(newDetails.guests || reservation.partySize);
    const availableTable = tables.find(t =>
        t.Capacity >= partySize && t.Tablestatus === 'AVAILABLE'
    );

    if (!availableTable) {
        // If no table found, re-lock the old table and fail
        if (currentTable) currentTable.Tablestatus = 'RESERVED';
        return { success: false, message: "No tables available for these new requirements." };
    }

    // 4. Success: Update reservation and lock the (potentially new) table
    reservation.date = newDetails.date || reservation.date;
    reservation.time = newDetails.time || reservation.time;
    reservation.partySize = partySize;
    reservation.comment = newDetails.comment || reservation.comment;
    reservation.tableId = availableTable.TableID;

    availableTable.Tablestatus = 'RESERVED';
    return { success: true };
}

/**
 * Cancels reservation and releases the table
 */
function cancelReservationSystem(reservationId) {
    const reservation = reservations.find(r => r.reservationId === reservationId);
    if (!reservation) return false;

    // Release the assigned table back to AVAILABLE
    const table = tables.find(t => t.TableID === reservation.tableId);
    if (table) {
        table.Tablestatus = 'AVAILABLE';
    }

    reservation.status = 'CANCELLED';
    return true;
}

// PAYMENT MANAGEMENT
function savePayment(payment) {
    payments.push(payment);
}

// EXPORTS
module.exports = {
    initializeData,
    saveCustomer,
    findCustomerByEmail,
    findManagerByEmail,
    saveReservation,
    makeReservation,
    editReservation,
    cancelReservationSystem,
    savePayment,
    getAllCustomers: () => customers,
    getAllManagers: () => managers,
    getAllTables: () => tables,
    getAllReservations: () => reservations,
    getAllPayments: () => payments
};