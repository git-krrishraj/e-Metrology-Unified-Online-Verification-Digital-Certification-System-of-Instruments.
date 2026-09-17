import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useLanguage } from '../../context/LanguageContext';
import { StatCard } from '../../components/common/StatCard';
import { formatCurrency } from '../../utils/formatters';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  Users,
  Scale,
  Award,
  ClipboardList,
  IndianRupee,
  ShieldAlert,
  Sliders,
  TrendingUp,
  Building,
  RefreshCw
} from 'lucide-react';

export const AdminDashboard = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
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
  const statusChartData = data?.statusChartData || [];
  const categoryBreakdown = (data?.categoryBreakdown || []).map((c) => ({
    name: c._id ? c._id.split(' ')[0] : 'Other',
    fullName: c._id,
    count: c.count
  }));
  const districtBreakdown = (data?.districtBreakdown || []).map((d) => ({
    district: d._id || 'General',
    count: d.count
  }));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[11px] font-mono font-bold text-gov-600 uppercase tracking-wider">
            {t('appName')} • {t('portalDept')}
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            {t('adminHqTitle')}
          </h1>
          <p className="text-xs text-slate-500">
            {t('adminHqSub')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/admin/allocation"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-sm transition"
          >
            <Sliders className="w-4 h-4" />
            <span>{t('manageAllocBtn')} ({stats.submittedApps || 0} {t('statPendingApps')})</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t('statTradeInstruments')}
          value={stats.totalInstruments || 0}
          icon={Scale}
          color="blue"
          subtitle={t('statTradeInstrumentsSub')}
        />
        <StatCard
          title={t('statActiveStampedCerts')}
          value={stats.totalActiveCerts || 0}
          icon={Award}
          color="emerald"
          subtitle={t('statActiveStampedCertsSub')}
        />
        <StatCard
          title={t('statRevenueCollected')}
          value={formatCurrency(stats.totalRevenue || 0)}
          icon={IndianRupee}
          color="purple"
          subtitle={t('statRevenueCollectedSub')}
        />
        <StatCard
          title={t('statExpiringWatchlist')}
          value={stats.expiringSoon || 0}
          icon={ShieldAlert}
          color={stats.expiringSoon > 0 ? 'rose' : 'emerald'}
          subtitle={t('statExpiringWatchlistSub')}
        />
      </div>

      {/* Secondary Status Pipeline Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
          <p className="text-amber-800 font-bold text-lg">{stats.submittedApps || 0}</p>
          <p className="text-amber-700 font-medium text-[11px]">{t('unassignedSubmitted')}</p>
        </div>
        <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
          <p className="text-blue-800 font-bold text-lg">{stats.scheduledApps || 0}</p>
          <p className="text-blue-700 font-medium text-[11px]">{t('assignedToOfficers')}</p>
        </div>
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <p className="text-emerald-800 font-bold text-lg">{stats.certifiedApps || 0}</p>
          <p className="text-emerald-700 font-medium text-[11px]">{t('certifiedStamped')}</p>
        </div>
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100">
          <p className="text-rose-800 font-bold text-lg">{stats.rejectedApps || 0}</p>
          <p className="text-rose-700 font-medium text-[11px]">{t('rejectedFailedMpe')}</p>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Breakdown Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gov-600" />
            <span>{t('pipelineDistributionTitle')}</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* District Verification Distribution */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Building className="w-4 h-4 text-gov-600" />
            <span>{t('volumeByDistrictTitle')}</span>
          </h3>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtBreakdown}>
                <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0052cc" radius={[6, 6, 0, 0]} name="Applications" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
