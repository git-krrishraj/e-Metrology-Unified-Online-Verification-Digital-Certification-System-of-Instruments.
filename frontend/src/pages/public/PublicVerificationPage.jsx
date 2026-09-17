import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client';
import { formatDate } from '../../utils/formatters';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Scale,
  Calendar,
  Building,
  UserCheck,
  Download,
  QrCode,
  CheckCircle2,
  Lock,
  ArrowLeft
} from 'lucide-react';

export const PublicVerificationPage = () => {
  const { certId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerification = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/public/verify/${encodeURIComponent(certId)}${token ? `?token=${token}` : ''}`);
        if (res.data?.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Verification lookup failed. This certificate ID could not be found or verified in the National Legal Metrology database.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (certId) {
      fetchVerification();
    }
  }, [certId, token]);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-600 font-medium mt-4">
          Querying National Legal Metrology Cryptographic Registry...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl border border-rose-200 p-8 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Certificate Verification Failed</h2>
          <p className="text-xs text-rose-700 bg-rose-50 p-4 rounded-xl border border-rose-200">
            {error || 'No matching certificate found.'}
          </p>
          <p className="text-xs text-slate-500">
            Searched Certificate ID: <span className="font-mono font-bold text-slate-900">{certId}</span>
          </p>
          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { isAuthentic, isSignatureValid, effectiveStatus, daysRemaining, certificate, instrument, owner, verifyingAuthority, verificationDetails } = data;

  const isValid = effectiveStatus === 'valid';
  const isExpired = effectiveStatus === 'expired';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Verification Status Banner */}
      <div
        className={`p-6 rounded-2xl border shadow-lg ${
          isValid
            ? 'bg-gradient-to-r from-emerald-900 to-slate-900 text-white border-emerald-500/50'
            : isExpired
            ? 'bg-gradient-to-r from-amber-900 to-slate-900 text-white border-amber-500/50'
            : 'bg-gradient-to-r from-rose-900 to-slate-900 text-white border-rose-500/50'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                isValid ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'
              }`}
            >
              {isValid ? <ShieldCheck className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-300 font-bold">
                  Official Verification Status
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {isValid ? 'VERIFIED & STATUTORILY VALID' : isExpired ? 'CERTIFICATE EXPIRED' : 'STATUS SUSPENDED'}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {isValid
                  ? `Certificate is active with ${daysRemaining} day(s) remaining on statutory validity.`
                  : `Instrument verification expired on ${formatDate(certificate.validTill)}. Use in trade is restricted under Legal Metrology Act.`}
              </p>
            </div>
          </div>

          {/* Cryptographic Signature Pill */}
          <div className="flex flex-col items-end shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono">
              <Lock className="w-3.5 h-3.5 text-gold-400" />
              <span className="text-slate-200">
                {isSignatureValid ? 'HMAC-SHA256 Valid' : 'Signature Unverified'}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 font-mono">
              Signed by DLM Root
            </span>
          </div>
        </div>
      </div>

      {/* Main Certificate Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Certificate Reference Bar */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div>
            <span className="text-slate-500 uppercase font-bold text-[10px] block">Certificate Number</span>
            <span className="font-mono font-bold text-sm text-gov-700">{certificate.certId}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-bold text-[10px] block">Statutory Stamp Number</span>
            <span className="font-mono font-bold text-sm text-slate-900">{certificate.stampNumber}</span>
          </div>
          <div>
            <span className="text-slate-500 uppercase font-bold text-[10px] block">Stamping Date</span>
            <span className="font-semibold text-sm text-slate-900">{formatDate(certificate.validFrom)}</span>
          </div>
        </div>

        {/* Validity Span */}
        <div className="p-5 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/40">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Effective Date</p>
              <p className="text-sm font-bold text-slate-900">{formatDate(certificate.validFrom)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="text-xs text-slate-500">Validity Up To</p>
              <p className="text-sm font-bold text-rose-700">{formatDate(certificate.validTill)}</p>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
          {/* Instrument Specifications */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b pb-2">
              <Scale className="w-4 h-4 text-gov-600" />
              <span>Instrument Particulars</span>
            </h3>
            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Instrument:</span>
                <span className="font-semibold">{instrument.instrumentName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Category:</span>
                <span className="font-medium">{instrument.category}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Serial Number:</span>
                <span className="font-mono font-bold text-slate-900">{instrument.serialNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Accuracy Class:</span>
                <span className="font-medium">{instrument.accuracyClass}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Max Capacity:</span>
                <span className="font-semibold">{instrument.maxCapacity} {instrument.units}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Verification Interval (e):</span>
                <span className="font-mono font-semibold">e = {instrument.verificationScaleInterval} {instrument.units}</span>
              </div>
            </div>
          </div>

          {/* Owner & Authority Particulars */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-2 border-b pb-2">
              <Building className="w-4 h-4 text-gov-600" />
              <span>Establishment & Verifying Officer</span>
            </h3>
            <div className="space-y-2 text-slate-700">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Owner Name:</span>
                <span className="font-semibold">{owner.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Establishment:</span>
                <span className="font-medium">{owner.organizationName || 'Registered Trade Establishment'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Location:</span>
                <span className="font-medium">{instrument.location?.district}, {instrument.location?.state}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Verifying Officer:</span>
                <span className="font-semibold text-slate-900">{verifyingAuthority.name}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Designation / Badge:</span>
                <span className="font-medium">{verifyingAuthority.designation} ({verifyingAuthority.officerId})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Jurisdiction:</span>
                <span className="font-medium">{verifyingAuthority.jurisdiction}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Statutory Compliance Footer / PDF CTA */}
        <div className="p-5 bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="text-xs text-slate-300">
              This digital record is issued in compliance with Section 24 of the Legal Metrology Act, 2009.
            </p>
          </div>

          {certificate.pdfUrl && (
            <a
              href={certificate.pdfUrl}
              download
              className="px-4 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download Official PDF Certificate</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
