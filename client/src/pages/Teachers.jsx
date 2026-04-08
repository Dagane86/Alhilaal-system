import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';

const Teachers = ({ editingId, onSuccess }) => {
    const today = new Date().toISOString().split('T')[0];
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        subject: 'Qur’aan',
        salary: '',
        hire_date: today,
        guarantor_name: '', // Optional
        guarantor_phone: '' // Optional
    });

    useEffect(() => {
        if (!editingId) return;
        const fetchTeacherDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/teachers/${editingId}`);
                const data = res.data;
                setFormData({
                    full_name: data.full_name || '',
                    phone: data.phone || '',
                    subject: data.subject || 'Qur’aan',
                    salary: data.salary || '',
                    hire_date: data.hire_date ? data.hire_date.split('T')[0] : '',
                    guarantor_name: data.guarantor_name || '',
                    guarantor_phone: data.guarantor_phone || ''
                });
            } catch (err) {
                console.error("Xogta lama soo helin:", err);
            }
        };
        fetchTeacherDetail();
    }, [editingId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/teachers/${editingId}`, formData);
                Swal.fire({ icon: 'success', title: 'Waa la cusboonaysiiyay!', timer: 1500, showConfirmButton: false });
            } else {
                await axios.post('http://localhost:5000/api/teachers', formData);
                Swal.fire({ icon: 'success', title: 'Macallin waa la daray!', timer: 1500, showConfirmButton: false });
            }
            onSuccess();
        } catch (error) {
            Swal.fire({ icon: 'error', title: 'Qalad ayaa dhacay!' });
        }
    };

    return (
        <div className="text-right p-2" dir="rtl">
            <h2 className="text-xl font-bold mb-4 text-[#1e3a8a] border-b-2 border-yellow-400 pb-2">
                {editingId ? "✏️ Wax ka beddel xogta" : "➕ Diiwaangeli Macallin Cusub"}
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block font-bold mb-1 text-gray-700 text-sm">الاسم الكامل (Magaca)</label>
                    <input type="text" value={formData.full_name} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                </div>
                
                <div>
                    <label className="block font-bold mb-1 text-gray-700 text-sm">رقم الهاتف (Taleefanka)</label>
                    <input type="text" value={formData.phone} className="w-full p-2 border rounded-lg outline-none" onChange={e => setFormData({...formData, phone: e.target.value})} required />
                </div>
                
                <div>
                    <label className="block font-bold mb-1 text-gray-700 text-sm">المادة (Maaddada)</label>
                    <input type="text" value={formData.subject} className="w-full p-2 border rounded-lg outline-none" onChange={e => setFormData({...formData, subject: e.target.value})} />
                </div>

                {/* --- Qaybta Damiinka (Guarantor Section) --- */}
                <div className="col-span-2 mt-2 p-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                    <p className="text-xs font-bold text-blue-800 mb-3 underline">معلومات الضامن (Xogta Damiinka - Optional)</p>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block font-bold mb-1 text-gray-600 text-xs">اسم الضامن (Damiinka)</label>
                            <input type="text" value={formData.guarantor_name} className="w-full p-2 border rounded bg-white" onChange={e => setFormData({...formData, guarantor_name: e.target.value})} />
                        </div>
                        <div>
                            <label className="block font-bold mb-1 text-gray-600 text-xs">هاتف الضامن (Tel Damiinka)</label>
                            <input type="text" value={formData.guarantor_phone} className="w-full p-2 border rounded bg-white" onChange={e => setFormData({...formData, guarantor_phone: e.target.value})} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block font-bold mb-1 text-gray-700 text-sm">الراتب (Mushaarka)</label>
                    <input type="number" value={formData.salary} className="w-full p-2 border rounded-lg outline-none" onChange={e => setFormData({...formData, salary: e.target.value})} />
                </div>
                
                <div>
                    <label className="block font-bold mb-1 text-gray-700 text-sm">التاريخ (Taariikhda)</label>
                    <input type="date" value={formData.hire_date} className="w-full p-2 border rounded-lg outline-none" onChange={e => setFormData({...formData, hire_date: e.target.value})} />
                </div>

                <button type="submit" className="col-span-2 bg-[#1e3a8a] text-white p-3 rounded-xl font-bold mt-2 hover:bg-yellow-600 transition-all shadow-md">
                    {editingId ? "Cusboonaysii (Update)" : "Keydi (Save)"}
                </button>
            </form>
        </div>
    );
};

export default Teachers;