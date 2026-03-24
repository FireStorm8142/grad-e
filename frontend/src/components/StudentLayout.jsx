import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { LayoutDashboard, LogOut } from "lucide-react";

export default function StudentLayout() {
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
    { name: "My Dashboard", path: "/student", icon: <LayoutDashboard size={20} /> },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      {/* Sidebar */}
      <aside style={{ width: "250px", backgroundColor: "#1e1b4b", color: "#fff", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px", fontSize: "24px", fontWeight: "bold", borderBottom: "1px solid #312e81" }}>
          Student Portal
        </div>
        
        <nav style={{ flex: 1, padding: "20px 0" }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "12px 20px", color: isActive ? "#a5b4fc" : "#818cf8",
                  textDecoration: "none", backgroundColor: isActive ? "#312e81" : "transparent",
                  transition: "all 0.2s"
                }}
              >
                {item.icon}
                <span style={{ fontWeight: isActive ? "600" : "400" }}>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "20px", borderTop: "1px solid #312e81" }}>
          <div style={{ marginBottom: "12px", fontSize: "14px", color: "#c7d2fe" }}>
            {currentUser?.displayName || currentUser?.email}
          </div>
          <button
            onClick={handleLogout}
            style={{
              display: "flex", alignItems: "center", gap: "8px", width: "100%", padding: "10px",
              backgroundColor: "transparent", color: "#fca5a5", border: "1px solid #fca5a5", borderRadius: "6px", cursor: "pointer"
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
