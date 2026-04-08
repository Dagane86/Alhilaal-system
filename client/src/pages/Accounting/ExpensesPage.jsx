import React, { useState, useEffect } from 'react';
import { Wallet, PlusCircle, Trash2, Calendar, Tag, DollarSign } from 'lucide-react';
import axios from 'axios';

const ExpensesPage = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);
    
    // Form State
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'Agabka Dugsiga',
        notes: ''
    });

    // Soo aqri xogta kharashyada
    const fetchExpenses = async () => {
        try {
            const res = await axios.get('https://al-hilaal-vercel-server.vercel.app/api/expenses');
            setExpenses(res.data);
        } catch (err) {
            console.error("Error fetching expenses:", err);
        }
    };

    useEffect(() => {
        fetchExpenses();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || !formData.amount) return alert("Fadlan buuxi meelaha muhiimka ah!");

        try {
            setLoading(true);
            await axios.post('https://al-hilaal-vercel-server.vercel.app/api/expenses', formData);
            setFormData({ title: '', amount: '', category: 'Agabka Dugsiga', notes: '' });
            fetchExpenses(); // Cusbooneysii miiska
            alert("Kharashka waa la keydiyey!");
        } catch (err) {
            alert("Cilad baa dhacday!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-[#0f172a] min-h-screen text-white" dir="rtl">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold flex items-center gap-3">
                    Maamulka Kharashyada <Wallet className="text-red-400" />
                </h1>
                <div className="text-sm bg-red-900/30 border border-red-500/50 px-4 py-2 rounded-lg">
                    Wadarta Kharashka: <span className="font-bold text-red-400">
                        ${expenses.reduce((acc, curr) => acc + Number(curr.amount), 0).toFixed(2)}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. Form-ka Diiwaangelinta (Dhinaca Midig) */}
                <div className="bg-white text-black p-6 rounded-2xl shadow-xl h-fit">
                    <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-800">
                        Diiwaangeli Kharash <PlusCircle size={20} className="text-blue-600" />
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Magaca Kharashka*</label>
                            <input 
                                type="text"
                                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder=" tusaale: Koronto, Dayactir..."
                                value={formData.title}
                                onChange={(e) => setFormData({...formData, title: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Cadadka Lacagta ($)*</label>
                            <input 
                                type="number"
                                className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nooca (Category)</label>
                            <select 
                                className="w-full p-3 border rounded-lg bg-gray-50 outline-none"
                                value={formData.category}
                                onChange={(e) => setFormData({...formData, category: e.target.value})}
                            >
                                <option>Agabka Dugsiga</option>
                                <option>Mushaaraadka</option>
                                <option>Adeegyada (Biyo/Layr)</option>
                                <option>Dayactir</option>
                                <option>Kale</option>
                            </select>
                        </div>
                        <button 
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition mt-4"
                        >
                            {loading ? 'Diiwaangelinaya...' : 'Keydi Kharashka'}
                        </button>
                    </form>
                </div>

                {/* 2. Miiska Kharashyada (Dhinaca Bidix) */}
                <div className="lg:col-span-2 bg-white text-black p-6 rounded-2xl shadow-xl">
                    <h2 className="text-lg font-bold mb-6 text-gray-800 border-r-4 border-red-500 pr-3">
                        Liiska Kharashyada Baxay
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-right">
                            <thead>
                                <tr className="bg-gray-100 border-b">
                                    <th className="p-3">Taariikhda</th>
                                    <th className="p-3">Kharashka</th>
                                    <th className="p-3">Nooca</th>
                                    <th className="p-3">Lacagta</th>
                                    <th className="p-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((exp) => (
                                    <tr key={exp.id} className="border-b hover:bg-gray-50 transition text-sm">
                                        <td className="p-3 flex items-center gap-2 text-gray-500">
                                            <Calendar size={14} /> {new Date(exp.expense_date).toLocaleDateString()}
                                        </td>
                                        <td className="p-3 font-bold">{exp.title}</td>
                                        <td className="p-3">
                                            <span className="bg-gray-200 px-2 py-1 rounded text-xs">{exp.category}</span>
                                        </td>
                                        <td className="p-3 font-bold text-red-600">${Number(exp.amount).toFixed(2)}</td>
                                        <td className="p-3 text-center">
                                            <button className="text-red-400 hover:text-red-600">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {expenses.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="p-10 text-center text-gray-400">
                                            Ma jiraan kharashyo weli la diiwaangeliyey.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ExpensesPage;