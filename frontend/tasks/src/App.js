import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { useContext } from "react";

import { AuthProvider, AuthContext } from "./context/AuthContext";
import { TaskProvider } from "./context/TaskContext";
import { NoteProvider } from "./context/NoteContext";
import { ChecklistProvider } from "./context/ChecklistContext";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CalendarView from "./pages/CalendarView";
import Notes from "./pages/Notes";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import Checklists from "./pages/Checklists";

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <NoteProvider>
          <ChecklistProvider>
            <Router>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected routes */}
                <Route element={<ProtectedLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calendar" element={<CalendarView />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/checklists" element={<Checklists />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                {/* Default */}
                <Route path="/" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Router>
          </ChecklistProvider>
        </NoteProvider>
      </TaskProvider>
    </AuthProvider>
  );
}

function ProtectedLayout() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <Navbar />
      <main className="page-container">
        <Outlet />
      </main>
    </>
  );
}
