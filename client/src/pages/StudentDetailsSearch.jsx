import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, User, ArrowLeft } from "lucide-react";

const StudentDetailsSearch = () => {
  const navigate = useNavigate();
  const [studentId, setStudentId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const id = studentId.trim();

    if (!id) {
      setError("Fadlan geli ID-ga ardayga");
      return;
    }

    if (isNaN(id) || parseInt(id) <= 0) {
      setError("ID-ga ardaygu waa inuu noqdaa tiro sax ah");
      return;
    }

    // Navigate to student details
    navigate(`/students/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/students")}
            className="flex items-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-3 rounded-2xl shadow-sm font-medium"
          >
            <ArrowLeft size={18} />
            Back to Students
          </button>
        </div>

        {/* Search Card */}
        <div className="bg-white rounded-3xl shadow-lg p-8 md:p-10 text-center">
          <div className="w-20 h-20 rounded-full bg-blue-100 mx-auto flex items-center justify-center mb-6">
            <User size={40} className="text-blue-600" />
          </div>

          <h1 className="text-3xl font-bold text-slate-800 mb-4">
            Search Student Details
          </h1>
          <p className="text-slate-600 mb-8 max-w-md mx-auto">
            Enter a student ID to view their detailed profile, including payments and attendance information.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="max-w-sm mx-auto">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Student ID
              </label>
              <input
                type="number"
                value={studentId}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  setError("");
                }}
                placeholder="Enter student ID (e.g., 14)"
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-center text-lg font-semibold"
                min="1"
                required
              />
              {error && (
                <p className="text-red-600 text-sm mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg mx-auto"
            >
              <Search size={20} />
              View Student Details
            </button>
          </form>

          {/* Help Text */}
          <div className="mt-8 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-600">
              <strong>Tip:</strong> You can also view student details by clicking the "View" button
              from the Students List page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsSearch;