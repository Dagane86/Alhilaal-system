import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  BarChart3,
  Loader2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Wallet
} from 'lucide-react';

const API = 'http://localhost:5000';

const Reports = () => {
  const [payments, setPayments] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState({
    month: '',
    status: ''
  });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/api/admin/reports`);

      setPayments(res.data.payments || []);
      setExpenses(res.data.expenses || []);
      setSummary(res.data.summary || null);
    } catch (err) {
      console.error('Reports fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic month list from payments
  const uniqueMonths = useMemo(() => {
    const months = [...new Set(payments.map((p) => p.month_for).filter(Boolean))];
    return months;
  }, [payments]);

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const paymentStatus = p.payment_status || p.status || '';
      return (
        (!filter.month || p.month_for === filter.month) &&
        (!filter.status || paymentStatus.toLowerCase() === filter.status.toLowerCase())
      );
    });
  }, [payments, filter]);

  return (
    <div className="p-6 bg-slate-100 min-h-screen">
      {/* HEADER */}
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart3 className="text-blue-600" />
        Reports Dashboard
      </h1>

      {/* LOADING */}
      {loading ? (
        <div className="bg-white rounded-2xl shadow p-10 flex justify-center">
          <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        </div>
      ) : (
        <>
          {/* SUMMARY CARDS */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card
              title="Total Income"
              value={`$${Number(summary?.totalIncome || 0).toFixed(2)}`}
              icon={<DollarSign className="text-green-600" />}
            />
            <Card
              title="Total Expenses"
              value={`$${Number(summary?.totalExpenses || 0).toFixed(2)}`}
              icon={<TrendingDown className="text-red-600" />}
            />
            <Card
              title="Net Profit"
              value={`$${Number(summary?.netProfit || 0).toFixed(2)}`}
              icon={<TrendingUp className="text-blue-600" />}
            />
            <Card
              title="Today Income"
              value={`$${Number(summary?.todayIncome || 0).toFixed(2)}`}
              icon={<Wallet className="text-purple-600" />}
            />
          </div>

          {/* SECOND ROW */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <Card title="Paid" value={summary?.paidCount || 0} />
            <Card title="Partial / Debt" value={summary?.partialCount || 0} />
            <Card title="Expenses Records" value={summary?.totalExpenseRows || 0} />
          </div>

          {/* FILTER */}
          <div className="bg-white p-4 rounded-2xl shadow mb-6 flex gap-4 flex-wrap">
            <select
              className="p-2 rounded-lg border"
              value={filter.month}
              onChange={(e) => setFilter({ ...filter, month: e.target.value })}
            >
              <option value="">All Months</option>
              {uniqueMonths.map((month, index) => (
                <option key={index} value={month}>
                  {month}
                </option>
              ))}
            </select>

            <select
              className="p-2 rounded-lg border"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="paid">Paid</option>
              <option value="debt">Partial / Debt</option>
              <option value="unpaid">Unpaid</option>
            </select>
          </div>

          {/* PAYMENTS TABLE */}
          <div className="bg-white rounded-2xl shadow overflow-x-auto mb-8">
            <div className="p-4 border-b font-bold text-lg text-blue-700">
              Income / Payments Report
            </div>

            <table className="w-full text-sm">
              <thead className="bg-blue-600 text-white">
                <tr>
                  <th className="p-3 text-left">Parent</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Month</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Status</th>
                  <th className="p-3 text-left">Type</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((p, i) => {
                    const status = (p.payment_status || p.status || 'unpaid').toLowerCase();

                    return (
                      <tr key={p.id || i} className="border-b hover:bg-slate-50">
                        <td className="p-3">{p.parent_name || 'N/A'}</td>
                        <td className="p-3">{p.parent_phone || 'N/A'}</td>
                        <td className="p-3">{p.month_for || 'N/A'}</td>
                        <td className="p-3 font-bold text-green-700">
                          ${Number(p.amount_paid || 0).toFixed(2)}
                        </td>
                        <td className="p-3">
                          {p.payment_date
                            ? new Date(p.payment_date).toLocaleDateString()
                            : 'N/A'}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-1 rounded text-xs font-bold ${
                              status === 'paid'
                                ? 'bg-green-100 text-green-700'
                                : status === 'debt' || status === 'partial'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="p-3">{p.payment_type || 'monthly'}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="p-6 text-center text-gray-500">
                      No payment records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* EXPENSES TABLE */}
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <div className="p-4 border-b font-bold text-lg text-red-700">
              Expense Report
            </div>

            <table className="w-full text-sm">
              <thead className="bg-red-600 text-white">
                <tr>
                  <th className="p-3 text-left">Title</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Amount</th>
                  <th className="p-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {expenses.length > 0 ? (
                  expenses.map((e, i) => (
                    <tr key={e.id || i} className="border-b hover:bg-slate-50">
                      <td className="p-3">{e.title}</td>
                      <td className="p-3">{e.category || 'General'}</td>
                      <td className="p-3 font-bold text-red-700">
                        ${Number(e.amount || 0).toFixed(2)}
                      </td>
                      <td className="p-3">
                        {e.expense_date
                          ? new Date(e.expense_date).toLocaleDateString()
                          : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-6 text-center text-gray-500">
                      No expense records found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

// CARD COMPONENT
const Card = ({ title, value, icon }) => (
  <div className="bg-white p-5 rounded-2xl shadow flex items-center justify-between">
    <div>
      <p className="text-gray-400 text-sm">{title}</p>
      <h2 className="text-2xl font-bold text-slate-800">{value}</h2>
    </div>
    <div>{icon}</div>
  </div>
);

export default Reports;