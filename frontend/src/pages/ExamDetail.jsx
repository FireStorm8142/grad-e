import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Upload, Users, BarChart3, Settings, Play, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function ExamDetail() {
  const { id } = useParams();
  const [exam, setExam] = useState(null);
  const [activeTab, setActiveTab] = useState("sheets");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExam();
  }, [id]);

  const fetchExam = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${id}`);
      const data = await res.json();
      setExam(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !exam) return <div>Loading exam details...</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", gap: "24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <div>
          <Link to="/teacher" style={{ display: "flex", alignItems: "center", color: "#64748b", textDecoration: "none", marginBottom: "8px", fontSize: "14px" }}>
            <ArrowLeft size={16} /> <span style={{ marginLeft: "4px" }}>Back to Dashboard</span>
          </Link>
          <h1 style={{ margin: "0 0 8px 0", fontSize: "28px", color: "#1e293b" }}>{exam.name}</h1>
          <div style={{ display: "flex", gap: "16px", color: "#64748b", fontSize: "14px", fontWeight: "500" }}>
            <span>{exam.classId?.name}</span>
            <span>&bull;</span>
            <span>{exam.subjectId?.name}</span>
            <span>&bull;</span>
            <span>Max Marks: {exam.totalMarks}</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          Status: 
          <span style={{ backgroundColor: "#e0f2fe", color: "#0284c7", padding: "6px 12px", borderRadius: "20px", fontWeight: "600", fontSize: "14px" }}>
            {exam.status}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: "16px", borderBottom: "2px solid #e2e8f0" }}>
        {[
          { id: "sheets", label: "Answer Sheets", icon: <Upload size={18} /> },
          { id: "seating", label: "Seating Arrangement", icon: <Settings size={18} /> },
          { id: "overview", label: "Class Overview", icon: <BarChart3 size={18} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none",
              padding: "12px 16px", cursor: "pointer", fontSize: "16px", fontWeight: activeTab === tab.id ? "600" : "500",
              color: activeTab === tab.id ? "#3b82f6" : "#64748b",
              borderBottom: activeTab === tab.id ? "3px solid #3b82f6" : "3px solid transparent",
              marginBottom: "-2px"
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "sheets" && <AnswerSheetsTab exam={exam} fetchExam={fetchExam} />}
      {activeTab === "seating" && <SeatingTab exam={exam} fetchExam={fetchExam} />}
      {activeTab === "overview" && <OverviewTab exam={exam} />}
    </div>
  );
}

// --------------------------------------------------------------------------------------
// ANSWER SHEETS TAB
function AnswerSheetsTab({ exam, fetchExam }) {
  const [submissions, setSubmissions] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [classStudents, setClassStudents] = useState([]);

  useEffect(() => {
    fetchSubmissions();
    if (exam.classId?._id) {
      fetchClassStudents();
    }
  }, [exam]);

  const fetchSubmissions = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}/submissions`);
    setSubmissions(await res.json());
  };

  const fetchClassStudents = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classes/${exam.classId._id}`);
    const data = await res.json();
    setClassStudents(data.students);
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (!files.length) return;
    setUploading(true);
    const fd = new FormData();
    for (let i = 0; i < files.length; i++) {
      fd.append("sheets", files[i]);
    }
    
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}/submissions`, { method: "POST", body: fd });
      fetchSubmissions();
      fetchExam(); // Updates status to "Sheets Uploaded"
    } catch(err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleAssignStudent = async (subId, studentId) => {
    try {
      if (!studentId) return;
      await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}/submissions/${subId}/assign`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId })
      });
      fetchSubmissions();
    } catch (error) { console.error(error); }
  };

  const handleProcess = async () => {
    setProcessing(true);
    await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}/grade-all`, { method: "POST" });
    fetchExam(); 
    // Wait for the mock processing
    setTimeout(() => {
      fetchSubmissions();
      fetchExam();
      setProcessing(false);
    }, 3500);
  };

  return (
    <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "24px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#f8fafc", border: "1px solid #cbd5e1", padding: "10px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", color: "#334155" }}>
          <Upload size={18} /> {uploading ? "Uploading..." : "Upload Submissions"}
          <input type="file" multiple accept="application/pdf" onChange={handleUpload} style={{ display: "none" }} disabled={uploading} />
        </label>

        <button 
          onClick={handleProcess} 
          disabled={submissions.length === 0 || processing || exam.status === "Graded"}
          style={{ display: "flex", alignItems: "center", gap: "8px", backgroundColor: "#3b82f6", color: "#fff", border: "none", padding: "10px 16px", borderRadius: "8px", cursor: submissions.length === 0 || processing || exam.status === "Graded" ? "not-allowed" : "pointer", fontWeight: "600", opacity: submissions.length === 0 || exam.status === "Graded" ? 0.5 : 1 }}
        >
          <Play size={18} /> {processing ? "Processing..." : exam.status === "Graded" ? "Grading Complete" : "Process Papers"}
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
        <thead style={{ backgroundColor: "#f8fafc", color: "#475569", fontSize: "14px", borderBottom: "1px solid #e2e8f0" }}>
          <tr>
            <th style={{ padding: "12px 16px" }}>Filename</th>
            <th style={{ padding: "12px 16px" }}>Student</th>
            <th style={{ padding: "12px 16px" }}>Status / Score</th>
            <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.length === 0 ? (
            <tr><td colSpan="4" style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>No sheets uploaded yet.</td></tr>
          ) : (
            submissions.map(sub => (
              <tr key={sub._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px 16px" }}>📄 {sub.fileName}</td>
                <td style={{ padding: "12px 16px" }}>
                  {sub.studentId ? (
                    <span style={{ fontWeight: "500", color: "#0f172a" }}>{sub.studentId.displayName || sub.studentId.email}</span>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#d97706" }}>
                      <AlertTriangle size={16} /> 
                      <select onChange={(e) => handleAssignStudent(sub._id, e.target.value)} style={{ padding: "6px", borderRadius: "4px", border: "1px solid #fcd34d", backgroundColor: "#fffbeb", minWidth: "150px" }}>
                        <option value="">Assign Student...</option>
                        {classStudents.map(cs => <option key={cs._id} value={cs._id}>{cs.displayName || cs.email}</option>)}
                      </select>
                    </div>
                  )}
                </td>
                <td style={{ padding: "12px 16px" }}>
                  {sub.status === "Graded" ? (
                    <span style={{ fontWeight: "bold", color: "#166534" }}>{sub.score} / {exam.totalMarks}</span>
                  ) : (
                    <span style={{ color: "#64748b" }}>{sub.status}</span>
                  )}
                </td>
                <td style={{ padding: "12px 16px", textAlign: "right" }}>
                  {sub.status === "Graded" && (
                    <Link to={`/teacher/exams/${exam._id}/grade/${sub._id}`} style={{ backgroundColor: "#1e293b", color: "#fff", textDecoration: "none", padding: "6px 12px", borderRadius: "6px", fontSize: "14px", fontWeight: "500" }}>Review</Link>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// --------------------------------------------------------------------------------------
// SEATING TAB
function SeatingTab({ exam, fetchExam }) {
  const [rows, setRows] = useState(exam.seatingArrangement?.rows || 5);
  const [cols, setCols] = useState(exam.seatingArrangement?.cols || 5);
  const [assignments, setAssignments] = useState(exam.seatingArrangement?.assignments || []);
  const [classStudents, setClassStudents] = useState([]);

  useEffect(() => {
    if (exam.classId?._id) fetchClassStudents();
  }, [exam]);

  const fetchClassStudents = async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/classes/${exam.classId._id}`);
    const data = await res.json();
    setClassStudents(data.students);
  };

  const handleCellClick = (r, c) => {
    const existingIdx = assignments.findIndex(a => a.row === r && a.col === c);
    let newAssignments = [...assignments];
    
    if (existingIdx !== -1) {
      newAssignments.splice(existingIdx, 1);
    } else {
      const assignedIds = new Set(newAssignments.map(a => a.studentId));
      const unassignedStudent = classStudents.find(s => !assignedIds.has(s._id));
      if (unassignedStudent) {
        newAssignments.push({ row: r, col: c, studentId: unassignedStudent._id, studentDetails: unassignedStudent });
      } else {
        alert("All class students currently enrolled are assigned to seats.");
        return;
      }
    }
    setAssignments(newAssignments);
  };

  const saveSeating = async () => {
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatingArrangement: { rows, cols, assignments } })
      });
      alert("Seating layout saved!");
      fetchExam();
    } catch(e) { console.error(e); }
  };

  const gridTemplate = `repeat(${cols}, 1fr)`;

  return (
    <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", alignItems: "flex-end", flexWrap: "wrap", borderBottom: "1px solid #e2e8f0", paddingBottom: "24px" }}>
        <div>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Rows</label>
          <input type="number" min="1" max="25" value={rows} onChange={e => setRows(Number(e.target.value))} style={{ display: "block", marginTop: "4px", padding: "8px", width: "80px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
        </div>
        <div>
          <label style={{ fontSize: "14px", fontWeight: "600", color: "#475569" }}>Cols</label>
          <input type="number" min="1" max="25" value={cols} onChange={e => setCols(Number(e.target.value))} style={{ display: "block", marginTop: "4px", padding: "8px", width: "80px", borderRadius: "6px", border: "1px solid #cbd5e1" }} />
        </div>
        <button onClick={saveSeating} style={{ padding: "10px 16px", backgroundColor: "#10b981", color: "#fff", border: "none", borderRadius: "6px", fontWeight: "600", cursor: "pointer", height: "36px" }}>
          Save Layout
        </button>
      </div>

      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: "400px", overflowX: "auto", border: "2px dashed #e2e8f0", padding: "24px", borderRadius: "8px", backgroundColor: "#f8fafc", minHeight: "300px", display: "flex", justifyContent: "center" }}>
          <div style={{ display: "grid", gridTemplateColumns: gridTemplate, gap: "8px", alignContent: "start" }}>
            {Array.from({ length: rows }).map((_, r) => 
               Array.from({ length: cols }).map((_, c) => {
                 const isAssigned = assignments.find(a => a.row === r && a.col === c);
                 return (
                   <div 
                     key={`${r}-${c}`}
                     onClick={() => handleCellClick(r, c)}
                     style={{
                       width: "50px", height: "50px", 
                       backgroundColor: isAssigned ? "#3b82f6" : "#fff",
                       border: isAssigned ? "none" : "1px solid #cbd5e1", 
                       borderRadius: "8px",
                       cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                       color: "#fff", fontSize: "12px",
                       boxShadow: isAssigned ? "0 4px 6px -1px rgba(59, 130, 246, 0.5)" : "none", 
                       transition: "transform 0.1s"
                     }}
                     onMouseEnter={e => e.currentTarget.style.transform = "scale(1.05)"}
                     onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
                     title={`Seat [Row ${r+1}, Col ${c+1}]`}
                   >
                     {isAssigned ? "👤" : ""}
                   </div>
                 );
               })
            )}
          </div>
        </div>
        
        <div style={{ width: "300px", color: "#64748b", fontSize: "14px", backgroundColor: "#f8fafc", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
          <h3 style={{ margin: "0 0 12px 0", color: "#1e293b", display: "flex", alignItems: "center", gap: "8px" }}>
             <AlertTriangle size={18} color="#d97706" /> Seating Notes
          </h3>
          <p style={{ lineHeight: "1.6" }}>
            1. Configure the grid to roughly match your classroom physical layout.
          </p>
          <p style={{ lineHeight: "1.6" }}>
            2. Click any empty box to <strong>allocate a seat</strong>. They are taken sequentially from your class roster.
          </p>
          <p style={{ lineHeight: "1.6" }}>
            3. During grading, if AI detects suspicious identical patterns across adjacent seats (<b>Row &plusmn; 1, Col &plusmn; 1</b>), the submissions will be surfaced internally.
          </p>
        </div>
      </div>
    </div>
  );
}

// --------------------------------------------------------------------------------------
// CLASS OVERVIEW TAB
function OverviewTab({ exam }) {
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/api/exams/${exam._id}/submissions`)
      .then(res => res.json())
      .then(data => setSubmissions(data.filter(s => s.status === "Graded")));
  }, [exam]);

  if (submissions.length === 0) {
    return <div style={{ padding: "40px", textAlign: "center", backgroundColor: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0", color: "#64748b", fontSize: "16px" }}>Not enough graded submissions to generate an overview.</div>;
  }

  const scores = submissions.map(s => s.score);
  const avg = (scores.reduce((a,b) => a+b, 0) / scores.length).toFixed(1);
  const max = Math.max(...scores);

  const ranges = {"0-20": 0, "21-40": 0, "41-60": 0, "61-80": 0, "81-100": 0};
  scores.forEach(s => {
    if (s <= 20) ranges["0-20"]++;
    else if (s <= 40) ranges["21-40"]++;
    else if (s <= 60) ranges["41-60"]++;
    else if (s <= 80) ranges["61-80"]++;
    else ranges["81-100"]++;
  });

  const chartData = {
    labels: Object.keys(ranges),
    datasets: [{
      label: "Students in Range",
      data: Object.values(ranges),
      backgroundColor: ["#ef4444", "#f59e0b", "#eab308", "#84cc16", "#22c55e"],
      borderRadius: 6
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "24px" }}>
        <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <div style={{ color: "#64748b", fontSize: "14px", marginBottom: "8px", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>Average Score</div>
          <div style={{ fontSize: "42px", fontWeight: "bold", color: "#10b981" }}>{avg} <span style={{fontSize:"20px", color:"#94a3b8"}}>/{exam.totalMarks}</span></div>
        </div>
        <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <div style={{ color: "#64748b", fontSize: "14px", marginBottom: "8px", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>Highest Score</div>
          <div style={{ fontSize: "42px", fontWeight: "bold", color: "#3b82f6" }}>{max}</div>
        </div>
        <div style={{ backgroundColor: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e2e8f0", textAlign: "center" }}>
          <div style={{ color: "#64748b", fontSize: "14px", marginBottom: "8px", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>Graded Submissions</div>
          <div style={{ fontSize: "42px", fontWeight: "bold", color: "#8b5cf6" }}>{submissions.length}</div>
        </div>
      </div>

      <div style={{ backgroundColor: "#fff", padding: "32px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
        <h3 style={{ margin: "0 0 24px 0", color: "#1e293b", fontSize: "20px" }}>Score Distribution</h3>
        <div style={{ height: "300px" }}>
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
}
