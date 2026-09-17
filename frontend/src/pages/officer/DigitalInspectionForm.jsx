import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useOffline } from '../../context/OfflineContext';
import { checkReadingCompliance, calculateMPE } from '../../utils/metrologyRules';
import { CameraUpload } from '../../components/common/CameraUpload';
import { CertificateModal } from '../../components/certificate/CertificateModal';
import {
  Scale,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Camera,
  MapPin,
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  Award,
  ArrowLeft,
  WifiOff
} from 'lucide-react';

export const DigitalInspectionForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { isOnline, queueInspection } = useOffline();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [generatedCert, setGeneratedCert] = useState(null);

  // Form State
  const [visualChecklist, setVisualChecklist] = useState({
    sealIntact: true,
    levelIndicatorAligned: true,
    noPhysicalDamage: true,
    markingPlateLegible: true,
    stampingPlugsAccessible: true
  });

  const [testReadings, setTestReadings] = useState([
    { testLoadKg: 5, observedReadingKg: 5.000 },
    { testLoadKg: 15, observedReadingKg: 15.002 },
    { testLoadKg: 30, observedReadingKg: 29.998 }
  ]);

  const [eccentricityTest, setEccentricityTest] = useState({
    performed: true,
    testLoadKg: 10,
    passed: true,
    notes: 'Corner load test within 1e tolerance'
  });

  const [repeatabilityTest, setRepeatabilityTest] = useState({
    performed: true,
    testLoadKg: 20,
    passed: true,
    notes: '3 consecutive readings consistent'
  });

  const [stampNumberAssigned, setStampNumberAssigned] = useState('');
  const [overallResult, setOverallResult] = useState('pass');
  const [inspectorNotes, setInspectorNotes] = useState(
    'Instrument tested with Class M1 working standards traceable to NPL. Found accurate within MPE limits.'
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [photos, setPhotos] = useState([]);
  const [geoCoordinates, setGeoCoordinates] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  useEffect(() => {
    const fetchApp = async () => {
      try {
        const res = await api.get(`/applications/${id}`);
        if (res.data?.success) {
          const app = res.data.application;
          setApplication(app);

          // Pre-populate test readings based on instrument max capacity
          const maxCap = app.instrument?.maxCapacity || 30;
          setTestReadings([
            { testLoadKg: parseFloat((maxCap * 0.1).toFixed(3)), observedReadingKg: parseFloat((maxCap * 0.1).toFixed(3)) },
            { testLoadKg: parseFloat((maxCap * 0.5).toFixed(3)), observedReadingKg: parseFloat((maxCap * 0.5).toFixed(3)) },
            { testLoadKg: parseFloat(maxCap.toFixed(3)), observedReadingKg: parseFloat(maxCap.toFixed(3)) }
          ]);

          // Suggest Stamp Number
          const year = new Date().getFullYear();
          const rand = Math.floor(1000 + Math.random() * 9000);
          setStampNumberAssigned(`MH/${user?.officerId || 'LMO'}/${year}/${rand}`);
        }
      } catch (err) {
        setError('Failed to fetch application details');
      } finally {
        setLoading(false);
      }
    };

    fetchApp();
  }, [id, user]);

  const captureLocation = () => {
    if ('geolocation' in navigator) {
      setGeoLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGeoCoordinates({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
          setGeoLoading(false);
        },
        (err) => {
          console.warn('Geolocation failed:', err.message);
          setGeoLoading(false);
          // Fallback mock coordinates for testing
          setGeoCoordinates({ latitude: 18.9388, longitude: 72.8354 });
        }
      );
    }
  };

  const handleReadingChange = (index, field, value) => {
    const updated = [...testReadings];
    updated[index][field] = value === '' ? '' : parseFloat(value) || 0;
    setTestReadings(updated);
  };

  const addReadingRow = () => {
    const lastLoad = testReadings.length > 0 ? testReadings[testReadings.length - 1].testLoadKg : 5;
    setTestReadings([...testReadings, { testLoadKg: lastLoad + 5, observedReadingKg: lastLoad + 5 }]);
  };

  const removeReadingRow = (index) => {
    if (testReadings.length <= 1) return;
    setTestReadings(testReadings.filter((_, i) => i !== index));
  };

  // Evaluate MPE compliance in real-time
  const inst = application?.instrument || {};
  const eVal = inst.verificationScaleInterval || 0.001;
  const accClass = inst.accuracyClass || 'Class III';

  const evaluatedReadings = testReadings.map((r) => {
    return {
      ...r,
      compliance: checkReadingCompliance(r.testLoadKg, r.observedReadingKg, eVal, accClass, true)
    };
  });

  const allReadingsPass = evaluatedReadings.every((r) => r.compliance.passed);
  const visualAllPass = Object.values(visualChecklist).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const inspectionPayload = {
      applicationId: application._id,
      visualChecklist,
      testReadings: evaluatedReadings.map((r) => ({
        testLoadKg: r.testLoadKg,
        observedReadingKg: r.observedReadingKg,
        errorKg: r.compliance.errorKg,
        maxAllowedErrorKg: r.compliance.maxAllowedErrorKg,
        tolerance: r.compliance.toleranceText,
        passed: r.compliance.passed
      })),
      eccentricityTest,
      repeatabilityTest,
      overallResult,
      stampNumberAssigned,
      inspectorNotes,
      rejectionReason: overallResult === 'fail' ? rejectionReason : '',
      geoCoordinates,
      photos
    };

    // If offline, store in IndexedDB queue
    if (!isOnline) {
      try {
        await queueInspection(inspectionPayload);
        alert('Offline mode: Inspection recorded locally in IndexedDB. It will automatically sync when network connectivity is restored.');
        navigate('/officer/queue');
      } catch (offErr) {
        setError('Failed to store offline inspection: ' + offErr.message);
      } finally {
        setSubmitting(false);
      }
      return;
    }

    try {
      const formData = new FormData();
      formData.append('applicationId', inspectionPayload.applicationId);
      formData.append('visualChecklist', JSON.stringify(inspectionPayload.visualChecklist));
      formData.append('testReadings', JSON.stringify(inspectionPayload.testReadings));
      formData.append('eccentricityTest', JSON.stringify(inspectionPayload.eccentricityTest));
      formData.append('repeatabilityTest', JSON.stringify(inspectionPayload.repeatabilityTest));
      formData.append('overallResult', inspectionPayload.overallResult);
      formData.append('stampNumberAssigned', inspectionPayload.stampNumberAssigned);
      formData.append('inspectorNotes', inspectionPayload.inspectorNotes);
      formData.append('rejectionReason', inspectionPayload.rejectionReason);
      if (geoCoordinates) {
        formData.append('geoCoordinates', JSON.stringify(geoCoordinates));
      }

      photos.forEach((file) => {
        formData.append('inspectionPhotos', file);
      });

      const res = await api.post('/inspections/record', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        if (res.data.certificate) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          setGeneratedCert(res.data.certificate);
        } else {
          alert('Inspection recorded. Application status updated.');
          navigate('/officer/queue');
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit inspection record');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
        <p className="text-sm text-slate-700">Application not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/officer/queue')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Queue</span>
          </button>
          <h1 className="text-xl font-bold text-slate-900">
            Digital Inspection & Stamping Terminal
          </h1>
          <p className="text-xs text-slate-500">
            Record verification observations as per Legal Metrology (General) Rules, 2011 Schedule VII.
          </p>
        </div>

        {!isOnline && (
          <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 text-xs flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span className="font-bold">Offline Queue Active</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Target Instrument Specs Card */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 shadow-sm">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Application No</span>
            <span className="font-mono font-bold text-gold-400">{application.applicationNo}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Instrument Name</span>
            <span className="font-semibold text-slate-100">{inst.instrumentName}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Serial Number</span>
            <span className="font-mono font-bold text-slate-100">{inst.serialNumber}</span>
          </div>
          <div>
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Accuracy Class / Max</span>
            <span className="font-semibold text-emerald-400">
              {inst.accuracyClass?.split(' ')[0]} • {inst.maxCapacity} {inst.units}
            </span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Visual / Physical Examination Checklist */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
            <ShieldCheck className="w-4 h-4 text-gov-600" />
            <span>1. Physical & Visual Examination Checklist</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {[
              { key: 'sealIntact', label: 'Previous statutory seals intact without evidence of tampering' },
              { key: 'levelIndicatorAligned', label: 'Spirit level indicator centered & leveling feet locked' },
              { key: 'noPhysicalDamage', label: 'Weighing pan, load cells & casing free of mechanical damage' },
              { key: 'markingPlateLegible', label: 'Manufacturer identification plate with Max, Min, e values legible' },
              { key: 'stampingPlugsAccessible', label: 'Lead stamping plug / security seal points accessible for official punch' }
            ].map(({ key, label }) => (
              <label
                key={key}
                className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer transition ${
                  visualChecklist[key]
                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50/60 border-rose-300 text-rose-950'
                }`}
              >
                <input
                  type="checkbox"
                  checked={visualChecklist[key]}
                  onChange={(e) => setVisualChecklist({ ...visualChecklist, [key]: e.target.checked })}
                  className="w-4 h-4 rounded text-gov-600 focus:ring-gov-500"
                />
                <span className="font-medium text-xs leading-tight">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Section 2: Real-time MPE Test Load Matrix */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4 text-gov-600" />
                <span>2. Test Load Observations & Maximum Permissible Error (MPE) Verification</span>
              </h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Scale Interval e = {eVal} {inst.units} ({accClass})
              </p>
            </div>
            <button
              type="button"
              onClick={addReadingRow}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 text-gov-700 text-xs font-bold hover:bg-blue-100 transition border border-blue-200"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Load Test</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px] border-b">
                  <th className="p-2.5">#</th>
                  <th className="p-2.5">Standard Test Load ({inst.units})</th>
                  <th className="p-2.5">Observed Reading ({inst.units})</th>
                  <th className="p-2.5">Error (Obs - Load)</th>
                  <th className="p-2.5">Permissible MPE Limit</th>
                  <th className="p-2.5">Status</th>
                  <th className="p-2.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {evaluatedReadings.map((r, idx) => {
                  const comp = r.compliance;
                  return (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold text-slate-500">{idx + 1}</td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="any"
                          required
                          value={r.testLoadKg}
                          onChange={(e) => handleReadingChange(idx, 'testLoadKg', e.target.value)}
                          className="w-28 px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-gov-500"
                        />
                      </td>
                      <td className="p-2.5">
                        <input
                          type="number"
                          step="any"
                          required
                          value={r.observedReadingKg}
                          onChange={(e) => handleReadingChange(idx, 'observedReadingKg', e.target.value)}
                          className="w-28 px-2 py-1 border border-slate-300 rounded font-mono text-xs focus:ring-2 focus:ring-gov-500"
                        />
                      </td>
                      <td className="p-2.5 font-mono font-semibold">
                        <span className={comp.errorKg === 0 ? 'text-slate-600' : comp.passed ? 'text-emerald-700' : 'text-rose-700'}>
                          {comp.errorKg > 0 ? `+${comp.errorKg}` : comp.errorKg} {inst.units}
                        </span>
                      </td>
                      <td className="p-2.5 font-mono text-slate-600">
                        {comp.toleranceText}
                      </td>
                      <td className="p-2.5">
                        {comp.passed ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> PASS
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                            <XCircle className="w-3 h-3" /> EXCEEDS MPE
                          </span>
                        )}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => removeReadingRow(idx)}
                          className="p-1 rounded hover:bg-slate-200 text-slate-400 hover:text-rose-600"
                          title="Remove test load"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
              allReadingsPass ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <span className="font-bold">
              {allReadingsPass
                ? '✓ All applied test load points meet Legal Metrology statutory tolerances.'
                : '✗ Notice: One or more load test points exceed Maximum Permissible Error (MPE).'}
            </span>
          </div>
        </div>

        {/* Section 3: Stamp & Field Proofs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b pb-2">
            <Award className="w-4 h-4 text-gov-600" />
            <span>3. Statutory Stamping & Field Evidence</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Statutory Stamp Number Assigned *
              </label>
              <input
                type="text"
                required
                value={stampNumberAssigned}
                onChange={(e) => setStampNumberAssigned(e.target.value)}
                placeholder="e.g. MH/LMO-042/2026/1094"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Inspection Decision *
              </label>
              <select
                value={overallResult}
                onChange={(e) => setOverallResult(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 font-bold bg-white"
              >
                <option value="pass">PASS — Issue Digital Certificate & Stamping Seal</option>
                <option value="fail">FAIL / REJECT — Issue Statutory Rectification Order</option>
              </select>
            </div>

            {/* Geolocation Tagging */}
            <div className="sm:col-span-2 flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <MapPin className="w-4 h-4 text-gov-600" />
                <span>
                  {geoCoordinates
                    ? `Geo-Tagged Location: Lat ${geoCoordinates.latitude.toFixed(4)}, Long ${geoCoordinates.longitude.toFixed(4)}`
                    : 'GPS coordinates optional for on-site field verification proof.'}
                </span>
              </div>
              <button
                type="button"
                onClick={captureLocation}
                disabled={geoLoading}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold hover:bg-slate-100 transition"
              >
                {geoLoading ? 'Acquiring...' : geoCoordinates ? 'Update Location' : 'Tag GPS Location'}
              </button>
            </div>

            {/* Mobile Camera Upload for Test & Seal Photos */}
            <div className="sm:col-span-2">
              <CameraUpload
                label="Capture Field Inspection & Seal Photos (Mobile Camera)"
                onFilesChange={(files) => setPhotos(files)}
                maxFiles={4}
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Officer Findings & Statutory Remarks
              </label>
              <textarea
                rows={2}
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500"
              />
            </div>

            {overallResult === 'fail' && (
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-rose-700 mb-1">
                  Reason for Rejection *
                </label>
                <textarea
                  rows={2}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Specify tolerance deviations, physical defects, or non-compliance under Legal Metrology Rules"
                  className="w-full px-3 py-2 text-xs border border-rose-300 rounded-lg focus:ring-2 focus:ring-rose-500 bg-rose-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="p-5 bg-slate-900 text-white rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400">
            Upon submitting a PASS decision, the system automatically generates an official PDF certificate with embedded cryptographic QR code.
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => navigate('/officer/queue')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                'Processing & Signing...'
              ) : overallResult === 'pass' ? (
                <>
                  <Award className="w-4 h-4 text-gold-400" />
                  <span>Issue Digital Certificate</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-400" />
                  <span>Record Rejection</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Generated Certificate Modal on Success */}
      {generatedCert && (
        <CertificateModal
          certificate={generatedCert}
          onClose={() => {
            setGeneratedCert(null);
            navigate('/officer/queue');
          }}
        />
      )}
    </div>
  );
};
