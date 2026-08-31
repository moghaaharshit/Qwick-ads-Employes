import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { useMeta } from "@/hooks/useMeta";
import { computeCampaign, inr, addDays } from "@/lib/qwick";

export default function ProposalGeneratorModal({ open, onClose, onSaved, proposal, prefill }) {
  const meta = useMeta();
  const editing = !!proposal;
  const [f, setF] = useState({});

  useEffect(() => {
    if (open) setF(proposal ? { ...proposal } : {
      brand_name: "", contact_person: "", phone: "", whatsapp: "", cabs: 20, paid_days: 7, free_days: 0,
      rate: 39, start_date: new Date().toISOString().slice(0, 10), end_date: "",
      target_area: "", ad_type: "video", notes: "", status: "draft",
      ...(prefill || {}),
    });
  }, [open, proposal, prefill]);

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const applyPreset = (p) => setF((s) => ({ ...s, paid_days: p.days, rate: p.rate, end_date: addDays(s.start_date, p.days + (+s.free_days || 0)) }));
  const calc = computeCampaign({ cabs: f.cabs, paidDays: f.paid_days, freeDays: f.free_days, rate: f.rate });

  const save = async () => {
    if (!f.brand_name) { toast.error("Brand name is required"); return; }
    try {
      if (editing) await api.put(`/qw-proposals/${proposal.id}`, f);
      else await api.post("/qw-proposals", f);
      toast.success(editing ? "Proposal updated" : "Proposal created");
      onSaved && onSaved();
      onClose();
    } catch (e) { toast.error(apiErr(e)); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="proposal-generator-modal" className="max-h-[92vh] max-w-lg overflow-y-auto rounded-3xl">
        <DialogHeader><DialogTitle className="font-heading text-xl">{editing ? "Edit Proposal" : "Create Proposal"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Brand Name *</Label><Input data-testid="prop-gen-brand" value={f.brand_name || ""} onChange={(e) => set("brand_name", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Contact Person</Label><Input value={f.contact_person || ""} onChange={(e) => set("contact_person", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Phone</Label><Input value={f.phone || ""} onChange={(e) => set("phone", e.target.value)} className="mt-1 rounded-2xl" /></div>

          <div className="col-span-2">
            <Label>Preset duration & rate</Label>
            <div className="mt-1 flex gap-2">
              {(meta.pricing_presets || []).map((p) => (
                <button key={p.key} type="button" data-testid={`preset-${p.key}`} onClick={() => applyPreset(p)}
                  className="flex-1 rounded-2xl border border-purple-100 bg-purple-50 px-2 py-2 text-xs font-semibold text-primary hover:bg-purple-100">
                  {p.label}<br /><span className="text-[10px] text-slate-500">{inr(p.rate)}/day</span>
                </button>
              ))}
            </div>
          </div>

          <div><Label>Number of Cabs</Label><Input data-testid="prop-gen-cabs" type="number" value={f.cabs} onChange={(e) => set("cabs", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Rate / Cab / Day (₹)</Label><Input data-testid="prop-gen-rate" type="number" value={f.rate} onChange={(e) => set("rate", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Paid Days</Label><Input data-testid="prop-gen-paid" type="number" value={f.paid_days} onChange={(e) => set("paid_days", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Free Days</Label><Input data-testid="prop-gen-free" type="number" value={f.free_days} onChange={(e) => set("free_days", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Start Date</Label><Input type="date" value={f.start_date || ""} onChange={(e) => set("start_date", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>End Date</Label><Input type="date" value={f.end_date || ""} onChange={(e) => set("end_date", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Target Area</Label><Input value={f.target_area || ""} onChange={(e) => set("target_area", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div>
            <Label>Ad Type</Label>
            <Select value={f.ad_type} onValueChange={(v) => set("ad_type", v)}>
              <SelectTrigger className="mt-1 rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.ad_types || []).map((a) => <SelectItem key={a.key} value={a.key}>{a.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2"><Label>Notes</Label><Textarea value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={2} className="mt-1 rounded-2xl" /></div>
        </div>

        <div className="rounded-2xl bg-purple-50 p-4">
          <div className="flex justify-between text-sm text-slate-600"><span>{f.cabs || 0} cabs × {inr(f.rate || 0)}/day × {f.paid_days || 0} paid days</span><span className="font-semibold">{inr(calc.amountPayable)}</span></div>
          <div className="mt-1 flex justify-between text-sm text-slate-600"><span>Total exposure</span><span className="font-semibold">{calc.totalExposure} days ({f.free_days || 0} free)</span></div>
          <div className="mt-2 flex items-center justify-between border-t border-purple-100 pt-2">
            <span className="font-heading font-bold text-primary">Amount Payable</span>
            <span data-testid="prop-gen-total" className="font-heading text-2xl font-bold text-primary">{inr(calc.amountPayable)}</span>
          </div>
        </div>

        <DialogFooter><Button data-testid="save-proposal-gen-btn" onClick={save} className="w-full rounded-2xl py-6 font-semibold">{editing ? "Save Proposal" : "Create Proposal"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
