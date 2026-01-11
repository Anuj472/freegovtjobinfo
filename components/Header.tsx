
import React from 'react';

interface HeaderProps {
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onNavigateHome 
}) => {
  // Using the more reliable 'lh3' proxy for Google Drive images to prevent broken icon issues
  const logoUrl = "https://lh3.googleusercontent.com/d/16mxMJQS75JFnupMKIFRtiOzPECzE94qY";

  return (
    <header className="bg-blue-900 text-white shadow-xl border-b-4 border-blue-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-24 md:h-32 flex items-center justify-start py-2">
        {/* Logo Section - Using reliable Google Drive content delivery link */}
        <div 
          className="flex items-center cursor-pointer bg-white p-1.5 rounded-md shadow-lg" 
          onClick={onNavigateHome}
        >
          <img 
            src={logoUrl} 
            alt="FreeGovtJob.info Logo" 
            className="h-16 md:h-24 w-auto object-contain transition-transform hover:scale-105"
            crossOrigin="anonymous"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // If the lh3 proxy fails, try the uc?export fallback
              if (!target.src.includes('uc?export')) {
                target.src = "https://drive.google.com/uc?export=view&id=16mxMJQS75JFnupMKIFRtiOzPECzE94qY";
              }
            }}
          />
        </div>
        <div className="ml-6 hidden md:block">
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-300 mb-1">Official Recruitment Portal</p>
           <h2 className="text-xl font-black italic tracking-tighter">SUCCESS STARTS HERE</h2>
        </div>
      </div>
    </header>
  );
};

export default Header;
