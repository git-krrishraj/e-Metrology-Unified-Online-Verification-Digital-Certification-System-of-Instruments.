import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Moon, Sun, Sparkles } from 'lucide-react';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`group relative flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/40 select-none ${
        isDark
          ? 'bg-slate-900/70 border-slate-700/60 text-slate-200 hover:border-slate-600 hover:bg-slate-800/80 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.15)]'
          : 'bg-white/85 border-slate-200/90 text-slate-700 hover:border-slate-300 hover:bg-white backdrop-blur-md shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode (Frosted Crystal)' : 'Switch to Dark Mode (Cool Deep Glass)'}
      aria-label="Toggle Theme"
    >
      {/* Dynamic Visual Icon Switcher */}
      <div className="relative flex items-center justify-center w-5 h-5">
        {isDark ? (
          <div className="relative flex items-center justify-center">
            {/* Soft Lunar Glow */}
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-sm scale-125 animate-pulse pointer-events-none"></div>
            {/* Luminous Crescent Moon */}
            <Moon className="w-4 h-4 text-cyan-300 transition-transform duration-300 group-hover:-rotate-12 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" />
            {/* Subtle Star Particle */}
            <Sparkles className="w-2 h-2 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
          </div>
        ) : (
          <div className="relative flex items-center justify-center">
            {/* Warm Ambient Ray Ring */}
            <div className="absolute inset-0 bg-amber-400/20 rounded-full blur-sm scale-125 animate-pulse pointer-events-none"></div>
            {/* Radiant Glowing Sun */}
            <Sun className="w-4 h-4 text-amber-500 transition-transform duration-500 group-hover:rotate-90 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          </div>
        )}
      </div>

      {/* Mode Label */}
      <span className="text-[11px] font-semibold tracking-tight hidden sm:inline">
        {isDark ? (
          <span className="text-slate-300 group-hover:text-cyan-200 transition-colors">
            Dark
          </span>
        ) : (
          <span className="text-slate-600 group-hover:text-amber-600 transition-colors">
            Light
          </span>
        )}
      </span>

      {/* Toggle Indicator Pill */}
      <div
        className={`w-6 h-3.5 rounded-full p-0.5 transition-colors duration-300 flex items-center ${
          isDark ? 'bg-blue-600 justify-end' : 'bg-slate-300 justify-start'
        }`}
      >
        <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm transition-transform"></div>
      </div>
    </button>
  );
};
