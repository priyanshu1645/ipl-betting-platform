import { useState, useEffect } from 'react';
import api from '../services/api';

const Admin = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Match Form State
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [multiplierA, setMultiplierA] = useState(1.5);
  const [multiplierB, setMultiplierB] = useState(2.0);
  const [createLoading, setCreateLoading] = useState(false);

  const fetchMatches = async () => {
    try {
      const res = await api.get('/matches');
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    setCreateLoading(true);
    try {
      await api.post('/matches', {
        teamA, teamB, multiplierA, multiplierB
      });
      setTeamA(''); setTeamB('');
      await fetchMatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating match');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleResolve = async (matchId, resultTeam) => {
    if (!window.confirm(`Are you sure you want to declare ${resultTeam} as winner? This will settle all bets.`)) return;
    
    try {
      await api.put(`/matches/${matchId}/resolve`, { result: resultTeam });
      await fetchMatches();
    } catch (err) {
      alert(err.response?.data?.message || 'Error resolving match');
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-blue-400">Admin Control Panel</h1>
        <p className="text-slate-400">Manage matches and coordinate simulations</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Create Match Column */}
        <div className="md:col-span-1">
          <div className="glass-panel p-6">
            <h2 className="text-xl font-bold mb-6">Create New Match</h2>
            
            <form onSubmit={handleCreateMatch} className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h3 className="font-semibold text-ipl-accent mb-3 uppercase text-xs tracking-wider">Team A Details</h3>
                <input 
                  type="text" required placeholder="Team A Name (e.g. RCB)" 
                  className="w-full bg-slate-800 border-none rounded p-2 text-sm mb-2 focus:ring-1 focus:ring-ipl-accent"
                  value={teamA} onChange={e => setTeamA(e.target.value.toUpperCase())}
                />
                <label className="text-xs text-slate-400">Multiplier (e.g. 1.5)</label>
                <input 
                  type="number" step="0.1" required 
                  className="w-full bg-slate-800 border-none rounded p-2 text-sm focus:ring-1 focus:ring-ipl-accent"
                  value={multiplierA} onChange={e => setMultiplierA(Number(e.target.value))}
                />
              </div>

              <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h3 className="font-semibold text-cyan-500 mb-3 uppercase text-xs tracking-wider">Team B Details</h3>
                <input 
                  type="text" required placeholder="Team B Name (e.g. SRH)" 
                  className="w-full bg-slate-800 border-none rounded p-2 text-sm mb-2 focus:ring-1 focus:ring-ipl-accent"
                  value={teamB} onChange={e => setTeamB(e.target.value.toUpperCase())}
                />
                <label className="text-xs text-slate-400">Multiplier (e.g. 2.0)</label>
                <input 
                  type="number" step="0.1" required 
                  className="w-full bg-slate-800 border-none rounded p-2 text-sm focus:ring-1 focus:ring-ipl-accent"
                  value={multiplierB} onChange={e => setMultiplierB(Number(e.target.value))}
                />
              </div>

              <button type="submit" disabled={createLoading} className="w-full btn-primary text-sm py-3 mt-4">
                {createLoading ? 'Deploying Match...' : 'Deploy Match to Users'}
              </button>
            </form>
          </div>
        </div>

        {/* Manage Matches Column */}
        <div className="md:col-span-2">
          <h2 className="text-xl font-bold mb-6">Active & Unresolved Matches</h2>
          
          {loading ? (
             <div className="text-slate-400">Loading matches...</div>
          ) : matches.filter(m => m.isActive).length === 0 ? (
            <div className="glass-panel p-8 text-center text-slate-400">
               No active matches to manage.
            </div>
          ) : (
            <div className="space-y-4">
               {matches.filter(m => m.isActive).map(match => (
                 <div key={match._id} className="glass-panel p-6 border-l-4 border-l-ipl-accent">
                    <div className="flex justify-between items-center mb-6">
                      <div className="text-sm font-semibold text-slate-400">Match ID: <span className="font-mono text-xs">{match._id}</span></div>
                    </div>
                    
                    <div className="flex items-center justify-between text-center gap-4">
                       <div className="flex-1">
                          <h3 className="font-bold text-2xl">{match.teamA}</h3>
                          <div className="text-ipl-accent font-semibold">{match.multiplierA}x</div>
                          <button 
                            onClick={() => handleResolve(match._id, 'teamA')}
                            className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold text-sm transition"
                          >
                             Declare {match.teamA} Win
                          </button>
                       </div>
                       
                       <div className="text-slate-600 font-bold uppercase tracking-widest text-xs">VS</div>
                       
                       <div className="flex-1">
                          <h3 className="font-bold text-2xl">{match.teamB}</h3>
                          <div className="text-cyan-500 font-semibold">{match.multiplierB}x</div>
                          <button 
                            onClick={() => handleResolve(match._id, 'teamB')}
                            className="w-full mt-4 bg-green-600 hover:bg-green-500 text-white py-2 rounded font-bold text-sm transition"
                          >
                             Declare {match.teamB} Win
                          </button>
                       </div>
                    </div>
                 </div>
               ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Admin;
