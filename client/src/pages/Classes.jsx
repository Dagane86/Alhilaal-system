import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Classes = () => {
    const [classes, setClasses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [newClass, setNewClass] = useState({ class_name: '', teacher_id: '', shift: 'الصباح', capacity: 0 });
    const [editingId, setEditingId] = useState(null);

    const API_URL = 'https://al-hilaal-vercel-server.vercel.app/api';

    const fetchData = async () => {
        try {
            const [classRes, teacherRes] = await Promise.all([
                axios.get(`${API_URL}/classes`),
                axios.get(`${API_URL}/teachers`)
            ]);
            setClasses(classRes.data);
            setTeachers(teacherRes.data);
        } catch (err) {
            console.error("Cilad baa dhacday!", err);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(`${API_URL}/classes/${editingId}`, newClass);
            } else {
                await axios.post(`${API_URL}/classes`, newClass);
            }
            setNewClass({ class_name: '', teacher_id: '', shift: 'Morning', capacity: 0 });
            setEditingId(null);
            fetchData();
        } catch (err) {
            alert("Fashil: " + err.message);
        }
    };

    return (
        <div className="p-8 text-right bg-gray-50 min-h-screen" dir="rtl">
            <h1 className="text-2xl font-bold mb-6">Maareynta Fasallada</h1>
            
            {/* Form */}
            <form onSubmit={handleSave} className="bg-white p-6 rounded-xl shadow-sm grid grid-cols-5 gap-4 mb-8">
                <input className="border p-2 rounded-lg" placeholder="Magaca" value={newClass.class_name} onChange={e => setNewClass({...newClass, class_name: e.target.value})} required />
                <select className="border p-2 rounded-lg" value={newClass.teacher_id} onChange={e => setNewClass({...newClass, teacher_id: e.target.value})} required>
                    <option value="">Dooro Macallin</option>
                    {teachers.map(t => <option key={t.id || t.teacher_id} value={t.id || t.teacher_id}>{t.full_name}</option>)}
                </select>
                <select 
                    className="border p-2 rounded-lg font-bold" 
                    value={newClass.shift} 
                    onChange={e => setNewClass({...newClass, shift: e.target.value})}
                >
                    <option value="الصباح">الصباح (Subax)</option>
                    <option value="المساء">المساء (Galab)</option>
                    <option value="كل وقت">كل وقت (Full Time)</option>
                </select>
                <input type="number" className="border p-2 rounded-lg" placeholder="Capacity" value={newClass.capacity} onChange={e => setNewClass({...newClass, capacity: e.target.value})} />
                <button className="bg-blue-600 text-white rounded-lg font-bold">{editingId ? 'Cusboonaysii' : 'Keydi'}</button>
            </form>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-right">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-4">Fasalka</th>
                            <th className="p-4">Macallinka</th>
                            <th className="p-4">Ardayda</th>
                            <th className="p-4">Howlgal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {classes.map(c => (
                            <tr key={c.id} className="border-b">
                                <td className="p-4 font-bold">{c.class_name}</td>
                                <td className="p-4">{c.teacher_name || 'Ma jiro'}</td>
                                <td className="p-4">{c.student_count}</td>
                                <td className="p-4 flex gap-2">
                                    <button onClick={() => {setEditingId(c.id); setNewClass(c)}} className="text-green-600 border border-green-600 px-2 py-1 rounded">Tafatir</button>
                                    <button onClick={async () => { if(confirm("Ma hubtaa?")) { await axios.delete(`${API_URL}/classes/${c.id}`); fetchData(); } }} className="text-red-600 border border-red-600 px-2 py-1 rounded">Tirtir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Classes;