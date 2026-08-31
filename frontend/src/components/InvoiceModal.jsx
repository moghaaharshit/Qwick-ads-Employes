import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { useMeta } from "@/hooks/useMeta";
import { inr, addDays } from "@/lib/qwick";

export default function InvoiceModal({ open, onClose, onSaved, invoice, prefill }) {
  const meta = useMeta();
  const editing = !!invoice;
  const [f, setF] = useState({});

  useEffect(() => {
    if (!open) return;
    if (invoice) { setF({ ...invoice }); return; }
    (async () => {
      let nextNo = "";
      try { nextNo = (await api.get("/invoices/next-number")).data.invoice_no; } catch (e) {}
      setF({
        brand_name: prefill?.brand_name || "", invoice_no: nextNo,
        contact_person: prefill?.contact_person || "", phone: prefill?.phone || "", whatsapp: prefill?.whatsapp || "",
        invoice_date: new Date().toISOString().slice(0, 10),
        description: "Advertising campaign on QwickAds digital cab screens",
        cabs: prefill?.cabs ?? 20, paid_days: prefill?.paid_days ?? 7,
        free_days: prefill?.free_days ?? 0, rate: prefill?.rate ?? 39,
        start_date: prefill?.start_date?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        end_date: prefill?.end_date?.slice(0, 10) || "", status: "pending", notes: "",
        campaign_id: prefill?.campaign_id, proposal_id: prefill?.proposal_id, lead_id: prefill?.lead_id,
      });
    })();
  }, [open, invoice, prefill]);

  const set = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const amount = (+f.cabs || 0) * (+f.paid_days || 0) * (+f.rate || 0);

  const save = async () => {
    if (!f.brand_name) { toast.error("Brand name required"); return; }
    try {
      if (editing) await api.put(`/invoices/${invoice.id}`, f);
      else await api.post("/invoices", f);
      toast.success(editing ? "Invoice updated" : "Invoice created");
      onSaved && onSaved();
      onClose();
    } catch (e) { toast.error(apiErr(e)); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="invoice-modal" className="max-h-[92vh] max-w-lg overflow-y-auto rounded-3xl">
        <DialogHeader><DialogTitle className="font-heading text-xl">{editing ? "Edit Invoice" : "Create Invoice"}</DialogTitle></DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Invoice No</Label><Input data-testid="inv-number" value={f.invoice_no || ""} onChange={(e) => set("invoice_no", e.target.value)} className="mt-1 rounded-2xl font-semibold" /></div>
          <div><Label>Invoice Date</Label><Input type="date" value={(f.invoice_date || "").slice(0, 10)} onChange={(e) => set("invoice_date", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div className="col-span-2"><Label>Brand Name *</Label><Input data-testid="inv-brand" value={f.brand_name || ""} onChange={(e) => set("brand_name", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div className="col-span-2"><Label>Campaign Description</Label><Input value={f.description || ""} onChange={(e) => set("description", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Cabs</Label><Input data-testid="inv-cabs" type="number" value={f.cabs} onChange={(e) => set("cabs", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Rate / Cab / Day</Label><Input data-testid="inv-rate" type="number" value={f.rate} onChange={(e) => set("rate", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Paid Days</Label><Input data-testid="inv-paid" type="number" value={f.paid_days} onChange={(e) => set("paid_days", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Free Days</Label><Input type="number" value={f.free_days} onChange={(e) => set("free_days", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Start Date</Label><Input type="date" value={(f.start_date || "").slice(0, 10)} onChange={(e) => set("start_date", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>End Date</Label><Input type="date" value={(f.end_date || "").slice(0, 10)} onChange={(e) => set("end_date", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div className="col-span-2"><Label>Notes</Label><Textarea value={f.notes || ""} onChange={(e) => set("notes", e.target.value)} rows={2} className="mt-1 rounded-2xl" /></div>
        </div>
        <div className="rounded-2xl bg-purple-50 p-4 text-center">
          <p className="text-xs text-slate-500">{f.cabs || 0} cabs × {inr(f.rate || 0)}/day × {f.paid_days || 0} paid days</p>
          <p data-testid="inv-total" className="font-heading text-3xl font-bold text-primary">{inr(amount)}</p>
        </div>
        <DialogFooter><Button data-testid="save-invoice-btn" onClick={save} className="w-full rounded-2xl py-6 font-semibold">{editing ? "Save Invoice" : "Create Invoice"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
