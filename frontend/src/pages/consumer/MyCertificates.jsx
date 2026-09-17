import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, getDaysRemaining } from '../../utils/formatters';
import { CertificateModal } from '../../components/certificate/CertificateModal';
import {
  Award,
  Scale,
  Calendar,
  Download,
  Eye,
  Search,
  ShieldCheck,
  AlertTriangle,
  QrCode,
  Send
} from 'lucide-react';

export const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCert, setSelectedCert] = useState(null);

  const navigate = useNavigate();

  const fetchCertificates = async () => {
    try {
      const res = await api.get('/certificates/my');
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

  const filtered = certificates.filter(
    (c) =>
      c.certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stampNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instrument?.instrumentName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Legal Metrology Digital Certificates</h1>
          <p className="text-xs text-slate-500">
            Statutory certificates of verification and stamping issued under the Legal Metrology Act, 2009.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by certificate ID, stamp number, or instrument..."
          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Award className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Certificates Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No certificates matched your search.'
              : 'You do not have any active certificates yet. Apply for verification to receive a digital certificate.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((cert) => {
            const daysLeft = getDaysRemaining(cert.validTill);
            const isExpiringSoon = daysLeft <= 30 && daysLeft > 0;
            const isExpired = daysLeft <= 0;

            return (
              <div
                key={cert._id}
                className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-4">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase font-bold text-gov-700 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                        {cert.certId}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900 mt-1">
                        {cert.instrument?.instrumentName || 'Instrument'}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-mono">
                        Stamp No: {cert.stampNumber}
                      </p>
                    </div>
                    <StatusBadge status={isExpired ? 'expired' : cert.status} />
                  </div>

                  {/* Validity Callout */}
                  <div
                    className={`p-3.5 rounded-xl border text-xs flex items-center justify-between ${
                      isExpired
                        ? 'bg-rose-50 border-rose-200 text-rose-800'
                        : isExpiringSoon
                        ? 'bg-amber-50 border-amber-200 text-amber-800'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 shrink-0" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold">
                          {isExpired ? 'Expired On' : 'Valid Until'}
                        </span>
                        <span className="font-bold">{formatDate(cert.validTill)}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white border">
                      {isExpired
                        ? 'Expired'
                        : `${daysLeft} Day(s) Left`}
                    </span>
                  </div>

                  {/* Instrument Mini Specs */}
                  <div className="text-xs space-y-1 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Category:</span>
                      <span className="font-medium text-slate-800">{cert.instrument?.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Serial No:</span>
                      <span className="font-mono font-bold text-slate-900">{cert.instrument?.serialNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Verifying Officer:</span>
                      <span className="font-medium text-slate-800">{cert.issuedBy?.name}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedCert(cert)}
                    className="flex-1 py-2 px-3 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View & Scan QR</span>
                  </button>

                  <a
                    href={`/api/certificates/${cert._id}/pdf`}
                    download
                    className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </a>

                  {(isExpiringSoon || isExpired) && (
                    <button
                      onClick={() => navigate(`/consumer/apply?instrumentId=${cert.instrument?._id}`)}
                      className="py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Renew</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedCert && (
        <CertificateModal certificate={selectedCert} onClose={() => setSelectedCert(null)} />
      )}
    </div>
  );
};
