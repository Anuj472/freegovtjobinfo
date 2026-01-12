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
      <div className="container mx-auto px-3 h-20 md:h-28 flex items-center justify-between">
        <div 
          className="flex items-center cursor-pointer bg-white p-1 rounded shadow-md active:scale-95 transition-transform" 
          onClick={onNavigateHome}
        >
          <img 
            src={logoUrl} 
            alt="FreeGovtJob.info" 
            className="h-12 md:h-20 w-auto object-contain"
          />
        </div>
        
        <div className="flex flex-col items-end text-right">
           <div className="flex items-center gap-1.5 mb-0.5">
             <p className="text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] text-blue-300">Verified Portal</p>
             <span className="bg-green-500 text-[6px] md:text-[8px] font-black uppercase px-1.5 py-0.5 rounded text-white shadow-sm flex items-center gap-1">
               <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
               <span className="hidden xs:inline">Verified</span>
             </span>
           </div>
           <h2 className="text-sm md:text-xl font-black italic tracking-tighter text-white leading-none">SUCCESS STARTS HERE</h2>
        </div>
      </div>
    </header>
  );
};

export default Header;