
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
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-2 px-4 py-2 bg-white border rounded-lg text-sm font-medium transition-all min-w-[140px] ${
          (isMulti ? (selectedValues as string[]).length > 0 : selectedValues !== 'all-india')
            ? 'border-blue-500 text-blue-700 bg-blue-50'
            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="truncate max-w-[100px]">{getDisplayText()}</span>
        </div>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl z-[60] py-2 animate-in fade-in zoom-in duration-150 origin-top">
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {options.map((opt) => {
              const isSelected = isMulti 
                ? (selectedValues as string[]).includes(opt.id)
                : selectedValues === opt.id;
              
              return (
                <div
                  key={opt.id}
                  onClick={() => toggleValue(opt.id)}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                    isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'
                  }`}>
                    {isSelected && (
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${isSelected ? 'font-semibold text-blue-700' : 'text-gray-700'}`}>
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
    <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-6 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2 text-gray-400 border-r border-gray-200 pr-4">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="text-sm font-bold uppercase tracking-wider">Filters</span>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Dropdown 
          label="State" 
          options={STATES} 
          selectedValues={selectedState} 
          onChange={onStateChange} 
          isMulti={false}
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /></svg>}
        />

        <Dropdown 
          label="Qualification" 
          options={QUALIFICATIONS} 
          selectedValues={selectedQuals} 
          onChange={onQualsChange} 
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>}
        />

        <Dropdown 
          label="Category" 
          options={CATEGORIES} 
          selectedValues={selectedCats} 
          onChange={onCatsChange} 
          icon={<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>}
        />
      </div>

      {hasFilters && (
        <button 
          onClick={onReset}
          className="ml-auto text-sm font-semibold text-red-500 hover:text-red-700 hover:underline"
        >
          Clear All
        </button>
      )}
    </div>
  );
};

export default FilterBar;
