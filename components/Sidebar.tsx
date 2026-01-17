
import React from 'react';
import { 
  Users, 
  Trophy, 
  Settings, 
  LayoutDashboard, 
  Moon, 
  Sun,
  X,
  Zap,
  LogOut
} from 'lucide-react';
import { AuthSession } from '../types';

interface SidebarProps {
  activeTab: 'dashboard' | 'players' | 'tournaments' | 'admin';
  setActiveTab: (tab: any) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  onClose: () => void;
  session: AuthSession;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isDarkMode, 
  toggleDarkMode, 
  onClose,
  session,
  onLogout
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'players', label: 'Players', icon: Users, role: 'CLUB_ADMIN' },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy, role: 'CLUB_ADMIN' },
    { id: 'admin', label: session.role === 'SUPER_ADMIN' ? 'Global Console' : 'Club Settings', icon: Settings },
  ];

  const filteredItems = menuItems.filter(item => !item.role || item.role === session.role || session.role === 'SUPER_ADMIN');

  return (
    <div className={`w-72 h-full flex flex-col p-6 border-r ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
      <div className="flex items-center justify-between mb-10 lg:justify-start">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-2 rounded-xl shadow-lg shadow-orange-500/20">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight">SmashMaster</h1>
            <p className="text-xs text-orange-500 font-bold uppercase tracking-widest">Pro Edition</p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-2 hover:bg-slate-700/50 rounded-lg">
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-2">
        {filteredItems.map((item) => (
          <button
            key={item.id}
            onClick={() => { setActiveTab(item.id); onClose(); }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
              activeTab === item.id 
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' 
                : `${isDarkMode ? 'text-slate-400 hover:bg-slate-700/50 hover:text-white' : 'text-slate-500 hover:bg-slate-100'}`
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-4 h-4 text-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">System Logged</span>
          </div>
          <p className="text-xs font-bold truncate">{session.name}</p>
        </div>

        <button 
          onClick={toggleDarkMode}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${
            isDarkMode 
              ? 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white' 
              : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-2">
            {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span className="text-sm font-medium">{isDarkMode ? 'Dark' : 'Light'}</span>
          </div>
          <div className={`w-8 h-4 rounded-full relative ${isDarkMode ? 'bg-orange-500' : 'bg-slate-300'}`}>
            <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${isDarkMode ? 'right-0.5' : 'left-0.5'}`} />
          </div>
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors font-bold text-sm"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
