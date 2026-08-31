import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, ArrowRight, Target } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMeta } from "@/hooks/useMeta";
import api from "@/lib/api";
import StatCard from "@/components/StatCard";
import LeadCard from "@/components/LeadCard";
import CallOutcomeModal from "@/components/CallOutcomeModal";
import { CardSkeleton, EmptyState } from "@/components/Shared";
import { greeting } from "@/lib/qwick";

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [callLead, setCallLead] = useState(null);

  const { data: stats } = useQuery({ queryKey: ["emp-dash"], queryFn: async () => (await api.get("/dashboard/employee")).data });
  const { data: calls, isLoading } = useQuery({ queryKey: ["calls-today"], queryFn: async () => (await api.get("/calls/today")).data });

  const target = stats?.daily_target || 40;
  const done = stats?.calls_today || 0;
  const pct = Math.min(Math.round((done / target) * 100), 100);
  const list = (calls || []).slice(0, 6);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["calls-today"] }); qc.invalidateQueries({ queryKey: ["emp-dash"] }); qc.invalidateQueries({ queryKey: ["follow-ups"] }); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-extrabold text-slate-900 sm:text-4xl">
          {greeting()}, {user?.name?.split(" ")[0]} 👋
        </h1>
        <p className="mt-1 text-slate-500">Here's your activity for today</p>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-400">Today's Activity</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard testId="stat-calls-today" icon="Phone" label="Calls Today" value={stats?.calls_today || 0} tone="purple" index={0} />
          <StatCard testId="stat-followups" icon="Bell" label="Follow-ups" value={stats?.follow_ups || 0} tone="amber" index={1} />
          <StatCard testId="stat-interested" icon="Star" label="Interested" value={stats?.interested || 0} tone="green" index={2} />
          <StatCard testId="stat-proposals" icon="FileText" label="Proposals" value={stats?.proposals || 0} tone="blue" index={3} />
        </div>
      </div>

      {/* Daily target */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-br from-primary to-purple-600 p-6 text-white shadow-lift">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2"><Target className="h-5 w-5" /><span className="font-semibold">Daily Target</span></div>
          <span className="font-heading text-lg font-bold">{done} / {target} calls</span>
        </div>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/25">
          <motion.div data-testid="daily-target-bar" initial={{ width: 0 }} animate={{ width: `${pct}%` }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="h-full rounded-full bg-white" />
        </div>
        <p className="mt-2 text-sm text-purple-100">{pct}% completed · {Math.max(target - done, 0)} calls to go</p>
      </motion.div>

      {/* Today's calls */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold text-slate-900">Today's Calls</h2>
          <button data-testid="view-all-calls" onClick={() => navigate("/calls")} className="flex items-center gap-1 text-sm font-semibold text-primary">
            View all <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {isLoading ? <CardSkeleton /> : list.length === 0 ? (
          <EmptyState icon="PhoneOff" title="No calls queued" subtitle="You're all caught up. Great work!" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((lead, i) => (
              <LeadCard key={lead.id} lead={lead} index={i} showComplete onCall={() => {}} onComplete={setCallLead} />
            ))}
          </div>
        )}
      </div>

      <CallOutcomeModal lead={callLead} open={!!callLead} onClose={() => setCallLead(null)} onSaved={refresh} />
    </div>
  );
}
