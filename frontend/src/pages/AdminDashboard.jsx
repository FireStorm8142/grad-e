import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Users, BookOpen, GraduationCap, ClipboardList } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    classes: 0,
    subjects: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stats`);
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to load stats", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: "Total Teachers", value: stats.teachers, icon: <Users size={32} color="#3b82f6" />, link: "/admin/users", bgColor: "#eff6ff" },
    { title: "Total Students", value: stats.students, icon: <Users size={32} color="#10b981" />, link: "/admin/users", bgColor: "#ecfdf5" },
    { title: "Total Classes", value: stats.classes, icon: <GraduationCap size={32} color="#f59e0b" />, link: "/admin/classes", bgColor: "#fffbeb" },
    { title: "Total Subjects", value: stats.subjects, icon: <BookOpen size={32} color="#8b5cf6" />, link: "/admin/subjects", bgColor: "#f5f3ff" }
  ];

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1 style={{ margin: "0 0 24px 0", fontSize: "28px", color: "#1e293b" }}>Dashboard Overview</h1>
      
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "24px", marginBottom: "32px" }}>
        {statCards.map((card, idx) => (
          <div key={idx} style={{
            backgroundColor: "#fff",
            padding: "24px",
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            gap: "20px"
          }}>
            <div style={{
              width: "64px", height: "64px", borderRadius: "16px",
              backgroundColor: card.bgColor, display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: "14px", color: "#64748b", marginBottom: "4px" }}>{card.title}</div>
              <div style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a" }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 style={{ margin: "0 0 16px 0", fontSize: "20px", color: "#1e293b" }}>Quick Links</h2>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <QuickLink to="/admin/users" icon={<Users size={20} />} text="Manage Users" />
        <QuickLink to="/admin/classes" icon={<GraduationCap size={20} />} text="Manage Classes" />
        <QuickLink to="/admin/subjects" icon={<BookOpen size={20} />} text="Manage Subjects" />
        <QuickLink to="/admin/assignments" icon={<ClipboardList size={20} />} text="Manage Assignments" />
      </div>
    </div>
  );
}

function QuickLink({ to, icon, text }) {
  return (
    <Link to={to} style={{
      display: "flex", alignItems: "center", gap: "8px",
      padding: "12px 20px", backgroundColor: "#fff", borderRadius: "8px",
      color: "#3b82f6", textDecoration: "none", fontWeight: "500",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    }}>
      {icon} {text}
    </Link>
  );
}
