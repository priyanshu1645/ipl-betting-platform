import { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Trophy, X } from 'lucide-react';
import api from '../services/api';

const WinNotification = () => {
  const [winData, setWinData] = useState(null);
  const [show, setShow] = useState(false);
  const socket = useSocket();
  const { user } = useAuth(); // We just need user to know they are logged in

  useEffect(() => {
    if (!socket || !user) return;

    const handleMatchResolved = async (data) => {
      // data: { matchId, result, teamName }
      try {
        const res = await api.get('/bets/mybets');
        const bets = res.data;

        // Find if we had a winning bet on this specific match
        const matchingBet = bets.find(
          (b) =>
            (b.matchId._id === data.matchId || b.matchId === data.matchId) &&
            b.result === 'win'
        );

        if (matchingBet) {
          setWinData({
            amount: matchingBet.payout,
            team: data.teamName,
          });
          setShow(true);
        }
      } catch (error) {
        console.error('Failed to fetch bets for notification', error);
      }
    };

    socket.on('match_resolved', handleMatchResolved);

    return () => {
      socket.off('match_resolved', handleMatchResolved);
    };
  }, [socket, user]);

  if (!show || !winData) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[100] px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={() => setShow(false)}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-slate-900 border-2 border-green-500/50 rounded-2xl p-8 max-w-sm w-full shadow-[0_0_50px_rgba(34,197,94,0.3)] transform transition-all animate-bounce-in text-center">
        <button 
          onClick={() => setShow(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-green-500/20 flex items-center justify-center animate-pulse">
            <Trophy size={48} className="text-green-400" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-green-500 mb-2">
          CONGRATULATIONS!
        </h2>
        
        <p className="text-slate-300 text-lg mb-6">
          You predicted correctly! <span className="font-bold text-white">{winData.team}</span> won the match.
        </p>

        <div className="bg-slate-800 rounded-xl p-4 mb-6 border border-slate-700">
          <p className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-1">You Won</p>
          <div className="text-4xl font-mono font-bold text-green-400">
            +{winData.amount} 🪙
          </div>
        </div>

        <button 
          onClick={() => setShow(false)}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 font-bold text-white text-lg hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg hover:shadow-green-500/25"
        >
          Claim Winnings
        </button>
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0.8); opacity: 0; }
          60% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounceIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
      `}</style>
    </div>
  );
};

export default WinNotification;
