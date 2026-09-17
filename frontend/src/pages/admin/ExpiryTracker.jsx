import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, getDaysRemaining } from '../../utils/formatters';
import {
  ShieldAlert,
  BellRing,
  Send,
  Calendar,
  Building,
  Scale,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Mail
} from 'lucide-react';

export const ExpiryTracker = () => {
  const [certificates, setCertificates] = useState([]);
  const [daysFilter, setDaysFilter] = useState('30');
  const [loading, setLoading] = useState(true);
  const [cronRunning, setCronRunning] = useState(false);
  const [cronResult, setCronResult] = useState(null);

  const fetchExpiring = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/certificates?expiringInDays=${daysFilter}`);
      if (res.data?.success) {
        setCertificates(res.data.certificates);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpiring();
  }, [daysFilter]);

  const triggerCron = async () => {
    setCronRunning(true);
    setCronResult(null);
    try {
      const res = await api.post('/notifications/trigger-cron');
      if (res.data?.success) {
        setCronResult(res.data.result);
        await fetchExpiring();
      }
    } catch (err) {
      console.error('Failed to trigger cron:', err);
    } finally {
      setCronRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Manual Cron Sweep Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[11px] font-mono font-bold text-amber-600 uppercase tracking-wider">
            Legal Metrology Act, 2009 • Section 24 & 30 Compliance
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-0.5">
            Statutory Expiry & Renewal Watchlist
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated tracking of certificates approaching statutory expiration at 30, 15, and 7-day thresholds.
          </p>
        </div>

        <button
          onClick={triggerCron}
          disabled={cronRunning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition shrink-0"
        >
          <BellRing className={`w-4 h-4 ${cronRunning ? 'animate-spin' : ''}`} />
          <span>{cronRunning ? 'Dispatching Notices...' : 'Trigger Expiry Sweep & Email Alerts'}</span>
        </button>
      </div>

      {/* Cron Result Toast */}
      {cronResult && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Daily Expiry Sweep Executed Successfully</p>
              <p className="text-emerald-700">
                Dispatched {cronResult.alertsSent || 0} renewal email notice(s) and updated {cronResult.expiredUpdated || 0} expired certificate status(es).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Threshold Filter Buttons */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-700 uppercase">Expiry Window:</span>
        {[
          { days: '30', label: 'Within 30 Days (Early Notice)' },
          { days: '15', label: 'Within 15 Days (Urgent Warning)' },
          { days: '7', label: 'Within 7 Days (Critical Action)' }
        ].map((item) => (
          <button
            key={item.days}
            onClick={() => setDaysFilter(item.days)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              daysFilter === item.days
                ? 'bg-gov-600 text-white shadow-sm font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Expiring Certificates Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No Certificates Expiring in This Window</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All registered measuring instruments are currently operating within their valid statutory terms.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                  <th className="p-3.5">Certificate ID</th>
                  <th className="p-3.5">Establishment / Owner</th>
                  <th className="p-3.5">Contact Email / Phone</th>
                  <th className="p-3.5">Instrument Specs</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5">Days Remaining</th>
                  <th className="p-3.5">Alerts Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {certificates.map((cert) => {
                  const daysLeft = getDaysRemaining(cert.validTill);
                  return (
                    <tr key={cert._id} className="hover:bg-slate-50">
                      <td className="p-3.5 font-mono font-bold text-gov-700">{cert.certId}</td>
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-900 block">
                          {cert.owner?.organizationName || cert.owner?.name}
                        </span>
                        <span className="text-slate-500 text-[11px]">{cert.owner?.name}</span>
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{cert.owner?.email}</span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">{cert.owner?.phone}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="font-medium text-slate-800 block">{cert.instrument?.instrumentName}</span>
                        <span className="text-slate-500 text-[11px] font-mono">{cert.instrument?.serialNumber}</span>
                      </td>
                      <td className="p-3.5 font-semibold text-rose-700">{formatDate(cert.validTill)}</td>
                      <td className="p-3.5">
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 font-bold text-[11px]">
                          {daysLeft} Day(s) Left
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 text-[10px] font-mono">
                          <span className={cert.renewalAlertsSent?.day30 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            30D: {cert.renewalAlertsSent?.day30 ? '✓' : 'Pending'}
                          </span>
                          <span>•</span>
                          <span className={cert.renewalAlertsSent?.day15 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            15D: {cert.renewalAlertsSent?.day15 ? '✓' : 'Pending'}
                          </span>
                          <span>•</span>
                          <span className={cert.renewalAlertsSent?.day7 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                            7D: {cert.renewalAlertsSent?.day7 ? '✓' : 'Pending'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
