import React, { createContext, useContext, useState, useEffect } from 'react';
import { LANGUAGES, translations } from '../locales/translations';

export { LANGUAGES, translations };

const LanguageContext = createContext(null);

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const saved = localStorage.getItem('preferredLang') || localStorage.getItem('emetrology_lang');
    return LANGUAGES.find((l) => l.code === saved) || LANGUAGES[0];
  });

  const setLanguage = (langCode) => {
    const found = LANGUAGES.find((l) => l.code === langCode);
    if (found) {
      setCurrentLanguage(found);
      localStorage.setItem('preferredLang', found.code);
      localStorage.setItem('emetrology_lang', found.code);
    }
  };

  // Synchronize on load
  useEffect(() => {
    localStorage.setItem('preferredLang', currentLanguage.code);
  }, [currentLanguage]);

  // Translation lookup with fallback to English
  const t = (key) => {
    const langDict = translations[currentLanguage.code] || translations.en;
    if (langDict && langDict[key] !== undefined) {
      return langDict[key];
    }
    if (translations.en && translations.en[key] !== undefined) {
      return translations.en[key];
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
