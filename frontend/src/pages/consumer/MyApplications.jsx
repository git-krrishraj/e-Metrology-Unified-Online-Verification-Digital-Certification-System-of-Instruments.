import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { CertificateModal } from '../../components/certificate/CertificateModal';
import {
  ClipboardList,
  Scale,
  Calendar,
  UserCheck,
  Award,
  AlertCircle,
  Eye,
  CheckCircle2,
  Clock,
  RefreshCw
} from 'lucide-react';

export const MyApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my');
      if (res.data?.success) {
        setApplications(res.data.applications);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getStepState = (status, stepIndex) => {
    // Pipeline: 0: Submitted, 1: Scheduled/Allocated, 2: Inspection/Verified, 3: Certified
    const map = {
      submitted: 0,
      scheduled: 1,
      verified: 2,
      certified: 3,
      rejected: -1
    };
    const current = map[status] !== undefined ? map[status] : 0;
    if (status === 'rejected') return 'rejected';
    if (current >= stepIndex) return 'complete';
    return 'upcoming';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Verification Applications</h1>
          <p className="text-xs text-slate-500">
            Track status, inspector allocations, and scheduled dates for your weighing instruments.
          </p>
        </div>
        <button
          onClick={fetchApplications}
          className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
          title="Refresh applications"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Applications Submitted</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't submitted any verification requests yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gov-50 text-gov-700 flex items-center justify-center border border-gov-200 font-bold">
                    <Scale className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                      Application No
                    </span>
                    <h3 className="text-sm font-mono font-bold text-slate-900">{app.applicationNo}</h3>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={app.status} />
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Fee: {formatCurrency(app.stampingFee)}
                  </span>
                </div>
              </div>

              {/* Status Pipeline Visualizer */}
              <div className="py-2">
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { title: '1. Submitted', sub: formatDate(app.createdAt) },
                    {
                      title: '2. Officer Assigned',
                      sub: app.assignedTo ? app.assignedTo.name : 'Pending Assignment'
                    },
                    {
                      title: '3. Inspection',
                      sub: app.scheduledDate ? formatDate(app.scheduledDate) : 'Awaiting Date'
                    },
                    {
                      title: '4. Digital Certificate',
                      sub: app.certificate ? 'Issued' : app.status === 'rejected' ? 'Rejected' : 'Pending'
                    }
                  ].map((step, idx) => {
                    const stepState = getStepState(app.status, idx);
                    return (
                      <div key={idx} className="space-y-1">
                        <div
                          className={`h-2 rounded-full transition ${
                            stepState === 'complete'
                              ? 'bg-emerald-500'
                              : stepState === 'rejected'
                              ? 'bg-rose-500'
                              : 'bg-slate-200'
                          }`}
                        />
                        <p className="text-[11px] font-bold text-slate-800">{step.title}</p>
                        <p className="text-[10px] text-slate-400 truncate">{step.sub}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs text-slate-700 border border-slate-100">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Instrument</span>
                  <span className="font-semibold">{app.instrument?.instrumentName || 'Weighing Instrument'}</span>
                  <span className="text-slate-500 block text-[11px] font-mono">{app.instrument?.serialNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Assigned Verifying Officer</span>
                  {app.assignedTo ? (
                    <div>
                      <span className="font-semibold text-slate-900">{app.assignedTo.name}</span>
                      <span className="text-slate-500 block text-[11px]">{app.assignedTo.designation || 'LMO Inspector'} ({app.assignedTo.officerId || 'LMO'})</span>
                    </div>
                  ) : (
                    <span className="text-amber-600 font-medium">Awaiting Allocation by Admin HQ</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Scheduled Verification Date</span>
                  {app.scheduledDate ? (
                    <span className="font-semibold text-slate-900">{formatDate(app.scheduledDate)}</span>
                  ) : (
                    <span className="text-slate-400">To be scheduled</span>
                  )}
                </div>
              </div>

              {/* Rejection notice if any */}
              {app.status === 'rejected' && app.rejectionReason && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Inspection Finding: </span>
                    <span>{app.rejectionReason}</span>
                  </div>
                </div>
              )}

              {/* Action Button if Certified */}
              {app.certificate && (
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedCert(app.certificate)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-sm transition"
                  >
                    <Award className="w-4 h-4 text-gold-400" />
                    <span>View Stamping Certificate & QR</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};
