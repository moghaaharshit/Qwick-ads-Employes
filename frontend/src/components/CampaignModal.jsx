import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { computeCampaign, inr, addDays } from "@/lib/qwick";

export default function CampaignModal({ open, onClose, onSaved, campaign }) {
  const editing = !!campaign;
  const [f, setF] = useState({});

  useEffect(() => {
    if (open) setF(campaign ? { ...campaign } : {
      brand_name: "", campaign_name: "", cabs: 20, paid_days: 30, free_days: 0, rate: 29,
      start_date: new Date().toISOString().slice(0, 10), end_date: addDays(new Date().toISOString().slice(0, 10), 30),
      target_area: "", ad_type: "video", status: "active",
    });
  }, [open, campaign]);

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const calc = computeCampaign({ cabs: f.cabs, paidDays: f.paid_days, freeDays: f.free_days, rate: f.rate });

  const save = async () => {
    if (!f.brand_name) { toast.error("Brand name required"); return; }
    try {
      if (editing) await api.put(`/campaigns/${campaign.id}`, f);
      else await api.post("/campaigns", f);
      toast.success(editing ? "Campaign updated" : "Campaign created");
      onSaved && onSaved();
      onClose();
    } catch (e) { toast.error(apiErr(e)); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="campaign-modal" className="max-h-[92vh] max-w-lg overflow-y-auto rounded-3xl">
        <DialogHeader><DialogTitle className="font-heading text-xl">{editing ? "Edit Campaign" : "Add Campaign"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Brand Name *</Label><Input data-testid="camp-brand" value={f.brand_name || ""} onChange={(e) => set("brand_name", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div className="col-span-2"><Label>Campaign Name</Label><Input value={f.campaign_name || ""} onChange={(e) => set("campaign_name", e.target.value)} className="mt-1 rounded-2xl" placeholder="Auto from brand" /></div>
          <div><Label>Cabs</Label><Input type="number" value={f.cabs} onChange={(e) => set("cabs", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Rate / Cab / Day</Label><Input type="number" value={f.rate} onChange={(e) => set("rate", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Paid Days</Label><Input type="number" value={f.paid_days} onChange={(e) => set("paid_days", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Free Days</Label><Input type="number" value={f.free_days} onChange={(e) => set("free_days", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Start Date</Label><Input type="date" value={(f.start_date || "").slice(0, 10)} onChange={(e) => set("start_date", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>End Date</Label><Input type="date" value={(f.end_date || "").slice(0, 10)} onChange={(e) => set("end_date", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div className="col-span-2"><Label>Target Area</Label><Input value={f.target_area || ""} onChange={(e) => set("target_area", e.target.value)} className="mt-1 rounded-2xl" /></div>
        </div>
        <div className="rounded-2xl bg-purple-50 p-4 text-center">
          <p className="text-xs text-slate-500">Total exposure {calc.totalExposure} days</p>
          <p className="font-heading text-2xl font-bold text-primary">{inr(calc.amountPayable)}</p>
        </div>
        <DialogFooter><Button data-testid="save-campaign-btn" onClick={save} className="w-full rounded-2xl py-6 font-semibold">{editing ? "Save Campaign" : "Add Campaign"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
