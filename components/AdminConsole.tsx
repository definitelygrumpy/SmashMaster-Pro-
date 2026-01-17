
import React, { useState } from 'react';
import { Club, Player, Tournament, AuthSession } from '../types';
import { 
  ShieldCheck, 
  Plus, 
  Building2, 
  Trash2, 
  CheckCircle,
  User,
  Lock,
  Trophy,
  AlertTriangle,
  Edit2
} from 'lucide-react';

interface AdminConsoleProps {
  clubs: Club[];
  setClubs: React.Dispatch<React.SetStateAction<Club[]>>;
  players: Player[];
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  session: AuthSession;
}

const AdminConsole: React.FC<AdminConsoleProps> = ({ 
  clubs, 
  setClubs, 
  players, 
  tournaments, 
  setTournaments,
  session 
}) => {
  const [newClub, setNewClub] = useState({ name: '', location: '', username: '', password: '' });
  const [editingClub, setEditingClub] = useState<Club | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    const club: Club = { id: Date.now().toString(), ...newClub };
    setClubs([...clubs, club]);
    setNewClub({ name: '', location: '', username: '', password: '' });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleUpdateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClub) return;
    setClubs(clubs.map(c => c.id === editingClub.id ? editingClub : c));
    setEditingClub(null);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const deleteClub = (id: string) => { if (confirm('Delete this club franchise?')) setClubs(clubs.filter(c => c.id !== id)); };
  const deleteTournament = (id: string) => { if (confirm('Delete this tournament?')) setTournaments(tournaments.filter(t => t.id !== id)); };

  if (session.role === 'CLUB_ADMIN') {
    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h2 className="text-3xl font-bold tracking-tight mb-8">Club Settings</h2>
        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-orange-500 p-4 rounded-2xl"><Building2 className="w-8 h-8 text-white" /></div>
            <div><h3 className="text-2xl font-bold">{session.name}</h3><p className="text-slate-500">Franchise Portal</p></div>
          </div>
          <p className="text-green-500 font-bold flex items-center gap-2 mb-4"><ShieldCheck className="w-4 h-4" /> Active Verified</p>
          <p className="text-slate-500 text-sm">To change club details, contact the Association Global Administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">Global Admin Console</h2>
        <p className="text-slate-400">Master management of all club franchises.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 sticky top-8">
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2">{editingClub ? <Edit2 className="w-5 h-5 text-orange-500" /> : <Plus className="w-5 h-5 text-orange-500" />}{editingClub ? 'Edit Franchise' : 'New Franchise'}</h3>
            <form onSubmit={editingClub ? handleUpdateClub : handleCreateClub} className="space-y-4">
              <input type="text" required placeholder="Club Name" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm" value={editingClub ? editingClub.name : newClub.name} onChange={(e) => editingClub ? setEditingClub({...editingClub, name: e.target.value}) : setNewClub({...newClub, name: e.target.value})} />
              <input type="text" placeholder="Location" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm" value={editingClub ? editingClub.location : newClub.location} onChange={(e) => editingClub ? setEditingClub({...editingClub, location: e.target.value}) : setNewClub({...newClub, location: e.target.value})} />
              <div className="relative"><User className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" /><input type="text" required placeholder="Username" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 text-sm" value={editingClub ? editingClub.username : newClub.username} onChange={(e) => editingClub ? setEditingClub({...editingClub, username: e.target.value}) : setNewClub({...newClub, username: e.target.value})} /></div>
              <div className="relative"><Lock className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" /><input type="password" required placeholder="Password" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 text-sm" value={editingClub ? editingClub.password : newClub.password} onChange={(e) => editingClub ? setEditingClub({...editingClub, password: e.target.value}) : setNewClub({...newClub, password: e.target.value})} /></div>
              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 rounded-xl transition-all">{editingClub ? 'Update' : 'Create'}</button>
            </form>
            {showSuccess && <div className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3 text-green-400 text-sm"><CheckCircle className="w-5 h-5" /><span>Success!</span></div>}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Building2 className="w-6 h-6 text-orange-500" /> Active Franchises</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {clubs.map(club => (
                <div key={club.id} className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 hover:border-slate-500 transition-colors group">
                  <div className="flex justify-between items-start mb-4">
                    <div><h4 className="font-bold text-lg">{club.name}</h4><p className="text-xs text-slate-500">{club.location || 'Unknown'}</p></div>
                    <div className="flex gap-1">
                      <button onClick={() => setEditingClub(club)} className="p-2 text-slate-500 hover:text-orange-400"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => deleteClub(club.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-400 border-t border-slate-700/50 pt-3 flex items-center gap-4"><span className="flex items-center gap-1"><User className="w-3 h-3" /> {club.username}</span><span>{players.filter(p => p.clubId === club.id).length} Players</span></div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2"><Trophy className="w-6 h-6 text-orange-500" /> Ledger</h3>
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden shadow-xl">
              {tournaments.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/50 border-b border-slate-700"><tr><th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Tournament</th><th className="px-6 py-4 text-[10px] font-black uppercase text-slate-500">Club</th><th className="px-6 py-4 text-right text-[10px] font-black uppercase text-slate-500">Del</th></tr></thead>
                  <tbody className="divide-y divide-slate-700/50">{tournaments.map(t => (
                    <tr key={t.id} className="hover:bg-slate-700/30 group transition-colors">
                      <td className="px-6 py-4 font-bold">{t.name}</td>
                      <td className="px-6 py-4 text-slate-400">{clubs.find(c => c.id === t.clubId)?.name || 'Admin'}</td>
                      <td className="px-6 py-4 text-right"><button onClick={() => deleteTournament(t.id)} className="p-2 text-slate-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button></td>
                    </tr>
                  ))}</tbody>
                </table>
              ) : <div className="p-16 text-center text-slate-500"><AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-20" /><p>No tournaments recorded.</p></div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AdminConsole;
