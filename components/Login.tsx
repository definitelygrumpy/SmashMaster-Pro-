
import React, { useState } from 'react';
import { Trophy, Shield, Lock, User, AlertCircle } from 'lucide-react';
import { Club, AuthSession } from '../types';

interface LoginProps {
  clubs: Club[];
  onLogin: (session: AuthSession) => void;
  isDarkMode: boolean;
}

const Login: React.FC<LoginProps> = ({ clubs, onLogin, isDarkMode }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Super Admin check (Hardcoded for demo/admin purposes)
    if (username === 'appu' && password === 'veedu@1432') {
      onLogin({ role: 'SUPER_ADMIN', name: 'Global Administrator' });
      return;
    }

    // Club Admin check
    const club = clubs.find(c => c.username === username && c.password === password);
    if (club) {
      onLogin({ role: 'CLUB_ADMIN', clubId: club.id, name: club.name });
    } else {
      setError('Invalid username or password. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-6 ${isDarkMode ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl animate-in zoom-in-95 duration-300 ${
        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
      }`}>
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="bg-orange-500 p-4 rounded-2xl shadow-xl shadow-orange-500/20 mb-4">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">SmashMaster <span className="text-orange-500">Pro</span></h1>
          <p className="text-slate-500 text-sm">Badminton Club Management Suite</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Username</label>
            <div className="relative">
              <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                required
                className={`w-full border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-orange-500 transition-colors ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
                placeholder="Club username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
              <input 
                type="password" 
                required
                className={`w-full border rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-orange-500 transition-colors ${
                  isDarkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
                placeholder="Your secure password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Shield className="w-5 h-5" />
            <span>Secure Login</span>
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
          <p className="text-xs text-slate-500">
            For global administration, use the master credentials provided by the association.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
