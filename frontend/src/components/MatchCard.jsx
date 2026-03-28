import { useState } from 'react';
import BetModal from './BetModal';
import { Swords } from 'lucide-react';

const MatchCard = ({ match, userBet, refreshBets }) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={`glass-panel p-6 ${!match.isActive ? 'opacity-70' : ''}`}>
        <div className="flex justify-between items-center mb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
            {match.isActive ? '🔴 Live Match' : '✅ Completed'}
          </span>
          {match.result !== 'pending' && (
             <span className="px-3 py-1 rounded-full bg-green-900/50 text-green-400 text-xs font-bold">
               Winner: {match.result === 'teamA' ? match.teamA : match.teamB}
             </span>
          )}
        </div>

        <div className="flex items-center justify-between mb-8">
          <div className="text-center flex-1">
            <div className="h-16 w-16 mx-auto bg-gradient-to-br from-red-500 to-red-900 rounded-full flex items-center justify-center mb-3 shadow-lg text-white font-black text-xl">
              {match.teamA.slice(0,3).toUpperCase()}
            </div>
            <h3 className="font-bold text-lg">{match.teamA}</h3>
            <p className="text-ipl-accent font-mono font-bold">{match.multiplierA}x</p>
          </div>
          
          <div className="px-4 text-slate-600 flex flex-col items-center">
             <Swords size={32} />
             <span className="text-xs font-bold mt-2">VS</span>
          </div>

          <div className="text-center flex-1">
            <div className="h-16 w-16 mx-auto bg-gradient-to-br from-orange-500 to-orange-900 rounded-full flex items-center justify-center mb-3 shadow-lg text-white font-black text-xl">
              {match.teamB.slice(0,3).toUpperCase()}
            </div>
            <h3 className="font-bold text-lg">{match.teamB}</h3>
            <p className="text-ipl-accent font-mono font-bold">{match.multiplierB}x</p>
          </div>
        </div>

        {userBet ? (
          <div className={`p-4 rounded-xl border-t ${userBet.result === 'win' ? 'bg-green-900/20 border-green-500/30' : userBet.result === 'loss' ? 'bg-red-900/20 border-red-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Your Bet:</span>
              <span className="font-bold text-white">{userBet.amount} Coins on {userBet.selectedTeam === 'teamA' ? match.teamA : match.teamB}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold uppercase tracking-wider" style={{ color: userBet.result === 'win' ? '#4ade80' : userBet.result === 'loss' ? '#f87171' : '#fbbf24'}}>
                {userBet.result} {userBet.result === 'win' && `(+${userBet.payout})`}
              </span>
            </div>
          </div>
        ) : match.isActive ? (
          <button 
            onClick={() => setShowModal(true)}
            className="w-full btn-primary"
          >
            Place Bet
          </button>
        ) : (
          <div className="text-center p-3 text-slate-500 bg-slate-800/50 rounded-lg text-sm">
            Betting Closed
          </div>
        )}
      </div>

      {showModal && (
        <BetModal 
          match={match} 
          onClose={() => setShowModal(false)} 
          onBetSuccess={refreshBets}
        />
      )}
    </>
  );
};

export default MatchCard;
