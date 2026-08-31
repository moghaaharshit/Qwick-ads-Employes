import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Leads from "@/pages/Leads";
import LeadDetail from "@/pages/LeadDetail";
import Calls from "@/pages/Calls";
import FollowUps from "@/pages/FollowUps";
import Pipeline from "@/pages/Pipeline";
import Proposals from "@/pages/Proposals";
import Campaigns from "@/pages/Campaigns";
import Invoices from "@/pages/Invoices";
import Customers from "@/pages/Customers";
import Employees from "@/pages/Employees";
import Cabs from "@/pages/Cabs";
import Analytics from "@/pages/Analytics";
import ImportLeads from "@/pages/ImportLeads";
import Settings from "@/pages/Settings";
import Profile from "@/pages/Profile";

function Protected({ children, adminOnly }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background text-primary">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

function LoginRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center bg-background text-primary">Loading…</div>;
  if (user) return <Navigate to="/" replace />;
  return <Login />;
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <Toaster position="top-center" richColors closeButton />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginRoute />} />
            <Route element={<Protected><AppLayout /></Protected>}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/leads" element={<Leads />} />
              <Route path="/leads/:id" element={<LeadDetail />} />
              <Route path="/calls" element={<Calls />} />
              <Route path="/follow-ups" element={<FollowUps />} />
              <Route path="/pipeline" element={<Protected adminOnly><Pipeline /></Protected>} />
              <Route path="/proposals" element={<Proposals />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/employees" element={<Protected adminOnly><Employees /></Protected>} />
  <Route path="/cabs" element={<Protected adminOnly><Cabs /></Protected>} />
              <Route path="/analytics" element={<Protected adminOnly><Analytics /></Protected>} />
              <Route path="/import" element={<Protected adminOnly><ImportLeads /></Protected>} />
              <Route path="/settings" element={<Protected adminOnly><Settings /></Protected>} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
