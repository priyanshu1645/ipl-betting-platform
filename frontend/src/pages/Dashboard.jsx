import { useState, useEffect } from 'react';
import api from '../services/api';
import MatchCard from '../components/MatchCard';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [matches, setMatches] = useState([]);
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const socket = useSocket();
  const { user, updateUser } = useAuth(); // Needed to update balance locally on match resolution

  const fetchData = async () => {
    try {
      const [matchesRes, betsRes] = await Promise.all([
        api.get('/matches'),
        api.get('/bets/mybets')
      ]);
      setMatches(matchesRes.data);
      setBets(betsRes.data);
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    const handleMatchesUpdated = () => {
      fetchData();
    };

    const handleMatchResolved = async (data) => {
      // Re-fetch all data to get updated results and wallet balance
      await fetchData();
      
      // Also fetch profile to get actual verified coins
      const profile = await api.get('/auth/profile');
      updateUser({ coins: profile.data.coins });
    };

    socket.on('matches_updated', handleMatchesUpdated);
    socket.on('match_resolved', handleMatchResolved);

    return () => {
      socket.off('matches_updated', handleMatchesUpdated);
      socket.off('match_resolved', handleMatchResolved);
    };
  }, [socket]);

  // Helper to find bet for a match
  const getBetForMatch = (matchId) => {
    return bets.find(b => b.matchId._id === matchId || b.matchId === matchId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ipl-accent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-black mb-2">Today's <span className="text-ipl-accent">Matches</span></h1>
        <p className="text-slate-400">Place your bets and watch the odds!</p>
      </div>

      {matches.length === 0 ? (
        <div className="glass-panel p-12 text-center">
          <h3 className="text-xl font-bold mb-2">No Active Matches</h3>
          <p className="text-slate-400">The admins are preparing the pitch. Check back soon!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {matches.map(match => (
            <MatchCard 
              key={match._id} 
              match={match} 
              userBet={getBetForMatch(match._id)}
              refreshBets={fetchData}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
