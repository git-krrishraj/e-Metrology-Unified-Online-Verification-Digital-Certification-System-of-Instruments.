import React from 'react';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { StatusBadge } from '../common/StatusBadge';
import {
  X,
  Download,
  Printer,
  ShieldCheck,
  QrCode,
  CheckCircle2,
  Calendar,
  Building,
  User,
  Scale,
  ExternalLink
} from 'lucide-react';

export const CertificateModal = ({ certificate, onClose }) => {
  if (!certificate) return null;

  const inst = certificate.instrument || {};
  const owner = certificate.owner || {};
  const officer = certificate.issuedBy || {};
  const vRecord = certificate.verificationRecord || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gov-600 border border-gov-500">
              <ShieldCheck className="w-6 h-6 text-gold-400" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-slate-400 font-mono">
                Legal Metrology Act, 2009
              </p>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Certificate of Verification & Stamping
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Certificate Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Certificate Identification Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Certificate Number
              </span>
              <p className="text-lg font-mono font-bold text-gov-700">{certificate.certId}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                Stamp Number
              </span>
              <p className="text-sm font-mono font-bold text-slate-900">{certificate.stampNumber}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-1">
                Status
              </span>
              <StatusBadge status={certificate.status} />
            </div>
          </div>

          {/* Validity Callout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs text-emerald-800 font-medium">Valid From</p>
                <p className="text-sm font-bold text-emerald-950">{formatDate(certificate.validFrom)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-700 shrink-0" />
              <div>
                <p className="text-xs text-emerald-800 font-medium">Valid Up To (Expiry Date)</p>
                <p className="text-sm font-bold text-rose-700">{formatDate(certificate.validTill)}</p>
              </div>
            </div>
          </div>

          {/* 2-Column Specs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Instrument Details */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b pb-1.5">
                <Scale className="w-4 h-4 text-gov-600" />
                <span>Instrument Particulars</span>
              </h4>
              <div className="text-xs space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Name:</span>
                  <span className="font-semibold">{inst.instrumentName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Category:</span>
                  <span className="font-medium">{inst.category || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Serial Number:</span>
                  <span className="font-mono font-bold text-slate-900">{inst.serialNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Accuracy Class:</span>
                  <span className="font-medium">{inst.accuracyClass || 'Class III'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Max Capacity:</span>
                  <span className="font-semibold">{inst.maxCapacity} {inst.units}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Scale Interval (e):</span>
                  <span className="font-mono font-semibold">e = {inst.verificationScaleInterval} {inst.units}</span>
                </div>
              </div>
            </div>

            {/* Right: Owner & Authority */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 border-b pb-1.5">
                <Building className="w-4 h-4 text-gov-600" />
                <span>Establishment & Authority</span>
              </h4>
              <div className="text-xs space-y-2 text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Owner Name:</span>
                  <span className="font-semibold">{owner.name || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Establishment:</span>
                  <span className="font-medium">{owner.organizationName || 'Individual'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-medium">{inst.location?.district}, {inst.location?.state}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Verifying Officer:</span>
                  <span className="font-semibold text-slate-900">{officer.name || 'Legal Metrology Officer'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Officer Designation:</span>
                  <span className="font-medium">{officer.designation || 'Inspector (LM)'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code & Tamper Proof Security Section */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center gap-5">
            {certificate.qrCodeDataUrl && (
              <div className="bg-white p-2 rounded-lg shrink-0">
                <img
                  src={certificate.qrCodeDataUrl}
                  alt="Verification QR Code"
                  className="w-28 h-28 object-contain"
                />
              </div>
            )}
            <div className="text-center sm:text-left space-y-1.5">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <QrCode className="w-4 h-4 text-gold-400" />
                <span className="text-xs font-bold uppercase text-gold-400 tracking-wider">
                  Tamper-Proof Cryptographic QR
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scan this QR code with any smartphone camera to verify certificate authenticity on the National Legal Metrology database.
              </p>
              <a
                href={`/verify/${certificate.certId}?token=${certificate.qrToken}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-semibold underline mt-1"
              >
                <span>Open Public Verification Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print</span>
          </button>
          <a
            href={`/api/certificates/${certificate._id}/pdf`}
            download
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold text-white bg-gov-600 hover:bg-gov-500 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            <span>Download Official PDF</span>
          </a>
        </div>
      </div>
    </div>
  );
};
