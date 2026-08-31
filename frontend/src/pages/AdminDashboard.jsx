import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { UserPlus, FileText, Receipt, Megaphone, AlertTriangle, Clock } from "lucide-react";
import api from "@/lib/api";
import StatCard from "@/components/StatCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import { PageHeader } from "@/components/Shared";
import LeadFormModal from "@/components/LeadFormModal";
import ProposalGeneratorModal from "@/components/ProposalGeneratorModal";
import InvoiceModal from "@/components/InvoiceModal";
import CampaignModal from "@/components/CampaignModal";
import { STATUS_META, inr } from "@/lib/qwick";

const FUNNEL_COLORS = ["#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD", "#10B981"];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [modal, setModal] = useState(null);
  const { data } = useQuery({ queryKey: ["admin-dash"], queryFn: async () => (await api.get("/dashboard/admin")).data });
  const { data: biz } = useQuery({ queryKey: ["biz-dash"], queryFn: async () => (await api.get("/dashboard/business")).data });
  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data });

  const funnel = data?.funnel || [];
  const maxF = Math.max(...funnel.map((f) => f.count), 1);
  const pipeline = data?.pipeline || {};
  const slots = biz?.total_slots || 6;
  const occupied = biz?.occupied_slots || 0;
  const refresh = () => { qc.invalidateQueries({ queryKey: ["biz-dash"] }); qc.invalidateQueries({ queryKey: ["admin-dash"] }); };

  const QUICK = [
    { key: "brand", label: "Add Brand", icon: UserPlus, testid: "quick-add-brand" },
    { key: "proposal", label: "Create Proposal", icon: FileText, testid: "quick-create-proposal" },
    { key: "invoice", label: "Create Invoice", icon: Receipt, testid: "quick-create-invoice" },
    { key: "campaign", label: "Add Campaign", icon: Megaphone, testid: "quick-add-campaign" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="QwickAds Sales Overview" subtitle="Complete visibility into your team's performance" />

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {QUICK.map((q) => (
          <button key={q.key} data-testid={q.testid} onClick={() => setModal(q.key)}
            className="flex items-center gap-2 rounded-2xl bg-white p-4 shadow-soft border border-purple-50 transition-transform hover:-translate-y-1 active:scale-95">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><q.icon className="h-5 w-5" /></span>
            <span className="text-sm font-semibold text-slate-800">{q.label}</span>
          </button>
        ))}
      </div>

      {/* Business cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard testId="biz-active-brands" icon="Building2" label="Active Brands" value={biz?.active_brands || 0} tone="purple" index={0} />
        <StatCard testId="biz-active-campaigns" icon="Megaphone" label="Active Campaigns" value={biz?.active_campaigns || 0} tone="indigo" index={1} />
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
          data-testid="biz-slots" className="rounded-2xl bg-gradient-to-br from-primary to-purple-600 p-4 text-white shadow-lift sm:p-5">
          <div className="mb-2 text-xs font-medium text-purple-100">Ad Slots</div>
          <div className="font-heading text-2xl font-bold sm:text-3xl">{occupied}/{slots}</div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
            <motion.div initial={{ width: 0 }} animate={{ width: `${(occupied / slots) * 100}%` }} transition={{ duration: 0.9 }} className="h-full rounded-full bg-white" />
          </div>
          <div className="mt-1 text-xs text-purple-100">{biz?.occupancy_pct || 0}% Occupancy</div>
        </motion.div>
        <StatCard testId="biz-revenue" icon="Wallet" label="Monthly Revenue" value={biz?.monthly_revenue || 0} prefix="₹" tone="green" index={3} />
        <StatCard testId="biz-pending" icon="Clock" label="Pending Payments" value={biz?.pending_payments || 0} prefix="₹" tone="amber" index={4} />
        <StatCard testId="biz-expiring" icon="AlertTriangle" label="Expiring Soon" value={(biz?.expiring_campaigns || []).length} tone="red" index={5} />
      </div>

      {/* Expiring campaigns alert */}
      {(biz?.expiring_campaigns || []).length > 0 && (
        <div data-testid="expiring-alert" className="rounded-3xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 font-heading font-bold text-amber-700">
            <AlertTriangle className="h-5 w-5" /> {biz.expiring_campaigns.length} campaign(s) expiring soon
          </div>
          <div className="mt-3 space-y-2">
            {biz.expiring_campaigns.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-2xl bg-white p-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{c.brand_name}</p>
                  <p className="flex items-center gap-1 text-xs text-amber-600"><Clock className="h-3 w-3" />{c.days_left >= 0 ? `expires in ${c.days_left} day(s)` : "expired"}</p>
                </div>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Hi, your QwickAds campaign for ${c.brand_name} is ending soon. Shall we renew it?`)}`} target="_blank" rel="noreferrer"
                  className="rounded-full bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white">Contact for Renewal</a>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard testId="admin-total-leads" icon="Users" label="Total Leads" value={data?.total_leads || 0} tone="purple" index={0} />
        <StatCard testId="admin-calls-today" icon="Phone" label="Calls Today" value={data?.calls_today || 0} tone="blue" index={1} />
        <StatCard testId="admin-calls-week" icon="PhoneCall" label="Calls This Week" value={data?.calls_week || 0} tone="indigo" index={2} />
        <StatCard testId="admin-interested" icon="Star" label="Interested" value={data?.interested || 0} tone="green" index={3} />
        <StatCard testId="admin-proposals" icon="FileText" label="Proposals Sent" value={data?.proposals_sent || 0} tone="amber" index={4} />
        <StatCard testId="admin-converted" icon="Trophy" label="Conversions" value={data?.converted || 0} tone="green" index={5} />
        <StatCard testId="admin-conv-rate" icon="Percent" label="Conversion Rate" value={data?.conversion_rate || 0} suffix="%" tone="purple" index={6} />
        <StatCard testId="admin-pipeline-value" icon="Wallet" label="Pipeline (₹K)" value={Math.round((data?.pipeline_value || 0) / 1000)} prefix="₹" suffix="K" tone="indigo" index={7} />
      </div>

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Funnel */}
        <div className="rounded-3xl bg-white p-6 shadow-soft lg:col-span-3">
          <h3 className="font-heading text-lg font-bold text-slate-900">Sales Funnel</h3>
          <div className="mt-4 space-y-3">
            {funnel.map((f, i) => {
              const w = Math.max((f.count / maxF) * 100, 8);
              const drop = i > 0 && funnel[i - 1].count ? Math.round((f.count / funnel[i - 1].count) * 100) : null;
              return (
                <div key={f.stage}>
                  {drop != null && <p className="mb-1 text-center text-[11px] font-semibold text-slate-400">↓ {drop}%</p>}
                  <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: `${w}%`, opacity: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center justify-between rounded-2xl px-4 py-3 text-white shadow-soft"
                    style={{ background: FUNNEL_COLORS[i % FUNNEL_COLORS.length] }}>
                    <span className="text-sm font-semibold">{f.stage}</span>
                    <span className="font-heading text-lg font-bold"><AnimatedCounter value={f.count} /></span>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue + pipeline */}
        <div className="space-y-5 lg:col-span-2">
          <motion.div
  initial={{ opacity: 0, y: 14 }}
  animate={{ opacity: 1, y: 0 }}
  className="rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 text-white shadow-lift"
>
  <p className="text-sm font-semibold text-emerald-100">
    Revenue Booked
  </p>

  <p className="font-heading text-4xl font-extrabold">
    {inr(biz?.total_revenue || 0)}
  </p>

  <p className="mt-1 text-sm text-emerald-100">
    Payments actually received
  </p>
</motion.div>
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <h3 className="font-heading text-lg font-bold text-slate-900">Pipeline Stages</h3>
            <div className="mt-3 space-y-2">
              {Object.entries(STATUS_META).filter(([k]) => k !== "not_interested").map(([k, m]) => (
                <button key={k} data-testid={`pipeline-row-${k}`} onClick={() => navigate(`/leads?status=${k}`)}
                  className="flex w-full items-center justify-between rounded-xl px-2 py-1.5 hover:bg-purple-50">
                  <span className="flex items-center gap-2 text-sm text-slate-600"><span className={`h-2 w-2 rounded-full ${m.dot}`} />{m.label}</span>
                  <span className="font-heading font-bold text-slate-900">{pipeline[k] || 0}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <LeadFormModal open={modal === "brand"} onClose={() => setModal(null)} onSaved={refresh} employees={employees || []} />
      <ProposalGeneratorModal open={modal === "proposal"} onClose={() => setModal(null)} onSaved={refresh} />
      <InvoiceModal open={modal === "invoice"} onClose={() => setModal(null)} onSaved={refresh} />
      <CampaignModal open={modal === "campaign"} onClose={() => setModal(null)} onSaved={refresh} />
    </div>
  );
}
