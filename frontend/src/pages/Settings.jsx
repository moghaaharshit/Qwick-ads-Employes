import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { MessageCircle, Save, Building2, Landmark, MessageSquare, DatabaseZap, AlertTriangle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { PageHeader } from "@/components/Shared";

export default function Settings() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: templates, refetch } = useQuery({ queryKey: ["templates"], queryFn: async () => (await api.get("/templates")).data });
  const { data: settings } = useQuery({ queryKey: ["business-settings"], queryFn: async () => (await api.get("/business-settings")).data });
  const [drafts, setDrafts] = useState({});
  const [biz, setBiz] = useState(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  useEffect(() => { if (templates) setDrafts(Object.fromEntries(templates.map((t) => [t.id, t.body]))); }, [templates]);
  useEffect(() => { if (settings) setBiz({ ...settings, banking: { ...settings.banking } }); }, [settings]);

  const saveTemplate = async (t) => {
    try { await api.put(`/templates/${t.id}`, { body: drafts[t.id] }); toast.success(`${t.title} saved`); refetch(); }
    catch (e) { toast.error(apiErr(e)); }
  };
  const saveBiz = async () => {
    try { await api.put("/business-settings", biz); toast.success("Business details saved"); qc.invalidateQueries({ queryKey: ["business-settings"] }); }
    catch (e) { toast.error(apiErr(e)); }
  };
  const setB = (k, v) => setBiz((s) => ({ ...s, [k]: v }));
  const setBank = (k, v) => setBiz((s) => ({ ...s, banking: { ...s.banking, [k]: v } }));

  const doReset = async () => {
    try {
      await api.post("/admin/reset-demo", { confirm: confirmText });
      toast.success("Demo data successfully cleared.");
      setResetOpen(false); setConfirmText("");
      qc.invalidateQueries();
      navigate("/");
    } catch (e) { toast.error(apiErr(e)); }
  };
  const backup = async () => {
    try { await api.get("/admin/backup"); toast.success("Backup downloaded"); }
    catch (e) { toast.error("Backup failed"); }
  };

  if (!biz) return null;

  return (
    <div>
      <PageHeader title="Settings" subtitle="Business details, banking, templates & data management" />
      <Tabs defaultValue="business">
        <TabsList className="mb-4 flex-wrap">
          <TabsTrigger value="business" data-testid="tab-business"><Building2 className="mr-1 h-4 w-4" /> Business</TabsTrigger>
          <TabsTrigger value="banking" data-testid="tab-banking"><Landmark className="mr-1 h-4 w-4" /> Banking</TabsTrigger>
          <TabsTrigger value="templates" data-testid="tab-templates"><MessageSquare className="mr-1 h-4 w-4" /> Templates</TabsTrigger>
          <TabsTrigger value="data" data-testid="tab-data"><DatabaseZap className="mr-1 h-4 w-4" /> Data</TabsTrigger>
        </TabsList>

        <TabsContent value="business">
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <h3 className="mb-4 font-heading text-lg font-bold text-slate-900">Business Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Company Name</Label><Input data-testid="biz-company" value={biz.company_name || ""} onChange={(e) => setB("company_name", e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div className="col-span-2"><Label>Tagline</Label><Input value={biz.tagline || ""} onChange={(e) => setB("tagline", e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div className="col-span-2"><Label>Address</Label><Input value={biz.address || ""} onChange={(e) => setB("address", e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>Phone</Label><Input value={biz.phone || ""} onChange={(e) => setB("phone", e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>Email</Label><Input value={biz.email || ""} onChange={(e) => setB("email", e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>GST No</Label><Input value={biz.gst || ""} onChange={(e) => setB("gst", e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>Total Ad Slots</Label><Input type="number" value={biz.total_slots || 6} onChange={(e) => setB("total_slots", Number(e.target.value))} className="mt-1 rounded-2xl" /></div>
            </div>
            <Button data-testid="save-business-btn" onClick={saveBiz} className="mt-4 rounded-full font-semibold"><Save className="h-4 w-4" /> Save</Button>
          </div>
        </TabsContent>

        <TabsContent value="banking">
          <div className="rounded-3xl bg-white p-6 shadow-soft">
            <h3 className="mb-4 font-heading text-lg font-bold text-slate-900">Banking Details</h3>
            <p className="mb-3 text-sm text-slate-500">Shown on generated invoices.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Account Name</Label><Input data-testid="bank-account-name" value={biz.banking?.account_name || ""} onChange={(e) => setBank("account_name", e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>Bank Name</Label><Input data-testid="bank-name" value={biz.banking?.bank_name || ""} onChange={(e) => setBank("bank_name", e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>Account Number</Label><Input data-testid="bank-account-number" value={biz.banking?.account_number || ""} onChange={(e) => setBank("account_number", e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>IFSC Code</Label><Input data-testid="bank-ifsc" value={biz.banking?.ifsc || ""} onChange={(e) => setBank("ifsc", e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>Branch</Label><Input value={biz.banking?.branch || ""} onChange={(e) => setBank("branch", e.target.value)} className="mt-1 rounded-2xl" /></div>
            </div>
            <Button data-testid="save-banking-btn" onClick={saveBiz} className="mt-4 rounded-full font-semibold"><Save className="h-4 w-4" /> Save</Button>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <div className="grid gap-4 lg:grid-cols-2">
            {(templates || []).map((t) => (
              <div key={t.id} data-testid={`template-${t.key}`} className="rounded-3xl bg-white p-6 shadow-soft border border-purple-50">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><MessageCircle className="h-5 w-5" /></div>
                  <h3 className="font-heading text-lg font-bold text-slate-900">{t.title}</h3>
                </div>
                <Textarea data-testid={`template-input-${t.key}`} value={drafts[t.id] ?? ""} onChange={(e) => setDrafts((d) => ({ ...d, [t.id]: e.target.value }))} rows={4} className="rounded-2xl" />
                <Button data-testid={`save-template-${t.key}`} onClick={() => saveTemplate(t)} className="mt-3 rounded-full font-semibold"><Save className="h-4 w-4" /> Save</Button>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="rounded-3xl border border-red-200 bg-white p-6 shadow-soft">
            <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-red-600"><AlertTriangle className="h-5 w-5" /> Reset Demo Data</h3>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Permanently removes all demo/sample business records — brands, leads, campaigns, proposals, invoices, payments and activity history.
              Your account, settings, banking details and pricing configuration are preserved. Invoice numbering resets to QW-001.
            </p>
            <div className="mt-4 flex gap-2">
              <Button variant="outline" onClick={backup} data-testid="download-backup-btn" className="rounded-full"><Download className="h-4 w-4" /> Download Backup</Button>
              <Button data-testid="open-reset-btn" onClick={() => setResetOpen(true)} className="rounded-full bg-red-500 font-semibold hover:bg-red-600">Reset Demo Data</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={resetOpen} onOpenChange={(o) => { if (!o) { setResetOpen(false); setConfirmText(""); } }}>
        <DialogContent data-testid="reset-modal" className="max-w-md rounded-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-heading text-xl text-red-600"><AlertTriangle className="h-5 w-5" /> Reset Demo Data</DialogTitle>
          </DialogHeader>
          <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
            This will permanently remove all brands, leads, campaigns, proposals, invoices, payment records and activity history.
            <b> This action cannot be undone.</b> Your login, settings and banking details are safe.
          </div>
          <Button variant="outline" onClick={backup} className="rounded-full"><Download className="h-4 w-4" /> Download Backup first</Button>
          <div>
            <Label>Type RESET to continue</Label>
            <Input data-testid="reset-confirm-input" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="RESET" className="mt-1 rounded-2xl" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setResetOpen(false); setConfirmText(""); }} className="rounded-full">Cancel</Button>
            <Button data-testid="confirm-reset-btn" disabled={confirmText !== "RESET"} onClick={doReset} className="rounded-full bg-red-500 font-semibold hover:bg-red-600">Reset Demo Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
