import {
  BrowserRouter as Router,
  Navigate,
  Outlet,
  Route,
  Routes,
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
import ContestTracker from "./pages/ContestTracker";

export default function App() {
  return (
    <AuthProvider>
      <TaskProvider>
        <NoteProvider>
          <ChecklistProvider>
            <Router
              future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true,
              }}
            >
              <Routes>
                <Route element={<PublicOnlyRoute />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Route>

                <Route element={<ProtectedLayout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/calendar" element={<CalendarView />} />
                  <Route path="/notes" element={<Notes />} />
                  <Route path="/contests" element={<ContestTracker />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/checklists" element={<Checklists />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
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

  if (loading) {
    return <div className="page-status">Loading your workspace...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  );
}

function PublicOnlyRoute() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="page-status">Checking your session...</div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
