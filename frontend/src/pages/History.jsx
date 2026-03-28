import { useState, useEffect } from 'react';
import api from '../services/api';
import { History as HistoryIcon, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useSocket } from '../context/SocketContext';

const History = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchHistory = async () => {
    try {
      const res = await api.get('/bets/mybets');
      setBets(res.data);
    } catch (error) {
      console.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    // Listen to matches updating so we can fetch real-time bet resolutions
    const handleMatchResolved = () => {
      fetchHistory();
    };

    socket.on('match_resolved', handleMatchResolved);

    return () => {
      socket.off('match_resolved', handleMatchResolved);
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ipl-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center space-x-3 mb-8">
        <HistoryIcon size={32} className="text-blue-400" />
        <div>
          <h1 className="text-3xl font-black">Transaction <span className="text-ipl-accent">History</span></h1>
          <p className="text-slate-400">Review your past bets and outcomes</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {bets.length === 0 ? (
          <p className="p-12 text-center text-slate-400">You haven't placed any bets yet. The stadium awaits!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 uppercase text-xs tracking-wider">
                  <th className="p-4 rounded-tl-lg">Match</th>
                  <th className="p-4">Prediction</th>
                  <th className="p-4">Bet Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right rounded-tr-lg">Payout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {bets.map(bet => {
                   const match = bet.matchId;
                   const isWin = bet.result === 'win';
                   const isLoss = bet.result === 'loss';
                   const isPending = bet.result === 'pending';
                   
                   const selectedTeamName = bet.selectedTeam === 'teamA' ? match.teamA : match.teamB;

                   return (
                    <tr key={bet._id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-4">
                        <div className="font-semibold">{match.teamA} vs {match.teamB}</div>
                        <div className="text-xs text-slate-500">{new Date(bet.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-4">
                         <span className="bg-blue-900/40 text-blue-300 py-1 px-3 rounded-full text-xs font-semibold">
                           {selectedTeamName}
                         </span>
                      </td>
                      <td className="p-4 font-mono font-medium text-slate-300">
                        {bet.amount} 🪙
                      </td>
                      <td className="p-4">
                        {isPending && <span className="flex items-center text-yellow-500 font-semibold text-sm w-fit"><Clock size={16} className="mr-1" /> Pending</span>}
                        {isWin && <span className="flex items-center text-green-500 font-semibold text-sm w-fit"><CheckCircle size={16} className="mr-1" /> Win</span>}
                        {isLoss && <span className="flex items-center text-red-500 font-semibold text-sm w-fit"><XCircle size={16} className="mr-1" /> Loss</span>}
                      </td>
                      <td className="p-4 text-right font-mono font-bold text-lg">
                        {isPending ? (
                          <span className="text-slate-500">-</span>
                        ) : isWin ? (
                          <span className="text-green-500">+{bet.payout}</span>
                        ) : (
                          <span className="text-red-500">-</span>
                        )}
                      </td>
                    </tr>
                   );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
