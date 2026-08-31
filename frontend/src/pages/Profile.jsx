import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { LogOut, Shield, User, Phone, Star, FileText, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { PageHeader } from "@/components/Shared";
import { initials } from "@/lib/qwick";

const ADMIN_LINKS = [
  { to: "/", label: "Dashboard", icon: "LayoutDashboard" },
  { to: "/pipeline", label: "Pipeline", icon: "GitBranch" },
  { to: "/proposals", label: "Proposals", icon: "FileText" },
  { to: "/campaigns", label: "Campaigns", icon: "Megaphone" },
  { to: "/invoices", label: "Invoices", icon: "Receipt" },
  { to: "/customers", label: "Customers", icon: "Trophy" },
  { to: "/employees", label: "Employees", icon: "UserCog" },
  { to: "/analytics", label: "Analytics", icon: "BarChart3" },
  { to: "/import", label: "Import Leads", icon: "Upload" },
  { to: "/settings", label: "Settings", icon: "Settings" },
];

export default function Profile() {
  const { user, isAdmin, logout } = useAuth();
  const { data: stats } = useQuery({ queryKey: ["emp-dash"], queryFn: async () => (await api.get("/dashboard/employee")).data, enabled: !isAdmin });

  return (
    <div>
      <PageHeader title="Profile" />
      <div className="rounded-3xl bg-gradient-to-br from-primary to-purple-600 p-6 text-white shadow-lift">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 font-heading text-xl font-bold">{initials(user?.name)}</div>
          <div>
            <h2 className="font-heading text-2xl font-extrabold">{user?.name}</h2>
            <p className="text-purple-100">{user?.email}</p>
            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold">
              {isAdmin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}{user?.role}
            </span>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="mt-5 lg:hidden">
          <h3 className="mb-3 font-heading text-lg font-bold text-slate-900">Admin Menu</h3>
          <div className="grid grid-cols-2 gap-3">
            {ADMIN_LINKS.map((l) => {
              const Icon = Icons[l.icon] || Icons.Circle;
              return (
                <Link key={l.to} to={l.to} data-testid={`admin-link-${l.label.toLowerCase().replace(/\s/g, "-")}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft border border-purple-50 transition-transform active:scale-95">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-primary"><Icon className="h-5 w-5" /></div>
                  <span className="text-sm font-semibold text-slate-800">{l.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="mt-5 lg:hidden">
          <h3 className="mb-3 font-heading text-lg font-bold text-slate-900">Quick Menu</h3>
          <div className="grid grid-cols-2 gap-3">
            {[{ to: "/proposals", label: "Proposals", icon: "FileText" }, { to: "/invoices", label: "Invoices", icon: "Receipt" }].map((l) => {
              const Icon = Icons[l.icon] || Icons.Circle;
              return (
                <Link key={l.to} to={l.to} data-testid={`emp-link-${l.label.toLowerCase()}`}
                  className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-soft border border-purple-50 transition-transform active:scale-95">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-primary"><Icon className="h-5 w-5" /></div>
                  <span className="text-sm font-semibold text-slate-800">{l.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {!isAdmin && stats && (
        <div className="mt-5">
          <h3 className="mb-3 font-heading text-lg font-bold text-slate-900">My Performance</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric icon={Phone} label="Calls (Week)" value={stats.calls_week} tone="text-primary bg-purple-50" />
            <Metric icon={Star} label="Interested" value={stats.interested} tone="text-emerald-600 bg-emerald-50" />
            <Metric icon={FileText} label="Proposals" value={stats.proposals} tone="text-blue-600 bg-blue-50" />
            <Metric icon={Trophy} label="Converted" value={stats.converted} tone="text-amber-600 bg-amber-50" />
          </div>
        </div>
      )}

      <Button data-testid="profile-logout" onClick={logout} variant="outline" className="mt-6 w-full rounded-2xl py-6 font-semibold text-red-600 hover:bg-red-50 hover:text-red-600">
        <LogOut className="h-5 w-5" /> Log out
      </Button>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-soft">
      <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}><Icon className="h-4 w-4" /></div>
      <p className="font-heading text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
