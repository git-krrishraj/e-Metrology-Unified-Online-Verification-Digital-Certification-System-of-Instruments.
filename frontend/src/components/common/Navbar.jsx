import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { LanguageSelector } from './LanguageSelector';
import { ThemeToggle } from './ThemeToggle';
import {
  Bell,
  Scale,
  LogOut,
  User,
  Wifi,
  WifiOff,
  RefreshCw,
  ChevronDown,
  ShieldAlert,
  Menu,
  X
} from 'lucide-react';

export const Navbar = ({ toggleSidebar, isSidebarOpen }) => {
  const { user, logout, quickLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { isOnline, pendingCount, isSyncing, syncQueue } = useOffline();
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDemoMenu, setShowDemoMenu] = useState(false);
  const navigate = useNavigate();

  const handleRoleSwitch = async (roleKey) => {
    setShowDemoMenu(false);
    await quickLogin(roleKey);
    if (roleKey === 'admin') navigate('/admin/dashboard');
    else if (roleKey === 'lmo' || roleKey === 'gatc') navigate('/officer/dashboard');
    else navigate('/consumer/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 transition-colors duration-300 bg-white/80 dark:bg-[#0B0F19]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10 shadow-sm dark:shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
      {/* Top Tiranga / Sovereign Indicator Line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-500 via-white to-emerald-600"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Left: Mobile Toggle & Brand */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden focus:outline-none transition"
                aria-label="Toggle navigation"
              >
                {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-gov-600 to-blue-700 dark:from-blue-600 dark:to-cyan-600 flex items-center justify-center text-white shadow-md border border-white/20 dark:shadow-[0_0_15px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform duration-300">
                <Scale className="w-6 h-6 text-gold-400 drop-shadow-sm" />
              </div>
              <div>
                <span className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2 text-slate-900 dark:text-white">
                  {t('appName')}
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/70 text-gov-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/30 hidden sm:inline-block">
                    {t('govOfIndia')}
                  </span>
                </span>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  {t('portalSubhead')}
                </p>
              </div>
            </Link>
          </div>

          {/* Right: Offline status, Theme Toggle, Language Selector, Demo switcher, Notifications, Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* PWA Network Status Pill */}
            {!isOnline ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-xs animate-pulse">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline font-medium">{t('offlineMode')}</span>
                {pendingCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[10px]">
                    {pendingCount} {t('queued')}
                  </span>
                )}
              </div>
            ) : pendingCount > 0 ? (
              <button
                onClick={syncQueue}
                disabled={isSyncing}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs hover:bg-blue-500/25 transition"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline font-medium">
                  {isSyncing ? 'Syncing...' : `Sync ${pendingCount}`}
                </span>
              </button>
            ) : null}

            {/* Theme Toggle (Sun & Moon Micro-interaction) */}
            <ThemeToggle />

            {/* Multi-Language Dropdown */}
            <LanguageSelector variant={isDark ? 'dark' : 'light'} />

            {/* Quick Demo Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowDemoMenu(!showDemoMenu)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 backdrop-blur-md transition shadow-sm"
                title="Switch demo persona for testing"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></span>
                <span className="font-medium hidden sm:inline">{t('demoSwitcher')}</span>
                <span className="sm:hidden font-medium">Demo</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showDemoMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900/95 rounded-2xl shadow-xl dark:shadow-glass-dark border border-slate-200 dark:border-white/10 py-2 z-50 text-slate-800 dark:text-slate-200 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      {t('switchRolePersona')}
                    </p>
                  </div>
                  {Object.entries(DEMO_USERS).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => handleRoleSwitch(key)}
                      className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-blue-50/70 dark:hover:bg-slate-800/80 flex items-center justify-between transition"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">{config.label}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{config.email}</p>
                      </div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {key}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* In-App Notifications Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 rounded-xl text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900/95 rounded-2xl shadow-xl dark:shadow-glass-dark border border-slate-200 dark:border-white/10 py-2 z-50 text-slate-800 dark:text-slate-200 backdrop-blur-xl max-h-[420px] overflow-y-auto">
                    <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase">{t('notificationsTitle')}</p>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-blue-600 dark:text-cyan-400 hover:underline font-semibold"
                        >
                          {t('markAllRead')}
                        </button>
                      )}
                    </div>

                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400">
                        {t('noNotifications')}
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          onClick={() => markAsRead(n._id)}
                          className={`px-4 py-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition ${
                            !n.isRead ? 'bg-blue-50/50 dark:bg-blue-950/40' : ''
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {n.type === 'expiry_warning' ? (
                              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0 mt-1.5"></span>
                            )}
                            <div>
                              <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-1">
                                {new Date(n.createdAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Auth State */}
            {user ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">{user.name}</p>
                  <span className="text-[10px] uppercase font-mono text-gold-500 dark:text-gold-400 font-bold">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-500 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-gov-600 to-blue-600 dark:from-blue-600 dark:to-cyan-600 hover:opacity-95 shadow-md shadow-blue-500/20 transition"
                >
                  {t('loginDemo')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
