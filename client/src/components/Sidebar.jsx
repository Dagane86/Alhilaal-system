import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Settings,
  ChevronLeft,
  ChevronDown,
  Wallet,
  School,
  ClipboardCheck,
  FileSearch,
  Menu,
  X,
  ArrowDownCircle,
  ArrowUpCircle,
  BarChart3 // Icon-ka cusub ee Reports
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  
  // Maamulidda Menu-yada hoos u dhaca (Dropdowns)
  const [attendanceOpen, setAttendanceOpen] = useState(location.pathname.includes('/attendance'));
  const [accountingOpen, setAccountingOpen] = useState(location.pathname.includes('/accounting'));

  const isActive = (path) => location.pathname === path;

  const closeSidebar = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 right-4 z-50 bg-blue-900 text-white p-3 rounded-xl shadow-lg"
      >
        {isOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white shadow-2xl z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-blue-700 text-center">
          <div className="w-16 h-16 mx-auto bg-white rounded-xl flex items-center justify-center mb-3 shadow-md">
            <img
              src="https://cdn-icons-png.flaticon.com/512/2232/2232688.png"
              className="w-10"
              alt="Logo"
            />
          </div>
          <h2 className="text-lg font-bold text-yellow-400 font-arabic">مدرسة الهلال</h2>
          <p className="text-xs text-blue-200">School Management System</p>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[75%]">
          <NavItem to="/" label="لوحة التحكم" icon={<LayoutDashboard />} active={isActive('/')} onClick={closeSidebar} />
          <NavItem to="/teacher-list" label="المعلمين" icon={<Users />} active={isActive('/teacher-list')} onClick={closeSidebar} />
          <NavItem to="/classes" label="الفصول" icon={<School />} active={isActive('/classes')} onClick={closeSidebar} />
          <NavItem to="/students" label="الطلاب" icon={<GraduationCap />} active={isActive('/students')} onClick={closeSidebar} />

          {/* Attendance Dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => setAttendanceOpen(!attendanceOpen)}
              className={`flex justify-between items-center w-full p-3 rounded-lg transition-colors hover:bg-blue-700 ${attendanceOpen ? 'bg-blue-800/50' : ''}`}
            >
              <div className="flex gap-3 items-center">
                <ClipboardCheck className={attendanceOpen ? 'text-yellow-400' : 'text-white'} />
                <span>التحضير</span>
              </div>
              {attendanceOpen ? <ChevronDown size={18} /> : <ChevronLeft size={18} />}
            </button>

            {attendanceOpen && (
              <div className="mr-6 space-y-1 border-r-2 border-blue-700/50 pr-2 transition-all">
                <SubItem to="/attendance/entry" label="تسجيل الحضور" icon={<ClipboardCheck size={14} />} active={isActive('/attendance/entry')} onClick={closeSidebar} />
                <SubItem to="/attendance/view" label="تقارير الحضور" icon={<FileSearch size={14} />} active={isActive('/attendance/view')} onClick={closeSidebar} />
              </div>
            )}
          </div>

          {/* Accounting Dropdown */}
          <div className="space-y-1">
            <button
              onClick={() => setAccountingOpen(!accountingOpen)}
              className={`flex justify-between items-center w-full p-3 rounded-lg transition-colors hover:bg-blue-700 ${accountingOpen ? 'bg-blue-800/50' : ''}`}
            >
              <div className="flex gap-3 items-center">
                <Wallet className={accountingOpen ? 'text-yellow-400' : 'text-white'} />
                <span>المحاسبة</span>
              </div>
              {accountingOpen ? <ChevronDown size={18} /> : <ChevronLeft size={18} />}
            </button>

            {accountingOpen && (
              <div className="mr-6 space-y-1 border-r-2 border-blue-700/50 pr-2 transition-all">
                <SubItem to="/accounting/income" label="Dakhliga (Income)" icon={<ArrowDownCircle size={14} />} active={isActive('/accounting/income')} onClick={closeSidebar} />
                <SubItem to="/accounting/expenses" label="Kharashka (Expenses)" icon={<ArrowUpCircle size={14} />} active={isActive('/accounting/expenses')} onClick={closeSidebar} />
                {/* KAN AYAA CUSUB */}
                <SubItem to="/accounting/reports" label="Warbixinta (Reports)" icon={<BarChart3 size={14} />} active={isActive('/accounting/reports')} onClick={closeSidebar} />
              </div>
            )}
          </div>
        </nav>

        {/* Footer Settings */}
        <div className="p-4 border-t border-blue-700">
          <NavItem to="/settings" label="الإعدادات" icon={<Settings />} active={isActive('/settings')} onClick={closeSidebar} />
        </div>
      </aside>
    </>
  );
};

// Main Nav Item Component
const NavItem = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center p-3 rounded-lg transition-all duration-200
    ${active ? 'bg-yellow-400 text-blue-900 font-bold shadow-lg' : 'hover:bg-blue-700 text-white'}`}
  >
    <div className="flex items-center gap-3">
      {React.cloneElement(icon, { size: 20 })}
      <span>{label}</span>
    </div>
  </Link>
);

// Sub Nav Item Component
const SubItem = ({ to, icon, label, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className={`flex items-center gap-2 text-sm p-2.5 rounded-md transition-colors
    ${active ? 'text-yellow-400 font-bold bg-blue-800/40' : 'text-blue-200 hover:text-white hover:bg-blue-700/30'}`}
  >
    {icon}
    <span>{label}</span>
  </Link>
);

export default Sidebar;