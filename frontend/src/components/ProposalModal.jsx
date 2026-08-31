import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { useMeta } from "@/hooks/useMeta";
import { inr } from "@/lib/qwick";

export default function ProposalModal({ lead, open, onClose, onSaved }) {
  const meta = useMeta();
  const [cabs, setCabs] = useState(20);
  const [price, setPrice] = useState(29);
  const [duration, setDuration] = useState(30);
  const [status, setStatus] = useState("sent");
  const [pkg, setPkg] = useState("Standard Cab Campaign");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const amount = (Number(cabs) || 0) * (Number(price) || 0) * (Number(duration) || 0);

  const save = async () => {
    setSaving(true);
    try {
      await api.post(`/leads/${lead.id}/proposals`, {
        package: pkg, cabs: Number(cabs), price_per_day: Number(price),
        duration_days: Number(duration), amount, status, notes,
      });
      toast.success("Proposal saved");
      onSaved && onSaved();
      onClose();
    } catch (e) { toast.error(apiErr(e)); }
    finally { setSaving(false); }
  };

  if (!lead) return null;
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="proposal-modal" className="max-w-md rounded-3xl">
        <DialogHeader><DialogTitle className="font-heading text-xl">Proposal · {lead.brand_name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Package</Label><Input data-testid="prop-package" value={pkg} onChange={(e) => setPkg(e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div className="grid grid-cols-3 gap-2">
            <div><Label>Cabs</Label><Input data-testid="prop-cabs" type="number" value={cabs} onChange={(e) => setCabs(e.target.value)} className="mt-1 rounded-2xl" /></div>
            <div><Label>₹/day</Label><Input data-testid="prop-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 rounded-2xl" /></div>
            <div><Label>Days</Label><Input data-testid="prop-duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 rounded-2xl" /></div>
          </div>
          <div>
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="prop-status" className="mt-1 rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.proposal_statuses || []).filter((s) => s.key !== "not_sent").map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Notes</Label><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 rounded-2xl" rows={2} /></div>
          <div className="rounded-2xl bg-purple-50 p-4 text-center">
            <p className="text-xs font-medium text-primary">{cabs} Cabs × {inr(price)}/day × {duration} days</p>
            <p className="font-heading text-3xl font-bold text-primary" data-testid="prop-total">{inr(amount)}</p>
          </div>
        </div>
        <DialogFooter><Button data-testid="save-proposal-btn" onClick={save} disabled={saving} className="w-full rounded-2xl py-6 font-semibold">{saving ? "Saving…" : "Save Proposal"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
