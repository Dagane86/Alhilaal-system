import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Students from './Students'; 

const StudentList = () => {
    const [students, setStudents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);

    // 1. Soo qaado xogta ardayda
    const fetchStudents = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/students');
            setStudents(res.data);
        } catch (err) {
            console.error("Khalad ayaa dhacay:", err);
        }
    };

    useEffect(() => {
        const load = async () => {
            await fetchStudents();
        };
        load();
    }, []);

    // 2. Tirtirista ardayga
    const handleDelete = async (id) => {
        if (window.confirm("Ma hubtaa inaad tirtirto ardaygan?")) {
            try {
                await axios.delete(`http://localhost:5000/api/students/${id}`);
                fetchStudents();
            } catch (err) {
                console.error(err);
                alert("Wuu diiday inuu tirtiro!");
            }
        }
    };

    // 3. Furitaanka Pop-up-ka Edit-ka
    const handleEdit = (id) => {
        setEditId(id);
        setShowModal(true);
    };

    return (
        <div className="p-6 font-arabic text-right" dir="rtl">
            {/* Qaybta Sare */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#1e3a8a] border-r-4 border-[#c27803] pr-3">إدارة الطلاب (Maamulka Ardayda)</h2>
                <button 
                    onClick={() => { setEditId(null); setShowModal(true); }} 
                    className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg shadow-lg hover:bg-[#c27803] transition-all transform hover:scale-105 font-bold"
                >
                    + إضافة طالب جديد
                </button>
            </div>

            {/* Modal-ka Pop-up-ka ah */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[90vh] relative">
                        <button 
                            onClick={() => setShowModal(false)} 
                            className="absolute top-4 left-4 text-2xl text-gray-400 hover:text-red-500 z-10"
                        >
                            ✖
                        </button>
                        <Students 
                            key={editId || 'new'}
                            editingId={editId} 
                            onSuccess={() => {
                                setShowModal(false);
                                fetchStudents();
                            }} 
                        />
                    </div>
                </div>
            )}

            {/* Jadwalka (Table) */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-center border-collapse">
                        <thead className="bg-gray-50 text-[#1e3a8a]">
                            <tr>
                                <th className="p-4 border-b text-right">اسم الطالب</th>
                                <th className="p-4 border-b">الجنس (Jinsi)</th>
                                <th className="p-4 border-b">ولي الأمر</th>
                                <th className="p-4 border-b">رقم الهاتف</th>
                                <th className="p-4 border-b">المستوى</th>
                                <th className="p-4 border-b">الفترة</th>
                                <th className="p-4 border-b">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((s) => (
                                <tr key={s.student_id} className="border-b hover:bg-blue-50/50 transition-colors">
                                    <td className="p-3 font-bold text-gray-800 text-right">{s.full_name}</td>
                                    
                                    {/* Jinsiga */}
                                    <td className="p-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                            {s.gender === 'Male' ? 'ذكر' : 'أنثى'}
                                        </span>
                                    </td>

                                    <td className="p-3 text-gray-600 text-right">{s.parent_name}</td>
                                    
                                    {/* Numberka Waalidka */}
                                    <td className="p-3 text-gray-700 font-mono">{s.parent_phone}</td>

                                    <td className="p-3 text-blue-600 font-medium">{s.level}</td>
                                    
                                    <td className="p-3">
                                        <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-sm">
                                            {s.shift === 'Morning' ? 'صباحي' : s.shift === 'Afternoon' ? 'ظهري' : s.shift === 'Evening' ? 'مسائي' : 'كل ساعة'}
                                        </span>
                                    </td>

                                    <td className="p-3 flex justify-center gap-2">
                                        <button 
                                            onClick={() => handleEdit(s.student_id)} 
                                            className="bg-blue-100 text-blue-600 px-3 py-1 rounded-md hover:bg-blue-600 hover:text-white transition-all font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(s.student_id)} 
                                            className="bg-red-100 text-red-600 px-3 py-1 rounded-md hover:bg-red-600 hover:text-white transition-all font-medium"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {students.length === 0 && (
                    <div className="p-10 text-center text-gray-400 italic">Ma jiraan arday la diiwaangeliyay...</div>
                )}
            </div>
        </div>
    );
};

export default StudentList;