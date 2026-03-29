import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Students = ({ editingId, onSuccess }) => {
    const API_URL = 'http://localhost:5000/api';
    const today = new Date().toISOString().split('T')[0];

    // State-ka lagu kaydinayo fasallada ka imaanaya DB
    const [classes, setClasses] = useState([]);
    const [selectedClassId, setSelectedClassId] = useState('');

    const [formData, setFormData] = useState({
        full_name: '', 
        registration_date: today, 
        gender: 'Male', 
        parent_name: '', 
        relation: 'Father',
        parent_phone: '', 
        level: '', // Tani waxay hadda noqonaysaa Class Name-ka la doorto
        shift: 'Morning', 
        monthly_fee: ''
    });

    // 1. Soo qaado liiska fasallada markii bogga la furo
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/classes');
                setClasses(res.data);
            } catch (err) {
                console.error("Fasallada lama soo saari karo:", err);
            }
        };
        fetchClasses();
    }, []);

    // 2. Marka Edit la taabto, soo qaado xogta ardayga
    useEffect(() => {
        if (!editingId) return;

        const fetchStudentDetail = async () => {
            try {
                const res = await axios.get(`http://localhost:5000/api/students/${editingId}`);
                const s = res.data;
                setFormData({
                    full_name: s.full_name || '',
                    registration_date: s.registration_date ? s.registration_date.split('T')[0] : today,
                    gender: s.gender || 'Male',
                    parent_name: s.parent_name || '',
                    relation: s.relation || 'Father',
                    parent_phone: s.parent_phone || '',
                    level: s.level || '',
                    shift: s.shift || 'Morning',
                    monthly_fee: s.monthly_fee || ''
                });
            } catch (err) {
                console.error("Error fetching student:", err);
            }
        };
        fetchStudentDetail();
    }, [editingId, today]);

    const selectedClassInfo = classes.find(c =>
        (c.class_id === parseInt(selectedClassId)) || (c.id === parseInt(selectedClassId))
    );

    const handleSubmit = async (e) => {
        e.preventDefault();
        const dataToSubmit = {
            ...formData,
            monthly_fee: formData.monthly_fee === '' ? 0 : parseFloat(formData.monthly_fee),
            class_id: selectedClassId || null
        };

        try {
            if (editingId) {
                await axios.put(`http://localhost:5000/api/students/${editingId}`, dataToSubmit);
                alert("✅ Xogta ardayga waa la cusboonaysiiyay!");
            } else {
                const res = await axios.post('http://localhost:5000/api/students', dataToSubmit);
                alert("✅ " + res.data.message);
            }

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error(error);
            alert("❌ Qalad: " + (error.response?.data?.error || "Server Error"));
        }
    };

    return (
        <div className="p-8 font-arabic text-right" dir="rtl">
            <h1 className="text-2xl font-bold text-[#1e3a8a] mb-6 border-r-4 border-[#c27803] pr-3">
                {editingId ? "تعديل بيانات الطالب" : "تسجيل طالب جديد"}
            </h1>
            
            <form onSubmit={handleSubmit} className="bg-white grid grid-cols-2 gap-5 text-sm">
                
                <div className="col-span-2">
                    <label className="block mb-1 font-bold text-gray-600 italic">الاسم الكامل (Magaca Buuxa)</label>
                    <input type="text" value={formData.full_name} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, full_name: e.target.value})} required />
                </div>

                {/* --- QAYBTA FASALKA (LEVEL) OO DYNAMIC AH --- */}
                <div className="col-span-2 md:col-span-1">
                    <label className="block mb-1 font-bold text-gray-600 italic">الفصل / المستوى (Fasalka)</label>
                    <select
                        value={selectedClassId}
                        className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 bg-yellow-50"
                        onChange={e => {
                            const classId = e.target.value;
                            setSelectedClassId(classId);
                            const chosen = classes.find(c => (c.class_id === parseInt(classId)) || (c.id === parseInt(classId)));
                            if (chosen) {
                                setFormData({
                                    ...formData,
                                    level: chosen.class_name,
                                    shift: chosen.shift || 'Morning'
                                });
                            }
                        }}
                        required
                    >
                        <option value="">-- اختر الفصل (Dooro Fasalka) --</option>
                        {classes.map((cls) => (
                            <option key={cls.class_id || cls.id} value={cls.class_id || cls.id}>
                                {cls.class_name} - {cls.teacher_name ? `Macallin: ${cls.teacher_name}` : '⚠️ Macallin lama qoondeyn'}
                            </option>
                        ))}
                    </select>
                    {selectedClassInfo && (
                        <p className="mt-2 text-sm text-gray-600">
                            Waxaa la doortay: <strong>{selectedClassInfo.class_name}</strong> (Macallin: {selectedClassInfo.teacher_name || 'Lama meeleyn'})
                        </p>
                    )}
                </div>

                <div>
                    <label className="block mb-1 font-bold text-gray-600 italic">الجنس (Jinsiga)</label>
                    <select value={formData.gender} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, gender: e.target.value})}>
                        <option value="Male">ذكر (Wiil)</option>
                        <option value="Female">أنثى (Gabdho)</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 font-bold text-gray-600 italic">اسم ولي الأمر</label>
                    <input type="text" value={formData.parent_name} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, parent_name: e.target.value})} required />
                </div>

                <div>
                    <label className="block mb-1 font-bold text-gray-600 italic">صلة القرابة</label>
                    <select value={formData.relation} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, relation: e.target.value})}>
                        <option value="Father">أب (Aabbe)</option>
                        <option value="Mother">أم (Hooyo)</option>
                        <option value="Uncle">عم/خال (Adeer/Abbti)</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 font-bold text-gray-600 italic">رقم الهاتف</label>
                    <input type="text" value={formData.parent_phone} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center" onChange={e => setFormData({...formData, parent_phone: e.target.value})} required />
                </div>

                <div>
                    <label className="block mb-1 font-bold text-gray-600 italic">الفترة (Shift)</label>
                    <select value={formData.shift} className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, shift: e.target.value})}>
                        <option value="Morning">صباحي</option>
                        <option value="Afternoon">ظهري</option>
                        <option value="Evening">مسائي</option>
                        <option value="all time">كل وقت</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1 font-bold text-gray-600 italic">الرسوم الشهرية</label>
                    <input type="number" value={formData.monthly_fee} placeholder="0.00" className="w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold" onChange={e => setFormData({...formData, monthly_fee: e.target.value})} />
                </div>

                <div className="col-span-2 mt-4">
                    <button type="submit" className="w-full bg-[#1e3a8a] text-white p-3.5 rounded-xl font-bold text-lg hover:bg-[#c27803] transition-all shadow-md active:scale-95">
                        {editingId ? "تعديل البيانات (Update)" : "حفظ البيانات (Save)"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default Students;