// Reservation Management JavaScript - Streamlined for List View Only
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the page
    initializePage();

    // Setup event listeners
    setupEventListeners();

    // Load reservations (Initial load)
    loadReservations();

    console.log('Reservation management page initialized for List View');
});

// --- Mock Data ---
let reservations = [
    { id: 1, date: '2025-12-24', time: '19:30', guests: 4, occasion: 'Birthday', specialRequests: 'Need a quiet corner table.', status: 'upcoming' },
    { id: 2, date: '2025-11-05', time: '18:00', guests: 2, occasion: 'None', specialRequests: '', status: 'completed' },
    { id: 3, date: '2025-12-15', time: '20:00', guests: 6, occasion: 'Anniversary', specialRequests: 'A single red rose on the table.', status: 'upcoming' },
    { id: 4, date: '2025-12-01', time: '17:30', guests: 3, occasion: 'Friends Get-together', specialRequests: '', status: 'cancelled' },
];

let currentEditId = null;

// --- Initialization ---
function initializePage() {
    // Set minimum date for date inputs
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('editDate').setAttribute('min', today);
}

// --- Event Listeners ---
function setupEventListeners() {
    // Search control
    document.getElementById('searchReservations').addEventListener('input', debounce(searchReservations, 300));

    // Edit modal save
    document.getElementById('saveReservation').addEventListener('click', saveReservation);

    // Cancel modal confirmation
    document.getElementById('confirmCancellation').addEventListener('click', confirmCancellation);
}

// --- Reservation Loading and Display ---

function loadReservations(searchQuery = '') {
    const listElement = document.getElementById('reservationList');
    const emptyState = document.getElementById('emptyState');
    listElement.innerHTML = '';

    const filteredReservations = reservations.filter(res => {
        const query = searchQuery.toLowerCase();
        const dateStr = formatDate(res.date);
        const timeStr = formatTime(res.time);

        return (
            res.status !== 'cancelled' && // Only show non-cancelled in default list
            (dateStr.toLowerCase().includes(query) ||
             timeStr.toLowerCase().includes(query) ||
             res.occasion.toLowerCase().includes(query) ||
             res.status.toLowerCase().includes(query))
        );
    }).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort by date

    if (filteredReservations.length === 0) {
        emptyState.style.display = 'block';
        return;
    }
    emptyState.style.display = 'none';

    filteredReservations.forEach(res => {
        listElement.appendChild(createReservationCard(res));
    });
}

function createReservationCard(res) {
    const card = document.createElement('div');
    card.className = 'reservation-card';
    card.setAttribute('data-id', res.id);

    const statusClass = `status-${res.status}`;
    const dateStr = formatDate(res.date);
    const timeStr = formatTime(res.time);

    card.innerHTML = `
        <div class="reservation-info">
            <h6>${dateStr} at ${timeStr}</h6>
            <p>Guests: ${res.guests}</p>
            <p>Occasion: ${formatOccasion(res.occasion)}</p>
            <p class="special-requests">${res.specialRequests || 'No special requests.'}</p>
        </div>
        <span class="reservation-status ${statusClass}">${res.status}</span>
        <div class="reservation-actions">
            ${res.status === 'upcoming' ? `
                <button class="btn action-btn edit-btn" onclick="openEditModal(${res.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn action-btn cancel-btn" onclick="openCancelModal(${res.id})">
                    <i class="fas fa-times-circle"></i> Cancel
                </button>
            ` : `
                <button class="btn action-btn view-btn" disabled>
                    <i class="fas fa-check"></i> ${res.status === 'completed' ? 'Completed' : 'Cancelled'}
                </button>
            `}
        </div>
    `;
    return card;
}

// --- Search Functionality ---

function searchReservations(event) {
    const query = event.target.value;
    loadReservations(query);
}

// --- Modal Handlers (Edit/Save) ---

function openEditModal(id) {
    currentEditId = id;
    const res = reservations.find(r => r.id === id);

    document.getElementById('editReservationId').value = res.id;
    document.getElementById('editDate').value = res.date;
    document.getElementById('editTime').value = res.time;
    document.getElementById('editGuests').value = res.guests;
    document.getElementById('editOccasion').value = res.occasion === 'None' ? '' : res.occasion;
    document.getElementById('editSpecialRequests').value = res.specialRequests;

    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();
}

function saveReservation() {
    clearAllErrors();
    const id = currentEditId;

    let isValid = true;

    const date = document.getElementById('editDate').value;
    const time = document.getElementById('editTime').value;
    const guests = parseInt(document.getElementById('editGuests').value);
    const occasion = document.getElementById('editOccasion').value.trim() || 'None';
    const specialRequests = document.getElementById('editSpecialRequests').value.trim();

    // Validation
    if (!date) { showFieldError('editDate', 'Date is required.'); isValid = false; }
    if (!time) { showFieldError('editTime', 'Time is required.'); isValid = false; }
    if (isNaN(guests) || guests < 1 || guests > 10) { showFieldError('editGuests', 'Guests must be between 1 and 10.'); isValid = false; }

    if (isValid) {
        const resIndex = reservations.findIndex(r => r.id === id);
        if (resIndex !== -1) {
            reservations[resIndex].date = date;
            reservations[resIndex].time = time;
            reservations[resIndex].guests = guests;
            reservations[resIndex].occasion = occasion;
            reservations[resIndex].specialRequests = specialRequests;
        }

        // Close modal and refresh list
        const editModal = bootstrap.Modal.getInstance(document.getElementById('editModal'));
        editModal.hide();

        loadReservations();
        showSuccessModal('Reservation updated successfully!');
    }
}

// --- Modal Handlers (Cancel) ---

function openCancelModal(id) {
    currentEditId = id;
    const res = reservations.find(r => r.id === id);
    if (!res) return;

    const details = `${formatDate(res.date)} at ${formatTime(res.time)} for ${res.guests} guests`;
    document.getElementById('cancelReservationDetails').textContent = details;

    const cancelModal = new bootstrap.Modal(document.getElementById('cancelModal'));
    cancelModal.show();
}

function confirmCancellation() {
    const id = currentEditId;
    const resIndex = reservations.findIndex(r => r.id === id);

    if (resIndex !== -1) {
        reservations[resIndex].status = 'cancelled';
    }

    // Close modal and refresh list
    const cancelModal = bootstrap.Modal.getInstance(document.getElementById('cancelModal'));
    cancelModal.hide();

    loadReservations();
    showSuccessModal('Reservation cancelled successfully.');
}

// --- Utility Functions ---

function formatDate(dateString) {
    const options = { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function formatTime(timeString) {
    const [hour, minute] = timeString.split(':');
    const date = new Date(2000, 0, 1, hour, minute);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatOccasion(occasion) {
    if (!occasion || occasion === 'None') return 'General Dining';
    return occasion.charAt(0).toUpperCase() + occasion.slice(1);
}

// Error handling functions
function showFieldError(fieldId, message) {
    const errorElement = document.getElementById(fieldId + 'Error');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function clearAllErrors() {
    document.querySelectorAll('.error-message').forEach(error => {
        error.classList.remove('show');
    });
}

function showSuccessModal(message) {
    document.getElementById('successMessage').textContent = message;
    // Ensure Bootstrap is loaded before attempting to use its features
    if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        modal.show();
    } else {
        alert("Success: " + message); // Fallback
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}