
import React, { useState, useMemo } from 'react';
import { Player, Tournament, Match, Standing, SkillLevel, AuthSession } from '../types';
import { 
  Trophy, 
  Plus, 
  ChevronRight, 
  X,
  User,
  Shuffle,
  MousePointer2,
  AlertTriangle,
  Award,
  Medal,
  PartyPopper,
  ListOrdered,
  CheckCircle2
} from 'lucide-react';

interface TournamentEngineProps {
  players: Player[];
  tournaments: Tournament[];
  setTournaments: React.Dispatch<React.SetStateAction<Tournament[]>>;
  matches: Match[];
  setMatches: React.Dispatch<React.SetStateAction<Match[]>>;
  session: AuthSession;
}

const TournamentEngine: React.FC<TournamentEngineProps> = ({ 
  players, 
  tournaments, 
  setTournaments, 
  matches, 
  setMatches,
  session
}) => {
  const [activeTournamentId, setActiveTournamentId] = useState<string | null>(null);
  const [isNewTournamentModalOpen, setIsNewTournamentModalOpen] = useState(false);
  const [creationStep, setCreationStep] = useState(1);
  const [newTourney, setNewTourney] = useState<{
    name: string, 
    teamMode: 'RANDOM' | 'MANUAL',
    selectedPlayerIds: string[],
    manualTeams: string[][]
  }>({
    name: '',
    teamMode: 'RANDOM',
    selectedPlayerIds: [],
    manualTeams: []
  });

  const activeTournament = useMemo(() => 
    tournaments.find(t => t.id === activeTournamentId), 
    [tournaments, activeTournamentId]
  );

  const tournamentMatches = useMemo(() => 
    matches.filter(m => m.tournamentId === activeTournamentId),
    [matches, activeTournamentId]
  );

  const finalMatch = useMemo(() => 
    tournamentMatches.find(m => m.type === 'FINAL'),
    [tournamentMatches]
  );

  const results = useMemo(() => {
    if (!finalMatch || !finalMatch.isCompleted) return null;
    const getTeamName = (ids: string[]) => ids.map(pid => players.find(p => p.id === pid)?.name || 'TBD').join(' / ');
    return finalMatch.score1 > finalMatch.score2 
      ? { winner: getTeamName(finalMatch.team1Ids), runnerUp: getTeamName(finalMatch.team2Ids) }
      : { winner: getTeamName(finalMatch.team2Ids), runnerUp: getTeamName(finalMatch.team1Ids) };
  }, [finalMatch, players]);

  const standings = useMemo(() => {
    if (!activeTournament) return [];
    const statsMap = new Map<string, Standing>();
    activeTournament.teams.forEach(team => {
      const teamId = team.sort().join('-');
      const teamName = team.map(pid => players.find(p => p.id === pid)?.name || 'TBD').join(' / ');
      statsMap.set(teamId, { teamId, playerName: teamName, matchesPlayed: 0, won: 0, loss: 0, points: 0, setsWon: 0, setsLost: 0, setDifference: 0 });
    });

    tournamentMatches.filter(m => m.isCompleted && m.type === 'ROUND_ROBIN').forEach(m => {
      const t1Id = m.team1Ids.sort().join('-');
      const t2Id = m.team2Ids.sort().join('-');
      const s1 = statsMap.get(t1Id); const s2 = statsMap.get(t2Id);
      if (s1 && s2) {
        s1.matchesPlayed++; s2.matchesPlayed++;
        s1.setsWon += m.score1; s1.setsLost += m.score2;
        s2.setsWon += m.score2; s2.setsLost += m.score1;
        if (m.score1 > m.score2) { s1.won++; s1.points += 2; s2.loss++; }
        else { s2.won++; s2.points += 2; s1.loss++; }
      }
    });

    return Array.from(statsMap.values())
      .map(s => ({ ...s, setDifference: s.setsWon - s.setsLost }))
      .sort((a, b) => b.points - a.points || b.setDifference - a.setDifference);
  }, [activeTournament, tournamentMatches, players]);

  const generateMatches = (tourney: Tournament) => {
    const newMatches: Match[] = [];
    const teams = tourney.teams;
    const numTeams = teams.length;
    const rrRounds = (numTeams === 3) ? 2 : 1;

    for (let r = 0; r < rrRounds; r++) {
      for (let i = 0; i < teams.length; i++) {
        for (let j = i + 1; j < teams.length; j++) {
          newMatches.push({
            id: `${tourney.id}-rr-${newMatches.length}`,
            tournamentId: tourney.id,
            team1Ids: teams[i], team2Ids: teams[j],
            score1: 0, score2: 0,
            isCompleted: false, round: r + 1, type: 'ROUND_ROBIN'
          });
        }
      }
    }
    setMatches(prev => [...prev, ...newMatches]);
  };

  const updateMatchScore = (matchId: string, s1: number, s2: number, completed: boolean) => {
    setMatches(prev => {
      const nextMatches = prev.map(m => m.id === matchId ? { ...m, score1: s1, score2: s2, isCompleted: completed } : m);
      const updatedMatch = nextMatches.find(m => m.id === matchId)!;
      const tournament = tournaments.find(t => t.id === updatedMatch.tournamentId);

      if (completed && tournament) {
        const tMatches = nextMatches.filter(m => m.tournamentId === tournament.id);
        const rrMatches = tMatches.filter(m => m.type === 'ROUND_ROBIN');
        if (rrMatches.every(m => m.isCompleted)) {
          const s = calculateStats(tournament, rrMatches);
          const numT = tournament.teams.length;
          if (numT === 3 || numT === 5) {
            const top2 = s.slice(0, 2);
            if (!tMatches.find(m => m.type === 'FINAL')) {
              nextMatches.push({
                id: `${tournament.id}-final`, tournamentId: tournament.id,
                team1Ids: tournament.teams.find(t => t.sort().join('-') === top2[0].teamId)!,
                team2Ids: tournament.teams.find(t => t.sort().join('-') === top2[1].teamId)!,
                score1: 0, score2: 0, isCompleted: false, round: 99, type: 'FINAL'
              });
            }
          } else if (numT === 4) {
            const q1 = tMatches.find(m => m.type === 'QUALIFIER_1');
            const eli = tMatches.find(m => m.type === 'ELIMINATOR');
            if (!q1 && !eli) {
              nextMatches.push({ id: `${tournament.id}-q1`, tournamentId: tournament.id, team1Ids: tournament.teams.find(t => t.sort().join('-') === s[0].teamId)!, team2Ids: tournament.teams.find(t => t.sort().join('-') === s[1].teamId)!, score1: 0, score2: 0, isCompleted: false, round: 90, type: 'QUALIFIER_1' });
              nextMatches.push({ id: `${tournament.id}-eli`, tournamentId: tournament.id, team1Ids: tournament.teams.find(t => t.sort().join('-') === s[2].teamId)!, team2Ids: tournament.teams.find(t => t.sort().join('-') === s[3].teamId)!, score1: 0, score2: 0, isCompleted: false, round: 90, type: 'ELIMINATOR' });
            } else if (q1?.isCompleted && eli?.isCompleted) {
              const q2 = tMatches.find(m => m.type === 'QUALIFIER_2');
              const loserQ1 = q1.score1 < q1.score2 ? q1.team1Ids : q1.team2Ids;
              const winnerEli = eli.score1 > eli.score2 ? eli.team1Ids : eli.team2Ids;
              if (!q2) {
                nextMatches.push({ id: `${tournament.id}-q2`, tournamentId: tournament.id, team1Ids: loserQ1, team2Ids: winnerEli, score1: 0, score2: 0, isCompleted: false, round: 95, type: 'QUALIFIER_2' });
              } else if (q2.isCompleted) {
                const final = tMatches.find(m => m.type === 'FINAL');
                const winnerQ1 = q1.score1 > q1.score2 ? q1.team1Ids : q1.team2Ids;
                const winnerQ2 = q2.score1 > q2.score2 ? q2.team1Ids : q2.team2Ids;
                if (!final) nextMatches.push({ id: `${tournament.id}-final`, tournamentId: tournament.id, team1Ids: winnerQ1, team2Ids: winnerQ2, score1: 0, score2: 0, isCompleted: false, round: 99, type: 'FINAL' });
              }
            }
          }
        }
      }
      return [...nextMatches];
    });
  };

  const calculateStats = (tourney: Tournament, tMatches: Match[]) => {
    const statsMap = new Map<string, Standing>();
    tourney.teams.forEach(t => statsMap.set(t.sort().join('-'), { teamId: t.sort().join('-'), playerName: '', matchesPlayed: 0, won: 0, loss: 0, points: 0, setsWon: 0, setsLost: 0, setDifference: 0 }));
    tMatches.forEach(m => {
      const s1 = statsMap.get(m.team1Ids.sort().join('-'))!; const s2 = statsMap.get(m.team2Ids.sort().join('-'))!;
      s1.matchesPlayed++; s2.matchesPlayed++; s1.setsWon += m.score1; s1.setsLost += m.score2; s2.setsWon += m.score2; s2.setsLost += m.score1;
      if (m.score1 > m.score2) { s1.won++; s1.points += 2; s2.loss++; } else { s2.won++; s2.points += 2; s1.loss++; }
    });
    return Array.from(statsMap.values()).sort((a, b) => b.points - a.points || (b.setsWon - b.setsLost) - (a.setsWon - a.setsLost));
  };

  const createTournament = (e: React.FormEvent) => {
    e.preventDefault();
    let finalTeams: string[][] = [];
    if (newTourney.teamMode === 'RANDOM') {
      const shuffled = [...newTourney.selectedPlayerIds].sort(() => Math.random() - 0.5);
      for (let i = 0; i < shuffled.length; i += 2) { if (shuffled[i+1]) finalTeams.push([shuffled[i], shuffled[i+1]]); }
    } else finalTeams = newTourney.manualTeams;

    const t: Tournament = { id: `t-${Date.now()}`, name: newTourney.name, clubId: session.clubId || '1', status: 'ONGOING', teams: finalTeams, playerIds: newTourney.selectedPlayerIds };
    setTournaments([...tournaments, t]);
    generateMatches(t);
    setIsNewTournamentModalOpen(false);
    setActiveTournamentId(t.id);
    setCreationStep(1);
    setNewTourney({ name: '', teamMode: 'RANDOM', selectedPlayerIds: [], manualTeams: [] });
  };

  const togglePlayerSelection = (id: string) => setNewTourney(p => ({ ...p, selectedPlayerIds: p.selectedPlayerIds.includes(id) ? p.selectedPlayerIds.filter(x => x !== id) : [...p.selectedPlayerIds, id] }));
  const [currentPair, setCurrentPair] = useState<string[]>([]);
  const addToPair = (id: string) => currentPair.includes(id) ? setCurrentPair(p => p.filter(x => x !== id)) : currentPair.length < 2 && setCurrentPair(p => [...p, id]);
  const confirmPair = () => { if (currentPair.length === 2) { setNewTourney(p => ({ ...p, manualTeams: [...p.manualTeams, currentPair] })); setCurrentPair([]); } };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">Tournament Engine</h2>
          <p className="text-slate-400">Manage 3, 4, or 5 team championships with live scoring.</p>
        </div>
        {session.role === 'CLUB_ADMIN' && (
          <button onClick={() => setIsNewTournamentModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-5 py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
            <Plus className="w-5 h-5" /> <span>New Tournament</span>
          </button>
        )}
      </div>

      {!activeTournamentId ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.filter(t => t.clubId === session.clubId || session.role === 'SUPER_ADMIN').map(t => (
            <div key={t.id} onClick={() => setActiveTournamentId(t.id)} className="bg-slate-800/40 border border-slate-700/50 p-6 rounded-2xl cursor-pointer hover:border-orange-500/50 transition-all relative group overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"><Trophy className="w-16 h-16 text-orange-500" /></div>
              <div className="flex items-center justify-between mb-4">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${t.status === 'ONGOING' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-500/20 text-slate-400'}`}>{t.status}</span>
                <span className="text-[9px] font-black border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded">DOUBLES</span>
              </div>
              <h3 className="font-bold text-xl mb-1 group-hover:text-orange-500 transition-colors">{t.name}</h3>
              <p className="text-slate-500 text-sm mb-4">{t.teams.length} Teams</p>
              <div className="flex items-center gap-2 text-orange-500 text-sm font-bold">Manage Season <ChevronRight className="w-4 h-4" /></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in duration-300">
          <button onClick={() => setActiveTournamentId(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-300 font-medium transition-colors"><ChevronRight className="w-4 h-4 rotate-180" /> Back to List</button>

          {results && (
            <div className="bg-slate-800 border border-orange-500/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center animate-in zoom-in-95">
              <div className="absolute inset-0 opacity-5 pointer-events-none"><PartyPopper className="w-full h-full text-orange-500" /></div>
              <div className="flex flex-col md:flex-row items-center justify-around gap-8 relative z-10">
                <div className="space-y-4">
                  <div className="bg-orange-500/20 p-6 rounded-full inline-block"><Trophy className="w-16 h-16 text-orange-500" /></div>
                  <div><h3 className="text-sm font-black text-orange-500 tracking-widest uppercase">Champion</h3><p className="text-4xl font-black italic text-white tracking-tighter">{results.winner}</p></div>
                </div>
                <div className="space-y-4">
                  <div className="bg-slate-700/30 p-5 rounded-full inline-block"><Medal className="w-12 h-12 text-slate-400" /></div>
                  <div><h3 className="text-sm font-black text-slate-500 tracking-widest uppercase">Runner-up</h3><p className="text-2xl font-bold text-slate-300">{results.runnerUp}</p></div>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-2/5">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 shadow-xl sticky top-8">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2"><ListOrdered className="w-5 h-5 text-orange-500" /> Standings</h3>
                <div className="overflow-x-auto"><table className="w-full text-left text-xs">
                  <thead><tr className="border-b border-slate-700 text-slate-500 uppercase font-black"><th className="pb-3 pr-2 text-center">#</th><th className="pb-3">Team</th><th className="pb-3 text-center">P</th><th className="pb-3 text-center">W</th><th className="pb-3 text-center">L</th><th className="pb-3 text-center text-orange-500">PTS</th><th className="pb-3 text-right">+/-</th></tr></thead>
                  <tbody className="divide-y divide-slate-700/50">{standings.map((s, i) => (
                    <tr key={s.teamId} className={`${i === 0 ? 'bg-orange-500/5' : ''}`}>
                      <td className="py-4 text-center text-slate-500 font-bold">{i+1}</td>
                      <td className="py-4 font-bold text-slate-200">{s.playerName}</td>
                      <td className="py-4 text-center">{s.matchesPlayed}</td>
                      <td className="py-4 text-center text-green-500">{s.won}</td>
                      <td className="py-4 text-center text-red-500">{s.loss}</td>
                      <td className="py-4 text-center font-black text-orange-500">{s.points}</td>
                      <td className={`py-4 text-right font-bold ${s.setDifference >= 0 ? 'text-green-500' : 'text-red-500'}`}>{s.setDifference > 0 ? '+' : ''}{s.setDifference}</td>
                    </tr>
                  ))}</tbody>
                </table></div>
              </div>
            </div>

            <div className="flex-1 space-y-8">
              {tournamentMatches.filter(m => m.type !== 'ROUND_ROBIN').length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-bold text-xl flex items-center gap-2"><Trophy className="w-5 h-5 text-orange-500" /> Knockout Phase</h3>
                  {tournamentMatches.filter(m => m.type !== 'ROUND_ROBIN').sort((a,b) => a.round - b.round).map(m => (
                    <div key={m.id} className={`bg-orange-500/10 border-2 border-orange-500/30 rounded-2xl p-6 relative group ${m.isCompleted ? 'opacity-80' : ''}`}>
                      <div className="text-center mb-4"><span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-500">{m.type.replace('_', ' ')}</span></div>
                      <div className="flex justify-between items-center gap-4">
                        <div className="flex-1 text-center text-sm font-bold">{m.team1Ids.map(pid => <p key={pid}>{players.find(p => p.id === pid)?.name}</p>)}</div>
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex items-center gap-4">
                            <input type="number" className="w-14 h-14 bg-slate-950 border-2 border-orange-500/30 rounded-xl text-center font-black text-2xl text-orange-500" value={m.score1} onChange={(e) => updateMatchScore(m.id, parseInt(e.target.value) || 0, m.score2, m.isCompleted)} disabled={m.isCompleted} />
                            <div className="text-slate-600 font-black italic text-xs">VS</div>
                            <input type="number" className="w-14 h-14 bg-slate-950 border-2 border-orange-500/30 rounded-xl text-center font-black text-2xl text-orange-500" value={m.score2} onChange={(e) => updateMatchScore(m.id, m.score1, parseInt(e.target.value) || 0, m.isCompleted)} disabled={m.isCompleted} />
                          </div>
                          <button onClick={() => updateMatchScore(m.id, m.score1, m.score2, !m.isCompleted)} className={`w-full py-2 px-6 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all ${m.isCompleted ? 'bg-slate-700 text-slate-300' : 'bg-orange-500 text-white'}`}>{m.isCompleted ? 'Edit' : 'Submit'}</button>
                        </div>
                        <div className="flex-1 text-center text-sm font-bold">{m.team2Ids.map(pid => <p key={pid}>{players.find(p => p.id === pid)?.name}</p>)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">League Matches</h3>
                <div className="grid grid-cols-1 gap-3">
                  {tournamentMatches.filter(m => m.type === 'ROUND_ROBIN').map(m => (
                    <div key={m.id} className={`bg-slate-800/40 border border-slate-700/50 rounded-2xl p-4 flex items-center justify-between gap-4 ${m.isCompleted ? 'opacity-60' : 'border-orange-500/20'}`}>
                      <div className="flex-1 text-center text-xs font-bold">{m.team1Ids.map(pid => <p key={pid}>{players.find(p => p.id === pid)?.name}</p>)}</div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3">
                          <input type="number" className="w-10 h-10 bg-slate-950 border border-slate-700 rounded-lg text-center font-bold text-orange-500 text-sm" value={m.score1} onChange={(e) => updateMatchScore(m.id, parseInt(e.target.value) || 0, m.score2, m.isCompleted)} disabled={m.isCompleted} />
                          <input type="number" className="w-10 h-10 bg-slate-950 border border-slate-700 rounded-lg text-center font-bold text-orange-500 text-sm" value={m.score2} onChange={(e) => updateMatchScore(m.id, m.score1, parseInt(e.target.value) || 0, m.isCompleted)} disabled={m.isCompleted} />
                        </div>
                        <button onClick={() => updateMatchScore(m.id, m.score1, m.score2, !m.isCompleted)} className={`py-1 px-4 rounded-lg font-bold uppercase text-[9px] tracking-widest transition-all ${m.isCompleted ? 'bg-slate-700' : 'bg-orange-500 text-white'}`}>{m.isCompleted ? 'Edit' : 'Submit'}</button>
                      </div>
                      <div className="flex-1 text-center text-xs font-bold">{m.team2Ids.map(pid => <p key={pid}>{players.find(p => p.id === pid)?.name}</p>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isNewTournamentModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-2xl p-8 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-8"><h3 className="text-2xl font-black italic uppercase tracking-tight">Launch Season</h3><button onClick={() => setIsNewTournamentModalOpen(false)} className="p-2 hover:bg-slate-700 rounded-full"><X className="w-5 h-5" /></button></div>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              {creationStep === 1 && (
                <div className="space-y-6">
                  <div><label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-2">Name</label><input type="text" required placeholder="Smash Cup 2024" className="w-full bg-slate-900 border border-slate-700 rounded-xl py-4 px-5 focus:outline-none focus:border-orange-500 font-bold" value={newTourney.name} onChange={(e) => setNewTourney({...newTourney, name: e.target.value})} /></div>
                  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-3">Pairing Strategy</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setNewTourney({...newTourney, teamMode: 'RANDOM'})} className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${newTourney.teamMode === 'RANDOM' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}><Shuffle className="w-4 h-4" /> <span className="text-sm font-bold">Auto Pairs</span></button>
                      <button type="button" onClick={() => setNewTourney({...newTourney, teamMode: 'MANUAL'})} className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-all ${newTourney.teamMode === 'MANUAL' ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-700 text-slate-500'}`}><MousePointer2 className="w-4 h-4" /> <span className="text-sm font-bold">Manual Select</span></button>
                    </div>
                  </div>
                </div>
              )}
              {creationStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Players (Pairs for 3-5 teams)</label><span className="text-[10px] font-black bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full">{newTourney.selectedPlayerIds.length} Players</span></div>
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl h-[350px] overflow-y-auto p-3 grid grid-cols-2 gap-2 custom-scrollbar">
                    {players.filter(p => p.clubId === session.clubId || session.role === 'SUPER_ADMIN').map(p => (
                      <button key={p.id} type="button" onClick={() => togglePlayerSelection(p.id)} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${newTourney.selectedPlayerIds.includes(p.id) ? 'bg-orange-500/20 border-orange-500 text-orange-400' : 'bg-slate-900 border-slate-800 text-slate-500'}`}>
                        <div className="text-left font-bold text-sm"><p>{p.name}</p></div>
                        {newTourney.selectedPlayerIds.includes(p.id) && <CheckCircle2 className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                  {newTourney.selectedPlayerIds.length % 2 !== 0 && (<p className="text-red-400 text-[10px] font-bold flex items-center gap-2 mt-2"><AlertTriangle className="w-3 h-3" /> Player count must be even (Pairs Only).</p>)}
                </div>
              )}
              {creationStep === 3 && newTourney.teamMode === 'MANUAL' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-8">
                    <div><p className="text-[10px] font-black text-slate-500 uppercase mb-2">Draft Pool</p>
                      <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-3 h-[250px] overflow-y-auto space-y-1 custom-scrollbar">
                        {newTourney.selectedPlayerIds.filter(id => !newTourney.manualTeams.flat().includes(id) && !currentPair.includes(id)).map(id => (<button key={id} onClick={() => addToPair(id)} className={`w-full flex items-center gap-2 p-2 rounded-lg text-xs font-bold transition-all ${currentPair.includes(id) ? 'bg-orange-500 text-white' : 'hover:bg-slate-800 text-slate-400'}`}><User className="w-3 h-3" /> {players.find(p => p.id === id)?.name}</button>))}
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-orange-500/10 border-2 border-dashed border-orange-500/30 rounded-2xl p-4 text-center">
                        <div className="flex items-center justify-center gap-4 min-h-[40px]">{currentPair.map(id => (<div key={id} onClick={() => addToPair(id)} className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-black cursor-pointer">{players.find(p => p.id === id)?.name}</div>))}</div>
                        <button disabled={currentPair.length !== 2} onClick={confirmPair} className="mt-6 w-full bg-orange-500 text-white py-2 rounded-xl text-xs font-bold shadow-lg disabled:opacity-30">Lock Pair</button>
                      </div>
                      <div className="max-h-[120px] overflow-y-auto space-y-2">{newTourney.manualTeams.map((team, idx) => (<div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded-xl border border-slate-800 text-[10px] font-bold text-slate-300"><span>{players.find(p => p.id === team[0])?.name} & {players.find(p => p.id === team[1])?.name}</span><button onClick={() => setNewTourney(prev => ({ ...prev, manualTeams: prev.manualTeams.filter((_, i) => i !== idx) }))}><X className="w-3 h-3" /></button></div>))}</div>
                    </div>
                  </div>
                </div>
              )}
              <div className="pt-8 flex gap-4">
                {creationStep > 1 && (<button type="button" onClick={() => setCreationStep(creationStep - 1)} className="px-8 py-4 rounded-2xl font-bold text-slate-400 hover:bg-slate-700">Previous</button>)}
                <button type="button" disabled={!newTourney.name || (creationStep === 2 && (newTourney.selectedPlayerIds.length < 6 || newTourney.selectedPlayerIds.length > 10))} onClick={() => creationStep < (newTourney.teamMode === 'MANUAL' ? 3 : 2) ? setCreationStep(creationStep + 1) : createTournament(new Event('submit') as any)} className="flex-1 px-8 py-4 rounded-2xl font-black bg-orange-500 hover:bg-orange-600 text-white shadow-xl disabled:opacity-50 transition-all">{creationStep < (newTourney.teamMode === 'MANUAL' ? 3 : 2) ? 'Next' : 'Finalize Season'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentEngine;
