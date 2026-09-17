import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Animated number counter hook with ease-out cubic interpolation
 */
const useAnimatedNumber = (target, duration = 1600, decimals = 0) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId = null;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = easeOut * target;

      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [target, duration]);

  return decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString('en-IN');
};

export const VerificationStatsTicker = ({ className = '' }) => {
  const { t } = useLanguage();
  const verifiedCount = useAnimatedNumber(12480, 1800, 0);
  const complianceRate = useAnimatedNumber(99.8, 1600, 1);
  const speed = useAnimatedNumber(1.2, 1400, 1);

  return (
    <div
      className={`inline-flex flex-wrap items-center gap-3 sm:gap-4 px-3.5 sm:px-4 py-2.5 rounded-xl transition-all duration-300 backdrop-blur-md bg-blue-50/80 dark:bg-cyan-950/30 border border-blue-100 dark:border-cyan-500/20 text-blue-900 dark:text-cyan-300 text-xs font-medium shadow-sm dark:shadow-[0_0_15px_rgba(6,182,212,0.1)] hover:border-blue-200 dark:hover:border-cyan-500/40 ${className}`}
      role="status"
      aria-label="Live verification statistics"
    >
      {/* Live Pulsing Status Dot */}
      <div className="flex items-center gap-2 pr-2 border-r border-blue-200/80 dark:border-cyan-500/30 shrink-0">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700 dark:text-emerald-300 font-mono">
          {t('statLive')}
        </span>
      </div>

      {/* Metric 1 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-bold text-gov-700 dark:text-white font-mono text-xs sm:text-[13px]">
          {verifiedCount}+
        </span>
        <span className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">{t('statVerifiedToday')}</span>
      </div>

      <span className="hidden sm:inline-block text-blue-300 dark:text-cyan-600 font-light">•</span>

      {/* Metric 2 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-bold text-gov-700 dark:text-white font-mono text-xs sm:text-[13px]">
          {complianceRate}%
        </span>
        <span className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">{t('statComplianceRate')}</span>
      </div>

      <span className="hidden md:inline-block text-blue-300 dark:text-cyan-600 font-light">•</span>

      {/* Metric 3 */}
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="font-bold text-gov-700 dark:text-white font-mono text-xs sm:text-[13px]">
          &lt; {speed}s
        </span>
        <span className="text-slate-600 dark:text-slate-300 text-[11px] sm:text-xs">{t('statSpeed')}</span>
      </div>
    </div>
  );
};
