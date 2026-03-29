import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Teachers from './Teachers'; // Hubi in magacu sax yahay

const TeacherList = () => {
    const [teachers, setTeachers] = useState([]);
    const [showModal, setShowModal] = useState(false); 
    const [editId, setEditId] = useState(null);

    const fetchTeachers = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/teachers');
            setTeachers(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => {
        const loadTeachers = async () => {
            await fetchTeachers();
        };
        loadTeachers();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm("Ma hubtaa inaad tirtirto?")) {
            try {
                await axios.delete(`http://localhost:5000/api/teachers/${id}`);
                fetchTeachers();
            } catch (err) {
                console.error(err);
                alert("Qalad ayaa dhacay!");
            }
        }
    };

    const handleEdit = (id) => {
        setEditId(id);
        setShowModal(true); 
    };

    return (
        <div className="p-6 font-arabic text-right" dir="rtl">
            {/* Qaybta Sare iyo Badhanka Pop-up-ka */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#1e3a8a] border-r-4 border-[#c27803] pr-3">إدارة المعلمين</h2>
                <button 
                    onClick={() => { setEditId(null); setShowModal(true); }} 
                    className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg shadow-lg hover:bg-[#c27803] transition-all transform hover:scale-105"
                >
                    + إضافة معلم جديد (Ku dar Macallin)
                </button>
            </div>

            {/* Modal-ka Pop-up-ka */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-300">
                        <button 
                            onClick={() => setShowModal(false)} 
                            className="absolute top-4 left-4 text-2xl text-gray-400 hover:text-red-500 transition-colors"
                        >
                            ✖
                        </button>
                        <div className="p-8">
                            <Teachers 
                                key={editId || 'new'}
                                editingId={editId} 
                                onSuccess={() => { 
                                    setShowModal(false); 
                                    fetchTeachers(); 
                                }} 
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Table-ka oo leh Edit iyo Delete */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <table className="w-full text-center border-collapse">
                    <thead className="bg-gray-50 text-[#1e3a8a]">
                        <tr>
                            <th className="p-4 border-b">الاسم</th>
                            <th className="p-4 border-b">الهاتف</th>
                            <th className="p-4 border-b">المادة</th>
                            <th className="p-4 border-b">الراتb</th>
                            <th className="p-4 border-b">الإجراءات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {teachers.map(t => (
                            <tr key={t.teacher_id} className="border-b hover:bg-blue-50/30 transition-colors">
                                <td className="p-3 font-bold text-gray-800">{t.full_name}</td>
                                <td className="p-3 text-gray-600">{t.phone}</td>
                                <td className="p-3 italic text-blue-600">{t.subject}</td>
                                <td className="p-3 font-mono text-green-600">${t.salary}</td>
                                <td className="p-3 flex justify-center gap-2">
                                    <button 
                                        onClick={() => handleEdit(t.teacher_id)} 
                                        className="bg-blue-100 text-blue-600 px-4 py-1.5 rounded-md hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(t.teacher_id)} 
                                        className="bg-red-100 text-red-600 px-4 py-1.5 rounded-md hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TeacherList;