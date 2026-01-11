
import React, { useState, useRef, useEffect } from 'react';
import { STATES, QUALIFICATIONS, CATEGORIES } from '../constants';

interface FilterBarProps {
  selectedState: string;
  selectedQuals: string[];
  selectedCats: string[];
  onStateChange: (stateId: string) => void;
  onQualsChange: (qualIds: string[]) => void;
  onCatsChange: (catIds: string[]) => void;
  onReset: () => void;
}

const Dropdown = ({ 
  label, 
  options, 
  selectedValues, 
  onChange, 
  isMulti = true,
  icon
}: { 
  label: string, 
  options: { id: string, label: string }[], 
  selectedValues: string | string[], 
  onChange: (val: any) => void, 
  isMulti?: boolean,
  icon?: React.ReactNode
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleValue = (id: string) => {
    if (!isMulti) {
      onChange(id);
      setIsOpen(false);
      return;
    }
    const current = selectedValues as string[];
    if (current.includes(id)) {
      onChange(current.filter(v => v !== id));
    } else {
      onChange([...current, id]);
    }
  };

  const getDisplayText = () => {
    if (!isMulti) {
      return options.find(o => o.id === selectedValues)?.label || label;
    }
    const current = selectedValues as string[];
    if (current.length === 0) return label;
    if (current.length === 1) return options.find(o => o.id === current[0])?.label;
    return `${current.length} selected`;
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 px-3 py-1.5 bg-white border rounded text-[10px] font-black uppercase tracking-wider transition-all min-w-[120px] ${
          (isMulti ? (selectedValues as string[]).length > 0 : selectedValues !== 'all-india')
            ? 'border-blue-500 text-blue-700'
            : 'border-gray-300 text-gray-600 hover:border-gray-400'
        }`}
      >
        <div className="flex items-center gap-1.5 truncate">
          {icon}
          <span className="truncate">{getDisplayText()}</span>
        </div>
        <svg className={`w-2.5 h-2.5 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-1 w-56 bg-white border border-gray-200 rounded shadow-xl z-[60] py-1 animate-in fade-in zoom-in duration-100 origin-top">
          <div className="max-h-56 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {options.map((opt) => {
              const isSelected = isMulti 
                ? (selectedValues as string[]).includes(opt.id)
                : selectedValues === opt.id;
              
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleValue(opt.id)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className={`w-3 h-3 rounded border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const FilterBar: React.FC<FilterBarProps> = ({ 
  selectedState, 
  selectedQuals, 
  selectedCats,
  onStateChange, 
  onQualsChange,
  onCatsChange,
  onReset
}) => {
  const hasFilters = selectedState !== 'all-india' || selectedQuals.length > 0 || selectedCats.length > 0;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Dropdown 
        label="Select State" 
        options={STATES} 
        selectedValues={selectedState} 
        onChange={onStateChange} 
        isMulti={false}
        icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>}
      />

      <Dropdown 
        label="Qualification" 
        options={QUALIFICATIONS} 
        selectedValues={selectedQuals} 
        onChange={onQualsChange} 
        icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /></svg>}
      />

      <Dropdown 
        label="Sector" 
        options={CATEGORIES} 
        selectedValues={selectedCats} 
        onChange={onCatsChange} 
        icon={<svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
      />

      {hasFilters && (
        <button 
          onClick={onReset}
          className="text-[9px] font-black uppercase tracking-[0.1em] text-red-600 hover:text-red-800 transition-colors"
        >
          Reset Filters
        </button>
      )}
    </div>
  );
};

export default FilterBar;
