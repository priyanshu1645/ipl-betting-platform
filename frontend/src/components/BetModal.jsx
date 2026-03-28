import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const BetModal = ({ match, onClose, onBetSuccess }) => {
  const { user, updateUser } = useAuth();
  const [selectedTeam, setSelectedTeam] = useState('teamA');
  const [amount, setAmount] = useState(20);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (amount < 20 || amount > 100) {
      return setError('Bet amount must be between 20 and 100');
    }

    if (amount > user.coins) {
      return setError('Insufficient balance');
    }

    try {
      setLoading(true);
      await api.post('/bets', {
        matchId: match._id,
        selectedTeam,
        amount
      });
      
      // Update local wallet visually instantly
      updateUser({ coins: user.coins - amount });
      
      onBetSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place bet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel p-6 w-full max-w-md relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          ✕
        </button>
        
        <h2 className="text-2xl font-bold mb-6">Place Your Bet</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-6">
            <div 
              onClick={() => setSelectedTeam('teamA')}
              className={`flex-1 p-4 rounded-xl cursor-pointer border-2 transition-all text-center ${selectedTeam === 'teamA' ? 'border-ipl-accent bg-ipl-accent/10' : 'border-slate-700 hover:border-slate-500'}`}
            >
              <div className="font-bold text-lg mb-1">{match.teamA}</div>
              <div className="text-sm font-semibold text-green-400">{match.multiplierA}x Returns</div>
            </div>
            
            <div 
              onClick={() => setSelectedTeam('teamB')}
              className={`flex-1 p-4 rounded-xl cursor-pointer border-2 transition-all text-center ${selectedTeam === 'teamB' ? 'border-ipl-accent bg-ipl-accent/10' : 'border-slate-700 hover:border-slate-500'}`}
            >
              <div className="font-bold text-lg mb-1">{match.teamB}</div>
              <div className="text-sm font-semibold text-green-400">{match.multiplierB}x Returns</div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-400 mb-2">Bet Amount (20 - 100 Coins)</label>
            <input 
              type="range" 
              min="20" 
              max="100" 
              step="10"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-ipl-accent"
            />
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>20</span>
              <span>100</span>
            </div>
            <div className="text-center mt-4 text-4xl font-bold font-mono text-yellow-400">
              {amount}
            </div>
          </div>
          
          <div className="p-4 bg-slate-900 rounded-lg mb-6 flex justify-between items-center text-sm">
            <span className="text-slate-400">Potential Win:</span>
            <span className="font-bold text-green-400 text-lg">
              {Math.floor(amount * (selectedTeam === 'teamA' ? match.multiplierA : match.multiplierB))} Coins
            </span>
          </div>

          {error && <div className="p-3 mb-6 rounded bg-red-900/50 text-red-200 text-sm">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-primary py-3 text-lg h-12 flex items-center justify-center"
          >
            {loading ? 'Placing Bet...' : 'Confirm Bet'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BetModal;
