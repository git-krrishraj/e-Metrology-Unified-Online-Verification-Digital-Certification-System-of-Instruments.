import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { CertificateModal } from '../../components/certificate/CertificateModal';
import {
  FileCheck2,
  Award,
  Search,
  Download,
  Eye,
  Calendar,
  Building,
  Scale
} from 'lucide-react';

export const VerificationHistory = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
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
    fetchHistory();
  }, []);

  const filtered = certificates.filter(
    (c) =>
      c.certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stampNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner?.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrument?.instrumentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Verification & Stamping Logs</h1>
          <p className="text-xs text-slate-500">
            Historical log of all digitally certified weighing instruments.
          </p>
        </div>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by certificate ID, stamp number, or establishment name..."
          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Verification Logs Found</h3>
          <p className="text-xs text-slate-500">No records match your query.</p>
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
                    <td className="p-3.5">
                      <StatusBadge status={cert.status} />
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedCert(cert)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700"
                          title="View certificate & QR"
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
