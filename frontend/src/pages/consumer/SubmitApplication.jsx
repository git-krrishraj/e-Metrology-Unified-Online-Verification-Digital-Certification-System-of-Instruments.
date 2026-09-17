import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import { formatCurrency } from '../../utils/formatters';
import {
  Scale,
  ClipboardList,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Building,
  ArrowRight
} from 'lucide-react';

export const SubmitApplication = () => {
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('instrumentId');

  const [instruments, setInstruments] = useState([]);
  const [selectedInstrument, setSelectedInstrument] = useState(null);
  const [applicationType, setApplicationType] = useState('periodic_reverification');
  const [inspectionType, setInspectionType] = useState('on_site');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedApp, setSubmittedApp] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadInstruments = async () => {
      try {
        const res = await api.get('/instruments/my');
        if (res.data?.success) {
          setInstruments(res.data.instruments);
          if (preselectedId) {
            const found = res.data.instruments.find((i) => i._id === preselectedId);
            if (found) setSelectedInstrument(found);
          } else if (res.data.instruments.length > 0) {
            setSelectedInstrument(res.data.instruments[0]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadInstruments();
  }, [preselectedId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedInstrument) {
      setError('Please select an instrument to apply for verification');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const res = await api.post('/applications', {
        instrumentId: selectedInstrument._id,
        applicationType,
        inspectionType,
        remarks
      });

      if (res.data?.success) {
        setSubmittedApp(res.data.application);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  const getStampingFee = (category) => {
    if (!category) return 350;
    if (category.includes('Weighbridge')) return 1500;
    if (category.includes('Fuel')) return 1000;
    if (category.includes('Automatic')) return 600;
    return 350;
  };

  if (submittedApp) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white rounded-2xl shadow-xl border border-emerald-200 p-8 text-center space-y-5">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h2 className="text-xl font-bold text-slate-900">Verification Application Submitted!</h2>
            <p className="text-xs text-slate-500">
              Your application has been logged under the Legal Metrology e-Verification System.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2 text-left">
            <div className="flex justify-between">
              <span className="text-slate-500">Application Number:</span>
              <span className="font-mono font-bold text-slate-900">{submittedApp.applicationNo}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Instrument:</span>
              <span className="font-medium text-slate-900">{selectedInstrument?.instrumentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Statutory Stamping Fee:</span>
              <span className="font-bold text-emerald-700">{formatCurrency(submittedApp.stampingFee)} (PAID)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Reference:</span>
              <span className="font-mono text-slate-700">{submittedApp.paymentReference}</span>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            A Legal Metrology Officer (LMO) or GATC will be allocated to conduct on-site testing. You will receive real-time notifications as status changes.
          </p>

          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/consumer/applications')}
              className="px-5 py-2.5 rounded-xl bg-gov-600 text-white font-bold text-xs shadow-sm hover:bg-gov-500 transition flex items-center gap-2"
            >
              <span>Track in My Applications</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Apply for Verification / Re-Verification</h1>
        <p className="text-xs text-slate-500 mt-1">
          Submit statutory verification request under Section 24 of the Legal Metrology Act, 2009.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {instruments.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 space-y-3">
          <Scale className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No Instruments Registered</h3>
          <p className="text-xs text-slate-500">
            You need to register your weighing or measuring instrument before applying for verification.
          </p>
          <button
            onClick={() => navigate('/consumer/instruments')}
            className="px-4 py-2 rounded-xl bg-gov-600 text-white font-bold text-xs shadow-sm"
          >
            Register Instrument Now
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          {/* Instrument Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              1. Select Instrument for Verification *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {instruments.map((inst) => {
                const isSelected = selectedInstrument?._id === inst._id;
                return (
                  <div
                    key={inst._id}
                    onClick={() => setSelectedInstrument(inst)}
                    className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-blue-50/70 border-gov-500 ring-2 ring-gov-500'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-gov-700">{inst.serialNumber}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border text-slate-700">
                          {inst.accuracyClass?.split(' ')[0] || 'Class III'}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 mt-1">{inst.instrumentName}</p>
                      <p className="text-[11px] text-slate-500">{inst.category}</p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-200 text-[11px] text-slate-600 flex justify-between">
                      <span>Capacity: {inst.maxCapacity} {inst.units}</span>
                      <span className="font-mono">e = {inst.verificationScaleInterval}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Type & Mode */}
          <div className="space-y-4 pt-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              2. Verification Type & Inspection Mode
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Application Type</label>
                <select
                  value={applicationType}
                  onChange={(e) => setApplicationType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 bg-white"
                >
                  <option value="periodic_reverification">Periodic Re-Verification (Annual Renewal)</option>
                  <option value="initial_verification">Initial Verification (New Instrument)</option>
                  <option value="re_verification_after_repair">Re-Verification after Repair / Adjustment</option>
                  <option value="stamping">Mandatory Re-Stamping</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection Location</label>
                <select
                  value={inspectionType}
                  onChange={(e) => setInspectionType(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 bg-white"
                >
                  <option value="on_site">On-Site Inspection at Trade Premises</option>
                  <option value="test_centre">At Govt Approved Test Centre (GATC)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Applicant Remarks / Special Notes</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Instrument available for verification on weekdays between 10am - 4pm"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500"
                />
              </div>
            </div>
          </div>

          {/* Fee & Payment Summary */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-gov-600">
                <CreditCard className="w-5 h-5 text-gold-400" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-slate-400 font-mono">Statutory Stamping Fee</p>
                <p className="text-lg font-bold text-gold-400">
                  {formatCurrency(getStampingFee(selectedInstrument?.category))}
                </p>
                <p className="text-[10px] text-slate-400">As per Legal Metrology (General) Rules, 2011 Schedule</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {submitting ? 'Submitting Application...' : 'Pay Fee & Submit Application'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
