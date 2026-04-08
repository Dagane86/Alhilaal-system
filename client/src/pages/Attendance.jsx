import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, Users, CheckCircle, XCircle, Loader2 } from 'lucide-react';

const API_URL = 'https://al-hilaal-vercel-server.vercel.app/api';

const Attendance = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [shift, setShift] = useState('Subax');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(false);

  // Soo qaado fasalada
  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await axios.get(`${API_URL}/classes`);
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    }
  };

  // Soo qaado ardayda marka fasal la doorto
  useEffect(() => {
    if (selectedClass) {
      fetchStudentsByClass();
    } else {
      setStudents([]);
      setAttendanceData({});
    }
  }, [selectedClass]);

  const fetchStudentsByClass = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/students?class_id=${selectedClass}`);
      const data = Array.isArray(res.data) ? res.data : [];

      setStudents(data);

      const initialData = {};
      data.forEach((student) => {
        initialData[student.student_id] = {
          status: 'Present',
          notes: ''
        };
      });

      setAttendanceData(initialData);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (id, newStatus) => {
    setAttendanceData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        status: newStatus
      }
    }));
  };

  const handleNoteChange = (id, note) => {
    setAttendanceData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        notes: note
      }
    }));
  };

  const handleSave = async () => {
    if (!selectedClass) return alert('Fadlan dooro fasal!');
    if (students.length === 0) return alert('Fasalkan arday kuma jirto!');

    const records = Object.keys(attendanceData).map((id) => ({
      student_id: Number(id),
      status: attendanceData[id]?.status || 'Present',
      notes: attendanceData[id]?.notes || ''
    }));

    try {
      setLoading(true);

      await axios.post(`${API_URL}/attendance`, {
        class_id: Number(selectedClass),
        attendance_date: attendanceDate,
        shift,
        records
      });

      alert('✅ Xaadirinta si guul leh ayaa loo keydiyey!');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      alert('❌ Khalad Server-ka ah: ' + errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const presentCount = Object.values(attendanceData).filter((s) => s.status === 'Present').length;
  const absentCount = Object.values(attendanceData).filter((s) => s.status === 'Absent').length;

  return (
    <div className="p-8 bg-white rounded-[2.5rem] shadow-sm font-sans" dir="rtl">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4 text-right">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-100">
            <Users size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Xaadirinta Ardayda</h2>
            <p className="text-slate-400 text-sm font-bold tracking-tight">
              Dooro fasalka si aad u bilowdo
            </p>
          </div>
        </div>

        <select
          className="p-4 w-full md:w-64 rounded-2xl bg-slate-50 border-none ring-2 ring-slate-100 focus:ring-4 focus:ring-blue-500/10 font-bold text-slate-600 transition-all cursor-pointer text-right"
          onChange={(e) => setSelectedClass(e.target.value)}
          value={selectedClass}
        >
          <option value="">-- Dooro Fasal --</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.class_name}
            </option>
          ))}
        </select>
      </div>

      {/* Controls */}
      {selectedClass && (
        <>
          <div className="bg-blue-50/50 p-6 rounded-[2rem] mb-6 grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-blue-400 mr-2 uppercase">Taariikhda</label>
              <input
                type="date"
                className="p-4 rounded-xl border-none font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 text-right"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-black text-blue-400 mr-2 uppercase">Shift</label>
              <select
                className="p-4 rounded-xl border-none font-bold text-slate-600 focus:ring-2 focus:ring-blue-500 text-right"
                value={shift}
                onChange={(e) => setShift(e.target.value)}
              >
                <option value="Subax">Subax</option>
                <option value="Barqo">Barqo</option>
              </select>
                <option value="Galab">Galab</option>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleSave}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-4 rounded-xl font-black shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                {loading ? 'Waa la keydinayaa...' : 'Keydi Xaadirinta'}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-green-50 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-green-500 text-sm font-bold">Jooga</p>
                <h3 className="text-3xl font-black text-green-700">{presentCount}</h3>
              </div>
              <CheckCircle className="text-green-600" size={28} />
            </div>

            <div className="bg-red-50 rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-red-500 text-sm font-bold">Maqan</p>
                <h3 className="text-3xl font-black text-red-700">{absentCount}</h3>
              </div>
              <XCircle className="text-red-600" size={28} />
            </div>
          </div>
        </>
      )}

      {/* Students Table */}
      <div className="min-h-[200px] border-2 border-dashed border-slate-100 rounded-[2.5rem] p-6">
        {loading && students.length === 0 ? (
          <div className="py-20 text-center font-bold text-blue-500 animate-pulse">
            Waa la soo ridayyaa liiska...
          </div>
        ) : students.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-separate border-spacing-y-3">
              <thead>
                <tr className="text-slate-400 font-bold text-xs uppercase">
                  <th className="p-4 text-right">Magaca Ardayga</th>
                  <th className="p-4 text-center">Xaaladda</th>
                  <th className="p-4 text-right">Cudur-daar (Note)</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                    key={student.student_id}
                    className="bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group"
                  >
                    <td className="p-5 rounded-r-2xl font-bold text-slate-700 text-right">
                      {student.full_name}
                    </td>

                    <td className="p-5 text-center">
                      <div className="flex justify-center gap-4">
                        <button
                          onClick={() => handleStatusChange(student.student_id, 'Present')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                            attendanceData[student.student_id]?.status === 'Present'
                              ? 'bg-green-600 text-white shadow-md'
                              : 'bg-white text-slate-400 ring-1 ring-slate-100'
                          }`}
                        >
                          <CheckCircle size={16} />
                          Jooga
                        </button>

                        <button
                          onClick={() => handleStatusChange(student.student_id, 'Absent')}
                          className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                            attendanceData[student.student_id]?.status === 'Absent'
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-white text-slate-400 ring-1 ring-slate-100'
                          }`}
                        >
                          <XCircle size={16} />
                          Maqan
                        </button>
                      </div>
                    </td>

                    <td className="p-5 rounded-l-2xl">
                      <input
                        type="text"
                        placeholder="Sababta..."
                        className="w-full p-3 rounded-xl bg-white border-none ring-1 ring-slate-100 focus:ring-2 focus:ring-blue-500 text-xs text-right"
                        value={attendanceData[student.student_id]?.notes || ''}
                        onChange={(e) => handleNoteChange(student.student_id, e.target.value)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-20 text-center text-slate-400 font-medium">
            <p>Fadlan marka hore dooro fasal si aad u aragto ardayda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Attendance;