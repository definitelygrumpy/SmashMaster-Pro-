
import React, { useState } from 'react';
import { Player, SkillLevel, Club, AuthSession } from '../types';
import { 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus, 
  Filter,
  X,
  User,
  Users
} from 'lucide-react';

interface PlayerRegistryProps {
  players: Player[];
  setPlayers: React.Dispatch<React.SetStateAction<Player[]>>;
  clubs: Club[];
  session: AuthSession;
}

const PlayerRegistry: React.FC<PlayerRegistryProps> = ({ players, setPlayers, clubs, session }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<SkillLevel | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    skill: SkillLevel.BEGINNER,
    clubId: session.clubId || clubs[0]?.id || ''
  });

  const handleOpenAdd = () => {
    setEditingPlayer(null);
    setFormData({ name: '', skill: SkillLevel.BEGINNER, clubId: session.clubId || clubs[0]?.id || '' });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (player: Player) => {
    setEditingPlayer(player);
    setFormData({ name: player.name, skill: player.skill, clubId: player.clubId });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    if (editingPlayer) {
      setPlayers(players.map(p => p.id === editingPlayer.id ? { ...p, ...formData } : p));
    } else {
      const player: Player = {
        id: Date.now().toString(),
        name: formData.name,
        skill: formData.skill,
        clubId: formData.clubId,
        wins: 0,
        losses: 0,
        joinedDate: new Date().toISOString().split('T')[0]
      };
      setPlayers([...players, player]);
    }
    setIsModalOpen(false);
  };

  const deletePlayer = (id: string) => {
    if (confirm('Are you sure you want to remove this player?')) {
      setPlayers(players.filter(p => p.id !== id));
    }
  };

  const filteredPlayers = players.filter(p => {
    const isClubMatch = session.role === 'SUPER_ADMIN' || p.clubId === session.clubId;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSkill = skillFilter === 'ALL' || p.skill === skillFilter;
    return isClubMatch && matchesSearch && matchesSkill;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Player Registry</h2>
          <p className="text-slate-400">Manage club members and performance stats.</p>
        </div>
        {session.role === 'CLUB_ADMIN' && (
          <button 
            onClick={handleOpenAdd}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-5 h-5" />
            <span>Add Player</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl sticky top-8">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Filter className="w-4 h-4 text-orange-500" /> Filters
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Search Name</label>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input type="text" placeholder="Search..." className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-orange-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Skill Level</label>
                <select className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-orange-500" value={skillFilter} onChange={(e) => setSkillFilter(e.target.value as any)}>
                  <option value="ALL">All Levels</option>
                  <option value={SkillLevel.BEGINNER}>Beginner</option>
                  <option value={SkillLevel.INTERMEDIATE}>Intermediate</option>
                  <option value={SkillLevel.ADVANCED}>Advanced</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 border-b border-slate-700">
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Player</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Skill</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Record</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredPlayers.map(player => (
                  <tr key={player.id} className="hover:bg-slate-700/30 transition-colors group">
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-slate-300"><User className="w-5 h-5" /></div>
                      <span className="font-semibold">{player.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${player.skill === SkillLevel.ADVANCED ? 'bg-blue-500/20 text-blue-400' : player.skill === SkillLevel.INTERMEDIATE ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-500/20 text-slate-400'}`}>
                        {player.skill}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-sm">
                      <span className="text-green-500">{player.wins}W</span> <span className="text-red-500">{player.losses}L</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenEdit(player)} className="p-2 hover:bg-slate-600 rounded-lg text-slate-300"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => deletePlayer(player.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-2xl font-bold mb-6">{editingPlayer ? 'Edit Player' : 'Add Player'}</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Name</label>
                <input type="text" autoFocus required className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 focus:outline-none focus:border-orange-500" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Skill</label>
                <div className="grid grid-cols-3 gap-3">
                  {Object.values(SkillLevel).map(skill => (
                    <button key={skill} type="button" onClick={() => setFormData({...formData, skill})} className={`py-2 text-xs font-bold rounded-xl border transition-all ${formData.skill === skill ? 'bg-orange-500 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'}`}>{skill}</button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-700">Cancel</button>
                <button type="submit" className="flex-1 px-6 py-3 rounded-xl font-bold bg-orange-500 hover:bg-orange-600 text-white shadow-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayerRegistry;
