import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate } from '../../utils/formatters';
import {
  Scale,
  Search,
  Building,
  Filter,
  Eye,
  FileSpreadsheet
} from 'lucide-react';

export const AllInstruments = () => {
  const [instruments, setInstruments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('');

  const fetchInstruments = async () => {
    try {
      const res = await api.get('/instruments');
      if (res.data?.success) {
        setInstruments(res.data.instruments);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInstruments();
  }, []);

  const filtered = instruments.filter((inst) => {
    const matchSearch =
      inst.instrumentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.owner?.organizationName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inst.model.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDistrict = districtFilter ? inst.location?.district === districtFilter : true;
    return matchSearch && matchDistrict;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Registered Commercial Instruments</h1>
          <p className="text-xs text-slate-500">
            Master database of all trade measuring instruments registered under the Directorate of Legal Metrology.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by serial number, owner, instrument name, or model..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 bg-white"
          />
        </div>
        <select
          value={districtFilter}
          onChange={(e) => setDistrictFilter(e.target.value)}
          className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-gov-500 bg-white"
        >
          <option value="">All Districts</option>
          <option value="Mumbai City">Mumbai City</option>
          <option value="Mumbai Suburban">Mumbai Suburban</option>
          <option value="Thane">Thane</option>
          <option value="Pune">Pune</option>
          <option value="Nagpur">Nagpur</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-gov-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 space-y-3">
          <Scale className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700">No Instruments Found</h3>
          <p className="text-xs text-slate-500">No equipment records match your search query.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b">
                  <th className="p-3.5">Serial Number</th>
                  <th className="p-3.5">Instrument Particulars</th>
                  <th className="p-3.5">Owner / Establishment</th>
                  <th className="p-3.5">Technical Specs</th>
                  <th className="p-3.5">Location / District</th>
                  <th className="p-3.5">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((inst) => (
                  <tr key={inst._id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-mono font-bold text-gov-700">{inst.serialNumber}</td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-900 block">{inst.instrumentName}</span>
                      <span className="text-slate-500 text-[11px]">{inst.category}</span>
                    </td>
                    <td className="p-3.5">
                      <span className="font-semibold text-slate-900 block">
                        {inst.owner?.organizationName || inst.owner?.name}
                      </span>
                      <span className="text-slate-500 text-[11px]">{inst.owner?.phone}</span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <span className="block font-medium">Max: {inst.maxCapacity} {inst.units} (e = {inst.verificationScaleInterval} {inst.units})</span>
                      <span className="text-[11px] text-slate-500">{inst.accuracyClass}</span>
                    </td>
                    <td className="p-3.5 text-slate-700">
                      <span className="block font-medium">{inst.location?.district}</span>
                      <span className="text-[11px] text-slate-500 truncate max-w-xs block">{inst.location?.address}</span>
                    </td>
                    <td className="p-3.5">
                      <StatusBadge status={inst.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
