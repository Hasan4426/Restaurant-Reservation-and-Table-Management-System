// Import all object classes
const Customer = require('./Customer');
const Manager = require('./Manager');
const Table = require('./Table');
const Reservation = require('./Reservation');
const Payment = require('./Payment');


//Storage Arrays
const customers = [];
const managers = [];
const tables = [];
const reservations = [];
const payments = [];


//INITIALIZATION
function initializeData() {
    tables.push(new Table('T-1', 4, 'INDOOR'));
    tables.push(new Table('T-2', 2, 'OUTDOOR'));
    tables.push(new Table('T-3', 6, 'INDOOR'));
    tables.push(new Table('T-4', 4, 'ANY'));
    tables.push(new Table('T-5', 8, 'OUTDOOR'));

    managers.push(new Manager('admin', '123456'));

    console.log(`DataManager initialized with ${tables.length} tables and ${managers.length} manager account.`);
}



function saveCustomer(customer) {
    customers.push(customer);
}

//Customer Login
function findCustomerByUsername(username) {
    return customers.find(u => u.usernameCus === username);
}

//Manager Management
function findManagerByUsername(username) {
    // Finds and returns the manager that matches the username
    return managers.find(m => m.username === username);
}

//Reservation Management

function saveReservation(reservation) {
    reservations.push(reservation);
}

function getAvailableTables(numGuests, date, time, preference) {
    // 1. Identify tables already assigned to a reservation at this time
    const bookedTableIds = reservations
        // Filters for matching time/date (using includes since dateTime is a combined string)
        .filter(res => res.dateTime.includes(date) && res.dateTime.includes(time))
        // Map to the ID of the assigned table (safely handle unassigned tables)
        .map(res => res.tableAssigned ? res.tableAssigned.TableID : null)
        .filter(id => id !== null); // Remove any null IDs

    // 2. Filter for suitable tables
    return tables.filter(table =>
        //Large enough capacity
        table.Capacity >= numGuests &&
        //Not currently booked
        !bookedTableIds.includes(table.TableID) &&
        //Matches preference (if a specific preference is given)
        (preference === 'ANY' || table.location === preference)
    );
}

//makeReservation (implements the core logic)
function makeReservation(customer, partySize, date, time, preference, comment) {

    //Check Availability
    const availableTables = getAvailableTables(partySize, date, time, preference);

    if (availableTables.length === 0) {
        return { success: false, message: "No table available for this time/size." };
    }

    //Select the best table
    //For simplicity, we just take the first available table.
    const tableToAssign = availableTables.sort((a, b) => a.Capacity - b.Capacity)[0];

    //Create the Reservation object
    const newReservation = new Reservation({
        guests: partySize,
        date: date,
        time: time,
        preference: preference,
        diet: comment
    }, customer.id);

    //Assign the table and save
    newReservation.tableAssigned = tableToAssign;
    saveReservation(newReservation);
    tableToAssign.AssignTable(); // Update the Table status to "BOOKED"

    return { success: true, reservation: newReservation };
}

//editReservation
function editReservation(reservationId, newDetails) {
    const reservation = reservations.find(r => r.reservationId === reservationId);
    if (!reservation) return false;

    // Simplified update logic
    if (newDetails.partySize) reservation.partySize = newDetails.partySize;
    if (newDetails.comment) reservation.comment = newDetails.comment;

    return true;
}

//cancel Reservation
function cancelReservationSystem(reservationId) {
    const index = reservations.findIndex(r => r.reservationId === reservationId);
    if (index === -1) return false;

    const reservation = reservations[index];

    //Release the assigned table
    if (reservation.tableAssigned) {
        const table = tables.find(t => t.TableID === reservation.tableAssigned.TableID);
        table.ReleaseTable();
    }

    reservation.cancelReservation(); //Update the reservation status to "CANCELLED"

    return true;
}

//displayDetails
function displayReservationDetails(reservationId) {
    const reservation = reservations.find(r => r.reservationId === reservationId);
    if (!reservation) return null;

    //Returns the full object for display
    return reservation;
}

//countRecords
function countReservationsByDate(date) {
    return reservations.filter(res => res.dateTime.includes(date)).length;
}

//Payment Management
function savePayment(payment) {
    payments.push(payment);
}


//Export all public methods to be used by server.js
module.exports = {
    initializeData,

    //Management methods
    saveCustomer,
    findCustomerByUsername,
    findManagerByUsername,

    //Reservation Management
    saveReservation,
    getAvailableTables,
    makeReservation,
    editReservation,
    cancelReservationSystem,
    displayReservationDetails,
    countReservationsByDate,
    savePayment,

    //Getters
    getAllCustomers: () => customers,
    getAllManagers: () => managers,
    getAllTables: () => tables,
    getAllReservations: () => reservations,
    getAllPayments: () => payments
};