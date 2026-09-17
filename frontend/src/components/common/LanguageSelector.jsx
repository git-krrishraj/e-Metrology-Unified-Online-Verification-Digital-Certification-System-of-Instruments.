import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const LanguageSelector = ({ variant = 'dark' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, setLanguage, languages, t } = useLanguage();
  const dropdownRef = useRef(null);

  const handleSelect = (langCode) => {
    setLanguage(langCode);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const buttonStyles =
    variant === 'light'
      ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm'
      : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800/80 backdrop-blur-md';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-gov-500/50 ${buttonStyles}`}
        aria-label="Select Language"
        title="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="hidden sm:inline">{currentLanguage.native}</span>
        <span className="sm:hidden font-mono uppercase text-[11px]">{currentLanguage.code}</span>
        <ChevronDown
          className={`w-3 h-3 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1 border-b border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {t('selectLangTitle')}
            </p>
          </div>
          <div className="max-h-60 overflow-y-auto py-1">
            {languages.map((lang) => {
              const isSelected = currentLanguage.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelect(lang.code)}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition hover:bg-slate-50 ${
                    isSelected ? 'bg-blue-50/70 font-semibold text-gov-700' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{lang.native}</span>
                    {lang.code !== 'en' && (
                      <span className="text-[10px] text-slate-400 font-normal">({lang.label})</span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-gov-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
