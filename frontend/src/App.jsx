import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import Login from "./components/Login";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import SubjectManagement from "./pages/SubjectManagement";
import ClassManagement from "./pages/ClassManagement";
import ClassDetail from "./pages/ClassDetail";
import AssignmentManagement from "./pages/AssignmentManagement";

function App() {
  const { currentUser } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={!currentUser ? <Login /> : <Navigate to={currentUser.role === 'admin' ? '/admin' : '/dashboard'} />} 
        />
        
        {/* Admin Routes */}
        {currentUser && currentUser.role === "admin" && (
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="classes" element={<ClassManagement />} />
            <Route path="classes/:id" element={<ClassDetail />} />
            <Route path="subjects" element={<SubjectManagement />} />
            <Route path="assignments" element={<AssignmentManagement />} />
          </Route>
        )}

        {/* Dashboard fallback for non-admins (placeholder) */}
        <Route path="/dashboard" element={
          <div style={{ padding: "20px" }}>
            <h1>Welcome To Grad-E, {currentUser?.displayName || currentUser?.email}</h1>
            <p>Role: {currentUser?.role}</p>
          </div>
        } />

        {/* Catch-all or Unauthorized */}
        <Route path="*" element={<div style={{ padding: "20px" }}>404 - Not Found or Unauthorized</div>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
