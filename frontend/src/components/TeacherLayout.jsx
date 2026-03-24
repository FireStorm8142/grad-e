import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, FileText, LogOut } from "lucide-react";

export default function TeacherLayout() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const navItems = [
    { name: "Dashboard", path: "/teacher", icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: "250px", backgroundColor: "#0f172a", color: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", fontSize: "24px", fontWeight: "bold", borderBottom: "1px solid #1e293b" }}>
          Teacher Portal
        </div>
        
        <nav style={{ flex: 1, padding: "20px 0" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/teacher" && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 20px", color: isActive ? "#38bdf8" : "#94a3b8",
                  textDecoration: "none", backgroundColor: isActive ? "#1e293b" : "transparent",
                  transition: "all 0.2s"
                }}
              >
                {item.icon}
                <span style={{ fontWeight: isActive ? "600" : "400" }}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "20px", borderTop: "1px solid #1e293b" }}>
          <div style={{ marginBottom: "12px", fontSize: "14px", color: "#cbd5e1" }}>
            {currentUser?.displayName || currentUser?.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px",
              backgroundColor: "transparent", color: "#f87171", border: "1px solid #f87171", borderRadius: "6px", cursor: "pointer"
            }}
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: "auto", padding: "32px", display: "flex", flexDirection: "column" }}>
        <Outlet />
      </main>
    </div>
  );
}
