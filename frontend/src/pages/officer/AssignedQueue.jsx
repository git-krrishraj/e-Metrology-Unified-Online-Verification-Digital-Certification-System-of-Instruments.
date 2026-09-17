import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  ClipboardList,
  Scale,
  Calendar,
  Building,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight
} from 'lucide-react';

export const AssignedQueue = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const navigate = useNavigate();

  const fetchQueue = async () => {
    try {
      const res = await api.get('/inspections/queue');
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
    fetchQueue();
  }, []);

  const filtered = applications.filter((app) => {
    const matchSearch =
      app.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.instrument?.instrumentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.instrument?.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.applicant?.organizationName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter ? app.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Assigned Verification Queue</h1>
          <p className="text-xs text-slate-500">
            Field inspections and test centre verification duties assigned to you.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by application no, serial no, or establishment..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled / Pending Inspection</option>
          <option value="certified">Certified / Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Applications Found</h3>
          <p className="text-xs text-slate-500">No verification tasks matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                    {app.applicationNo}
                  </span>
                  <StatusBadge status={app.status} />
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{app.instrument?.instrumentName}</h3>
                  <p className="text-[11px] font-mono text-slate-500">SN: {app.instrument?.serialNumber}</p>
                </div>

                <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-medium text-slate-800">{app.instrument?.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accuracy Class:</span>
                    <span className="font-medium text-slate-800">{app.instrument?.accuracyClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Capacity:</span>
                    <span className="font-semibold text-slate-900">{app.instrument?.maxCapacity} {app.instrument?.units}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interval (e):</span>
                    <span className="font-mono font-semibold text-slate-900">e = {app.instrument?.verificationScaleInterval} {app.instrument?.units}</span>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600 pt-1">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium text-slate-800">
                      {app.applicant?.organizationName || app.applicant?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Scheduled: {formatDate(app.scheduledDate)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                {app.status === 'scheduled' ? (
                  <button
                    onClick={() => navigate(`/officer/inspect/${app._id}`)}
                    className="w-full py-2.5 px-3 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Scale className="w-4 h-4 text-gold-400" />
                    <span>Conduct Digital Inspection</span>
                  </button>
                ) : app.status === 'certified' ? (
                  <div className="text-center py-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 rounded-xl border border-emerald-200">
                    ✓ Verified & Certificate Issued
                  </div>
                ) : (
                  <div className="text-center py-1.5 text-xs text-rose-700 font-bold bg-rose-50 rounded-xl border border-rose-200">
                    ✗ Rejected / Non-Compliant
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
