import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LayoutDashboard,
  Scale,
  FileCheck2,
  Award,
  ClipboardList,
  UserCheck,
  ShieldAlert,
  Sliders,
  Users,
  Search,
  ExternalLink,
  PlusCircle
} from 'lucide-react';

export const Sidebar = ({ isOpen, closeSidebar }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  if (!user) return null;

  const role = user.role;

  const consumerLinks = [
    { to: '/consumer/dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { to: '/consumer/instruments', label: t('navMyInstruments'), icon: Scale },
    { to: '/consumer/apply', label: t('navApplyVerification'), icon: PlusCircle },
    { to: '/consumer/applications', label: t('navMyApplications'), icon: ClipboardList },
    { to: '/consumer/certificates', label: t('navDigitalCertificates'), icon: Award }
  ];

  const officerLinks = [
    { to: '/officer/dashboard', label: t('navOfficerDashboard'), icon: LayoutDashboard },
    { to: '/officer/queue', label: t('navAssignedQueue'), icon: ClipboardList },
    { to: '/officer/history', label: t('navVerificationLogs'), icon: FileCheck2 }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: t('navHqOverview'), icon: LayoutDashboard },
    { to: '/admin/allocation', label: t('navApplicationAllocation'), icon: Sliders },
    { to: '/admin/certificates', label: t('navMasterCertificates'), icon: Award },
    { to: '/admin/expiry', label: t('navExpiryCompliance'), icon: ShieldAlert },
    { to: '/admin/instruments', label: t('navAllInstruments'), icon: Scale }
  ];

  const links =
    role === 'admin' ? adminLinks : role === 'lmo' || role === 'gatc' ? officerLinks : consumerLinks;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={closeSidebar}
          className="fixed inset-0 bg-slate-900/60 z-30 md:hidden backdrop-blur-sm transition-opacity"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 w-64 bg-white/80 dark:bg-[#0B0F19]/90 text-slate-700 dark:text-slate-300 border-r border-slate-200/80 dark:border-white/10 backdrop-blur-xl transform transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div className="py-4 px-3 space-y-6">
          {/* User Role Tag */}
          <div className="px-3.5 py-3 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"></span>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                {role === 'admin'
                  ? t('portalAdmin')
                  : role === 'lmo'
                  ? t('portalOfficerLmo')
                  : role === 'gatc'
                  ? t('portalOfficerGatc')
                  : t('portalConsumerOwner')}
              </p>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate font-medium">
              {user.organizationName || user.name}
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={closeSidebar}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gov-600 dark:bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Bottom Public Tools */}
        <div className="p-3 border-t border-slate-200/80 dark:border-white/10 space-y-2">
          <NavLink
            to="/verify/search"
            onClick={closeSidebar}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 transition"
          >
            <Search className="w-4 h-4 text-gold-500 dark:text-cyan-400" />
            <span>{t('navPublicPortal')}</span>
          </NavLink>
          <div className="px-3.5 py-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono">
            {t('pwaReady')}
          </div>
        </div>
      </aside>
    </>
  );
};
