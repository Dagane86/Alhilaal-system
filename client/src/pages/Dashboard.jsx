import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion"; // Ku rakib: npm install framer-motion
import { 
  Users, GraduationCap, School, CheckCircle, 
  XCircle, TrendingUp, Calendar, UserPlus 
} from "lucide-react";
import {
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  CartesianGrid, AreaChart, Area 
} from "recharts";

const Dashboard = () => {
  const [data, setData] = useState({
    totalStudents: 0, totalTeachers: 0, totalClasses: 0,
    presentToday: 0, absentToday: 0
  });
  const [extra, setExtra] = useState({ boys: 0, girls: 0, families: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [res, extraRes] = await Promise.all([
        axios.get("https://al-hilaal-vercel-server.vercel.app/api/dashboard"),
        axios.get("https://al-hilaal-vercel-server.vercel.app/api/dashboard/extra")
      ]);
      setData(res.data);
      setExtra(extraRes.data);
    } catch (err) {
      console.error("Xogta lama soo kicin karo", err);
    }
  };

  const attendancePercent = data.totalStudents > 0 
    ? Math.round((data.presentToday / data.totalStudents) * 100) 
    : 0;

  const genderData = [
    { name: "Wiilal", value: extra.boys, color: "#3b82f6" },
    { name: "Gabdho", value: extra.girls, color: "#ec4899" },
  ];

  return (
    <div className="bg-[#f0f4f8] min-h-screen p-6 font-sans text-slate-900">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            مدرسة الهلال <span className="text-blue-600">للإحصائيات</span>
          </h1>
          <p className="text-slate-500 font-medium">Maareynta iyo xogta guud ee Madarasada</p>
        </div>
        <div className="bg-white p-2 rounded-xl shadow-sm border flex items-center gap-3">
          <Calendar className="text-blue-500" size={20} />
          <span className="font-semibold text-slate-700">{new Date().toDateString()}</span>
        </div>
      </div>

      {/* TOP STATS - Animated Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Warta Ardayda" value={data.totalStudents} icon={<Users />} trend="+4%" color="blue" delay={0.1} />
        <StatCard title="Macalimiinta" value={data.totalTeachers} icon={<GraduationCap />} trend="Stable" color="purple" delay={0.2} />
        <StatCard title="Fasallada Firfircoon" value={data.totalClasses} icon={<School />} trend="Full" color="orange" delay={0.3} />
        <StatCard title="Qoysaska" value={extra.families} icon={<UserPlus />} trend="New" color="green" delay={0.4} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Charts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Attendance Overview */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="text-green-500" /> Attendance Performance
              </h3>
              <span className="text-xs font-bold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">TODAY</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm">Jooga hadda</p>
                <p className="text-3xl font-black text-blue-600">{data.presentToday}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500 text-sm">Maqan hadda</p>
                <p className="text-3xl font-black text-red-500">{data.absentToday}</p>
              </div>
              <div className="bg-blue-600 p-4 rounded-2xl shadow-lg shadow-blue-200 text-white flex flex-col justify-center">
                <p className="opacity-80 text-sm font-medium text-center">Boqolkiiba</p>
                <p className="text-4xl font-black text-center">{attendancePercent}%</p>
              </div>
            </div>
          </motion.div>

          {/* Bar Chart Section */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold mb-6 text-slate-800">Qaybinta Shaqaalaha & Ardayda</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Students', val: data.totalStudents },
                  { name: 'Teachers', val: data.totalTeachers },
                  { name: 'Staff', val: 5 } // Tusaale
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '15px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                  <Bar dataKey="val" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Pie Charts & Extras */}
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
          >
            <h3 className="text-lg font-bold mb-6 text-slate-800 text-center">Dheelitirka Wiilal & Gabdho</h3>
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {genderData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-bold text-slate-800">{extra.boys + extra.girls}</span>
                <span className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total</span>
              </div>
            </div>
            
            <div className="flex justify-center gap-6 mt-4">
               {genderData.map(item => (
                 <div key={item.name} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full" style={{backgroundColor: item.color}} />
                   <span className="text-sm font-semibold text-slate-600">{item.name}</span>
                 </div>
               ))}
            </div>
          </motion.div>

          {/* Quick Actions or Summary Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-blue-700 p-6 rounded-3xl shadow-xl text-white">
            <h4 className="font-bold mb-2">Hadafka Sanadka</h4>
            <p className="text-sm opacity-80 mb-4">Waxaad mareysaa 80% dhamaystirka xogta sanadlaha ah ee Al-Hilaal.</p>
            <div className="w-full bg-white/20 h-2 rounded-full mb-6">
              <div className="bg-white h-2 rounded-full w-[80%]"></div>
            </div>
            <button className="w-full bg-white text-blue-700 font-bold py-3 rounded-xl hover:bg-opacity-90 transition">
              Dhoofso Report (PDF)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

// Reusable StatCard Component with Framer Motion
const StatCard = ({ title, value, icon, trend, color, delay }) => {
  const colors = {
    blue: "bg-blue-100 text-blue-600 shadow-blue-100",
    purple: "bg-purple-100 text-purple-600 shadow-purple-100",
    orange: "bg-orange-100 text-orange-600 shadow-orange-100",
    green: "bg-green-100 text-green-600 shadow-green-100",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-4 rounded-2xl ${colors[color]}`}>
          {React.cloneElement(icon, { size: 24 })}
        </div>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${trend.includes('+') ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-500'}`}>
          {trend}
        </span>
      </div>
      <div>
        <h2 className="text-3xl font-black text-slate-800">{value}</h2>
        <p className="text-slate-400 text-sm font-bold uppercase tracking-tight mt-1">{title}</p>
      </div>
    </motion.div>
  );
};

export default Dashboard;