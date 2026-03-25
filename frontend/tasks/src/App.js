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
                {/* Public routes - Redirect to dashboard if they ever try to visit login/register */}
                <Route path="/login" element={<Navigate to="/dashboard" replace />} />
                <Route path="/register" element={<Navigate to="/dashboard" replace />} />

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
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
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

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <h1>Initializing App...</h1>
    </div>
  );
  
  // If user is still null after loading, something went wrong with bootstrap.
  // We'll show a message instead of redirecting to a login page that no longer exists.
  if (!user) return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Authentication Failed</h1>
      <p>Please try refreshing the page. If the issue persists, clear your browser cache.</p>
    </div>
  );

  return (
    <>
      <Navbar />
      <main className="page-container">
        <Outlet />
      </main>
    </>
  );
}
