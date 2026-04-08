import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Students from './Students';
import { ToastContainer, toast } from 'react-toastify';

const StudentList = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch students
    const fetchStudents = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/students');
            setStudents(res.data);
        } catch (err) {
            console.error(err);
            toast.error("خطأ في جلب بيانات الطلاب!");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
    }, []);

    // Delete student
    const handleDelete = async (id) => {
        if (window.confirm("هل أنت متأكد من حذف هذا الطالب؟")) {
            try {
                await axios.delete(`http://localhost:5000/api/students/${id}`);
                toast.success("تم حذف الطالب بنجاح!");
                fetchStudents();
            } catch (err) {
                console.error(err);
                toast.error("فشل حذف الطالب!");
            }
        }
    };

    // Edit student
    const handleEdit = (id) => {
        setEditId(id);
        setShowModal(true);
    };

    // Filter students
    const filteredStudents = students.filter(
        s => s.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             s.parent_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 font-arabic text-right" dir="rtl">
            <ToastContainer position="top-right" autoClose={3000} />

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-[#1e3a8a] border-r-4 border-[#c27803] pr-3">
                    إدارة الطلاب (Maamulka Ardayda)
                </h2>
                <button
                    onClick={() => { setEditId(null); setShowModal(true); }}
                    className="bg-[#1e3a8a] text-white px-6 py-2 rounded-lg shadow-lg hover:bg-[#c27803] transition-all transform hover:scale-105 font-bold"
                >
                    + إضافة طالب جديد
                </button>
            </div>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="ابحث عن طالب..."
                    className="w-full sm:w-1/3 p-2 border rounded-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-y-auto max-h-[90vh] relative animate-slideIn">
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

            {/* Loader */}
            {loading && (
                <div className="p-10 text-center text-gray-500 italic">جاري التحميل...</div>
            )}

            {/* Students Table / Cards */}
            {!loading && filteredStudents.length > 0 && (
                <div className="hidden lg:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                    <div className="overflow-x-auto">
                        <table className="w-full text-center border-collapse">
                            <thead className="bg-gray-50 text-[#1e3a8a]">
                                <tr>
                                    <th className="p-4 border-b text-right">رقم الطالب</th>
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
                                {filteredStudents.map(s => (
                                    <tr key={s.student_id} className="border-b hover:bg-blue-50/50 transition-colors">
                                        <td className="p-3 text-blue-600 font-mono font-bold">#{s.student_id}</td>
                                        <td className="p-3 font-bold text-gray-800 text-right">{s.full_name}</td>
                                        <td className="p-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.gender === 'Male' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                                {s.gender === 'Male' ? 'ذكر' : 'أنثى'}
                                            </span>
                                        </td>
                                        <td className="p-3 text-gray-600 text-right">{s.parent_name}</td>
                                        <td className="p-3 text-gray-700 font-mono">{s.parent_phone}</td>
                                        <td className="p-3 text-blue-600 font-medium">{s.level}</td>
                                        <td className="p-3">
                                            <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-sm">
                                                {s.shift === 'Morning' ? 'صباحي' : s.shift === 'Afternoon' ? 'ظهري' : s.shift === 'Evening' ? 'مسائي' : 'كل ساعة'}
                                            </span>
                                        </td>
                                        <td className="p-3 flex justify-center gap-2">
                                            <button
                                                onClick={() => navigate(`/students/${s.student_id}`)}
                                                className="bg-green-100 text-green-600 px-3 py-1 rounded-md hover:bg-green-600 hover:text-white transition-all font-medium"
                                            >
                                                View
                                            </button>
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
                </div>
            )}

            {/* Card view mobile */}
            {!loading && filteredStudents.length > 0 && (
                <div className="grid lg:hidden gap-4">
                    {filteredStudents.map(s => (
                        <div key={s.student_id} className="bg-white shadow-md rounded-lg p-4 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h3 className="text-lg font-bold text-right">{s.full_name}</h3>
                                <span className="text-blue-600 font-mono font-bold text-sm">#{s.student_id}</span>
                            </div>
                            <p className="text-right text-gray-600">ولي الأمر: {s.parent_name}</p>
                            <p className="text-right text-gray-600">رقم الهاتف: {s.parent_phone}</p>
                            <p className="text-right text-blue-600">المستوى: {s.level}</p>
                            <span className="text-orange-600 bg-orange-50 px-2 py-1 rounded text-sm">
                                {s.shift === 'Morning' ? 'صباحي' : s.shift === 'Afternoon' ? 'ظهري' : s.shift === 'Evening' ? 'مسائي' : 'كل ساعة'}
                            </span>
                            <div className="flex justify-center gap-2 mt-2">
                                <button
                                    onClick={() => navigate(`/students/${s.student_id}`)}
                                    className="bg-green-100 text-green-600 px-3 py-1 rounded-md hover:bg-green-600 hover:text-white transition-all font-medium"
                                >
                                    View
                                </button>
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
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredStudents.length === 0 && (
                <div className="p-10 text-center text-gray-400 italic">لا يوجد طلاب مسجلين...</div>
            )}
        </div>
    );
};

export default StudentList;