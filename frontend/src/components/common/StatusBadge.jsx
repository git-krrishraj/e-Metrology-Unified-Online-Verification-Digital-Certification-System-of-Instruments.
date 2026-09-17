import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  const configs = {
    // Application & Certificate Statuses
    submitted: { label: 'Submitted / Pending Allocation', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    scheduled: { label: 'Scheduled / In Queue', bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
    verified: { label: 'Verified', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    certified: { label: 'Certified / Stamped', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    valid: { label: 'Active & Valid', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    rejected: { label: 'Rejected / Non-Compliant', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
    expired: { label: 'Expired', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
    suspended: { label: 'Suspended', bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
    active: { label: 'Active', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    due_verification: { label: 'Due for Verification', bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
    in_process: { label: 'Verification in Process', bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
    pass: { label: 'PASSED', bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
    fail: { label: 'FAILED', bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' }
  };

  const config = configs[normalized] || {
    label: status || 'Unknown',
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-300'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {config.label}
    </span>
  );
};
