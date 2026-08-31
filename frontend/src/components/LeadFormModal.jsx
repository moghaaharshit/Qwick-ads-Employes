import { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { useMeta } from "@/hooks/useMeta";
import { useAuth } from "@/context/AuthContext";

export default function LeadFormModal({ open, onClose, onSaved, lead, employees = [] }) {
  const meta = useMeta();
  const { isAdmin } = useAuth();
  const editing = !!lead;
  const [form, setForm] = useState({});
  const [dup, setDup] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(lead ? { ...lead } : {
        brand_name: "", category: "restaurant", contact_person: "", mobile: "", whatsapp: "",
        email: "", location: "", area: "", source: "instagram", priority: "warm", notes: "",
        expected_value: 0, assigned_to: "",
      });
      setDup(null);
    }
  }, [open, lead]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (force = false) => {
    if (!form.brand_name || !form.mobile) { toast.error("Brand name and mobile are required"); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/leads/${lead.id}`, form);
        toast.success("Lead updated");
      } else {
        const payload = { ...form, whatsapp: form.whatsapp || form.mobile };
        if (isAdmin && !payload.assigned_to) delete payload.assigned_to;
        await api.post(`/leads?force=${force}`, payload);
        toast.success("Lead created");
      }
      onSaved && onSaved();
      onClose();
    } catch (e) {
      if (e.response?.status === 409) {
        setDup(e.response.data.detail.duplicate);
      } else toast.error(apiErr(e));
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="lead-form-modal" className="max-h-[90vh] max-w-lg overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl">{editing ? "Edit Lead" : "Add New Lead"}</DialogTitle>
        </DialogHeader>

        {dup && (
          <div data-testid="duplicate-warning" className="rounded-2xl border border-amber-200 bg-amber-50 p-3">
            <div className="flex items-center gap-2 font-semibold text-amber-700">
              <AlertTriangle className="h-4 w-4" /> Lead already exists
            </div>
            <p className="mt-1 text-sm text-amber-700">
              <b>{dup.brand_name}</b> · Assigned to {dup.assigned_to_name || "—"}
            </p>
            <div className="mt-2 flex gap-2">
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => submit(true)}>Create anyway</Button>
              <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setDup(null)}>Cancel</Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2"><Label>Brand Name *</Label><Input data-testid="lead-brand-input" value={form.brand_name || ""} onChange={(e) => set("brand_name", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Mobile *</Label><Input data-testid="lead-mobile-input" value={form.mobile || ""} onChange={(e) => set("mobile", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>WhatsApp</Label><Input data-testid="lead-whatsapp-input" value={form.whatsapp || ""} onChange={(e) => set("whatsapp", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Contact Person</Label><Input value={form.contact_person || ""} onChange={(e) => set("contact_person", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Email</Label><Input value={form.email || ""} onChange={(e) => set("email", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Location</Label><Input value={form.location || ""} onChange={(e) => set("location", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div><Label>Area</Label><Input value={form.area || ""} onChange={(e) => set("area", e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger data-testid="lead-category-select" className="mt-1 rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.categories || []).map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Industry</Label>
            <Select value={form.industry || ""} onValueChange={(v) => set("industry", v)}>
              <SelectTrigger data-testid="lead-industry-select" className="mt-1 rounded-2xl"><SelectValue placeholder="Select industry" /></SelectTrigger>
              <SelectContent className="max-h-64">{(meta.industries || []).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Source</Label>
            <Select value={form.source} onValueChange={(v) => set("source", v)}>
              <SelectTrigger className="mt-1 rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.sources || []).map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Priority</Label>
            <Select value={form.priority} onValueChange={(v) => set("priority", v)}>
              <SelectTrigger data-testid="lead-priority-select" className="mt-1 rounded-2xl"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta.priorities || []).map((c) => <SelectItem key={c.key} value={c.key}>{c.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>Expected Value (₹)</Label><Input type="number" value={form.expected_value || 0} onChange={(e) => set("expected_value", Number(e.target.value))} className="mt-1 rounded-2xl" /></div>
          {isAdmin && (
            <div className="col-span-2">
              <Label>Assign to</Label>
              <Select value={form.assigned_to || ""} onValueChange={(v) => set("assigned_to", v)}>
                <SelectTrigger data-testid="lead-assign-select" className="mt-1 rounded-2xl"><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>{employees.map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="col-span-2"><Label>Notes</Label><Textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} className="mt-1 rounded-2xl" rows={2} /></div>
        </div>

        <DialogFooter>
          <Button data-testid="save-lead-btn" onClick={() => submit(false)} disabled={saving} className="w-full rounded-2xl py-6 text-base font-semibold">
            {saving ? "Saving..." : editing ? "Save Changes" : "Create Lead"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
