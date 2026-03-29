import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Users, GraduationCap, School,
  CheckCircle, XCircle, Calendar,
  Loader2
} from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    presentToday: 0,
    absentToday: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/dashboard');
        if (res.data) setStats(res.data);
      } catch (err) {
        setError("Xogta lama helin");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const percentage =
    stats.totalStudents > 0
      ? Math.round((stats.presentToday / stats.totalStudents) * 100)
      : 0;

  if (loading)
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0f172a] text-white">
        <Loader2 className="animate-spin mb-4" />
        <p>Fadlan sug...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#020617] text-white p-4 md:p-8" dir="rtl">

      {/* 🌙 HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-yellow-400">لوحة التحكم الإسلامية</h1>
          <p className="text-slate-300 text-sm mt-1">
            "وَقُل رَّبِّ زِدْنِي عِلْمًا"
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur p-4 rounded-2xl flex items-center gap-3">
          <Calendar />
          <span>{new Date().toLocaleDateString('so-SO')}</span>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/20 p-3 rounded-xl mb-6">
          {error}
        </div>
      )}

      {/* 📊 STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Card title="Ardayda" value={stats.totalStudents} icon={<Users />} />
        <Card title="Macallimiin" value={stats.totalTeachers} icon={<GraduationCap />} />
        <Card title="Fasallo" value={stats.totalClasses} icon={<School />} />
      </div>

      {/* 📈 ATTENDANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Circle */}
        <div className="bg-white/10 backdrop-blur p-6 rounded-3xl flex flex-col items-center">
          <h3 className="mb-4 text-sm text-slate-300">Heerka Imaanshaha</h3>

          <div className="relative">
            <svg className="w-40 h-40 -rotate-90">
              <circle cx="80" cy="80" r="70" strokeWidth="10" className="text-gray-700" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r="70"
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={440}
                strokeDashoffset={440 - (440 * percentage) / 100}
                className="text-yellow-400"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{percentage}%</span>
            </div>
          </div>
        </div>

        {/* Present */}
        <div className="bg-green-600 p-6 rounded-3xl flex flex-col justify-between">
          <CheckCircle size={28} />
          <div>
            <p>Jooga</p>
            <h2 className="text-4xl font-black">{stats.presentToday}</h2>
          </div>
        </div>

        {/* Absent */}
        <div className="bg-red-600 p-6 rounded-3xl flex flex-col justify-between">
          <XCircle size={28} />
          <div>
            <p>Maqan</p>
            <h2 className="text-4xl font-black">{stats.absentToday}</h2>
          </div>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, icon }) => (
  <div className="bg-white/10 backdrop-blur p-5 rounded-2xl flex justify-between items-center hover:scale-[1.02] transition">
    <div>
      <p className="text-sm text-slate-300">{title}</p>
      <h2 className="text-3xl font-bold">{value}</h2>
    </div>
    <div className="bg-yellow-400 text-black p-3 rounded-xl">
      {icon}
    </div>
  </div>
);

export default Dashboard;