import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
  Search,
  Printer,
  Calendar,
  UserCheck,
  UserX,
  Clock,
  Loader2,
  Filter
} from 'lucide-react';

const API_URL = 'https://al-hilaal-vercel-server.vercel.app/api';

const AttendanceView = () => {
  const [report, setReport] = useState([]);
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [shiftFilter, setShiftFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Soo qaado fasalada marka component-ku furmo
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get(`${API_URL}/classes`);
        setClasses(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Classes fetch error:', err);
        setClasses([]);
      }
    };

    fetchClasses();
  }, []);

  // Soo qaado report-ka
  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const res = await axios.get(`${API_URL}/attendance/report`, {
        params: {
          date: dateFilter,
          class_id: selectedClass || undefined,
          shift: shiftFilter || undefined
        }
      });

      setReport(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Attendance fetch error:', err);

      setError(
        err.response?.data?.details ||
        err.response?.data?.message ||
        'Server-ka ayaa cilad bixiyey'
      );

      setReport([]);
    } finally {
      setLoading(false);
    }
  }, [dateFilter, selectedClass, shiftFilter]);

  // Mar kasta oo filter-adu isbedelaan
  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Search filter
  const filteredData = report.filter((item) => {
    const studentName = (item.student_name || '').toLowerCase();
    return studentName.includes(searchTerm.toLowerCase());
  });

  const handlePrint = () => {
    window.print();
  };

  const presentCount = filteredData.filter((item) => item.status === 'Present').length;
  const absentCount = filteredData.filter((item) => item.status === 'Absent').length;

  // Safe date formatter
  const formatDate = (dateValue) => {
    if (!dateValue) return '---';

    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '---';
      return date.toLocaleDateString('so-SO');
    } catch {
      return '---';
    }
  };

  return (
    <div
      className="bg-white rounded-[2.5rem] p-8 mt-8 shadow-sm border border-slate-100 print:p-0"
      dir="rtl"
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between mb-8 gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500 p-3 rounded-2xl text-white shadow-lg shadow-orange-100">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 text-right">
              Dabagalka Xaadirinta
            </h2>
            <p className="text-slate-400 text-sm font-bold text-right">
              Warbixinta xaadirinta ardayda
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Date Filter */}
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 px-4 py-3 font-bold text-slate-600"
          />

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 px-4 py-3 font-bold text-slate-600"
          >
            <option value="">Dhammaan Fasalada</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.class_name}
              </option>
            ))}
          </select>

          {/* Shift Filter */}
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="rounded-2xl bg-slate-50 border-none ring-1 ring-slate-200 px-4 py-3 font-bold text-slate-600"
          >
            <option value="">Dhammaan Shift-yada</option>
            <option value="Subax">Subax</option>
            <option value="Barqo">Barqo</option>
            <option value="Galab">Galab</option>
          </select>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Raadi magac..."
              className="pr-10 pl-4 py-3 rounded-2xl bg-slate-50 ring-1 ring-slate-200 text-right"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-3 top-3.5 text-slate-300" size={18} />
          </div>

          {/* Print */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold hover:bg-slate-800 transition"
          >
            <Printer size={18} />
            Daabac
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 print:hidden">
        <div className="bg-slate-50 rounded-2xl p-5 flex items-center justify-between">
          <div className="text-right">
            <p className="text-slate-400 text-sm font-bold">Wadarta Diiwaanada</p>
            <h3 className="text-3xl font-black text-slate-800">{filteredData.length}</h3>
          </div>
          <Filter className="text-slate-500" size={24} />
        </div>

        <div className="bg-green-50 rounded-2xl p-5 flex items-center justify-between">
          <div className="text-right">
            <p className="text-green-500 text-sm font-bold">Jooga</p>
            <h3 className="text-3xl font-black text-green-700">{presentCount}</h3>
          </div>
          <UserCheck className="text-green-600" size={24} />
        </div>

        <div className="bg-red-50 rounded-2xl p-5 flex items-center justify-between">
          <div className="text-right">
            <p className="text-red-500 text-sm font-bold">Maqan</p>
            <h3 className="text-3xl font-black text-red-700">{absentCount}</h3>
          </div>
          <UserX className="text-red-600" size={24} />
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl font-bold text-right">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="py-20 text-center flex justify-center">
            <Loader2 className="animate-spin text-blue-500" size={28} />
          </div>
        ) : (
          <table className="w-full text-right border-separate border-spacing-y-3">
            <thead>
              <tr className="text-slate-400 text-xs font-bold uppercase">
                <th className="p-4">Magaca Ardayga</th>
                <th className="p-4">Fasalka</th>
                <th className="p-4 text-center">Xaaladda</th>
                <th className="p-4">Cudur-daar</th>
                <th className="p-4">Shift</th>
                <th className="p-4">Taariikhda</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr
                    key={item.id}
                    className="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all"
                  >
                    <td className="p-5 font-bold text-slate-700">
                      {item.student_name || 'Arday'}
                    </td>

                    <td className="p-5 text-slate-600">
                      {item.class_name || 'N/A'}
                    </td>

                    <td className="p-5">
                      <div className="flex justify-center">
                        <span
                          className={`px-4 py-1.5 rounded-xl font-black text-[10px] flex items-center gap-2 ${
                            item.status === 'Present'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {item.status === 'Present' ? (
                            <UserCheck size={12} />
                          ) : (
                            <UserX size={12} />
                          )}
                          {item.status === 'Present' ? 'JOOGA' : 'MAQAN'}
                        </span>
                      </div>
                    </td>

                    <td className="p-5 text-slate-500 text-xs italic">
                      {item.notes || '---'}
                    </td>

                    <td className="p-5 text-slate-500">
                      <div className="flex items-center gap-2 justify-end">
                        <Clock size={14} />
                        {item.shift || '---'}
                      </div>
                    </td>

                    <td className="p-5 text-slate-400 font-mono text-sm">
                      {formatDate(item.attendance_date)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-20 text-slate-400 font-medium">
                    Lama helin wax xog ah. Iska hubi filter-yada.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceView;