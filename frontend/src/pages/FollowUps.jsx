import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Phone, MessageCircle, Check, Clock, CalendarClock } from "lucide-react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Shared";
import { telLink, waLink, fmtDateTime, toIso, tomorrowDate } from "@/lib/qwick";

const SECTIONS = [
  { key: "overdue", label: "Overdue", tone: "text-red-600", bg: "bg-red-500" },
  { key: "today", label: "Today", tone: "text-orange-600", bg: "bg-orange-500" },
  { key: "tomorrow", label: "Tomorrow", tone: "text-amber-600", bg: "bg-amber-500" },
  { key: "upcoming", label: "Upcoming", tone: "text-slate-600", bg: "bg-slate-400" },
];

export default function FollowUps() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [resched, setResched] = useState(null);
  const [date, setDate] = useState(tomorrowDate());
  const [time, setTime] = useState("11:00");

  const { data } = useQuery({ queryKey: ["follow-ups"], queryFn: async () => (await api.get("/follow-ups")).data });
  const refresh = () => { qc.invalidateQueries({ queryKey: ["follow-ups"] }); qc.invalidateQueries({ queryKey: ["emp-dash"] }); };

  const complete = async (fu) => { await api.post(`/follow-ups/${fu.id}/complete`); toast.success("Follow-up completed"); refresh(); };
  const doResched = async () => { await api.post(`/follow-ups/${resched.id}/reschedule`, { due_at: toIso(date, time) }); toast.success("Rescheduled"); setResched(null); refresh(); };

  const total = data ? Object.values(data).reduce((s, a) => s + a.length, 0) : 0;

  return (
    <div>
      <PageHeader title="Follow-ups" subtitle={`${total} pending follow-ups`} />
      <div className="space-y-6">
        {SECTIONS.map((sec) => {
          const items = data?.[sec.key] || [];
          if (items.length === 0) return null;
          return (
            <div key={sec.key} data-testid={`followup-section-${sec.key}`}>
              <div className="mb-3 flex items-center gap-2">
                <span className={`flex h-6 items-center rounded-full ${sec.bg} px-2.5 text-xs font-bold text-white`}>{items.length}</span>
                <h2 className={`font-heading text-lg font-bold ${sec.tone}`}>{sec.label}</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {items.map((fu, i) => (
                  <motion.div key={fu.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                    data-testid={`followup-${fu.id}`} className="rounded-3xl bg-white p-5 shadow-soft border border-purple-50">
                    <div role="button" onClick={() => navigate(`/leads/${fu.lead_id}`)}>
                      <div className="flex items-center justify-between">
                        <h3 className="font-heading text-base font-bold text-slate-900">{fu.brand_name}</h3>
                        <span className="flex items-center gap-1 text-xs font-semibold text-amber-600"><Clock className="h-3.5 w-3.5" />{fmtDateTime(fu.due_at)}</span>
                      </div>
                      <p className="mt-0.5 text-sm text-slate-500">{fu.contact_person} · {fu.mobile}</p>
                      {fu.assigned_to_name && <p className="text-xs text-slate-400">Assigned: {fu.assigned_to_name}</p>}
                      {fu.note && <p className="mt-2 rounded-xl bg-slate-50 px-3 py-1.5 text-xs text-slate-600">"{fu.note}"</p>}
                    </div>
                    <div className="mt-3 grid grid-cols-4 gap-1.5">
                      <a href={telLink(fu.mobile)} className="flex items-center justify-center rounded-xl bg-primary py-2.5 text-white active:scale-95"><Phone className="h-4 w-4" /></a>
                      <a href={waLink(fu.whatsapp || fu.mobile)} target="_blank" rel="noreferrer" className="flex items-center justify-center rounded-xl bg-emerald-500 py-2.5 text-white active:scale-95"><MessageCircle className="h-4 w-4" /></a>
                      <button data-testid={`followup-complete-${fu.id}`} onClick={() => complete(fu)} className="flex items-center justify-center rounded-xl bg-emerald-100 py-2.5 text-emerald-600 active:scale-95"><Check className="h-4 w-4" /></button>
                      <button data-testid={`followup-reschedule-${fu.id}`} onClick={() => setResched(fu)} className="flex items-center justify-center rounded-xl bg-slate-100 py-2.5 text-slate-600 active:scale-95"><CalendarClock className="h-4 w-4" /></button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
        {total === 0 && <EmptyState icon="BellOff" title="No follow-ups" subtitle="Schedule follow-ups from the call workflow." />}
      </div>

      <Dialog open={!!resched} onOpenChange={(o) => !o && setResched(null)}>
        <DialogContent className="max-w-sm rounded-3xl">
          <DialogHeader><DialogTitle className="font-heading">Reschedule Follow-up</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl" data-testid="resched-date" />
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-2xl" data-testid="resched-time" />
          </div>
          <DialogFooter><Button onClick={doResched} data-testid="confirm-resched" className="w-full rounded-2xl py-5 font-semibold">Reschedule</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
