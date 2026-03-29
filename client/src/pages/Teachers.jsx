import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Teachers = ({ editingId, onSuccess }) => {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        subject: 'Qur’aan',
        salary: '',
        hire_date: today
    });

    // MAR KASTA OO editingId ISBEDDELO, XOGTA SOO QAAD
    useEffect(() => {
        if (!editingId) return;

        const fetchTeacherDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/teachers/${editingId}`);
                const data = res.data;
                setFormData({
                    full_name: data.full_name,
                    phone: data.phone,
                    subject: data.subject,
                    salary: data.salary,
                    hire_date: data.hire_date ? data.hire_date.split('T')[0] : ''
                });
            } catch (err) {
                console.error("Xogta lama soo helin:", err);
            }
        };

        fetchTeacherDetail();
    }, [editingId]); // Kani waa fure (Trigger) muhiim ah

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                // UPDATE (Beddel)
                await axios.put(`http://localhost:5000/api/teachers/${editingId}`, formData);
                alert("✅ Isbeddelka waa la kaydiyay!");
            } else {
                // POST (Diiwaangeli)
                await axios.post('http://localhost:5000/api/teachers', formData);
                alert("✅ Macallin cusub waa la daray!");
            }
            onSuccess(); // Xir modal-ka dibna u raaci liiska (fetch)
        } catch (error) {
            console.error(error);
            alert("❌ Qalad ayaa dhacay!");
        }
    };

    return (
        <div className="text-right" dir="rtl">
            <h2 className="text-xl font-bold mb-4 text-[#1e3a8a] border-b pb-2">
                {editingId ? "✏️ Wax ka beddel xogta" : "➕ Diiwaangeli Macallin Cusub"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2 text-right">
                    <label className="block font-bold">الاسم الكامل (Magaca)</label>
                    <input type="text" value={formData.full_name} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                </div>
                <div>
                    <label className="block font-bold">رقم الهاتف (Taleefanka)</label>
                    <input type="text" value={formData.phone} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
                <div>
                    <label className="block font-bold">المادة (Maaddada)</label>
                    <input type="text" value={formData.subject} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, subject: e.target.value})} />
                </div>
                <div>
                    <label className="block font-bold">الراتب (Mushaarka)</label>
                    <input type="number" value={formData.salary} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, salary: e.target.value})} />
                </div>
                <div>
                    <label className="block font-bold">التاريخ (Taariikhda)</label>
                    <input type="date" value={formData.hire_date} className="w-full p-2 border rounded" onChange={e => setFormData({...formData, hire_date: e.target.value})} />
                </div>
                <button type="submit" className="col-span-2 bg-[#1e3a8a] text-white p-3 rounded-lg font-bold mt-4 hover:bg-[#c27803]">
                    {editingId ? "Cusboonaysii (Update)" : "Keydi (Save)"}
                </button>
            </form>
        </div>
    );
};

export default Teachers;