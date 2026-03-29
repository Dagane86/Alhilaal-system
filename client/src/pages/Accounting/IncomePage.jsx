import React, { useState, useMemo } from "react";
import {
  Search,
  Loader2,
  History,
  Wallet,
  Users,
  Calendar,
  User,
  Phone,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import axios from "axios";

const IncomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [familyData, setFamilyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [amountPaid, setAmountPaid] = useState("");
  const [notes, setNotes] = useState("");
  const [monthFor, setMonthFor] = useState(
    new Date().toLocaleString("default", { month: "long", year: "numeric" })
  );

  const API_URL = "http://localhost:5000/api";

  const today = new Date().toLocaleDateString();
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  const getStatusMeta = (status) => {
    switch (status) {
      case "paid":
        return {
          label: "Bashay",
          color: "bg-green-100 text-green-700 border-green-200",
          icon: <CheckCircle size={14} />,
        };

      case "debt_paid":
        return {
          label: "Deyn La Bixiyay",
          color: "bg-emerald-100 text-emerald-700 border-emerald-200",
          icon: <CheckCircle size={14} />,
        };

      case "partial":
        return {
          label: "Qayb / Deyn",
          color: "bg-orange-100 text-orange-700 border-orange-200",
          icon: <AlertTriangle size={14} />,
        };

      default:
        return {
          label: "Aan bixin",
          color: "bg-red-100 text-red-700 border-red-200",
          icon: <Clock size={14} />,
        };
    }
  };

  // ===============================
  // CALCULATIONS
  // ===============================
  const stats = useMemo(() => {
    if (!familyData) {
      return {
        totalFee: 0,
        debt: 0,
        grandTotal: 0,
        paid: 0,
        balance: 0,
        status: "unpaid",
      };
    }

    const totalFee =
      familyData.students?.reduce(
        (sum, s) => sum + (Number(s.monthly_fee) || 0),
        0
      ) || 0;

    const oldDebt = Number(familyData.previous_debt) || 0;
    const paid = Number(amountPaid) || 0;

    // haddii current month la qorayo oo bishaas hore payment jiro
    const selectedMonthHistory =
      familyData.history?.filter((h) => h.month === monthFor) || [];

    const alreadyPaidForSelectedMonth = selectedMonthHistory.reduce(
      (sum, h) => sum + (Number(h.total_paid) || 0),
      0
    );

    let grandTotal = totalFee + oldDebt;

    // haddii isla bishaas payment hore jiro -> kaliya haraaga bishaas
    if (selectedMonthHistory.length > 0) {
      grandTotal = Math.max(totalFee - alreadyPaidForSelectedMonth, 0);
    }

    const balance = Math.max(grandTotal - paid, 0);

    let status = "unpaid";
    if (paid >= grandTotal && grandTotal > 0) {
      status = selectedMonthHistory.length > 0 ? "debt_paid" : "paid";
    } else if (paid > 0 && paid < grandTotal) {
      status = "partial";
    } else {
      status = familyData.current_month_status || "unpaid";
    }

    return {
      totalFee,
      debt: oldDebt,
      grandTotal,
      paid,
      balance,
      status,
      alreadyPaidForSelectedMonth,
      selectedMonthHistory,
    };
  }, [familyData, amountPaid, monthFor]);

  // ===============================
  // SEARCH FAMILY
  // ===============================
  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      alert("Fadlan geli lambarka waalidka.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/family-status/${searchTerm.trim()}`);
      setFamilyData(res.data);
      setAmountPaid("");
      setNotes("");
      setMonthFor(currentMonth);
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.message || "Waalid lama helin!");
      setFamilyData(null);
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // SAVE PAYMENT
  // ===============================
  const handleSave = async () => {
    if (!familyData) return;

    const paid = Number(amountPaid);

    if (isNaN(paid) || paid <= 0) {
      alert("Fadlan geli lacag sax ah oo ka weyn 0.");
      return;
    }

    if (stats.grandTotal <= 0) {
      alert("Bishan hore ayaa si buuxda loo bixiyay. Wax haraaga ma jiro.");
      return;
    }

    if (paid > stats.grandTotal) {
      alert(
        `Lacagta aad gelisay ($${paid}) waxay ka badan tahay haraaga la rabo ($${stats.grandTotal.toFixed(
          2
        )}).`
      );
      return;
    }

    setSubmitting(true);

    try {
      const res = await axios.post(`${API_URL}/family-payment`, {
        parent_phone: familyData.parent_phone,
        amount_paid: paid,
        month_for: monthFor,
        notes,
        receipt_number: `REC-${Date.now()}`,
      });

      alert(
        `${res.data.message}\nStatus: ${
          getStatusMeta(res.data.summary.payment_status).label
        }`
      );

      await handleSearch();
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || "Khalad ayaa dhacay xiliga keydinta.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentStatus = getStatusMeta(stats.status);

  return (
    <div className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-800">School Fee Income</h1>
            <p className="text-slate-500 font-medium">Family payment management system</p>
          </div>

          <div className="bg-white px-4 py-3 rounded-xl shadow-sm text-sm flex items-center gap-2 font-semibold border border-slate-200">
            <Calendar size={16} className="text-blue-600" />
            {today}
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-3 border border-slate-200">
          <input
            className="flex-1 p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Gali lambarka waalidka..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : (
              <>
                <Search size={20} /> Raadi
              </>
            )}
          </button>
        </div>

        {familyData ? (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-6">
              {/* PARENT INFO */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-800">
                      <User size={18} className="text-blue-600" />
                      <h2 className="text-2xl font-black">{familyData.parent_name}</h2>
                    </div>

                    <div className="flex items-center gap-2 text-slate-500 font-medium">
                      <Phone size={16} />
                      {familyData.parent_phone}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold">
                      {familyData.students.length} Arday
                    </div>

                    <div
                      className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${currentStatus.color}`}
                    >
                      {currentStatus.icon}
                      {currentStatus.label}
                    </div>
                  </div>
                </div>
              </div>

              {/* STUDENT LIST */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex justify-between items-center">
                  <h2 className="font-bold text-slate-700 flex items-center gap-2">
                    <Users size={18} /> Magacyada Ardayda
                  </h2>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Lacagta Bishii
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {familyData.students.map((student) => (
                    <div
                      key={student.id}
                      className="flex justify-between items-center p-5 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-slate-800 font-bold text-lg">
                        {student.name}
                      </span>
                      <span className="text-xl font-black text-slate-900">
                        ${Number(student.monthly_fee).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* SUMMARY */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm text-center">
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">
                    Kharashka Bishan
                  </p>
                  <h3 className="text-2xl font-black text-blue-600">
                    ${stats.totalFee.toFixed(2)}
                  </h3>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm text-center">
                  <p className="text-slate-500 text-xs font-bold uppercase mb-1">
                    Deyn Hore
                  </p>
                  <h3 className="text-2xl font-black text-orange-600">
                    ${stats.debt.toFixed(2)}
                  </h3>
                </div>

                <div className="bg-slate-800 p-5 rounded-2xl shadow-sm text-center">
                  <p className="text-slate-300 text-xs font-bold uppercase mb-1">
                    Wadarta La Rabo
                  </p>
                  <h3 className="text-2xl font-black text-white">
                    ${stats.grandTotal.toFixed(2)}
                  </h3>
                </div>

                <div className="bg-green-600 p-5 rounded-2xl shadow-sm text-center">
                  <p className="text-green-100 text-xs font-bold uppercase mb-1">
                    Hadda La Bixinayo
                  </p>
                  <h3 className="text-2xl font-black text-white">
                    ${stats.paid.toFixed(2)}
                  </h3>
                </div>
              </div>

              {/* PAYMENT FORM */}
              <div className="bg-white p-8 rounded-2xl shadow-md border-t-4 border-t-green-500 space-y-5">
                <div className="flex justify-between items-center flex-wrap gap-3">
                  <h2 className="text-xl font-black text-slate-800">Diiwaangali Lacagta</h2>

                  <div
                    className={`px-4 py-2 rounded-xl text-sm font-bold border flex items-center gap-2 ${currentStatus.color}`}
                  >
                    {currentStatus.icon}
                    Status: {currentStatus.label}
                  </div>
                </div>

                {stats.selectedMonthHistory.length > 0 && stats.grandTotal > 0 && (
                  <div className="p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-700 font-bold">
                    ⚠️ Bishan ({monthFor}) hore qayb ayaa looga bixiyay. Hadda waxaad
                    dhammeystiraysaa deynta haray.
                  </div>
                )}

                {stats.grandTotal === 0 && (
                  <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 font-bold">
                    ✅ Bishan ({monthFor}) si buuxda ayaa loo bixiyay. Wax haraaga ma jiro.
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">
                      Lacagta la bixiyay
                    </label>
                    <input
                      type="number"
                      className="w-full p-4 border-2 rounded-xl text-xl font-bold focus:border-green-500 outline-none"
                      placeholder="0.00"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-600">Bisha</label>
                    <input
                      type="text"
                      className="w-full p-4 border-2 rounded-xl font-bold focus:border-green-500 outline-none"
                      value={monthFor}
                      onChange={(e) => setMonthFor(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-600">
                    Faahfaahin / Notes
                  </label>
                  <textarea
                    rows="3"
                    className="w-full p-4 border-2 rounded-xl focus:border-green-500 outline-none"
                    placeholder="Qoraal dheeraad ah (optional)..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-between items-center p-4 bg-red-50 rounded-xl border border-red-100">
                  <span className="font-bold text-red-800 text-lg">Haraaga (Balance):</span>
                  <span className="text-2xl font-black text-red-600">
                    ${stats.balance.toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleSave}
                  disabled={submitting || stats.grandTotal === 0}
                  className={`text-white w-full py-5 rounded-xl font-black text-xl shadow-lg transition-all transform active:scale-95 flex justify-center items-center ${
                    stats.grandTotal === 0
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  {submitting ? (
                    <Loader2 className="animate-spin text-white" />
                  ) : (
                    "KEYDI LACAGTA"
                  )}
                </button>
              </div>
            </div>

            {/* RIGHT SIDE: HISTORY */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 h-fit">
              <div className="p-4 border-b flex items-center gap-2 font-bold text-slate-700 bg-slate-50">
                <History size={18} className="text-orange-500" />
                Taariikhda Lacagaha
              </div>

              <div className="p-4 space-y-4 max-h-[650px] overflow-y-auto">
                {familyData.history && familyData.history.length > 0 ? (
                  familyData.history.map((h) => {
                    const statusMeta = getStatusMeta(h.payment_status);

                    return (
                      <div
                        key={h.id}
                        className="bg-slate-50 p-4 rounded-xl border border-slate-100 relative overflow-hidden"
                      >
                        <div
                          className={`absolute left-0 top-0 bottom-0 w-1 ${
                            h.payment_status === "paid" || h.payment_status === "debt_paid"
                              ? "bg-green-500"
                              : h.payment_status === "partial"
                              ? "bg-orange-500"
                              : "bg-red-500"
                          }`}
                        ></div>

                        <div className="flex justify-between items-start gap-3">
                          <p className="font-black text-slate-800">{h.month}</p>

                          <div
                            className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${statusMeta.color}`}
                          >
                            {statusMeta.icon}
                            {statusMeta.label}
                          </div>
                        </div>

                        <div className="flex justify-between mt-2 text-sm">
                          <span className="font-bold text-green-600">
                            Paid: ${Number(h.total_paid).toFixed(2)}
                          </span>
                        </div>

                        <div className="mt-2 text-xs text-slate-500 space-y-1">
                          <p>Type: {h.payment_type || "monthly"}</p>
                          <p>Receipt: {h.receipt_number || "N/A"}</p>
                          <p>{new Date(h.date).toLocaleString()}</p>
                          <p>Debt Before: ${Number(h.debt_before || 0).toFixed(2)}</p>
                          <p>Debt After: ${Number(h.debt_after || 0).toFixed(2)}</p>
                          {h.notes && <p className="italic">{h.notes}</p>}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-400 py-10">Taariikh hore lama hayo</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* EMPTY STATE */
          <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-slate-200">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Wallet size={48} className="text-slate-300" />
            </div>
            <h2 className="text-2xl font-bold text-slate-400">
              Fadlan raadi waalid si aad lacag uga qabato
            </h2>
            <p className="text-slate-400 mt-2">
              Gali lambarka telefoonka waalidka ee kor ku yaal
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomePage;