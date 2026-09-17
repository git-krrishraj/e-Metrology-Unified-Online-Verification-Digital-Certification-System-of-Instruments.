import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  Search,
  Scale,
  Award,
  ShieldCheck,
  Building,
  ArrowRight,
  QrCode
} from 'lucide-react';

export const PublicDirectorySearch = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim() || query.trim().length < 3) {
      setError('Please enter at least 3 characters to search.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await api.get(`/public/search?query=${encodeURIComponent(query.trim())}`);
      if (res.data?.success) {
        setResults(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm text-center max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-gov-600 flex items-center justify-center mx-auto">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">National Legal Metrology Registry</h1>
        <p className="text-xs text-slate-500">
          Public search directory for verified weighing & measuring instruments, verification certificates, and statutory stamping records.
        </p>

        <form onSubmit={handleSearch} className="pt-2 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Certificate ID, Stamp No, or Serial No..."
              className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
          >
            {loading ? 'Searching...' : 'Search Registry'}
          </button>
        </form>
      </div>

      {error && (
        <div className="max-w-2xl mx-auto p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs text-center">
          {error}
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Matching Certificates */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-gov-600" />
              <span>Matching Verification Certificates ({results.certificates?.length || 0})</span>
            </h3>

            {results.certificates?.length === 0 ? (
              <p className="text-xs text-slate-400">No certificates found matching "{query}".</p>
            ) : (
              <div className="space-y-3">
                {results.certificates.map((cert) => (
                  <div
                    key={cert._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-mono font-bold text-gov-700 block">{cert.certId}</span>
                      <p className="text-slate-700 font-semibold">{cert.instrument?.instrumentName}</p>
                      <p className="text-slate-500 text-[11px] font-mono">
                        Stamp No: {cert.stampNumber} • Serial No: {cert.instrument?.serialNumber}
                      </p>
                    </div>

                    <Link
                      to={`/verify/${cert.certId}`}
                      className="px-4 py-2 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 shrink-0"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>View Authenticity Status</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
