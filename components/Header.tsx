
import React from 'react';
import { SITE_NAME } from '../constants';

interface HeaderProps {
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNavigateHome }) => {
  return (
    <header className="bg-blue-800 text-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div 
          className="flex items-center gap-2 cursor-pointer" 
          onClick={onNavigateHome}
        >
          <div className="bg-white text-blue-800 p-1.5 rounded-lg font-bold text-xl">FG</div>
          <h1 className="text-2xl font-extrabold tracking-tight">{SITE_NAME}</h1>
        </div>
        
        <nav className="flex items-center gap-6 text-sm font-medium">
          <button onClick={onNavigateHome} className="hover:text-blue-200 transition-colors">Home</button>
          <a href="#/all-india" className="hover:text-blue-200 transition-colors">All India Jobs</a>
          <a href="#/qualification/graduation" className="hover:text-blue-200 transition-colors">Graduate Jobs</a>
          <a href="#/trending" className="hidden sm:block hover:text-blue-200 transition-colors">Trending</a>
        </nav>
        
        <div className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search Jobs..." 
            className="w-full bg-blue-700 text-white placeholder-blue-300 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
          <svg className="absolute right-3 top-2 w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
