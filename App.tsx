
import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Menu,
  LogOut
} from 'lucide-react';
import { SkillLevel, Player, Club, Tournament, Match, AuthSession } from './types';
import Dashboard from './components/Dashboard';
import PlayerRegistry from './components/PlayerRegistry';
import TournamentEngine from './components/TournamentEngine';
import AdminConsole from './components/AdminConsole';
import Sidebar from './components/Sidebar';
import Login from './components/Login';

const INITIAL_CLUBS: Club[] = [
  { id: '1', name: 'Downtown Smashers', location: 'City Arena', username: 'club1', password: 'password' }
];

const INITIAL_PLAYERS: Player[] = [
  { id: 'p1', name: 'Alex Wong', skill: SkillLevel.ADVANCED, clubId: '1', wins: 12, losses: 3, joinedDate: '2023-01-15' },
  { id: 'p2', name: 'Sarah Chen', skill: SkillLevel.INTERMEDIATE, clubId: '1', wins: 8, losses: 5, joinedDate: '2023-02-10' },
  { id: 'p3', name: 'Mike Johnson', skill: SkillLevel.ADVANCED, clubId: '1', wins: 15, losses: 2, joinedDate: '2023-01-05' },
  { id: 'p4', name: 'Emma Davis', skill: SkillLevel.BEGINNER, clubId: '1', wins: 2, losses: 8, joinedDate: '2023-05-20' },
];

const App: React.FC = () => {
  const [session, setSession] = useState<AuthSession | null>(() => {
    const saved = localStorage.getItem('sm_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<'dashboard' | 'players' | 'tournaments' | 'admin'>('dashboard');
  const [players, setPlayers] = useState<Player[]>(() => {
    const saved = localStorage.getItem('sm_players');
    return saved ? JSON.parse(saved) : INITIAL_PLAYERS;
  });
  const [clubs, setClubs] = useState<Club[]>(() => {
    const saved = localStorage.getItem('sm_clubs');
    return saved ? JSON.parse(saved) : INITIAL_CLUBS;
  });
  const [tournaments, setTournaments] = useState<Tournament[]>(() => {
    const saved = localStorage.getItem('sm_tournaments');
    return saved ? JSON.parse(saved) : [];
  });
  const [matches, setMatches] = useState<Match[]>(() => {
    const saved = localStorage.getItem('sm_matches');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    localStorage.setItem('sm_players', JSON.stringify(players));
    localStorage.setItem('sm_clubs', JSON.stringify(clubs));
    localStorage.setItem('sm_tournaments', JSON.stringify(tournaments));
    localStorage.setItem('sm_matches', JSON.stringify(matches));
    if (session) localStorage.setItem('sm_session', JSON.stringify(session));
    else localStorage.removeItem('sm_session');
  }, [players, clubs, tournaments, matches, session]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);
  const handleLogout = () => setSession(null);

  if (!session) {
    return <Login clubs={clubs} onLogin={setSession} isDarkMode={isDarkMode} />;
  }

  // Filter data based on session
  const filteredPlayers = session.role === 'SUPER_ADMIN' 
    ? players 
    : players.filter(p => p.clubId === session.clubId);

  const filteredTournaments = session.role === 'SUPER_ADMIN'
    ? tournaments
    : tournaments.filter(t => t.clubId === session.clubId);

  const filteredMatches = session.role === 'SUPER_ADMIN'
    ? matches
    : matches.filter(m => tournaments.find(t => t.id === m.tournamentId)?.clubId === session.clubId);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      <header className="lg:hidden flex items-center justify-between p-4 border-b border-slate-700/50 bg-slate-800/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-orange-500 p-1.5 rounded-lg shadow-lg">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">SmashMaster <span className="text-orange-500">Pro</span></span>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-700 rounded-lg">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      <div className="flex relative">
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className={`
          fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isDarkMode={isDarkMode} 
            toggleDarkMode={toggleDarkMode}
            onClose={() => setIsSidebarOpen(false)}
            session={session}
            onLogout={handleLogout}
          />
        </div>

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto max-h-screen custom-scrollbar">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-4">
              <div className="hidden lg:block">
                <p className="text-xs font-bold text-orange-500 uppercase tracking-widest">{session.role.replace('_', ' ')}</p>
                <h2 className="text-sm font-medium text-slate-400">Authenticated as: <span className="text-white">{session.name}</span></h2>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-slate-500 hover:text-red-400 transition-colors text-sm font-bold"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>

            {activeTab === 'dashboard' && (
              <Dashboard 
                players={filteredPlayers} 
                tournaments={filteredTournaments} 
                matches={filteredMatches} 
                clubs={clubs}
                role={session.role}
              />
            )}
            {activeTab === 'players' && (
              <PlayerRegistry 
                players={players} 
                setPlayers={setPlayers} 
                clubs={clubs}
                session={session}
              />
            )}
            {activeTab === 'tournaments' && (
              <TournamentEngine 
                players={filteredPlayers} 
                tournaments={filteredTournaments} 
                setTournaments={setTournaments}
                matches={matches}
                setMatches={setMatches}
                session={session}
              />
            )}
            {activeTab === 'admin' && (
              <AdminConsole 
                clubs={clubs} 
                setClubs={setClubs} 
                players={players}
                tournaments={tournaments}
                setTournaments={setTournaments}
                session={session}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
