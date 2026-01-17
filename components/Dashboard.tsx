
import React from 'react';
import { Player, Tournament, Match, Club, SkillLevel, UserRole } from '../types';
import { 
  Users, 
  Trophy, 
  Target, 
  TrendingUp, 
  Activity,
  Award,
  Zap,
  Building2
} from 'lucide-react';
import { CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface DashboardProps {
  players: Player[];
  tournaments: Tournament[];
  matches: Match[];
  clubs: Club[];
  role: UserRole;
}

const Dashboard: React.FC<DashboardProps> = ({ players, tournaments, matches, clubs, role }) => {
  const activeTournaments = tournaments.filter(t => t.status === 'ONGOING');
  const completedMatches = matches.filter(m => m.isCompleted).length;

  const skillData = [
    { name: 'Beginner', value: players.filter(p => p.skill === SkillLevel.BEGINNER).length, color: '#94a3b8' },
    { name: 'Intermediate', value: players.filter(p => p.skill === SkillLevel.INTERMEDIATE).length, color: '#f97316' },
    { name: 'Advanced', value: players.filter(p => p.skill === SkillLevel.ADVANCED).length, color: '#0ea5e9' },
  ];

  const topPlayers = [...players].sort((a, b) => b.wins - a.wins).slice(0, 5);

  const stats = [
    { label: 'Total Players', value: players.length, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Tournaments', value: activeTournaments.length, icon: Trophy, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    { label: 'Matches Finished', value: completedMatches, icon: Activity, color: 'text-green-500', bg: 'bg-green-500/10' },
    { 
      label: role === 'SUPER_ADMIN' ? 'Managed Clubs' : 'Venue Status', 
      value: role === 'SUPER_ADMIN' ? clubs.length : 1, 
      icon: role === 'SUPER_ADMIN' ? Building2 : Target, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10' 
    },
  ];

  return (
    <div className="animate-in fade-in duration-500 slide-in-from-bottom-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold tracking-tight mb-2">
          {role === 'SUPER_ADMIN' ? 'Global Overview' : 'Club Dashboard'}
        </h2>
        <p className="text-slate-400">
          {role === 'SUPER_ADMIN' 
            ? 'Unified view of all badminton franchises and tournaments.' 
            : 'Track your club members and championship progress.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl flex items-center justify-between hover:border-slate-500/50 transition-all group">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">{stat.label}</p>
              <h3 className="text-2xl font-bold">{stat.value}</h3>
            </div>
            <div className={`${stat.bg} ${stat.color} p-4 rounded-xl group-hover:scale-110 transition-transform`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <h3 className="font-bold text-lg">Skill Distribution</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {skillData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 mt-4">
            {skillData.map((s, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-slate-400">{s.name}</span>
                </div>
                <span className="font-bold">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-lg">Top Performers</h3>
            </div>
          </div>
          <div className="space-y-4">
            {topPlayers.length > 0 ? topPlayers.map((player, idx) => (
              <div key={player.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500 font-bold border border-orange-500/30">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold">{player.name}</h4>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">{player.skill} • {clubs.find(c => c.id === player.clubId)?.name || 'Unknown Club'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-500">{player.wins}W</p>
                  <p className="text-xs text-slate-500">{player.losses}L</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-10 text-slate-500">No players recorded yet.</div>
            )}
          </div>
        </div>

        {role === 'CLUB_ADMIN' && (
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Upcoming Matches
              </h3>
              <div className="space-y-3">
                {matches.filter(m => !m.isCompleted).slice(0, 3).map(m => (
                  <div key={m.id} className="p-3 border border-slate-700/50 rounded-lg flex items-center justify-between text-sm bg-slate-900/40">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-300 font-medium">{players.find(p => p.id === m.team1Ids[0])?.name || 'TBD'}</span>
                      <span className="text-slate-500 px-1 text-xs italic">vs</span>
                      <span className="text-slate-300 font-medium">{players.find(p => p.id === m.team2Ids[0])?.name || 'TBD'}</span>
                    </div>
                  </div>
                ))}
                {matches.filter(m => !m.isCompleted).length === 0 && (
                  <p className="text-slate-500 text-center py-4 italic">No scheduled matches.</p>
                )}
              </div>
            </div>

            <div className="bg-orange-500 rounded-2xl p-6 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <h3 className="font-bold text-xl mb-2">New Season?</h3>
                <p className="text-orange-100 text-sm mb-6 opacity-90">Host a regional qualifier or club round-robin today.</p>
                <button className="bg-white text-orange-500 font-bold px-6 py-2.5 rounded-xl text-sm shadow-xl shadow-orange-700/20 hover:scale-105 transition-transform">
                  Launch Tournament
                </button>
              </div>
              <Trophy className="absolute -right-8 -bottom-8 w-40 h-40 text-white/10 group-hover:scale-110 transition-transform" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
