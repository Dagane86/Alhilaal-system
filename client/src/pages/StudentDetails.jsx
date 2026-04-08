import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Phone,
  Users,
  Calendar,
  BookOpen,
  Clock3,
  CreditCard,
  Pencil,
  Loader2,
  Wallet,
  BadgeInfo,
  CheckCircle2,
  XCircle,
  Percent,
  TrendingUp,
  GraduationCap,
  RefreshCcw,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const StudentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [payments, setPayments] = useState([]);
  const [attendance, setAttendance] = useState({
    presentDays: 0,
    absentDays: 0,
    attendanceRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchStudentDetails = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await axios.get(`${API_URL}/students/${id}`);
      const data = response.data;

      setStudent(data.student || data);

      // haddii backend-ku soo celiyo payments iyo attendance
      if (data.payments) setPayments(data.payments);
      if (data.attendance) setAttendance(data.attendance);

      // haddii backend-ku kaliya student soo celiyo, placeholders
      if (!data.payments) setPayments([]);
      if (!data.attendance) {
        setAttendance({
          presentDays: 0,
          absentDays: 0,
          attendanceRate: 0,
        });
      }
    } catch (err) {
      console.error("Student details error:", err);
      setError(
        err?.response?.data?.message ||
          "Ardayga lama helin ama server error ayaa dhacay."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStudentDetails();
  }, [fetchStudentDetails]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  };

  const formatMoney = (amount) => {
    const num = Number(amount || 0);
    return `$${num.toFixed(2)}`;
  };

  const totalPaid = useMemo(() => {
    if (!payments?.length) return 0;
    return payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const monthlyFee = Number(student?.monthly_fee || 0);

  const remainingBalance = useMemo(() => {
    const remain = monthlyFee - totalPaid;
    return remain > 0 ? remain : 0;
  }, [monthlyFee, totalPaid]);

  const paymentStatus = useMemo(() => {
    if (monthlyFee <= 0) return "No Fee";
    if (remainingBalance <= 0) return "Paid";
    if (totalPaid > 0 && remainingBalance > 0) return "Partial";
    return "Unpaid";
  }, [monthlyFee, remainingBalance, totalPaid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center gap-4 w-full max-w-md">
          <Loader2 className="animate-spin text-blue-700" size={40} />
          <h2 className="text-xl font-bold text-slate-800">
            Loading Student Details...
          </h2>
          <p className="text-slate-500 text-center">
            Fadlan sug, xogta ardayga waa soo socotaa.
          </p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-lg text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 mx-auto flex items-center justify-center mb-4">
            <XCircle className="text-red-600" size={34} />
          </div>
          <h2 className="text-2xl font-bold text-red-600 mb-3">Error</h2>
          <p className="text-slate-600 mb-6">
            {error || "Student not found."}
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("/students")}
              className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-xl font-semibold"
            >
              Back to Students
            </button>

            <button
              onClick={() => fetchStudentDetails(true)}
              className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-5 py-3 rounded-xl font-semibold"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const latestPayment = payments?.length ? payments[0] : null;

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Top Actions */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate("/students")}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-3 rounded-2xl shadow-sm font-medium"
            >
              <ArrowLeft size={18} />
              Back
            </button>

            <button
              onClick={() => fetchStudentDetails(true)}
              disabled={refreshing}
              className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-3 rounded-2xl shadow-sm font-medium disabled:opacity-60"
            >
              <RefreshCcw
                size={18}
                className={refreshing ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => navigate(`/students/edit/${student.id}`)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl shadow font-semibold"
            >
              <Pencil size={18} />
              Edit Student
            </button>

            <button
              onClick={() => navigate(`/payments?studentId=${student.id}`)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl shadow font-semibold"
            >
              <CreditCard size={18} />
              Payments
            </button>

            <button
              onClick={() => navigate(`/attendance?studentId=${student.id}`)}
              className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-2xl shadow font-semibold"
            >
              <Calendar size={18} />
              Attendance
            </button>
          </div>
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-r from-blue-800 via-blue-700 to-indigo-700 rounded-3xl shadow-xl p-6 md:p-8 text-white mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-white/15 border border-white/20 flex items-center justify-center shrink-0">
              <User size={46} />
            </div>

            {/* Main Info */}
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
                    {student.full_name || "N/A"}
                  </h1>
                  <p className="text-blue-100 mt-2 text-sm md:text-base">
                    Student Profile • Internal ID #{student.id}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    text={student.level || "No Class"}
                    bg="bg-white/15"
                    textColor="text-white"
                  />
                  <Badge
                    text={student.shift || "No Shift"}
                    bg="bg-white/15"
                    textColor="text-white"
                  />
                  <Badge
                    text={student.gender || "N/A"}
                    bg="bg-white/15"
                    textColor="text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <HeroMiniCard
                  icon={<GraduationCap size={18} />}
                  label="Class"
                  value={student.level || "N/A"}
                />
                <HeroMiniCard
                  icon={<Clock3 size={18} />}
                  label="Shift"
                  value={student.shift || "N/A"}
                />
                <HeroMiniCard
                  icon={<Phone size={18} />}
                  label="Parent Phone"
                  value={student.parent_phone || "N/A"}
                />
                <HeroMiniCard
                  icon={<Wallet size={18} />}
                  label="Monthly Fee"
                  value={formatMoney(student.monthly_fee)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <SummaryCard
            title="Monthly Fee"
            value={formatMoney(student.monthly_fee)}
            subtitle="Lacagta bishii"
            icon={<Wallet size={22} />}
            color="blue"
          />
          <SummaryCard
            title="Total Paid"
            value={formatMoney(totalPaid)}
            subtitle="Lacagta la bixiyey"
            icon={<TrendingUp size={22} />}
            color="green"
          />
          <SummaryCard
            title="Remaining"
            value={formatMoney(remainingBalance)}
            subtitle="Lacagta ka dhiman"
            icon={<CreditCard size={22} />}
            color="amber"
          />
          <SummaryCard
            title="Attendance"
            value={`${attendance.attendanceRate || 0}%`}
            subtitle="Heerka imaanshaha"
            icon={<Percent size={22} />}
            color="purple"
          />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="xl:col-span-2 space-y-6">
            {/* Student + Parent Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <InfoCard
                title="Student Information"
                icon={<User size={20} />}
                titleColor="text-blue-700"
              >
                <InfoRow
                  icon={<User size={18} />}
                  label="Full Name"
                  value={student.full_name}
                />
                <InfoRow
                  icon={<BadgeInfo size={18} />}
                  label="Student ID"
                  value={`#${student.id}`}
                />
                <InfoRow
                  icon={<Users size={18} />}
                  label="Gender"
                  value={student.gender}
                />
                <InfoRow
                  icon={<BookOpen size={18} />}
                  label="Class / Level"
                  value={student.level}
                />
                <InfoRow
                  icon={<Clock3 size={18} />}
                  label="Shift"
                  value={student.shift}
                />
                <InfoRow
                  icon={<Calendar size={18} />}
                  label="Registration Date"
                  value={formatDate(
                    student.registration_date || student.created_at
                  )}
                />
                <InfoRow
                  icon={<Calendar size={18} />}
                  label="Created At"
                  value={formatDate(student.created_at)}
                />
                <InfoRow
                  icon={<Calendar size={18} />}
                  label="Updated At"
                  value={formatDate(student.updated_at)}
                />
              </InfoCard>

              <InfoCard
                title="Parent / Guardian Information"
                icon={<Users size={20} />}
                titleColor="text-green-700"
              >
                <InfoRow
                  icon={<Users size={18} />}
                  label="Parent Name"
                  value={student.parent_name}
                />
                <InfoRow
                  icon={<BadgeInfo size={18} />}
                  label="Relation"
                  value={student.relation}
                />
                <InfoRow
                  icon={<Phone size={18} />}
                  label="Parent Phone"
                  value={student.parent_phone}
                />
                <InfoRow
                  icon={<BookOpen size={18} />}
                  label="Class ID"
                  value={student.class_id ?? "N/A"}
                />
                <InfoRow
                  icon={<CheckCircle2 size={18} />}
                  label="Status"
                  value="Active"
                />
              </InfoCard>
            </div>

            {/* Financial Section */}
            <InfoCard
              title="Financial Details"
              icon={<Wallet size={20} />}
              titleColor="text-amber-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                <SmallFinanceCard
                  label="Monthly Fee"
                  value={formatMoney(student.monthly_fee)}
                  bg="bg-blue-50"
                  text="text-blue-700"
                />
                <SmallFinanceCard
                  label="Total Paid"
                  value={formatMoney(totalPaid)}
                  bg="bg-green-50"
                  text="text-green-700"
                />
                <SmallFinanceCard
                  label="Remaining"
                  value={formatMoney(remainingBalance)}
                  bg="bg-amber-50"
                  text="text-amber-700"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <StatusBadge status={paymentStatus} />
                {latestPayment && (
                  <div className="bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium">
                    Last Payment: {formatDate(latestPayment.payment_date)}
                  </div>
                )}
              </div>
            </InfoCard>

            {/* Recent Payments */}
            <InfoCard
              title="Recent Payments"
              icon={<CreditCard size={20} />}
              titleColor="text-green-700"
            >
              {payments.length === 0 ? (
                <EmptyState
                  title="No payments yet"
                  subtitle="Wali lama diiwaan gelin wax lacag bixin ah ardaygan."
                  buttonText="Add Payment"
                  onClick={() => navigate(`/payments?studentId=${student.id}`)}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-3 text-sm font-semibold text-slate-600">
                          #
                        </th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-slate-600">
                          Amount
                        </th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-slate-600">
                          Date
                        </th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-slate-600">
                          Month
                        </th>
                        <th className="text-left py-3 px-3 text-sm font-semibold text-slate-600">
                          Method
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.slice(0, 8).map((payment, index) => (
                        <tr
                          key={payment.id || index}
                          className="border-b border-slate-100 hover:bg-slate-50"
                        >
                          <td className="py-3 px-3 font-medium text-slate-700">
                            {payment.id || index + 1}
                          </td>
                          <td className="py-3 px-3 font-semibold text-green-700">
                            {formatMoney(payment.amount)}
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {formatDate(payment.payment_date)}
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {payment.payment_month || "N/A"}
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {payment.method || "Cash"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </InfoCard>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Attendance Summary */}
            <InfoCard
              title="Attendance Summary"
              icon={<Calendar size={20} />}
              titleColor="text-purple-700"
            >
              <div className="space-y-4">
                <AttendanceRow
                  label="Present Days"
                  value={attendance.presentDays || 0}
                  color="green"
                />
                <AttendanceRow
                  label="Absent Days"
                  value={attendance.absentDays || 0}
                  color="red"
                />
                <AttendanceRow
                  label="Attendance Rate"
                  value={`${attendance.attendanceRate || 0}%`}
                  color="blue"
                />

                <div className="mt-4">
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Progress</span>
                    <span>{attendance.attendanceRate || 0}%</span>
                  </div>
                  <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          Math.max(attendance.attendanceRate || 0, 0),
                          100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </InfoCard>

            {/* Quick Actions */}
            <InfoCard
              title="Quick Actions"
              icon={<BadgeInfo size={20} />}
              titleColor="text-indigo-700"
            >
              <div className="grid grid-cols-1 gap-3">
                <ActionButton
                  label="Edit Student"
                  icon={<Pencil size={18} />}
                  color="amber"
                  onClick={() => navigate(`/students/edit/${student.id}`)}
                />

                <ActionButton
                  label="Open Payments"
                  icon={<CreditCard size={18} />}
                  color="green"
                  onClick={() => navigate(`/payments?studentId=${student.id}`)}
                />

                <ActionButton
                  label="Open Attendance"
                  icon={<Calendar size={18} />}
                  color="blue"
                  onClick={() => navigate(`/attendance?studentId=${student.id}`)}
                />

                <ActionButton
                  label="Back to Students"
                  icon={<ArrowLeft size={18} />}
                  color="slate"
                  onClick={() => navigate("/students")}
                />
              </div>
            </InfoCard>

            {/* Notes / System Tips */}
            <InfoCard
              title="Notes"
              icon={<BadgeInfo size={20} />}
              titleColor="text-slate-700"
            >
              <div className="space-y-3 text-sm text-slate-600">
                <p>
                  • Halkan mustaqbalka waxaad ku dari kartaa <b>student notes</b>.
                </p>
                <p>
                  • Waxaad kaloo ku dari kartaa <b>report card</b> iyo{" "}
                  <b>class history</b>.
                </p>
                <p>
                  • Haddii aad rabto, waxaan tallaabada xigta kuu sameyn karaa{" "}
                  <b>Payments gudaha page-kan</b> ama <b>Edit Student page</b>.
                </p>
              </div>
            </InfoCard>
          </div>
        </div>
      </div>
    </div>
  );
};

/* -------------------- UI Components -------------------- */

const Badge = ({ text, bg, textColor }) => (
  <span
    className={`${bg} ${textColor} px-3 py-1.5 rounded-full text-sm font-semibold border border-white/10`}
  >
    {text}
  </span>
);

const HeroMiniCard = ({ icon, label, value }) => (
  <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
    <div className="flex items-center gap-2 text-blue-100 text-sm mb-2">
      {icon}
      <span>{label}</span>
    </div>
    <div className="font-bold text-white text-lg">{value || "N/A"}</div>
  </div>
);

const SummaryCard = ({ title, value, subtitle, icon, color = "blue" }) => {
  const styles = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    amber: "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${styles[color]}`}>
          {icon}
        </div>
      </div>
      <h3 className="text-sm text-slate-500 font-medium">{title}</h3>
      <p className="text-2xl font-extrabold text-slate-800 mt-1">{value}</p>
      <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
    </div>
  );
};

const InfoCard = ({ title, icon, titleColor = "text-slate-800", children }) => (
  <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-5 md:p-6">
    <div className="flex items-center gap-3 mb-5">
      <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700">
        {icon}
      </div>
      <h2 className={`text-xl font-bold ${titleColor}`}>{title}</h2>
    </div>
    {children}
  </div>
);

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 border-b border-slate-100 pb-3 mb-3 last:mb-0 last:border-b-0 last:pb-0">
    <div className="text-slate-500 mt-0.5">{icon}</div>
    <div className="min-w-0">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="font-semibold text-slate-800 break-words">{value || "N/A"}</p>
    </div>
  </div>
);

const SmallFinanceCard = ({ label, value, bg, text }) => (
  <div className={`${bg} rounded-2xl p-4 border border-slate-100`}>
    <p className="text-sm text-slate-500">{label}</p>
    <p className={`text-xl font-bold mt-1 ${text}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const config = {
    Paid: "bg-green-100 text-green-700",
    Partial: "bg-amber-100 text-amber-700",
    Unpaid: "bg-red-100 text-red-700",
    "No Fee": "bg-slate-100 text-slate-700",
  };

  return (
    <span
      className={`px-4 py-2 rounded-full text-sm font-semibold ${
        config[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      Payment Status: {status}
    </span>
  );
};

const AttendanceRow = ({ label, value, color = "blue" }) => {
  const styles = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
      <span className="text-slate-700 font-medium">{label}</span>
      <span className={`px-3 py-1 rounded-full font-bold text-sm ${styles[color]}`}>
        {value}
      </span>
    </div>
  );
};

const ActionButton = ({ label, icon, onClick, color = "blue" }) => {
  const styles = {
    amber: "bg-amber-500 hover:bg-amber-600 text-white",
    green: "bg-green-600 hover:bg-green-700 text-white",
    blue: "bg-blue-700 hover:bg-blue-800 text-white",
    slate: "bg-slate-200 hover:bg-slate-300 text-slate-800",
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl font-semibold transition ${styles[color]}`}
    >
      {icon}
      {label}
    </button>
  );
};

const EmptyState = ({ title, subtitle, buttonText, onClick }) => (
  <div className="text-center py-8">
    <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-4">
      <CreditCard className="text-slate-500" size={28} />
    </div>
    <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
    <p className="text-slate-500 mb-5 max-w-md mx-auto">{subtitle}</p>
    <button
      onClick={onClick}
      className="bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-2xl font-semibold"
    >
      {buttonText}
    </button>
  </div>
);

export default StudentDetails;