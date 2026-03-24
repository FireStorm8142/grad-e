import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, FileText, ChevronRight } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function TeacherDashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [currentUser]);

  const fetchExams = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exams?teacherId=${currentUser._id}`);
      const data = await res.json();
      setExams(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Group exams by subject
  const groupedExams = exams.reduce((acc, exam) => {
    const subName = exam.subjectId?.name || "Other";
    if (!acc[subName]) acc[subName] = [];
    acc[subName].push(exam);
    return acc;
  }, {});

  const getStatusColor = (status) => {
    switch (status) {
      case "Draft": return { bg: "#f1f5f9", text: "#64748b" };
      case "Setup Complete": return { bg: "#e0f2fe", text: "#0284c7" };
      case "Sheets Uploaded": return { bg: "#fef3c7", text: "#d97706" };
      case "Processing": return { bg: "#ede9fe", text: "#7c3aed" };
      case "Graded": return { bg: "#dcfce3", text: "#166534" };
      default: return { bg: "#f1f5f9", text: "#64748b" };
    }
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: "#1e293b" }}>My Exams</h1>
        <button 
          onClick={() => navigate("/teacher/create-exam")}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#3b82f6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}
        >
          <Plus size={20} /> New Exam
        </button>
      </div>

      {Object.keys(groupedExams).length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", marginBottom: "16px" }}>No exams created yet.</div>
          <button onClick={() => navigate("/teacher/create-exam")} style={{ backgroundColor: "#1e293b", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: "pointer" }}>Create your first exam</button>
        </div>
      ) : (
        Object.keys(groupedExams).map(subject => (
          <div key={subject} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#334155", marginBottom: "16px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
              {subject}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
              {groupedExams[subject].map(exam => {
                const colors = getStatusColor(exam.status);
                return (
                  <Link key={exam._id} to={`/teacher/exams/${exam._id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.05)", transition: "transform 0.2s, box-shadow 0.2s",
                      cursor: "pointer", display: "flex", flexDirection: "column", gap: "12px", height: "100%"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 10px 15px -3px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0f172a", fontWeight: "600", fontSize: "18px" }}>
                          <FileText size={20} color="#3b82f6" /> {exam.name}
                        </div>
                        <span style={{ backgroundColor: colors.bg, color: colors.text, padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "600" }}>
                          {exam.status}
                        </span>
                      </div>
                      <div style={{ fontSize: "14px", color: "#64748b" }}>Class: {exam.classId?.name}</div>
                      <div style={{ fontSize: "14px", color: "#64748b" }}>Date: {exam.date ? new Date(exam.date).toLocaleDateString() : "TBD"}</div>
                      
                      <div style={{ marginTop: "auto", display: "flex", justifyContent: "flex-end", alignItems: "center", color: "#3b82f6", fontSize: "14px", fontWeight: "500", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        View Details <ChevronRight size={16} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
