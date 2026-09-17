import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Scale,
  QrCode,
  ShieldCheck,
  Award,
  Search,
  FileCheck2,
  BellRing,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  Smartphone,
  Shield,
  Zap
} from 'lucide-react';
import { VerificationStatsTicker } from '../../components/common/VerificationStatsTicker';
import { useLanguage } from '../../context/LanguageContext';

export const LandingPage = () => {
  const [certQuery, setCertQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleVerifyLookup = (e) => {
    e.preventDefault();
    if (certQuery.trim()) {
      navigate(`/verify/${encodeURIComponent(certQuery.trim())}`);
    }
  };

  return (
    <div className="space-y-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            {/* Frosted Glass Chip */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-cyan-500/30 text-gov-700 dark:text-cyan-300 text-xs font-semibold backdrop-blur-md shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-cyan-400 animate-pulse" />
              <span>{t('heroTag')}</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {t('heroTitlePrefix')}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-gov-600 to-cyan-500 dark:from-blue-400 dark:via-cyan-300 dark:to-emerald-400">
                {t('heroTitleHighlight')}
              </span>{' '}
              {t('heroTitleSuffix')}
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal max-w-2xl">
              {t('heroDesc')}
            </p>

            {/* Interactive Search Glass Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-glass-light dark:shadow-glass-dark space-y-3.5 transition-all duration-300 hover:border-blue-300 dark:hover:border-cyan-500/30">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-gov-600 dark:text-cyan-400" />
                <span>{t('verifyCardTitle')}</span>
              </div>

              <form onSubmit={handleVerifyLookup} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 dark:text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={certQuery}
                    onChange={(e) => setCertQuery(e.target.value)}
                    placeholder={t('certIdPlaceholder')}
                    className="w-full pl-10 pr-3.5 py-3 text-xs rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 dark:focus:ring-cyan-400/50 backdrop-blur-md transition"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-gov-600 to-blue-600 dark:from-blue-600 dark:to-cyan-600 hover:opacity-95 text-white font-bold text-xs shadow-md shadow-blue-500/20 dark:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 flex items-center justify-center gap-2 shrink-0 group"
                >
                  <ShieldCheck className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{t('verifyBtn')}</span>
                </button>
              </form>

              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                <span>{t('tryDemoCert')}</span>
                <button
                  type="button"
                  onClick={() => setCertQuery('LMA-MH-2026-10492')}
                  className="font-mono text-gov-600 dark:text-cyan-400 hover:underline font-semibold"
                >
                  LMA-MH-2026-10492
                </button>
              </div>
            </div>

            {/* Live Verification Stats Ticker */}
            <div>
              <VerificationStatsTicker />
            </div>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/login"
                className="px-6 py-3.5 rounded-xl bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 text-white font-bold text-xs shadow-lg shadow-slate-900/10 dark:shadow-[0_0_25px_rgba(37,99,235,0.4)] transition-all duration-300 flex items-center gap-2 group"
              >
                <span>{t('enterPortalBtn')}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-xl bg-white/80 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/90 dark:border-white/10 font-bold text-xs shadow-sm backdrop-blur-md transition-all duration-300"
              >
                {t('registerOwnerBtn')}
              </Link>
            </div>
          </div>

          {/* Right Hero Graphic: Floating Glass Certificate Card */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-3xl p-6 sm:p-7 bg-white/75 dark:bg-slate-900/65 border border-slate-200/90 dark:border-white/10 shadow-glass-light dark:shadow-glass-dark backdrop-blur-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl">
              {/* Internal Cyan Glow Effect */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-blue-500/10 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gov-600 to-blue-700 dark:from-blue-600 dark:to-cyan-600 flex items-center justify-center text-white shadow-sm">
                    <Award className="w-5 h-5 text-gold-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{t('certPreviewTitle')}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{t('certPreviewSub')}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-bold tracking-tight">
                  {t('cryptoSigned')}
                </span>
              </div>

              {/* Nested Metadata Grid */}
              <div className="py-4 space-y-2.5">
                <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs backdrop-blur-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{t('certNoLabel')}</span>
                  <span className="font-mono font-bold text-gov-700 dark:text-gold-400">LMA-MH-2026-10492</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs backdrop-blur-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{t('instrumentLabel')}</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Essae DS-215 (Class III)</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/10 flex items-center justify-between text-xs backdrop-blur-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">{t('validityWindowLabel')}</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{t('validityActive')}</span>
                </div>
              </div>

              {/* Confirmation Footer */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-white/10 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>{t('mpeVerified')}</span>
                </div>
                <span className="font-mono text-gov-600 dark:text-gold-400 font-bold">e = 0.005 kg</span>
              </div>
            </div>

            {/* PWA & Mobile Highlights */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-white/75 dark:bg-slate-900/65 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl transition hover:border-blue-300 dark:hover:border-cyan-500/30">
                <Smartphone className="w-5 h-5 text-gov-600 dark:text-cyan-400 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('pwaTitle')}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t('pwaDesc')}</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/75 dark:bg-slate-900/65 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl transition hover:border-blue-300 dark:hover:border-cyan-500/30">
                <BellRing className="w-5 h-5 text-amber-500 mb-2" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{t('validityTrackingTitle')}</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{t('validityTrackingDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Stakeholder Roles Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 border-t border-slate-200/80 dark:border-white/10">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t('ecosystemTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            {t('ecosystemSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 sm:p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-3 transition hover:shadow-md hover:border-blue-300 dark:hover:border-cyan-500/30">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-500/30 text-gov-600 dark:text-cyan-300 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('consumerTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('consumerDesc')}
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-3 transition hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-500/30">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/60 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
              2
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('lmoTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('lmoDesc')}
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-3 transition hover:shadow-md hover:border-purple-300 dark:hover:border-purple-500/30">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/70 border border-purple-200/60 dark:border-purple-500/30 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-sm">
              3
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('gatcTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('gatcDesc')}
            </p>
          </div>

          <div className="p-5 sm:p-6 rounded-2xl bg-white/75 dark:bg-slate-900/65 border border-slate-200/80 dark:border-white/10 shadow-sm backdrop-blur-xl space-y-3 transition hover:shadow-md hover:border-amber-300 dark:hover:border-amber-500/30">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-200/60 dark:border-amber-500/30 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{t('adminTitle')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('adminDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
