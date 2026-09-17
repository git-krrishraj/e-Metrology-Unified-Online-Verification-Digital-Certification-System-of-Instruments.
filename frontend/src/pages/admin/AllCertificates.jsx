import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { CertificateModal } from '../../components/certificate/CertificateModal';
import {
  Award,
  Search,
  Download,
  Eye,
  FileSpreadsheet,
  Calendar,
  Building,
  RefreshCw
} from 'lucide-react';

export const AllCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/certificates');
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
    fetchCertificates();
  }, []);

  const filtered = certificates.filter((c) => {
    const matchSearch =
      c.certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stampNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner?.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrument?.instrumentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrument?.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter ? c.status === statusFilter : true;
    return matchSearch && matchStatus;
  });

  const exportToCSV = () => {
    if (filtered.length === 0) return;

    const headers = [
      'Certificate ID',
      'Stamp Number',
      'Owner / Establishment',
      'Instrument Name',
      'Serial Number',
      'Category',
      'Accuracy Class',
      'Valid From',
      'Valid Till',
      'Issued By',
      'Status'
    ];

    const rows = filtered.map((c) => [
      `"${c.certId}"`,
      `"${c.stampNumber}"`,
      `"${c.owner?.organizationName || c.owner?.name || ''}"`,
      `"${c.instrument?.instrumentName || ''}"`,
      `"${c.instrument?.serialNumber || ''}"`,
      `"${c.instrument?.category || ''}"`,
      `"${c.instrument?.accuracyClass || ''}"`,
      `"${new Date(c.validFrom).toLocaleDateString('en-IN')}"`,
      `"${new Date(c.validTill).toLocaleDateString('en-IN')}"`,
      `"${c.issuedBy?.name || ''}"`,
      `"${c.status}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Legal_Metrology_Certificates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Master Certificate Registry</h1>
          <p className="text-xs text-slate-500">
            Central repository of all Legal Metrology verification & stamping certificates across the state.
          </p>
        </div>

        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Export Registry to CSV</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Certificate ID, Stamp No, Owner, or Instrument..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 bg-white"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 bg-white"
        >
          <option value="">All Statuses</option>
          <option value="valid">Active & Valid</option>
          <option value="expired">Expired</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Certificates Found</h3>
          <p className="text-xs text-slate-500">No certificate records match your query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                  <th className="p-3.5">Certificate ID</th>
                  <th className="p-3.5">Stamp Number</th>
                  <th className="p-3.5">Establishment / Owner</th>
                  <th className="p-3.5">Instrument</th>
                  <th className="p-3.5">Validity Span</th>
                  <th className="p-3.5">Verifying Authority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((cert) => (
                  <tr key={cert._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-gov-700">{cert.certId}</td>
                    <td className="p-3.5 font-mono font-medium text-slate-900">{cert.stampNumber}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-900 block">
                        {cert.owner?.organizationName || cert.owner?.name}
                      </span>
                      <span className="text-slate-500 text-[11px]">{cert.owner?.name}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-medium text-slate-800 block">{cert.instrument?.instrumentName}</span>
                      <span className="text-slate-500 text-[11px] font-mono">{cert.instrument?.serialNumber}</span>
                    </td>
                    <td className="p-3.5 text-slate-600">
                      <span>{formatDate(cert.validFrom)}</span> to{' '}
                      <span className="font-semibold text-slate-900">{formatDate(cert.validTill)}</span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <span className="font-medium block">{cert.issuedBy?.name}</span>
                      <span className="text-[10px] text-slate-400">{cert.issuedBy?.jurisdictionDistrict}</span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={cert.status} />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="View Certificate & QR"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <a
                          href={`/api/certificates/${cert._id}/pdf`}
                          download
                          className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-gov-700"
                          title="Download PDF"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};
