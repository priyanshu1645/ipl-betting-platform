import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, Trophy, History, LayoutDashboard, LogOut, Coins } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: 'Dashboard', path: '/', icon: Home },
    { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { name: 'History', path: '/history', icon: History },
  ];

  if (user?.isAdmin) {
    navLinks.push({ name: 'AdminPanel', path: '/admin', icon: LayoutDashboard });
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass-panel rounded-none border-x-0 border-t-0 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-ipl-accent to-yellow-300">
          IPL BetSim
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex items-center space-x-2 transition-colors duration-200 ${isActive ? 'text-ipl-accent' : 'text-slate-400 hover:text-white'}`}
              >
                <Icon size={18} />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700">
            <Coins size={16} className="text-yellow-400 mr-2" />
            <span className="font-bold font-mono text-yellow-50">{user.coins}</span>
          </div>
          
          <div className="hidden md:flex items-center space-x-3 border-l border-slate-700 pl-4">
            <span className="text-slate-300 font-medium">@{user.username}</span>
            <button onClick={logout} className="text-slate-400 hover:text-red-400 transition-colors">
              <LogOut size={20} />
            </button>
          </div>
        </div>

        {/* Mobile Bottom Nav (fixed bottom) */}
        <div className="md:hidden fixed bottom-0 left-0 w-full glass-panel border-x-0 border-b-0 rounded-none flex justify-around py-3 px-2 z-50">
           {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={`flex flex-col items-center flex-1 ${isActive ? 'text-ipl-accent' : 'text-slate-400'}`}
              >
                <Icon size={20} className="mb-1" />
                <span className="text-[10px] uppercase tracking-wider font-semibold">{link.name}</span>
              </Link>
            );
          })}
          <button onClick={logout} className="flex flex-col items-center flex-1 text-slate-400 hover:text-red-400">
            <LogOut size={20} className="mb-1" />
            <span className="text-[10px] uppercase tracking-wider font-semibold">Exit</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
