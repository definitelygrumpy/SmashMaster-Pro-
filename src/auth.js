const Auth = {
    currentUser: null,

    checkUser() {
        this.currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
        if (this.currentUser) {
            UI.showDashboard();
        } else {
            UI.showLogin();
        }
    },

    login(username, password) {
        // Check for superadmin
        if (username === 'appu' && password === 'veedu4321') {
            this.currentUser = { username: 'appu', role: 'superadmin' };
            sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            UI.showDashboard();
            return;
        }

        // Check for club user
        database.ref('clubs').orderByChild('username').equalTo(username).once('value', snapshot => {
            if (snapshot.exists()) {
                const clubId = Object.keys(snapshot.val())[0];
                const club = snapshot.val()[clubId];
                if (club.password === password) {
                    this.currentUser = { username: club.username, role: 'club', clubId: clubId };
                    sessionStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                    UI.showDashboard();
                } else {
                    alert('Incorrect password');
                }
            } else {
                alert('User not found');
            }
        });
    },

    logout() {
        this.currentUser = null;
        sessionStorage.removeItem('currentUser');
        UI.showLogin();
    }
};