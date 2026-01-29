document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeToggle = document.getElementById('themeToggle');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginBtn = document.getElementById('loginBtn');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const backToDashboardBtn = document.getElementById('back-to-dashboard-btn');
    const resetTournamentBtn = document.getElementById('reset-tournament-btn');


    // Views
    const loginView = document.getElementById('login-view');
    const superAdminView = document.getElementById('super-admin-view');
    const clubUserView = document.getElementById('club-user-view');
    const tournamentView = document.getElementById('tournament-view');

    // Modals
    const addClubModal = document.getElementById('add-club-modal');
    const editClubModal = document.getElementById('edit-club-modal');
    const addPlayerModal = document.getElementById('add-player-modal');
    const createTournamentModal = document.getElementById('create-tournament-modal');

    // Modal Forms
    const addClubForm = document.getElementById('add-club-form');
    const editClubForm = document.getElementById('edit-club-form');
    const addPlayerForm = document.getElementById('add-player-form');
    const createTournamentForm = document.getElementById('create-tournament-form');

    // Content Areas
    const clubList = document.getElementById('club-list');
    const allTournamentsList = document.getElementById('all-tournaments-list');
    const playerList = document.getElementById('player-list');
    const clubTournamentsList = document.getElementById('club-tournaments-list');
    const tournamentTitle = document.getElementById('tournament-title');
    const winnerDisplay = document.getElementById('winner-display');
    const winnerName = document.getElementById('winner-name');
    const runnerUpName = document.getElementById('runner-up-name');
    const matchesContent = document.getElementById('matches-content');
    const standingsContent = document.getElementById('standings-content');

    // Player Selection
    const playerSearchInput = document.getElementById('player-search-input');
    const playerTilesContainer = document.getElementById('player-tiles-container');

    // --- Global State ---
    let currentClubId = null;
    let currentTournamentId = null;
    let currentTournamentListener = null;
    let allPlayers = {};
    let selectedPlayerIds = [];

    // --- Initialization ---
    init();

    function init() {
        // Set default theme
        document.body.classList.remove('light-mode'); // Dark mode is default
        updateThemeToggleIcon();
        
        attachEventListeners();
        if (window.location.pathname.includes('app.html')) {
            checkAuthState();
        }
    }

    function checkAuthState() {
        const userRole = localStorage.getItem('userRole');
        const clubId = localStorage.getItem('clubId');
        if (userRole === 'superadmin') {
            showSuperAdminView();
        } else if (userRole === 'club' && clubId) {
            currentClubId = clubId;
            showClubUserView(clubId);
        } else {
            window.location.href = 'index.html';
        }
    }

    // --- UI & View Management ---
    function showView(viewId) {
        if (loginView) loginView.style.display = 'none';
        if (superAdminView) superAdminView.style.display = 'none';
        if (clubUserView) clubUserView.style.display = 'none';
        if (tournamentView) tournamentView.style.display = 'none';

        const view = document.getElementById(viewId);
        if (view) view.style.display = 'block';

        if (logoutBtn) {
            logoutBtn.style.display = (viewId === 'login-view') ? 'none' : 'inline-block';
        }
    }

    function openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'flex';
    }

    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
            if (modalId === 'create-tournament-modal') {
                resetPlayerSelection();
            }
        }
    }

    function switchTab(view, tabName) {
        if (!view) return;
        const tabContents = view.querySelectorAll('.tab-content');
        const correspondingButtons = view.querySelectorAll('.tab-button');
        tabContents.forEach(content => content.classList.remove('active'));
        correspondingButtons.forEach(button => button.classList.remove('active'));

        const tab = view.querySelector(`#${tabName}-tab`);
        const button = view.querySelector(`[data-tab=${tabName}]`);

        if (tab) tab.classList.add('active');
        if (button) button.classList.add('active');
    }
    
    function updateThemeToggleIcon() {
        if (themeToggle) {
            themeToggle.innerHTML = document.body.classList.contains('light-mode') ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
            themeToggle.setAttribute('aria-label', document.body.classList.contains('light-mode') ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        }
    }

    function showLoader(container) {
        if (!container) return;
        container.innerHTML = '<div class="loader"></div>';
    }

    function showEmptyState(container, message) {
        if (!container) return;
        container.innerHTML = `<div class="empty-state">${message}</div>`;
    }
    
    // --- Custom Alerts & Confirmations ---
    function showAlert(message) {
        // Remove existing alert if any
        const existingAlert = document.querySelector('.custom-alert');
        if (existingAlert) {
            existingAlert.remove();
        }

        const alertBox = document.createElement('div');
        alertBox.className = 'custom-alert';
        alertBox.textContent = message;
        document.body.appendChild(alertBox);

        // Animate in
        setTimeout(() => {
            alertBox.classList.add('show');
        }, 10);

        // Auto-dismiss after 3 seconds
        setTimeout(() => {
            alertBox.classList.remove('show');
            setTimeout(() => {
                alertBox.remove();
            }, 500);
        }, 3000);
    }

    function showConfirmation(message) {
        return new Promise((resolve) => {
            const confirmOverlay = document.createElement('div');
            confirmOverlay.className = 'confirm-modal-overlay';

            const confirmBox = document.createElement('div');
            confirmBox.className = 'confirm-modal-content';
            
            const isLightMode = document.body.classList.contains('light-mode');
            if (!isLightMode) {
                 confirmBox.classList.add('dark-mode-confirm');
            }


            confirmBox.innerHTML = `
                <p>${message}</p>
                <div class="confirm-modal-buttons">
                    <button id="confirm-yes">Yes</button>
                    <button id="confirm-no">No</button>
                </div>
            `;

            confirmOverlay.appendChild(confirmBox);
            document.body.appendChild(confirmOverlay);

            document.getElementById('confirm-yes').onclick = () => {
                confirmOverlay.remove();
                resolve(true);
            };

            document.getElementById('confirm-no').onclick = () => {
                confirmOverlay.remove();
                resolve(false);
            };
        });
    }


    // --- Event Listeners ---
    function attachEventListeners() {
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                document.body.classList.toggle('light-mode');
                updateThemeToggleIcon();
            });
        }

        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                const username = usernameInput.value.trim();
                const password = passwordInput.value.trim();
                if (!username || !password) {
                    showAlert('Please enter both username and password.');
                    return;
                }
                authenticate(username, password);
            });
        }

        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if(currentTournamentListener) {
                    const tournamentRef = database.ref(`clubs/${currentClubId}/tournaments/${currentTournamentId}`);
                    tournamentRef.off('value', currentTournamentListener);
                }
                localStorage.clear();
                currentClubId = null;
                currentTournamentId = null;
                window.location.href = 'index.html';
            });
        }
        
        if (resetTournamentBtn) {
            resetTournamentBtn.addEventListener('click', () => {
                if (currentClubId && currentTournamentId) {
                    resetTournament(currentClubId, currentTournamentId);
                }
            });
        }

        const addClubBtn = document.getElementById('add-club-btn');
        if (addClubBtn) {
            addClubBtn.addEventListener('click', () => openModal('add-club-modal'));
        }

        const addPlayerBtn = document.getElementById('add-player-btn');
        if (addPlayerBtn) {
            addPlayerBtn.addEventListener('click', () => openModal('add-player-modal'));
        }

        const createTournamentBtn = document.getElementById('create-tournament-btn');
        if (createTournamentBtn) {
            createTournamentBtn.addEventListener('click', openCreateTournamentModal);
        }

        document.querySelectorAll('.modal .close').forEach(btn => {
            btn.addEventListener('click', () => closeModal(btn.closest('.modal').id));
        });

        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                const view = button.closest('#super-admin-view, #club-user-view, #tournament-view');
                switchTab(view, button.dataset.tab);
            });
        });
        if (backToDashboardBtn) {
            backToDashboardBtn.addEventListener('click', () => {
                if(currentTournamentListener) {
                    const tournamentRef = database.ref(`clubs/${currentClubId}/tournaments/${currentTournamentId}`);
                    tournamentRef.off('value', currentTournamentListener);
                    currentTournamentListener = null;
                }
                const userRole = localStorage.getItem('userRole');
                if (userRole === 'superadmin') showSuperAdminView();
                else if (userRole === 'club') showClubUserView(currentClubId);
            });
        }

        if (addClubForm) {
            addClubForm.addEventListener('submit', e => {
                e.preventDefault();
                const { name, location, username, password } = e.target.elements;
                if (!name.value.trim() || !location.value.trim() || !username.value.trim() || !password.value.trim()) {
                    showAlert('Please fill in all club details.');
                    return;
                }
                addClub(name.value.trim(), location.value.trim(), username.value.trim(), password.value.trim());
                e.target.reset();
                closeModal('add-club-modal');
            });
        }

        if (editClubForm) {
            editClubForm.addEventListener('submit', e => {
                e.preventDefault();
                const { 'edit-club-id': id, 'edit-club-name': name, 'edit-club-location': location, 'edit-club-username': username, 'edit-club-password': password } = e.target.elements;
                if (!name.value.trim() || !location.value.trim() || !username.value.trim()) {
                    showAlert('Name, location, and username are required.');
                    return;
                }
                updateClub(id.value, name.value.trim(), location.value.trim(), username.value.trim(), password.value);
                closeModal('edit-club-modal');
            });
        }

        if (addPlayerForm) {
            addPlayerForm.addEventListener('submit', e => {
                e.preventDefault();
                const playerNameInput = e.target.elements['player-name'];
                if (!playerNameInput.value.trim()) {
                    showAlert('Please enter a player name.');
                    return;
                }
                addPlayer(currentClubId, playerNameInput.value.trim());
                e.target.reset();
                closeModal('add-player-modal');
            });
        }

        if (createTournamentForm) {
            createTournamentForm.addEventListener('submit', e => {
                e.preventDefault();
                const tournamentNameInput = e.target.elements['tournament-name'];
                if (!tournamentNameInput.value.trim()) {
                    showAlert('Please enter a tournament name.');
                    return;
                }
                const selectedPlayers = selectedPlayerIds.map(id => ({ id, name: allPlayers[id].name }));
                createTournament(currentClubId, tournamentNameInput.value.trim(), selectedPlayers);
                closeModal('create-tournament-modal');
            });
        }
        
         if (playerSearchInput) {
            playerSearchInput.addEventListener('keyup', filterPlayers);
        }
    }

    // --- Authentication ---
    function authenticate(username, password) {
        if (username === 'appu' && password === 'veedu4321') {
            localStorage.setItem('userRole', 'superadmin');
            window.location.href = 'app.html';
            return;
        }
        database.ref('clubs').once('value', snapshot => {
            const clubs = snapshot.val();
            const clubId = Object.keys(clubs || {}).find(id => clubs[id].username === username && clubs[id].password === password);
            if (clubId) {
                localStorage.setItem('userRole', 'club');
                localStorage.setItem('clubId', clubId);
                currentClubId = clubId;
                window.location.href = 'app.html';
            } else {
                showAlert('Invalid credentials');
            }
        });
    }

    // --- View Initializers ---
    function showSuperAdminView() {
        showView('super-admin-view');
        loadClubs();
        loadAllTournaments();
    }

    function showClubUserView(clubId) {
        const title = document.getElementById('club-dashboard-title');
        if (title) {
            database.ref(`clubs/${clubId}/name`).once('value', snapshot => {
                title.textContent = `${snapshot.val() || ''} Dashboard`;
            });
        }
        showView('club-user-view');
        loadPlayers(clubId);
        loadClubTournaments(clubId);
    }
    
    function showTournamentView(clubId, tournamentId) {
        currentClubId = clubId;
        currentTournamentId = tournamentId;
        showView('tournament-view');
        
        const tournamentRef = database.ref(`clubs/${clubId}/tournaments/${tournamentId}`);
       
        // Detach any existing listener before attaching a new one.
        if (currentTournamentListener) {
            tournamentRef.off('value', currentTournamentListener);
        }

        let lastKnownTournamentState = null;

        currentTournamentListener = tournamentRef.on('value', snapshot => {
            const tournament = snapshot.val();
            
            // Simple stringify check to prevent re-renders on identical data
            if (JSON.stringify(tournament) === lastKnownTournamentState) {
                return;
            }
            lastKnownTournamentState = JSON.stringify(tournament);

            if (!tournament || !tournamentTitle) {
                showClubUserView(clubId);
                return;
            }
            tournamentTitle.textContent = tournament.name;
            
            if (resetTournamentBtn) {
                resetTournamentBtn.style.display = (tournament.status === 'ongoing' || tournament.status === 'pending') ? 'inline-block' : 'none';
            }

            if (tournament.status === 'complete' && tournament.winner && tournament.runnerUp) {
                const winnerTeam = tournament.teams.find(t => t.teamName === tournament.winner);
                const runnerUpTeam = tournament.teams.find(t => t.teamName === tournament.runnerUp);

                 if(winnerTeam && runnerUpTeam) {
                    winnerName.textContent = winnerTeam.players.map(p => p.name).join(' & ');
                    runnerUpName.textContent = runnerUpTeam.players.map(p => p.name).join(' & ');
                    winnerDisplay.style.display = 'block';
                }
            } else {
                if(winnerDisplay) winnerDisplay.style.display = 'none';
            }

            loadMatches(clubId, tournamentId, tournament);
            loadStandings(clubId, tournamentId, tournament);
        });
    }
    // --- Super Admin Functions ---
    function addClub(name, location, username, password) {
        database.ref('clubs').push().set({ name, location, username, password })
            .then(() => showAlert('Club added successfully!'))
            .catch(err => showAlert(`Error: ${err.message}`));
    }

    function openEditClubModal(clubId) {
        database.ref(`clubs/${clubId}`).once('value', snapshot => {
            const club = snapshot.val();
            if (!club) return;
            document.getElementById('edit-club-id').value = clubId;
            document.getElementById('edit-club-name').value = club.name;
            document.getElementById('edit-club-location').value = club.location;
            document.getElementById('edit-club-username').value = club.username;
            // Password field is left blank for security
            document.getElementById('edit-club-password').value = '';
            openModal('edit-club-modal');
        });
    }

    function updateClub(id, name, location, username, password) {
        const updates = { name, location, username };
        if (password) { // Only update password if a new one is entered
            updates.password = password;
        }
        database.ref(`clubs/${id}`).update(updates)
            .then(() => showAlert('Club updated successfully!'))
            .catch(err => showAlert(`Error: ${err.message}`));
    }

    async function deleteClub(clubId) {
        const confirmed = await showConfirmation('Are you sure you want to delete this club? This action cannot be undone.');
        if (confirmed) {
            database.ref(`clubs/${clubId}`).remove()
                .then(() => showAlert('Club deleted.'))
                .catch(err => showAlert(`Error: ${err.message}`));
        }
    }

    async function deleteTournament(clubId, tournamentId) {
        const confirmed = await showConfirmation('Are you sure you want to delete this tournament? This will remove all associated matches and data.');
        if (confirmed) {
            database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).remove()
                .then(() => showAlert('Tournament deleted.'))
                .catch(err => showAlert(`Error: ${err.message}`));
        }
    }


    function loadClubs() {
        if (!clubList) return;
        showLoader(clubList);
        database.ref('clubs').on('value', snapshot => {
            const clubs = snapshot.val();
            clubList.innerHTML = '';
            if (!clubs || Object.keys(clubs).length === 0) {
                showEmptyState(clubList, 'No clubs have been added yet.');
                return;
            }
            for (const id in clubs) {
                const club = clubs[id];
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div>
                        <strong>${club.name}</strong>
                        <small>${club.location}</small>
                    </div>
                    <div class="card-actions">
                        <button class="icon-btn edit-club-btn" data-id="${id}" aria-label="Edit Club"><i class="fas fa-edit"></i></button>
                        <button class="icon-btn delete-club-btn" data-id="${id}" aria-label="Delete Club"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                card.querySelector('.edit-club-btn').onclick = () => openEditClubModal(id);
                card.querySelector('.delete-club-btn').onclick = () => deleteClub(id);
                clubList.appendChild(card);
            }
        });
    }

    function loadAllTournaments() {
        if (!allTournamentsList) return;
        showLoader(allTournamentsList);
        database.ref('clubs').on('value', snapshot => {
            const clubs = snapshot.val();
            allTournamentsList.innerHTML = '';
            if (!clubs) {
                showEmptyState(allTournamentsList, 'No tournaments found across any clubs.');
                return;
            }
            
            let tournaments = [];
            for (const clubId in clubs) {
                const club = clubs[clubId];
                if (club.tournaments) {
                    for (const tournamentId in club.tournaments) {
                        tournaments.push({
                            clubId,
                            tournamentId,
                            clubName: club.name,
                            ...club.tournaments[tournamentId]
                        });
                    }
                }
            }
            
            if (tournaments.length === 0) {
                showEmptyState(allTournamentsList, 'No tournaments found across any clubs.');
                return;
            }

            tournaments.sort((a, b) => b.createdAt - a.createdAt);

            tournaments.forEach(tournament => {
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <div class="tournament-info" style="cursor: pointer; flex-grow: 1;">
                        <strong>${tournament.name}</strong> 
                        <small>(${tournament.clubName}) - ${tournament.status}</small>
                    </div>
                    <div class="card-actions">
                        <button class="icon-btn delete-tournament-btn" aria-label="Delete Tournament"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                card.querySelector('.tournament-info').onclick = () => showTournamentView(tournament.clubId, tournament.tournamentId);

                card.querySelector('.delete-tournament-btn').onclick = (e) => {
                    e.stopPropagation();
                    deleteTournament(tournament.clubId, tournament.tournamentId);
                };
                
                allTournamentsList.appendChild(card);
            });
        });
    }
    // --- Club User Functions ---
    function addPlayer(clubId, playerName) {
        if (!clubId || !playerName) return;
        database.ref(`clubs/${clubId}/players`).push().set({ name: playerName })
            .then(() => showAlert('Player added successfully!'))
            .catch(err => showAlert(`Error: ${err.message}`));
    }

    async function deletePlayer(clubId, playerId) {
        const confirmed = await showConfirmation('Are you sure you want to delete this player?');
        if (confirmed) {
            database.ref(`clubs/${clubId}/players/${playerId}`).remove()
                .then(() => showAlert('Player deleted.'))
                .catch(err => showAlert(`Error: ${err.message}`));
        }
    }

    function loadPlayers(clubId) {
        if (!playerList) return;
        showLoader(playerList);
        database.ref(`clubs/${clubId}/players`).on('value', snapshot => {
            allPlayers = snapshot.val() || {};
            playerList.innerHTML = '';

            if (Object.keys(allPlayers).length === 0) {
                showEmptyState(playerList, 'No players have been added yet. Add some to get started!');
                return;
            }

            for (const id in allPlayers) {
                const player = allPlayers[id];
                const card = document.createElement('div');
                card.className = 'card';
                card.innerHTML = `
                    <span>${player.name}</span>
                    <div class="card-actions">
                         <button class="icon-btn delete-player-btn" data-id="${id}" aria-label="Delete Player"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                card.querySelector('.delete-player-btn').onclick = () => deletePlayer(clubId, id);
                playerList.appendChild(card);
            }
        });
    }

    // --- Player Selection Logic ---
    function resetPlayerSelection() {
        selectedPlayerIds = [];
        if(playerSearchInput) playerSearchInput.value = '';
        renderPlayerTiles();
    }
    
    function filterPlayers() {
        renderPlayerTiles(playerSearchInput.value.toLowerCase());
    }

    function renderPlayerTiles(filter = '') {
        if (!playerTilesContainer) return;
        playerTilesContainer.innerHTML = '';
        
        const playerIds = Object.keys(allPlayers);

        if (playerIds.length === 0) {
            showEmptyState(playerTilesContainer, 'No players available.');
            return;
        }

        const filteredPlayers = playerIds.filter(id => allPlayers[id].name.toLowerCase().includes(filter));

        if (filteredPlayers.length === 0) {
            showEmptyState(playerTilesContainer, 'No players match your search.');
            return;
        }

        filteredPlayers.forEach(id => {
            const player = allPlayers[id];
            const tile = document.createElement('div');
            tile.className = 'player-tile';
            tile.dataset.id = id;
            if (selectedPlayerIds.includes(id)) {
                tile.classList.add('selected');
            }
            tile.textContent = player.name;
            tile.onclick = () => togglePlayerSelection(id);
            playerTilesContainer.appendChild(tile);
        });
    }
    
    function togglePlayerSelection(id) {
        const index = selectedPlayerIds.indexOf(id);
        if (index > -1) {
            selectedPlayerIds.splice(index, 1);
        } else {
            selectedPlayerIds.push(id);
        }
        renderPlayerTiles(playerSearchInput.value.toLowerCase());
    }


    async function openCreateTournamentModal() {
        resetPlayerSelection();
        showLoader(playerTilesContainer);
        const snapshot = await database.ref(`clubs/${currentClubId}/players`).once('value');
        allPlayers = snapshot.val() || {};
        renderPlayerTiles();
        openModal('create-tournament-modal');
    }

    function loadClubTournaments(clubId) {
        if (!clubTournamentsList) return;
        showLoader(clubTournamentsList);
        database.ref(`clubs/${clubId}/tournaments`).on('value', snapshot => {
            const tournamentsData = snapshot.val();
            clubTournamentsList.innerHTML = '';
            
            if (!tournamentsData) {
                showEmptyState(clubTournamentsList, 'No tournaments have been created for this club yet.');
                return;
            }

            let tournaments = [];
            for (const id in tournamentsData) {
                tournaments.push({
                    id,
                    ...tournamentsData[id]
                });
            }

            tournaments.sort((a, b) => b.createdAt - a.createdAt);

            tournaments.forEach(tournament => {
                const card = document.createElement('div');
                card.className = 'card';
                card.style.cursor = 'pointer';
                card.innerHTML = `<span><strong>${tournament.name}</strong> - ${tournament.status}</span>`;
                card.onclick = () => showTournamentView(clubId, tournament.id);
                clubTournamentsList.appendChild(card);
            });
        });
    }

    // --- Tournament Functions ---
    function createTournament(clubId, name, players) {
         if (players.length < 4) {
            showAlert("You need at least 4 players (for 2 teams) to start a tournament.");
            return;
        }
        if (players.length % 2 !== 0) {
            showAlert("The number of players must be even to form teams of two.");
            return;
        }
        const tournamentRef = database.ref(`clubs/${clubId}/tournaments`).push();
        const tournamentId = tournamentRef.key;
        const newTournament = {
            name,
            players,
            teamSelectionMethod: 'random',
            status: 'pending',
            teams: [],
            matches: [],
            currentStage: 'round-robin',
            createdAt: firebase.database.ServerValue.TIMESTAMP
        };
        tournamentRef.set(newTournament).then(() => {
            generateTeamsAndMatches(clubId, tournamentId);
        });
    }

    async function resetTournament(clubId, tournamentId) {
        const confirmed = await showConfirmation('Are you sure you want to reset this tournament? All match progress will be deleted and new round-robin matches will be generated.');
        if (confirmed) {
            database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).once('value', snapshot => {
                const tournament = snapshot.val();
                if (!tournament || !tournament.teams) {
                    showAlert('Tournament data could not be found.');
                    return;
                };

                const matches = generateMatches(tournament.teams);

                database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).update({
                    matches: matches,
                    status: 'ongoing',
                    currentStage: 'round-robin',
                    winner: null,
                    runnerUp: null
                }).then(() => showAlert('Tournament has been reset.'));
            });
        }
    }
    function generateTeamsAndMatches(clubId, tournamentId) {
        database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).once('value', snapshot => {
            const tournament = snapshot.val();
            if (!tournament) return;

            let players = [...tournament.players];
            let teams = [];

            // Shuffle players
            for (let i = players.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [players[i], players[j]] = [players[j], players[i]];
            }

            // Create teams
            for (let i = 0; i < players.length; i += 2) {
                if (players[i + 1]) {
                    teams.push({ teamName: `Team ${teams.length + 1}`, players: [players[i], players[i + 1]] });
                }
            }

            if (teams.length < 2) {
                database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).update({ status: 'cancelled-no-teams' });
                return;
            }

            const matches = generateMatches(teams);

            database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).update({
                teams: teams,
                matches: matches,
                status: 'ongoing'
            });
        });
    }

    function generateMatches(teams) {
        let matches = [];
        const numTeams = teams.length;

        const generateRoundRobin = (teamList, isDouble) => {
            const roundRobinMatches = [];
            for (let i = 0; i < teamList.length; i++) {
                for (let j = i + 1; j < teamList.length; j++) {
                    roundRobinMatches.push({
                        team1: teamList[i].teamName,
                        team2: teamList[j].teamName,
                        status: 'pending',
                        score: '',
                        stage: 'Round Robin'
                    });
                }
            }
            if (isDouble) {
                const secondRound = roundRobinMatches.map(match => ({...match, team1: match.team2, team2: match.team1 }));
                return [...roundRobinMatches, ...secondRound];
            }
            return roundRobinMatches;
        };
        
        switch (numTeams) {
            case 3:
                matches.push(...generateRoundRobin(teams, true));
                break;
            case 4:
                matches.push(...generateRoundRobin(teams, false));
                break;
            case 5:
                 matches.push(...generateRoundRobin(teams, false));
                 break;
            default:
                 if (numTeams >= 2) {
                    matches.push(...generateRoundRobin(teams, false));
                 }
                 break;
        }
        return matches;
    }
    
    function isValidBadmintonScore(t1Score, t2Score) {
        const s1 = parseInt(t1Score);
        const s2 = parseInt(t2Score);

        if (isNaN(s1) || isNaN(s2) || s1 < 0 || s2 < 0) return false;
        if (s1 === s2) return false;

        const winnerScore = Math.max(s1, s2);
        const loserScore = Math.min(s1, s2);
        
        if (winnerScore < 21) return false; 
        if (winnerScore === 21 && loserScore < 20) return true; 
        if (winnerScore > 21 && winnerScore < 30) {
            return winnerScore - loserScore === 2;
        }
        if (winnerScore === 30) {
            return loserScore === 29;
        }
        return false;
    }


    function updateScore(clubId, tournamentId, matchIndex, team1Score, team2Score) {
         if (!isValidBadmintonScore(team1Score, team2Score)) {
            showAlert('Invalid badminton score. A game must be won by reaching at least 21 points with a 2-point lead (e.g., 21-19), or by being the first to 30 (30-29).');
            return;
        }

        const score = `${team1Score}-${team2Score}`;
        const matchRef = database.ref(`clubs/${clubId}/tournaments/${tournamentId}/matches/${matchIndex}`);
        matchRef.update({ score, status: 'complete' }).then(() => {
            checkTournamentStage(clubId, tournamentId);
        });
    }
    
    async function editScore(clubId, tournamentId, matchIndex) {
        const confirmed = await showConfirmation('Are you sure you want to edit this score? The match will be marked as pending.');
        if (confirmed) {
            const matchRef = database.ref(`clubs/${clubId}/tournaments/${tournamentId}/matches/${matchIndex}`);
            matchRef.update({
                status: 'pending',
                score: ''
            });

            // Also reset the tournament status if it was complete, so that stages can be re-calculated
            const tournamentRef = database.ref(`clubs/${clubId}/tournaments/${tournamentId}`);
            tournamentRef.once('value', snapshot => {
                if (snapshot.val().status === 'complete') {
                    tournamentRef.update({
                        status: 'ongoing',
                        winner: null,
                        runnerUp: null
                    });
                }
            })
        }
    }

    function checkTournamentStage(clubId, tournamentId) {
        database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).once('value', snapshot => {
            const tournament = snapshot.val();
            if (!tournament || !tournament.matches) return;

            const { teams, matches, currentStage } = tournament;
            
            const finalMatch = matches.find(m => m.stage === 'Final');
            if (finalMatch && finalMatch.status === 'complete') {
                 const winner = finalMatch.score.split('-')[0] > finalMatch.score.split('-')[1] ? finalMatch.team1 : finalMatch.team2;
                 const runnerUp = finalMatch.score.split('-')[0] > finalMatch.score.split('-')[1] ? finalMatch.team2 : finalMatch.team1;
                 database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).update({
                     status: 'complete',
                     winner: winner,
                     runnerUp: runnerUp
                 });
                 return;
            }

            const roundRobinMatches = matches.filter(m => m.stage === 'Round Robin');
            const allRoundRobinComplete = roundRobinMatches.every(m => m.status === 'complete');
            
            if (currentStage === 'round-robin' && allRoundRobinComplete) {
                 const standings = calculateStandings(teams, matches);
                 const existingPlayoffMatches = matches.filter(m => m.stage !== 'Round Robin');
                 let newMatches = [];
                 let nextStage = 'complete';

                 if (standings.length < 2) {
                     database.ref(`clubs/${clubId}/tournaments/${tournamentId}/status`).set('complete');
                     return;
                 }

                 switch(teams.length) {
                     case 3: 
                     case 5: 
                         newMatches.push({ team1: standings[0].name, team2: standings[1].name, status: 'pending', score: '', stage: 'Final' });
                         nextStage = 'finals';
                         break;
                    case 4: 
                        if (standings.length < 4) { 
                            database.ref(`clubs/${clubId}/tournaments/${tournamentId}/status`).set('complete');
                            return;
                        }
                        const [t1, t2, t3, t4] = standings;
                        newMatches.push({ team1: t1.name, team2: t2.name, status: 'pending', score: '', stage: 'Qualifier 1' });
                        newMatches.push({ team1: t3.name, team2: t4.name, status: 'pending', score: '', stage: 'Eliminator' });
                        nextStage = 'playoffs';
                        break;
                    default:
                        if (standings.length >= 2) {
                            newMatches.push({ team1: standings[0].name, team2: standings[1].name, status: 'pending', score: '', stage: 'Final' });
                            nextStage = 'finals';
                        } else {
                            database.ref(`clubs/${clubId}/tournaments/${tournamentId}/status`).set('complete');
                            return;
                        }
                 }
                 if (newMatches.length > 0) {
                    database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).update({
                        matches: [...roundRobinMatches, ...newMatches], // Reset matches to only include RR and new playoffs
                        currentStage: nextStage
                    });
                 }

            } else if (currentStage === 'playoffs' && teams.length === 4) {
                 const q1 = matches.find(m => m.stage === 'Qualifier 1');
                  const elim = matches.find(m => m.stage === 'Eliminator');

                  if (q1 && q1.status === 'complete' && elim && elim.status === 'complete') {
                     const q1Loser = q1.score.split('-')[0] > q1.score.split('-')[1] ? q1.team2 : q1.team1;
                     const elimWinner = elim.score.split('-')[0] > elim.score.split('-')[1] ? elim.team1 : elim.team2;

                     const existingQ2 = matches.find(m => m.stage === 'Qualifier 2');
                     if (existingQ2) return;

                     let newMatches = [];
                     newMatches.push({ team1: q1Loser, team2: elimWinner, status: 'pending', score: '', stage: 'Qualifier 2' });
                     
                     database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).update({
                         matches: [...matches, ...newMatches],
                         currentStage: 'qualifier2'
                     });
                  }
             } else if (currentStage === 'qualifier2' && teams.length === 4) {
                 const q1 = matches.find(m => m.stage === 'Qualifier 1');
                 const q2 = matches.find(m => m.stage === 'Qualifier 2');

                 if (q1 && q1.status === 'complete' && q2 && q2.status === 'complete') {
                     const q1Winner = q1.score.split('-')[0] > q1.score.split('-')[1] ? q1.team1 : q1.team2;
                     const q2Winner = q2.score.split('-')[0] > q2.score.split('-')[1] ? q2.team1 : q2.team2;
                    
                    const existingFinal = matches.find(m => m.stage === 'Final');
                    if (existingFinal) return;

                     let newMatches = [];
                     newMatches.push({ team1: q1Winner, team2: q2Winner, status: 'pending', score: '', stage: 'Final' });

                     database.ref(`clubs/${clubId}/tournaments/${tournamentId}`).update({
                         matches: [...matches, ...newMatches],
                         currentStage: 'finals'
                     });
                 }
             }
         });
     }

     function getTeamPlayersString(teamName, teams) {
         const team = teams.find(t => t.teamName ===teamName);
         return team ? team.players.map(p => p.name).join(' & ') : 'Unknown Team';
     }

    function loadMatches(clubId, tournamentId, tournament) {
        if (!matchesContent || !tournament) {
             if (matchesContent) showEmptyState(matchesContent, 'Matches will appear here once the tournament starts.');
            return;
        };
        
        const { matches, teams, status } = tournament;
        
        if (!matches || matches.length === 0) {
            if (status === 'pending') {
                showLoader(matchesContent);
            } else {
                showEmptyState(matchesContent, 'No matches have been generated for this tournament.');
            }
            return;
        }
        
        matchesContent.innerHTML = '';

        const stageOrder = { 'Final': 5, 'Qualifier 2': 4, 'Eliminator': 3, 'Qualifier 1': 3, 'Round Robin': 1 };
        const sortedMatches = [...matches].sort((a, b) => (stageOrder[b.stage] || 0) - (stageOrder[a.stage] || 0) || matches.indexOf(a) - matches.indexOf(b));

        sortedMatches.forEach((match) => {
            const originalIndex = matches.indexOf(match);
            const card = document.createElement('div');
            card.className = 'card match-card';
            const stageDisplay = match.stage ? `<span class="stage-badge">${match.stage}</span>` : '';

            const team1Players = getTeamPlayersString(match.team1, teams);
            const team2Players = getTeamPlayersString(match.team2, teams);

            if (match.status === 'pending') {
                 const [s1, s2] = match.score ? match.score.split('-') : ['', ''];
                card.innerHTML = `
                    <div class="match-info">
                        ${stageDisplay}
                        <div class="match-teams">
                            <span>${team1Players}</span>
                            <span class="vs">vs</span>
                            <span>${team2Players}</span>
                        </div>
                    </div>
                    <div class="score-input">
                        <input type="number" placeholder="S1" class="score1-input" value="${s1}" aria-label="Score for ${team1Players}">
                        <input type="number" placeholder="S2" class="score2-input" value="${s2}" aria-label="Score for ${team2Players}">
                        <button class="btn-primary icon-btn save-score-btn" aria-label="Save Score"><i class="fas fa-save"></i></button>
                    </div>
                `;
                card.querySelector('.save-score-btn').onclick = () => {
                    const s1_val = card.querySelector('.score1-input').value;
                    const s2_val = card.querySelector('.score2-input').value;
                    updateScore(clubId, tournamentId, originalIndex, s1_val, s2_val);
                };
            } else { // complete
                const [s1, s2] = match.score.split('-');
                const team1Won = parseInt(s1) > parseInt(s2);
                card.innerHTML = `
                    <div class="match-info">
                         ${stageDisplay}
                         <div class="match-teams">
                            <span class="${team1Won ? 'font-weight-bold' : ''}">${team1Players}</span>
                            <span class="vs">vs</span>
                            <span class="${!team1Won ? 'font-weight-bold' : ''}">${team2Players}</span>
                        </div>
                    </div>
                    <div class="score-display">
                        <span>${match.score}</span>
                        ${status !== 'complete' ? `<button class="icon-btn edit-score-btn" aria-label="Edit Score"><i class="fas fa-edit"></i></button>` : ''}
                    </div>
                `;
                 if (status !== 'complete') {
                    card.querySelector('.edit-score-btn').onclick = () => editScore(clubId, tournamentId, originalIndex);
                }
            }
            matchesContent.appendChild(card);
        });
    }

     function calculateStandings(teams, matches) {
         if (!teams || teams.length === 0) return [];
         const standings = teams.map(t => ({
             name: t.teamName,
             players: t.players.map(p => p.name).join(' & '),
             played: 0, wins: 0, losses: 0, points: 0,
             pointsFor: 0, pointsAgainst: 0, pointDifference: 0
         }));

         const relevantMatches = matches.filter(m => m.stage === 'Round Robin' && m.status === 'complete');

         relevantMatches.forEach(m => {
             const team1 = standings.find(t => t.name === m.team1);
             const team2 = standings.find(t => t.name === m.team2);
             if (!m.score) return;
             const score = m.score.split('-').map(s => parseInt(s));

             if (!team1 || !team2) return;

             team1.played++; team2.played++;
             team1.pointsFor += score[0]; team1.pointsAgainst += score[1];
             team2.pointsFor += score[1]; team2.pointsAgainst += score[0];
             team1.pointDifference = team1.pointsFor - team1.pointsAgainst;
             team2.pointDifference = team2.pointsFor - team2.pointsAgainst;

             if (score[0] > score[1]) { team1.wins++; team2.losses++; team1.points += 2; } 
             else if (score[1] > score[0]) { team2.wins++; team1.losses++; team2.points += 2; }
         });

         return standings.sort((a, b) => {
             if (b.points !== a.points) return b.points - a.points;
             if (b.pointDifference !== a.pointDifference) return b.pointDifference - a.pointDifference;
             return b.pointsFor - a.pointsFor; // Tie-breaker
         });
     }

     function loadStandings(clubId, tournamentId, tournament) {
        if (!standingsContent) return;
        const {teams, matches, status} = tournament;
        
        if (status === 'pending') {
            showEmptyState(standingsContent, 'Standings will be calculated as matches are completed.');
            return;
        }

        const standings = calculateStandings(teams, matches);
        
        if (standings.length === 0) {
            showEmptyState(standingsContent, 'No teams or matches available to generate standings.');
            return;
        }
        standingsContent.innerHTML = '';
        const table = document.createElement('table');
        table.className = 'standings-table';
        table.innerHTML = `
            <thead>
                <tr>
                    <th class="text-left">Team / Players</th>
                    <th>P</th>
                    <th>W</th>
                    <th>L</th>
                    <th>+/-</th>
                    <th>Pts</th>
                </tr>
            </thead>
            <tbody>
                ${standings.map(t => `
                    <tr>
                        <td class="text-left"><strong>${t.name}</strong><br><small>${t.players}</small></td>
                        <td>${t.played}</td>
                        <td>${t.wins}</td>
                        <td>${t.losses}</td>
                        <td>${t.pointDifference > 0 ? '+' : ''}${t.pointDifference}</td>
                        <td>${t.points}</td>
                    </tr>
                `).join('')}
            </tbody>
        `;
        standingsContent.appendChild(table);
    }
});

