import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from '../common/Navbar';
import { useLanguage } from '../../context/LanguageContext';

export const PublicLayout = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen relative overflow-hidden transition-colors duration-300 bg-[#F8FAFC] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between">
      {/* Ambient Radial Mesh Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Dark Mode Mesh: Electric Blue & Cool Cyan Glows */}
        <div className="hidden dark:block absolute -top-40 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[120px]"></div>
        <div className="hidden dark:block absolute top-1/3 -right-40 w-[500px] h-[500px] bg-cyan-500/15 rounded-full blur-[100px]"></div>
        <div className="hidden dark:block absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-blue-900/15 rounded-full blur-[140px]"></div>

        {/* Light Mode Mesh: Daylight Azure Radial Glows */}
        <div className="block dark:hidden absolute -top-40 left-1/4 w-[600px] h-[600px] bg-blue-200/40 rounded-full blur-[100px]"></div>
        <div className="block dark:hidden absolute top-1/3 -right-40 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[90px]"></div>
        <div className="block dark:hidden absolute -bottom-40 left-1/3 w-[700px] h-[700px] bg-sky-100/40 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 flex flex-col flex-1">
        <Navbar />
        <main className="flex-1">
          <Outlet />
        </main>
        <footer className="bg-white/80 dark:bg-[#070A11]/90 backdrop-blur-xl text-slate-500 dark:text-slate-400 py-8 border-t border-slate-200/80 dark:border-white/10 text-xs transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-slate-900 dark:text-white font-bold">e-Metrology • {t('govOfIndia')}</p>
              <p className="text-slate-500 dark:text-slate-400 mt-0.5">{t('portalDept')}</p>
            </div>
            <div className="text-center sm:text-right text-slate-500 dark:text-slate-400 font-mono text-[11px]">
              {t('statutoryCompliance')}
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
