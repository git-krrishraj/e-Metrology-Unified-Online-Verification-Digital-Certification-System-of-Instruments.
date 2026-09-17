import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Sliders,
  UserCheck,
  Zap,
  Calendar,
  Building,
  Scale,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  Send
} from 'lucide-react';

export const ApplicationAllocation = () => {
  const [applications, setApplications] = useState([]);
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchData = async () => {
    try {
      const [appRes, offRes] = await Promise.all([
        api.get('/applications?status=submitted'),
        api.get('/allocation/officers')
      ]);

      if (appRes.data?.success) setApplications(appRes.data.applications);
      if (offRes.data?.success) {
        setOfficers(offRes.data.officers);
        if (offRes.data.officers.length > 0) {
          setSelectedOfficerId(offRes.data.officers[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (!selectedApp || !selectedOfficerId) return;

    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const res = await api.post('/allocation/assign', {
        applicationId: selectedApp._id,
        officerId: selectedOfficerId,
        scheduledDate: scheduledDate || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        remarks
      });

      if (res.data?.success) {
        setMessage(res.data.message);
        setSelectedApp(null);
        await fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign officer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoAssign = async (appId) => {
    setError('');
    setMessage('');
    try {
      const res = await api.post(`/allocation/auto-assign/${appId}`);
      if (res.data?.success) {
        setMessage(`Auto-assigned to ${res.data.assignedOfficer?.name} based on district matching and workload balancing.`);
        await fetchData();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Auto-assignment failed');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Application Scheduling & Allocation</h1>
          <p className="text-xs text-slate-500">
            Assign submitted verification applications to Legal Metrology Officers (LMO) or GATC test centers.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Available Officers Roster with Live Workloads */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-gov-600" />
          <span>Available Verification Officers & Active Queue Workloads</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {officers.map((officer) => (
            <div
              key={officer._id}
              className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-slate-900 block">{officer.name}</span>
                <span className="text-[11px] text-slate-500">
                  {officer.jurisdictionDistrict} • {officer.officerId}
                </span>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                {officer.pendingInspections} in queue
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Unassigned Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5">
        <div className="flex items-center justify-between border-b pb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-gov-600" />
            <span>Pending Allocation Applications ({applications.length})</span>
          </h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            All submitted applications have been allocated to officers! No unassigned backlog.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                  <th className="p-3.5">Application No</th>
                  <th className="p-3.5">Applicant / Establishment</th>
                  <th className="p-3.5">Instrument Specs</th>
                  <th className="p-3.5">District / State</th>
                  <th className="p-3.5">Stamping Fee</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-gov-700">{app.applicationNo}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-900 block">
                        {app.applicant?.organizationName || app.applicant?.name}
                      </span>
                      <span className="text-slate-500 text-[11px]">{app.applicant?.name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-800 block">{app.instrument?.instrumentName}</span>
                      <span className="text-slate-500 text-[11px] font-mono">
                        {app.instrument?.serialNumber} ({app.instrument?.maxCapacity} {app.instrument?.units})
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-800 block">{app.district}</span>
                      <span className="text-slate-500 text-[11px]">{app.state}</span>
                    </td>
                    <td className="p-3.5 font-bold text-emerald-700">{formatCurrency(app.stampingFee)}</td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleAutoAssign(app._id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold text-[11px] border border-amber-200 transition"
                          title="Auto-Assign using smart district & workload algorithm"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-600" />
                          <span>Auto-Assign</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setScheduledDate(
                              new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                            );
                          }}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gov-600 hover:bg-gov-500 text-white font-bold text-[11px] shadow-sm transition"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Assign Officer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Allocation Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gov-600">
                  <UserCheck className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Assign Verification Officer</h3>
                  <p className="text-xs text-slate-400">Application: {selectedApp.applicationNo}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAssign} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <p className="text-slate-500">
                  Applicant:{' '}
                  <strong className="text-slate-900">
                    {selectedApp.applicant?.organizationName || selectedApp.applicant?.name}
                  </strong>
                </p>
                <p className="text-slate-500">
                  Instrument: <strong className="text-slate-900">{selectedApp.instrument?.instrumentName}</strong> (
                  {selectedApp.district})
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Verifying Officer (LMO / GATC) *</label>
                <select
                  required
                  value={selectedOfficerId}
                  onChange={(e) => setSelectedOfficerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 bg-white"
                >
                  {officers.map((o) => (
                    <option key={o._id} value={o._id}>
                      {o.name} ({o.designation || 'LMO'}, {o.jurisdictionDistrict}) — {o.pendingInspections} in queue
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Scheduled Verification Date *</label>
                <input
                  type="date"
                  required
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Remarks / Instructions</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Priority inspection for APMC mandi retail scale."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-lg text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-gov-600 hover:bg-gov-500 text-white font-bold shadow-sm transition"
                >
                  {submitting ? 'Assigning...' : 'Confirm Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
