const STATUS_PENDING = 'PENDING';
const STATUS_CONFIRMED = 'CONFIRMED';
const STATUS_CANCELLED = 'CANCELLED';

class Reservation {
    constructor(formData, customerId) {
        this.reservationId = 'R-' + Date.now();
        this.partySize = parseInt(formData.guests);
        this.dateTime = `${formData.date} ${formData.time}`;
        this.seatingPreference = formData.preference || 'ANY';

        this.status = STATUS_PENDING;
        this.feedBack = null;

        this.customerId = customerId;
        this.tableAssigned = null;
    }
}

module.exports = Reservation;