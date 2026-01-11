
import React from 'react';

interface HeaderProps {
  onNavigateHome: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onNavigateHome 
}) => {
  return (
    <header className="bg-blue-900 text-white shadow-xl border-b-4 border-blue-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-32 md:h-40 flex items-center justify-start py-2">
        {/* Logo Section - Uses Logo.png to match user's uploaded filename casing */}
        <div 
          className="flex items-center cursor-pointer bg-white p-2 rounded-sm shadow-inner" 
          onClick={onNavigateHome}
        >
          <img 
            src="/Logo.png" 
            alt="Govt Job Info" 
            className="h-24 md:h-32 w-auto object-contain transition-transform hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Try lowercase fallback if Logo.png fails
              if (!target.src.includes('logo.png')) {
                target.src = '/logo.png';
              } else {
                // If both fail, use the placeholder
                target.src = 'https://i.ibb.co/XfK70p9/placeholder-logo.png';
              }
            }}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
