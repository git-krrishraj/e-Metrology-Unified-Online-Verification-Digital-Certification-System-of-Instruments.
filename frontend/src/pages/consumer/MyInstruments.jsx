import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import { CameraUpload } from '../../components/common/CameraUpload';
import {
  Scale,
  PlusCircle,
  Search,
  Filter,
  Eye,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  X,
  Send
} from 'lucide-react';

export const MyInstruments = () => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    instrumentName: '',
    category: 'Counter / Platform Scale',
    accuracyClass: 'Class III (Medium Accuracy - Commercial Trade)',
    model: '',
    serialNumber: '',
    manufacturer: '',
    yearOfManufacture: new Date().getFullYear(),
    maxCapacity: '',
    minCapacity: '',
    verificationScaleInterval: '',
    units: 'kg',
    establishmentName: '',
    address: '',
    district: 'Mumbai City',
    state: 'Maharashtra',
    pincode: '400001'
  });

  const fetchInstruments = async () => {
    try {
      const res = await api.get('/instruments/my');
      if (res.data?.success) {
        setInstruments(res.data.instruments);
      }
    } catch (err) {
      console.error('Failed to load instruments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, val]) => {
        payload.append(key, val);
      });

      uploadedPhotos.forEach((file) => {
        payload.append('photos', file);
      });

      const res = await api.post('/instruments', payload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data?.success) {
        setShowRegisterModal(false);
        setUploadedPhotos([]);
        setFormData({
          instrumentName: '',
          category: 'Counter / Platform Scale',
          accuracyClass: 'Class III (Medium Accuracy - Commercial Trade)',
          model: '',
          serialNumber: '',
          manufacturer: '',
          yearOfManufacture: new Date().getFullYear(),
          maxCapacity: '',
          minCapacity: '',
          verificationScaleInterval: '',
          units: 'kg',
          establishmentName: '',
          address: '',
          district: 'Mumbai City',
          state: 'Maharashtra',
          pincode: '400001'
        });
        await fetchInstruments();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register instrument');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = instruments.filter((inst) => {
    const matchesSearch =
      inst.instrumentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = categoryFilter ? inst.category === categoryFilter : true;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header & Register Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Registered Instruments</h1>
          <p className="text-xs text-slate-500">
            All weighing & measuring equipment registered under your commercial trade entity.
          </p>
        </div>
        <button
          onClick={() => setShowRegisterModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Register New Instrument</span>
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
            placeholder="Search by serial number, name, or model..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 bg-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 bg-white"
        >
          <option value="">All Instrument Categories</option>
          <option value="Counter / Platform Scale">Counter / Platform Scale</option>
          <option value="Non-Automatic Weighing Instrument (NAWI)">Non-Automatic Weighing (NAWI)</option>
          <option value="Electronic Weighbridge">Electronic Weighbridge</option>
          <option value="Fuel Dispenser / Petrol Pump Flowmeter">Fuel Dispenser / Flowmeter</option>
        </select>
      </div>

      {/* Instruments Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Scale className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Instruments Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No instruments matched your search query.'
              : 'You have not registered any weighing or measuring instruments yet.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowRegisterModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-gov-600 text-white font-bold text-xs shadow-sm hover:bg-gov-500 transition"
            >
              Register First Instrument
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((inst) => (
            <div
              key={inst._id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-mono uppercase font-bold text-gov-600 bg-gov-50 px-2 py-0.5 rounded border border-gov-200">
                      {inst.serialNumber}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{inst.instrumentName}</h3>
                  </div>
                  <StatusBadge status={inst.status} />
                </div>

                <div className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-medium text-slate-800">{inst.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Model:</span>
                    <span className="font-medium text-slate-800">{inst.model} ({inst.manufacturer})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Capacity:</span>
                    <span className="font-semibold text-slate-900">{inst.maxCapacity} {inst.units}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Verification Interval:</span>
                    <span className="font-mono font-semibold text-slate-900">e = {inst.verificationScaleInterval} {inst.units}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Accuracy Class:</span>
                    <span className="font-medium text-slate-800">{inst.accuracyClass}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{inst.location?.district}, {inst.location?.state}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => navigate(`/consumer/apply?instrumentId=${inst._id}`)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-gold-400" />
                  <span>Apply Verification</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Register Instrument Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 text-white p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gov-600">
                  <Scale className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Register Measuring Instrument</h3>
                  <p className="text-xs text-slate-400">Enter technical parameters as per Legal Metrology specifications</p>
                </div>
              </div>
              <button
                onClick={() => setShowRegisterModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegister} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {error && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Instrument Name / Identifier *</label>
                  <input
                    type="text"
                    name="instrumentName"
                    required
                    value={formData.instrumentName}
                    onChange={handleChange}
                    placeholder="e.g. Counter Scale #1 (Billing Desk)"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 bg-white"
                  >
                    <option value="Counter / Platform Scale">Counter / Platform Scale</option>
                    <option value="Non-Automatic Weighing Instrument (NAWI)">Non-Automatic Weighing (NAWI)</option>
                    <option value="Electronic Weighbridge">Electronic Weighbridge</option>
                    <option value="Fuel Dispenser / Petrol Pump Flowmeter">Fuel Dispenser / Petrol Pump</option>
                    <option value="Liquid Capacity Measure">Liquid Capacity Measure</option>
                    <option value="Length & Dimensional Measure">Length & Dimensional Measure</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Accuracy Class *</label>
                  <select
                    name="accuracyClass"
                    required
                    value={formData.accuracyClass}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 bg-white"
                  >
                    <option value="Class III (Medium Accuracy - Commercial Trade)">Class III (Medium Accuracy - Commercial Trade)</option>
                    <option value="Class II (High Accuracy)">Class II (High Accuracy - Gold/Pharma)</option>
                    <option value="Class I (Special Accuracy)">Class I (Special Accuracy - Lab)</option>
                    <option value="Class IIII (Ordinary Accuracy - Heavy Industrial)">Class IIII (Ordinary Accuracy - Weighbridges)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Model / Type *</label>
                  <input
                    type="text"
                    name="model"
                    required
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g. Essae DS-215"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number (from nameplate) *</label>
                  <input
                    type="text"
                    name="serialNumber"
                    required
                    value={formData.serialNumber}
                    onChange={handleChange}
                    placeholder="e.g. ESS-2026-99014"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Manufacturer Make *</label>
                  <input
                    type="text"
                    name="manufacturer"
                    required
                    value={formData.manufacturer}
                    onChange={handleChange}
                    placeholder="e.g. Essae-Teraoka Ltd."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Year of Manufacture</label>
                  <input
                    type="number"
                    name="yearOfManufacture"
                    value={formData.yearOfManufacture}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Max Capacity (Max) *</label>
                  <input
                    type="number"
                    step="any"
                    name="maxCapacity"
                    required
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    placeholder="e.g. 30"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Verification Interval (e value) *</label>
                  <input
                    type="number"
                    step="any"
                    name="verificationScaleInterval"
                    required
                    value={formData.verificationScaleInterval}
                    onChange={handleChange}
                    placeholder="e.g. 0.005 for 5g"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Installation Premises Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Shop No., Market / Building Name, Road"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">District *</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 bg-white"
                  >
                    <option value="Mumbai City">Mumbai City</option>
                    <option value="Mumbai Suburban">Mumbai Suburban</option>
                    <option value="Thane">Thane</option>
                    <option value="Pune">Pune</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Nashik">Nashik</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="400001"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-gov-500 font-mono"
                  />
                </div>

                {/* Mobile Camera Upload for Instrument & Nameplate Photos */}
                <div className="sm:col-span-2 pt-2">
                  <CameraUpload
                    label="Upload Nameplate & Instrument Photos (Mobile Camera Supported)"
                    onFilesChange={(files) => setUploadedPhotos(files)}
                    maxFiles={3}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-gov-600 hover:bg-gov-500 text-white font-bold text-xs shadow-sm transition"
                >
                  {submitting ? 'Registering...' : 'Save & Register Instrument'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
