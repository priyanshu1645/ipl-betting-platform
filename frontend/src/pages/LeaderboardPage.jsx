import { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { Trophy, Medal } from 'lucide-react';

const LeaderboardPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const socket = useSocket();

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/auth/leaderboard');
      setUsers(res.data);
    } catch (error) {
      console.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('leaderboard_updated', () => {
      fetchLeaderboard();
    });

    return () => {
      socket.off('leaderboard_updated');
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
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex items-center space-x-3 mb-8">
        <Trophy size={32} className="text-yellow-400" />
        <div>
          <h1 className="text-3xl font-black">Top <span className="text-ipl-accent">Bettors</span></h1>
          <p className="text-slate-400">The 10 richest players in the arena</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden">
        {users.length === 0 ? (
           <p className="p-6 text-center text-slate-400">No bettors found.</p>
        ) : (
          <div className="divide-y divide-slate-800/50">
            {users.map((user, index) => (
              <div 
                key={user._id} 
                className={`flex items-center justify-between p-4 transition-colors hover:bg-slate-800/30
                  ${index === 0 ? 'bg-yellow-500/10' : index === 1 ? 'bg-slate-400/10' : index === 2 ? 'bg-amber-700/10' : ''}`}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-8 text-center font-bold text-lg text-slate-500">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                  </div>
                  <div className="font-semibold text-lg">{user.username}</div>
                </div>
                <div className="font-mono font-bold text-xl text-yellow-500">
                  {user.coins} 🪙
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
