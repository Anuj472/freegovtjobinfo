
import React from 'react';

interface HeaderProps {
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onNavigateHome 
}) => {
  const logoUrl = "https://lh3.googleusercontent.com/d/16mxMJQS75JFnupMKIFRtiOzPECzE94qY";

  return (
    <header className="bg-blue-900 text-white shadow-xl border-b-4 border-blue-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-24 md:h-32 flex items-center justify-start py-2">
        <div 
          className="flex items-center cursor-pointer bg-white p-1.5 rounded-md shadow-lg" 
          onClick={onNavigateHome}
        >
          <img 
            src={logoUrl} 
            alt="FreeGovtJob.info Logo" 
            className="h-16 md:h-24 w-auto object-contain transition-transform hover:scale-105"
            crossOrigin="anonymous"
          />
        </div>
        <div className="ml-6 hidden md:block">
           <div className="flex items-center gap-2 mb-1">
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300">Official Recruitment Portal</p>
             <span className="bg-green-500 text-[8px] font-black uppercase px-1.5 py-0.5 rounded text-white flex items-center gap-1">
               <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
               Verified
             </span>
           </div>
           <h2 className="text-xl font-black italic tracking-tighter">SUCCESS STARTS HERE</h2>
        </div>
      </div>
    </header>
  );
};

export default Header;
