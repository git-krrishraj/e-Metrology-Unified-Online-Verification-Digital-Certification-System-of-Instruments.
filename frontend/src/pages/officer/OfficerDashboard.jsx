import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Award,
  Calendar,
  Building,
  Scale,
  ArrowRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
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
  const queue = data?.assignedQueue || [];

  return (
    <div className="space-y-6">
      {/* Officer Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold text-gov-600 uppercase bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
              Officer ID: {user?.officerId || 'LMO-MH-01'}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              Jurisdiction: {user?.jurisdictionDistrict || 'Mumbai'}, {user?.jurisdictionState || 'Maharashtra'}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Officer {user?.name}
          </h1>
          <p className="text-xs text-slate-500">
            {user?.designation || 'Inspector / Officer of Legal Metrology'} • {t('officerTerminalSub')}
          </p>
        </div>

        <Link
          to="/officer/queue"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-sm transition"
        >
          <ClipboardList className="w-4 h-4" />
          <span>{t('openAssignedQueueBtn')}</span>
        </Link>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('statScheduledInspections')}
          value={stats.pendingInspections || 0}
          icon={ClipboardList}
          color="amber"
          subtitle={t('statScheduledInspectionsSub')}
        />
        <StatCard
          title={t('statVerifiedCertified')}
          value={stats.completedInspections || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle={t('statVerifiedCertifiedSub')}
        />
        <StatCard
          title={t('statNonCompliant')}
          value={stats.rejectedInspections || 0}
          icon={XCircle}
          color="rose"
          subtitle={t('statNonCompliantSub')}
        />
        <StatCard
          title={t('statCertsIssued')}
          value={stats.certificatesIssued || 0}
          icon={Award}
          color="blue"
          subtitle={t('statCertsIssuedSub')}
        />
      </div>

      {/* Immediate Inspection Queue */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-4 h-4 text-gov-600" />
            <span>{t('nextUpQueueTitle')}</span>
          </h3>
          <Link
            to="/officer/queue"
            className="text-xs font-semibold text-gov-600 hover:underline flex items-center gap-1"
          >
            <span>{t('viewAll')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {queue.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400">
            No pending inspections in your queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {queue.map((app) => (
              <div
                key={app._id}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-xs text-slate-900">{app.applicationNo}</span>
                    <StatusBadge status={app.status} />
                  </div>

                  <p className="text-xs font-bold text-slate-900">{app.instrument?.instrumentName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    SN: {app.instrument?.serialNumber} ({app.instrument?.category})
                  </p>

                  <div className="text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span className="font-medium text-slate-800">{app.applicant?.organizationName || app.applicant?.name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{t('scheduledDate')}: {formatDate(app.scheduledDate)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/officer/inspect/${app._id}`)}
                  className="w-full py-2 px-3 rounded-lg bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-gold-400" />
                  <span>{t('startInspectionBtn')}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
