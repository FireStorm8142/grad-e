import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText, ChevronRight, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function StudentDashboard() {
  const { currentUser } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, [currentUser]);

  const fetchExams = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/student/dashboard/${currentUser._id}`);
      const data = await res.json();
      setExams(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const groupedExams = exams.reduce((acc, exam) => {
    const subName = exam.subjectId?.name || "Other";
    if (!acc[subName]) acc[subName] = [];
    acc[subName].push(exam);
    return acc;
  }, {});

  const getStatusDisplay = (exam) => {
    if (exam.status === "Draft") return null;

    if (exam.status === "Graded") {
      const score = exam.mySubmission?.score;
      if (score !== undefined) {
         return { icon: <CheckCircle2 size={16} />, text: `Score: ${score}/${exam.totalMarks}`, color: "#166534", bg: "#dcfce3" };
      }
      return { icon: <AlertCircle size={16} />, text: "Missed / No Submission", color: "#991b1b", bg: "#fee2e2" };
    }

    if (exam.mySubmission) {
      return { icon: <Clock size={16} />, text: "Awaiting Grading", color: "#b45309", bg: "#fef3c7" };
    }

    return { icon: <Clock size={16} />, text: "Upcoming / Processing", color: "#475569", bg: "#f1f5f9" };
  };

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ margin: 0, fontSize: "28px", color: "#1e293b" }}>My Classes & Exams</h1>
      </div>

      {Object.keys(groupedExams).length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <div style={{ color: "#64748b", fontSize: "16px" }}>You do not have any active classes or exams yet.</div>
        </div>
      ) : (
        Object.keys(groupedExams).map(subject => (
          <div key={subject} style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", color: "#334155", marginBottom: "16px", paddingBottom: "8px", borderBottom: "2px solid #e2e8f0" }}>
              {subject}
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
              {groupedExams[subject].map(exam => {
                if (exam.status === "Draft") return null; // Hide drafts from students

                const statusDisplay = getStatusDisplay(exam);
                const isGraded = exam.status === "Graded" && exam.mySubmission?.score !== undefined;

                return (
                  <div key={exam._id} style={{
                    backgroundColor: "#fff", borderRadius: "12px", padding: "20px", border: "1px solid #e2e8f0",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.05)", display: "flex", flexDirection: "column", gap: "12px", height: "100%"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#0f172a", fontWeight: "600", fontSize: "18px" }}>
                        <FileText size={20} color="#4f46e5" /> {exam.name}
                      </div>
                    </div>
                    
                    <div style={{ fontSize: "14px", color: "#64748b" }}>Date: {exam.date ? new Date(exam.date).toLocaleDateString() : "TBD"}</div>
                    
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: statusDisplay.bg, color: statusDisplay.color, padding: "6px 12px", borderRadius: "20px", fontSize: "14px", fontWeight: "600", alignSelf: "flex-start", marginTop: "4px" }}>
                      {statusDisplay.icon} {statusDisplay.text}
                    </div>

                    <div style={{ marginTop: "auto", paddingTop: "16px", borderTop: "1px solid #f8fafc", ...(!isGraded ? {opacity: 0.5, cursor: "not-allowed"} : {})}}>
                       {isGraded ? (
                         <Link to={`/student/exams/${exam._id}/result/${exam.mySubmission._id}`} style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", color: "#4f46e5", fontSize: "14px", fontWeight: "600", textDecoration: "none" }}>
                           View Detailed Results <ChevronRight size={16} />
                         </Link>
                       ) : (
                         <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", color: "#94a3b8", fontSize: "14px", fontWeight: "600" }}>
                           Results Unavailable <ChevronRight size={16} />
                         </div>
                       )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
