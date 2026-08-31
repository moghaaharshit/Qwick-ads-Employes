import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Icons from "lucide-react";
import { Phone, MessageCircle, FileText, Pencil, Trophy, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useMeta } from "@/hooks/useMeta";
import api from "@/lib/api";
import { StatusPill, PriorityBadge } from "@/components/Pills";
import CallOutcomeModal from "@/components/CallOutcomeModal";
import ConversionModal from "@/components/ConversionModal";
import LeadFormModal from "@/components/LeadFormModal";
import ProposalGeneratorModal from "@/components/ProposalGeneratorModal";
import InvoiceModal from "@/components/InvoiceModal";
import { ACTIVITY_META, OUTCOME_META, telLink, waLink, inr, fmtDateTime, labelOf, initials } from "@/lib/qwick";

export default function LeadDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin, user } = useAuth();
  const meta = useMeta();
  const qc = useQueryClient();
  const [call, setCall] = useState(false);
  const [convert, setConvert] = useState(false);
  const [edit, setEdit] = useState(false);
  const [proposal, setProposal] = useState(false);
  const [invoice, setInvoice] = useState(false);

  const { data, isLoading } = useQuery({ queryKey: ["lead", id], queryFn: async () => (await api.get(`/leads/${id}`)).data });
  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data, enabled: isAdmin });

  const refresh = () => { qc.invalidateQueries({ queryKey: ["lead", id] }); qc.invalidateQueries({ queryKey: ["leads"] }); };

  if (isLoading || !data) return <div className="py-20 text-center text-slate-400">Loading…</div>;
  const lead = data.lead;

  return (
    <div className="space-y-5">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm font-semibold text-slate-500"><ArrowLeft className="h-4 w-4" /> Back</button>

      {/* Header */}
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="font-heading text-2xl font-extrabold text-slate-900">{lead.brand_name}</h1>
            <p className="text-slate-500">{labelOf(meta.categories, lead.category)} · {lead.area || lead.location}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <StatusPill status={lead.status} />
              <PriorityBadge priority={lead.priority} />
              {lead.expected_value > 0 && <span className="rounded-full bg-purple-50 px-2.5 py-1 text-xs font-semibold text-primary">{inr(lead.expected_value)}</span>}
            </div>
          </div>
          {lead.status === "converted" && <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100"><Trophy className="h-6 w-6 text-emerald-600" /></div>}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <a href={telLink(lead.mobile)} data-testid="detail-call-btn" onClick={() => setTimeout(() => setCall(true), 300)}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition-transform active:scale-95"><Phone className="h-4 w-4" /> Call</a>
          <a href={waLink(lead.whatsapp || lead.mobile)} target="_blank" rel="noreferrer" data-testid="detail-whatsapp-btn"
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white transition-transform active:scale-95"><MessageCircle className="h-4 w-4" /> WhatsApp</a>
          <button onClick={() => setProposal(true)} data-testid="detail-proposal-btn"
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-purple-100 py-3 text-sm font-semibold text-primary transition-transform active:scale-95"><FileText className="h-4 w-4" /> Proposal</button>
          <button onClick={() => setInvoice(true)} data-testid="detail-invoice-btn"
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-purple-100 py-3 text-sm font-semibold text-primary transition-transform active:scale-95"><FileText className="h-4 w-4" /> Invoice</button>
          <button onClick={() => setEdit(true)} data-testid="detail-edit-btn"
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-transform active:scale-95"><Pencil className="h-4 w-4" /> Edit</button>
        </div>
        {!(lead.whatsapp || lead.mobile) && (
          <p className="mt-2 text-xs text-amber-600">WhatsApp number not added — add one via Edit to share on WhatsApp.</p>
        )}
        {lead.status !== "converted" && (
          <Button data-testid="mark-converted-btn" onClick={() => setConvert(true)} className="mt-2 w-full rounded-2xl bg-emerald-500 py-5 font-semibold hover:bg-emerald-600">🎉 Mark as Converted</Button>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Contact + sales info */}
        <div className="space-y-5">
          <InfoCard title="Contact Details" rows={[
            ["Contact Person", lead.contact_person || "—"],
            ["Phone", lead.mobile],
            ["WhatsApp", lead.whatsapp || lead.mobile],
            ["Email", lead.email || "—"],
            ["Location", `${lead.area ? lead.area + ", " : ""}${lead.location || "—"}`],
          ]} />
          <InfoCard title="Sales Information" rows={[
            ["Assigned Employee", lead.assigned_to_name || "—"],
            ["Lead Source", labelOf(meta.sources, lead.source)],
            ["Expected Value", inr(lead.expected_value)],
            ["Proposal Status", labelOf(meta.proposal_statuses, lead.proposal_status)],
            ["Next Follow-up", lead.next_follow_up ? fmtDateTime(lead.next_follow_up) : "Not scheduled"],
          ]} />
          {lead.conversion && (
            <div className="rounded-3xl bg-emerald-50 p-6">
              <h3 className="font-heading text-lg font-bold text-emerald-700">🎉 Customer</h3>
              <p className="mt-1 text-sm text-emerald-600">{lead.conversion.cabs} Cabs × {inr(lead.conversion.price)}/day × {lead.conversion.duration_days} days</p>
              <p className="font-heading text-2xl font-bold text-emerald-700">{inr(lead.conversion.total_value)}</p>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="mb-5 rounded-2xl bg-purple-50/70 p-4">
            <div className="flex items-center gap-2">
              <Icons.StickyNote className="h-4 w-4 text-primary" />
              <h3 className="font-heading text-base font-bold text-slate-900">Notes</h3>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {lead.notes?.trim() || "No notes added for this lead."}
            </p>
          </div>

          <h3 className="mb-4 font-heading text-lg font-bold text-slate-900">Activity Timeline</h3>
          {data.activities.length === 0 && <p className="text-sm text-slate-400">No activity yet.</p>}
          <div className="relative space-y-5 before:absolute before:left-[15px] before:top-2 before:h-[calc(100%-1rem)] before:w-px before:bg-purple-100">
            {data.activities.map((a) => {
              const m = ACTIVITY_META[a.type] || ACTIVITY_META.lead_edited;
              const Icon = Icons[m.icon] || Icons.Circle;
              return (
                <div key={a.id} data-testid={`timeline-${a.type}`} className="relative flex gap-3">
                  <div className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.color}`}><Icon className="h-4 w-4" /></div>
                  <div className="flex-1 pt-0.5">
                    <p className="text-sm font-semibold text-slate-800">{a.description}</p>
                    {a.outcome && <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${OUTCOME_META[a.outcome]?.soft}`}>{OUTCOME_META[a.outcome]?.label}</span>}
                    {a.note && <p className="mt-1 rounded-xl bg-slate-50 px-3 py-1.5 text-sm text-slate-600">"{a.note}"</p>}
                    <p className="mt-1 text-xs text-slate-400">{fmtDateTime(a.created_at)} · {a.created_by_name}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <CallOutcomeModal lead={lead} open={call} onClose={() => setCall(false)} onSaved={refresh} />
      <ConversionModal lead={lead} open={convert} onClose={() => setConvert(false)} onSaved={refresh} />
      <LeadFormModal open={edit} onClose={() => setEdit(false)} onSaved={refresh} lead={lead} employees={employees || []} />
      <ProposalGeneratorModal open={proposal} onClose={() => setProposal(false)} onSaved={refresh}
        prefill={{ brand_name: lead.brand_name, lead_id: lead.id, contact_person: lead.contact_person, phone: lead.mobile, whatsapp: lead.whatsapp || lead.mobile, target_area: lead.area }} />
      <InvoiceModal open={invoice} onClose={() => setInvoice(false)} onSaved={refresh}
        prefill={{ brand_name: lead.brand_name, lead_id: lead.id, contact_person: lead.contact_person, phone: lead.mobile, whatsapp: lead.whatsapp || lead.mobile }} />
    </div>
  );
}

function InfoCard({ title, rows }) {
  return (
    <div className="rounded-3xl bg-white p-6 shadow-soft">
      <h3 className="mb-3 font-heading text-lg font-bold text-slate-900">{title}</h3>
      <div className="space-y-2.5">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-4 text-sm">
            <span className="text-slate-400">{k}</span>
            <span className="text-right font-semibold text-slate-800">{v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
