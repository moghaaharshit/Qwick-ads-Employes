import { useState } from "react";
import { Phone } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import api, { apiErr } from "@/lib/api";
import { useMeta } from "@/hooks/useMeta";
import { OUTCOME_META, telLink, toIso, tomorrowDate } from "@/lib/qwick";

export default function CallOutcomeModal({ lead, open, onClose, onSaved }) {
  const meta = useMeta();
  const [outcome, setOutcome] = useState(null);
  const [note, setNote] = useState("");
  const [lossReason, setLossReason] = useState(null);
  const [date, setDate] = useState(tomorrowDate());
  const [time, setTime] = useState("11:00");
  const [saving, setSaving] = useState(false);

  if (!lead) return null;
  const needsFollowUp = outcome && !["not_interested", "wrong_number"].includes(outcome);
  const needsReason = outcome === "not_interested";

  const reset = () => { setOutcome(null); setNote(""); setLossReason(null); };

  const save = async () => {
    if (!outcome) { toast.error("Pick a call outcome"); return; }
    if (needsReason && !lossReason) { toast.error("Select why they said no"); return; }
    setSaving(true);
    try {
      await api.post(`/leads/${lead.id}/call`, {
        outcome, note,
        next_follow_up: needsFollowUp ? toIso(date, time) : null,
        loss_reason: needsReason ? lossReason : null,
      });
      toast.success("Call logged");
      reset();
      onSaved && onSaved();
      onClose();
    } catch (e) { toast.error(apiErr(e)); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) { reset(); onClose(); } }}>
      <DialogContent data-testid="call-outcome-modal" className="max-w-md rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">How did the call go?</DialogTitle>
          <p className="text-sm text-slate-500">{lead.brand_name} · {lead.mobile}</p>
        </DialogHeader>

        <a href={telLink(lead.mobile)} data-testid="call-modal-dial-btn"
          className="mb-1 flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-primary/5 py-2.5 text-sm font-semibold text-primary">
          <Phone className="h-4 w-4" /> Tap to dial {lead.mobile}
        </a>

        <div className="grid grid-cols-2 gap-2">
          {(meta.call_outcomes || []).map((o) => {
            const m = OUTCOME_META[o.key];
            const active = outcome === o.key;
            return (
              <motion.button key={o.key} whileTap={{ scale: 0.96 }}
                data-testid={`call-outcome-${o.key}`}
                onClick={() => setOutcome(o.key)}
                className={`rounded-2xl py-3 px-2 text-sm font-semibold transition-colors ${active ? m.btn + " shadow-lift" : m.soft}`}>
                {m.emoji} {o.label}
              </motion.button>
            );
          })}
        </div>

        {needsReason && (
          <div className="animate-fade-up">
            <label className="text-sm font-semibold text-slate-700">Why did they say no?</label>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {(meta.loss_reasons || []).map((r) => (
                <button key={r.key} data-testid={`loss-reason-${r.key}`}
                  onClick={() => setLossReason(r.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${lossReason === r.key ? "bg-red-500 text-white" : "bg-red-50 text-red-600"}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="text-sm font-semibold text-slate-700">Add note</label>
          <Textarea data-testid="call-note-input" value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="Owner liked the concept. Asked for pricing for 20 cabs." className="mt-1.5 rounded-2xl" rows={2} />
        </div>

        {needsFollowUp && (
          <div className="animate-fade-up">
            <label className="text-sm font-semibold text-slate-700">Next follow-up</label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              <Input data-testid="followup-date-input" type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-2xl" />
              <Input data-testid="followup-time-input" type="time" value={time} onChange={(e) => setTime(e.target.value)} className="rounded-2xl" />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button data-testid="save-call-btn" onClick={save} disabled={saving}
            className="w-full rounded-2xl py-6 text-base font-semibold">
            {saving ? "Saving..." : "Save Call"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
