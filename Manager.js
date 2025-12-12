class Manager {

    constructor(username, password) {
        this.username = username;
        this.password = password;
        this.role = 'Manager';
    }

    login(inputPassword,inputUsername) {
        return this.password === inputPassword && this.username === inputUsername;
    }

}

module.exports = Manager;