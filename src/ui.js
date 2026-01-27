
const UI = {
    appRoot: document.getElementById('app-root'),
    themeToggle: document.getElementById('theme-toggle'),

    init() {
        this.themeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
        });
    },

    showLogin() {
        this.appRoot.innerHTML = `
            <div class="login-container">
                <h2>Login</h2>
                <input type="text" id="username" placeholder="Username">
                <input type="password" id="password" placeholder="Password">
                <button id="login-btn">Login</button>
            </div>
        `;

        document.getElementById('login-btn').addEventListener('click', () => {
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            Auth.login(username, password);
        });
    },

    showDashboard() {
        if (Auth.currentUser.role === 'superadmin') {
            this.showSuperAdminDashboard();
        } else {
            this.showClubDashboard();
        }
    },

    showSuperAdminDashboard() {
        this.appRoot.innerHTML = `
            <div>
                <h2>Welcome Super Admin!</h2>
                <button id="logout-btn">Logout</button>
                <hr>
                <h3>Create Club</h3>
                <input type="text" id="club-name" placeholder="Club Name">
                <input type="text" id="club-location" placeholder="Location">
                <input type="text" id="club-username" placeholder="Username">
                <input type="password" id="club-password" placeholder="Password">
                <button id="create-club-btn">Create Club</button>
                <hr>
                <h3>Clubs</h3>
                <div id="clubs-list"></div>
            </div>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => Auth.logout());
        document.getElementById('create-club-btn').addEventListener('click', () => this.createClub());

        this.loadClubs();
    },

    createClub() {
        const name = document.getElementById('club-name').value;
        const location = document.getElementById('club-location').value;
        const username = document.getElementById('club-username').value;
        const password = document.getElementById('club-password').value;

        if (name && location && username && password) {
            const newClubRef = database.ref('clubs').push();
            newClubRef.set({
                name: name,
                location: location,
                username: username,
                password: password
            });
            this.loadClubs();
        } else {
            alert('Please fill in all fields');
        }
    },

    loadClubs() {
        const clubsList = document.getElementById('clubs-list');
        database.ref('clubs').on('value', snapshot => {
            clubsList.innerHTML = '';
            snapshot.forEach(childSnapshot => {
                const clubId = childSnapshot.key;
                const club = childSnapshot.val();
                const clubElement = document.createElement('div');
                clubElement.innerHTML = `
                    <p><strong>${club.name}</strong> - ${club.location}</p>
                    <button onclick="UI.deleteClub('${clubId}')">Delete</button>
                `;
                clubsList.appendChild(clubElement);
            });
        });
    },

    deleteClub(clubId) {
        database.ref('clubs/' + clubId).remove();
        this.loadClubs();
    },

    showClubDashboard() {
        // Club user dashboard HTML and logic will go here
    }
};