import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { CertificateModal } from '../../components/certificate/CertificateModal';
import {
  Scale,
  Award,
  ClipboardList,
  ShieldAlert,
  PlusCircle,
  ArrowRight,
  Clock,
  Eye,
  CheckCircle2
} from 'lucide-react';

export const ConsumerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const recentApplications = data?.recentApplications || [];
  const recentCertificates = data?.recentCertificates || [];

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[11px] font-bold text-gov-600 uppercase tracking-wider font-mono">
            {user?.organizationName || t('portalConsumerOwner')}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {t('consumerWelcome')}, {user?.name}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t('consumerSubhead')}
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5">
          <Link
            to="/consumer/instruments"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-500 text-white text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('btnRegisterInstrument')}</span>
          </Link>
          <Link
            to="/consumer/apply"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition"
          >
            <ClipboardList className="w-4 h-4" />
            <span>{t('btnApplyVerification')}</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('statTotalInstruments')}
          value={stats.totalInstruments || 0}
          icon={Scale}
          color="blue"
          subtitle={t('statTotalInstrumentsSub')}
        />
        <StatCard
          title={t('statActiveStamped')}
          value={stats.activeInstruments || 0}
          icon={Award}
          color="emerald"
          subtitle={t('statActiveStampedSub')}
        />
        <StatCard
          title={t('statPendingApps')}
          value={stats.pendingApplications || 0}
          icon={ClipboardList}
          color="amber"
          subtitle={t('statPendingAppsSub')}
        />
        <StatCard
          title={t('statExpiringSoon')}
          value={stats.expiringSoon || 0}
          icon={ShieldAlert}
          color={stats.expiringSoon > 0 ? 'rose' : 'blue'}
          subtitle={t('statExpiringSoonSub')}
        />
      </div>

      {/* Expiry Warning Alert if any */}
      {stats.expiringSoon > 0 && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-amber-900">
                {t('renewalNoticeHeading')}: {stats.expiringSoon} {t('statExpiringSoon')}
              </p>
              <p className="text-xs text-amber-700">
                {t('renewalNoticeDesc')}
              </p>
            </div>
          </div>
          <Link
            to="/consumer/apply"
            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition shadow-sm"
          >
            {t('btnRenewNow')}
          </Link>
        </div>
      )}

      {/* Two Column Section: Recent Applications & Active Certificates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Recent Verification Applications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-gov-600" />
              <span>{t('recentApplicationsTitle')}</span>
            </h3>
            <Link
              to="/consumer/applications"
              className="text-xs font-semibold text-gov-600 hover:underline flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {t('noAppsFound')}
            </div>
          ) : (
            <div className="space-y-3">
              {recentApplications.map((app) => (
                <div
                  key={app._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">{app.applicationNo}</span>
                      <StatusBadge status={app.status} />
                    </div>
                    <p className="text-slate-600">{app.instrument?.instrumentName || 'Instrument'}</p>
                    <p className="text-[10px] text-slate-400">Submitted on {formatDate(app.createdAt)}</p>
                  </div>
                  {app.certificate && (
                    <button
                      onClick={() => setSelectedCert(app.certificate)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 font-semibold text-[11px] flex items-center gap-1 text-slate-700"
                    >
                      <Award className="w-3.5 h-3.5 text-gov-600" />
                      <span>{t('btnCertificate')}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Certificates */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-gov-600" />
              <span>{t('activeCertsTitle')}</span>
            </h3>
            <Link
              to="/consumer/certificates"
              className="text-xs font-semibold text-gov-600 hover:underline flex items-center gap-1"
            >
              <span>{t('viewAll')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentCertificates.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {t('noCertsFound')}
            </div>
          ) : (
            <div className="space-y-3">
              {recentCertificates.map((cert) => (
                <div
                  key={cert._id}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-gov-700">{cert.certId}</span>
                      <StatusBadge status={cert.status} />
                    </div>
                    <p className="text-slate-700 font-medium">
                      {cert.instrument?.instrumentName || 'Instrument'}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {t('validUpTo')}: <span className="font-bold text-slate-800">{formatDate(cert.validTill)}</span>
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="px-3 py-1.5 rounded-lg bg-gov-600 hover:bg-gov-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('viewQr')}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};
