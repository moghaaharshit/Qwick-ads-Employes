import { NavLink, useNavigate, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { greeting, initials } from "@/lib/qwick";
import Reminders from "./Reminders";
import { cn } from "@/lib/utils";

const EMP_NAV = [
  { to: "/", label: "Home", icon: "Home" },
  { to: "/leads", label: "Leads", icon: "Users" },
  { to: "/calls", label: "Calls", icon: "Phone" },
  { to: "/follow-ups", label: "Follow-ups", icon: "Bell" },
  { to: "/proposals", label: "Proposals", icon: "FileText" },
  { to: "/invoices", label: "Invoices", icon: "Receipt" },
  { to: "/profile", label: "Profile", icon: "User" },
];

const MOBILE_NAV = [
  { to: "/", label: "Home", icon: "Home" },
  { to: "/leads", label: "Leads", icon: "Users" },
  { to: "/calls", label: "Calls", icon: "Phone" },
  { to: "/follow-ups", label: "Follow-ups", icon: "Bell" },
  { to: "/cabs", label: "Cabs", icon: "Car" },
];

const ADMIN_NAV = [
  { to: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { to: "/leads", label: "Leads", icon: "Users" },
  { to: "/calls", label: "Calls", icon: "Phone" },
  { to: "/follow-ups", label: "Follow-ups", icon: "Bell" },
  { to: "/pipeline", label: "Pipeline", icon: "GitBranch" },
  { to: "/proposals", label: "Proposals", icon: "FileText" },
  { to: "/campaigns", label: "Campaigns", icon: "Megaphone" },
  { to: "/invoices", label: "Invoices", icon: "Receipt" },
  { to: "/customers", label: "Customers", icon: "Trophy" },
  { to: "/employees", label: "Employees", icon: "UserCog" },
  { to: "/cabs", label: "Cabs", icon: "Car" },
  { to: "/analytics", label: "Analytics", icon: "BarChart3" },
  { to: "/import", label: "Import Leads", icon: "Upload" },
  { to: "/settings", label: "Settings", icon: "Settings" },
];

function Logo({ compact }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary shadow-lift">
        <Icons.Zap className="h-5 w-5 text-white" fill="white" />
      </div>
      {!compact && <span className="font-heading text-lg font-extrabold text-slate-900">Qwick<span className="text-primary">Ads</span></span>}
    </div>
  );
}

export default function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const nav = isAdmin ? ADMIN_NAV : EMP_NAV;

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-30 hidden h-screen w-64 flex-col border-r border-purple-100 bg-white/70 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center px-6"><Logo /></div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 no-scrollbar">
          {nav.map((n) => {
            const Icon = Icons[n.icon];
            return (
              <NavLink key={n.to} to={n.to} end={n.to === "/"}
                data-testid={`nav-${n.label.toLowerCase().replace(/\s/g, "-")}`}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-primary text-white shadow-lift" : "text-slate-600 hover:bg-purple-50 hover:text-primary"
                )}>
                <Icon className="h-5 w-5" /> {n.label}
              </NavLink>
            );
          })}
        </nav>
        <div className="border-t border-purple-100 p-3">
          <button onClick={logout} data-testid="logout-btn"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600">
            <Icons.LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-purple-100 bg-white/80 px-4 backdrop-blur-xl sm:px-6">
          <div className="lg:hidden"><Logo /></div>
          <div className="hidden lg:block">
            <p className="text-xs text-slate-400">{greeting()},</p>
            <p className="font-heading text-sm font-bold text-slate-900">{user?.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <Reminders />
            <button onClick={() => navigate("/profile")} data-testid="profile-avatar"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
              {initials(user?.name)}
            </button>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.main key={location.pathname}
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:pb-10">
            <Outlet />
          </motion.main>
        </AnimatePresence>
      </div>

      {/* Mobile bottom nav */}
      <nav className="glass fixed bottom-0 left-0 z-30 flex w-full items-center justify-around border-t border-purple-100 px-2 py-2 lg:hidden">
        {MOBILE_NAV.map((n) => {
          const Icon = Icons[n.icon];
          return (
            <NavLink key={n.to} to={n.to} end={n.to === "/"}
              data-testid={`mobile-nav-${n.label.toLowerCase()}`}
              className={({ isActive }) => cn(
                "flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold transition-colors",
                isActive ? "text-primary" : "text-slate-400"
              )}>
              {({ isActive }) => (
                <>
                  <div className={cn("flex h-8 w-12 items-center justify-center rounded-full transition-colors", isActive && "bg-primary/10")}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {n.label}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}
