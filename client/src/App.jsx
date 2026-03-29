import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Teachers from './pages/Teachers';
import StudentList from './pages/StudentList';
import TeacherList from './pages/TeacherList';
import Classes from './pages/Classes';
import AttendanceEntry from './pages/Attendance';
import AttendanceView from './pages/AttendanceView';

// 💰 In laga soo jiido folder-ka Accounting (Hadda ReportsPage waa lagu daray)
import { IncomePage, ExpensesPage, ReportsPage } from './pages/Accounting';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-[#0f172a]" dir="rtl">

        {/* 🧭 SIDEBAR */}
        <Sidebar />

        {/* 📱 MAIN CONTENT */}
        <main
          className="
            flex-1 w-full
            transition-all duration-300
            mr-0 lg:mr-64
            p-4 md:p-8 lg:p-10
          "
        >
          {/* Container (centered content) */}
          <div className="max-w-7xl mx-auto">

            <Routes>
              {/* 🏠 Main Dashboard */}
              <Route path="/" element={<Dashboard />} />
              
              {/* 👨‍🏫 Teachers Section */}
              <Route path="/teacher-list" element={<TeacherList />} />
              <Route path="/teachers" element={<Teachers />} />
              
              {/* 🏫 Classes & Students */}
              <Route path="/classes" element={<Classes />} />
              <Route path="/students" element={<StudentList />} />

              {/* 📋 Attendance Section */}
              <Route path="/attendance/entry" element={<AttendanceEntry />} />
              <Route path="/attendance/view" element={<AttendanceView />} />

              {/* 💰 Accounting Section (Hadda waa saddex bog) */}
              <Route path="/accounting/income" element={<IncomePage />} />
              <Route path="/accounting/expenses" element={<ExpensesPage />} />
              <Route path="/accounting/reports" element={<ReportsPage />} />

              {/* ⚙️ Settings */}
              <Route
                path="/settings"
                element={
                  <div className="text-center py-24">
                    <h2 className="text-3xl font-black text-yellow-400 mb-2">
                      الإعدادات
                    </h2>
                    <p className="text-slate-400">
                      Settings-ka wali waa la dhisayaa...
                    </p>
                  </div>
                }
              />

              {/* ❌ 404 Page - Haddii bog aan jirin la isku dayo */}
              <Route
                path="*"
                element={
                  <div className="text-center py-24">
                    <h1 className="text-4xl font-black text-red-500">
                      404
                    </h1>
                    <p className="text-slate-400 mt-2">
                      Page lama helin
                    </p>
                  </div>
                }
              />
            </Routes>

          </div>
        </main>

      </div>
    </Router>
  );
}

export default App;