import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, User, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = ({ toggleSidebar, title }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-35 flex items-center justify-between h-16 px-6 bg-white border-b border-slate-200 shadow-xs">
      {/* Sidebar Mobile Toggle & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800">{title}</h1>
      </div>

      {/* User Actions */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {/* Avatar Icon */}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold uppercase border border-indigo-200 text-sm shadow-inner">
            {user?.name ? user.name.slice(0, 2) : 'AD'}
          </div>
          
          <div className="hidden md:block text-right">
            <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.name}</p>
            <Link 
              to="/profile" 
              className="text-xs text-indigo-600 hover:underline"
            >
              Edit Profile
            </Link>
          </div>
        </div>

        <div className="h-6 w-px bg-slate-200" />

        {/* Quick Logout Icon Button */}
        <button
          onClick={logout}
          title="Logout"
          className="p-2 text-slate-400 rounded-lg hover:bg-red-50 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Header;
