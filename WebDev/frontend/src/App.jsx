import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { TaskProvider } from "./context/TaskContext";
import Home from "./pages/Home";
import Tasks from "./pages/Tasks";
import TaskForm from "./pages/TaskForm";
import Navbar from "./components/Navbar";
import FocusMode from "./pages/FocusMode/FocusMode";
import EditTask from "./pages/EditTask";
import Reports from "./pages/Reports";
import Dashboard from "./pages/Dashboard";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Auth from "./pages/Auth";
import PrivateRoute from "./components/PrivateRoute";

function Layout() {
  const location = useLocation();
  const isFocusMode = location.pathname === "/focus"; // Hide navbar in Focus Mode

  return (
    <TaskProvider>
      <div className="w-full min-h-screen">
        {/* Only show navbar if not in Focus Mode */}
        {!isFocusMode && <Navbar />}
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/sign-in/*" element={<Auth />} />
          <Route path="/sign-up/*" element={<Auth />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/tasks" element={<PrivateRoute><Tasks /></PrivateRoute>} />
          <Route path="/tasks/new" element={<PrivateRoute><TaskForm /></PrivateRoute>} />
          <Route path="/tasks/edit/:taskId" element={<PrivateRoute><EditTask /></PrivateRoute>} />
          <Route path="/focus" element={<PrivateRoute><FocusMode /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />

          {/* Catch-all for undefined routes */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </TaskProvider>
  );
}

function App() {
  return <Layout />;
}

export default App;
