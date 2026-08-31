import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import api from "@/lib/api";
import { PageHeader } from "@/components/Shared";
import { useMeta } from "@/hooks/useMeta";
import { STATUS_META, inr } from "@/lib/qwick";

const STAGES = ["new", "called", "interested", "follow_up", "proposal_sent", "negotiation", "converted", "not_interested"];

export default function Pipeline() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["admin-dash"], queryFn: async () => (await api.get("/dashboard/admin")).data });
  const pipeline = data?.pipeline || {};

  return (
    <div>
      <PageHeader title="Sales Pipeline" subtitle="Leads across every stage of the funnel" />
      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
        {STAGES.map((s, i) => {
          const m = STATUS_META[s];
          const count = pipeline[s] || 0;
          return (
            <motion.button key={s} data-testid={`pipeline-stage-${s}`}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }} onClick={() => navigate(`/leads?status=${s}`)}
              className="min-w-[160px] flex-1 rounded-3xl bg-white p-5 text-left shadow-soft border border-purple-50">
              <div className={`mb-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${m.cls}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />{m.label}
              </div>
              <div className="font-heading text-4xl font-extrabold text-slate-900">{count}</div>
              <p className="mt-1 text-xs text-slate-400">leads</p>
            </motion.button>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-gradient-to-br from-primary to-purple-600 p-6 text-white shadow-lift">
          <p className="text-sm text-purple-100">Pipeline Value</p>
          <p className="font-heading text-3xl font-extrabold">{inr(data?.pipeline_value || 0)}</p>
        </div>
        <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lift">
          <p className="text-sm text-emerald-100">Revenue Booked</p>
          <p className="font-heading text-3xl font-extrabold">{inr(data?.revenue || 0)}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <p className="text-sm text-slate-400">Conversion Rate</p>
          <p className="font-heading text-3xl font-extrabold text-primary">{data?.conversion_rate || 0}%</p>
        </div>
      </div>
    </div>
  );
}
