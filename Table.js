const STATUS_AVAILABLE = 'AVAILABLE';
const STATUS_BOOKED = 'BOOKED';
const STATUS_CLEANING = 'CLEANING';
const STATUS_OCCUPIED = 'OCCUPIED';

class Table {
    constructor(id, capacity, location) {
        this.TableID = id;
        this.Capacity = capacity;
        this.location = location;
        this.Tablestatus = STATUS_AVAILABLE;
    }

    AssignTable() {
        this.Tablestatus = STATUS_BOOKED;
    }

    ReleaseTable() {
        this.Tablestatus = STATUS_CLEANING;
    }

    UpdateStatus(newST) {
        this.Tablestatus = newST;
    }

    UpdateTableDetailsManually(location, newCapacity) {
        this.location = location;
        this.Capacity = newCapacity;
    }
}

module.exports = Table;