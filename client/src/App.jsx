import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';
import Teachers from './pages/Teachers';
import StudentList from './pages/StudentList';
import StudentDetails from './pages/StudentDetails';
import StudentDetailsSearch from './pages/StudentDetailsSearch';
import TeacherList from './pages/TeacherList';
import Classes from './pages/Classes';
import AttendanceEntry from './pages/Attendance';
import AttendanceView from './pages/AttendanceView';

// 💰 Accounting section
import { IncomePage, ExpensesPage, ReportsPage } from './pages/Accounting';

// 🔐 Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function AppLayout() {
  const location = useLocation();
  const isLogin = location.pathname === '/login';

  return (
    <div className={`flex min-h-screen bg-[#f8fafc] ${isLogin ? 'justify-center items-center' : ''}`} dir="rtl">
      {!isLogin && <Sidebar />}

        {/* 📱 MAIN CONTENT */}
        <main
          className="
            flex-1 w-full
            transition-all duration-300
            mr-0 lg:mr-64
            p-4 md:p-8 lg:p-10
          "
        >
          {/* Container */}
          <div className="max-w-7xl mx-auto">

            <Routes>
              {/* 🔐 Login */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* 🏠 Main Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* 👨‍🏫 Teachers Section */}
              <Route path="/teacher-list" element={<ProtectedRoute><TeacherList /></ProtectedRoute>} />
              <Route path="/teachers" element={<ProtectedRoute><Teachers /></ProtectedRoute>} />
              
              {/* 🏫 Classes & Students */}
              <Route path="/classes" element={<ProtectedRoute><Classes /></ProtectedRoute>} />
              <Route path="/students" element={<ProtectedRoute><StudentList /></ProtectedRoute>} />
              <Route path="/students/details" element={<ProtectedRoute><StudentDetailsSearch /></ProtectedRoute>} />
              <Route path="/students/:id" element={<ProtectedRoute><StudentDetails /></ProtectedRoute>} />

              {/* 📋 Attendance Section */}
              <Route path="/attendance/entry" element={<ProtectedRoute><AttendanceEntry /></ProtectedRoute>} />
              <Route path="/attendance/view" element={<ProtectedRoute><AttendanceView /></ProtectedRoute>} />

              {/* 💰 Accounting Section */}
              <Route path="/accounting/income" element={<ProtectedRoute><IncomePage /></ProtectedRoute>} />
              <Route path="/accounting/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
              <Route path="/accounting/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />

              {/* ⚙️ Settings - Midabada qoraalka waa la beddelay */}
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <div className="text-center py-24 bg-white rounded-3xl shadow-sm border border-slate-100">
                      <h2 className="text-3xl font-black text-blue-600 mb-2">
                        الإعدادات
                      </h2>
                      <p className="text-slate-500 font-medium">
                        Settings-ka wali waa la dhisayaa...
                      </p>
                    </div>
                  </ProtectedRoute>
                }
              />

              {/* ❌ 404 Page */}
              <Route
                path="*"
                element={
                  <ProtectedRoute>
                    <div className="text-center py-24">
                      <h1 className="text-6xl font-black text-slate-200">
                        404
                      </h1>
                      <p className="text-slate-500 mt-2 font-bold">
                        Page lama helin
                      </p>
                    </div>
                  </ProtectedRoute>
                }
              />
            </Routes>

          </div>
        </main>

      </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;