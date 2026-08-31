import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Download, Eye, IndianRupee, Search, Pencil, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api from "@/lib/api";
import { buildInvoicePdf } from "@/lib/pdf";
import { getBusinessSettings } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { shareInvoice } from "@/lib/share";
import InvoiceModal from "@/components/InvoiceModal";
import PaymentModal from "@/components/PaymentModal";
import { PageHeader, EmptyState } from "@/components/Shared";
import { useMeta } from "@/hooks/useMeta";
import { inr, fmtDate, INVOICE_STATUS_META } from "@/lib/qwick";

export default function Invoices() {
  const qc = useQueryClient();
  const meta = useMeta();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [pay, setPay] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data } = useQuery({
    queryKey: ["invoices", search, status],
    queryFn: async () => (await api.get("/invoices", { params: { ...(search ? { search } : {}), ...(status !== "all" ? { status } : {}) } })).data,
  });
  const list = data || [];
  const refresh = () => { qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["biz-dash"] }); };
  const pdf = async (inv, download) => {
    try {
      const settings = await getBusinessSettings();
      const arrayBuf = buildInvoicePdf(inv, settings);
      const blob = new Blob([arrayBuf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (download) {
        const a = document.createElement("a"); a.href = url; a.download = `QwickAds_Invoice_${inv.invoice_no}.pdf`; a.click();
      } else {
        window.open(url, "_blank");
      }
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } catch (e) { toast.error("Could not generate PDF"); }
  };

  return (
    <div>
      <PageHeader title="Invoices" subtitle={`${list.length} invoices`}
        action={<Button data-testid="create-invoice-btn" onClick={() => { setEdit(null); setOpen(true); }} className="rounded-full font-semibold"><Plus className="h-4 w-4" /> Create Invoice</Button>} />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input data-testid="invoice-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brand or QW number…" className="rounded-full pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger data-testid="invoice-status-filter" className="w-44 rounded-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(meta.invoice_statuses || []).map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? <EmptyState icon="Receipt" title="No invoices yet" subtitle="Create your first QwickAds invoice." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((inv) => {
            const m = INVOICE_STATUS_META[inv.status] || INVOICE_STATUS_META.pending;
            return (
              <div key={inv.id} data-testid={`invoice-card-${inv.id}`} className="rounded-3xl bg-white p-5 shadow-soft border border-purple-50">
                <div className="flex items-center justify-between">
                  <span className="font-heading text-lg font-bold text-primary">{inv.invoice_no}</span>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${m.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />{m.label}</span>
                </div>
                <h3 className="mt-2 font-heading text-base font-bold text-slate-900">{inv.brand_name}</h3>
                <p className="text-sm text-slate-500">{inv.cabs} cabs × {inr(inv.rate)}/day × {inv.paid_days}d</p>
                <p className="mt-1 font-heading text-2xl font-bold text-slate-900">{inr(inv.amount)}</p>
                {inv.balance_due > 0 && inv.amount_paid > 0 && <p className="text-xs text-amber-600">Balance {inr(inv.balance_due)}</p>}
                <p className="text-xs text-slate-400">{fmtDate(inv.invoice_date)} · By {inv.created_by_name || "—"}{inv.whatsapp_shared ? " · ✓ Sent" : ""}</p>
                <div className="mt-3 grid grid-cols-5 gap-1.5">
                  <button data-testid={`inv-preview-${inv.id}`} onClick={() => pdf(inv, false)} title="Preview" className="flex items-center justify-center rounded-xl bg-slate-100 py-2 text-slate-700 active:scale-95"><Eye className="h-4 w-4" /></button>
                  <button data-testid={`inv-download-${inv.id}`} onClick={() => pdf(inv, true)} title="Download" className="flex items-center justify-center rounded-xl bg-slate-100 py-2 text-slate-700 active:scale-95"><Download className="h-4 w-4" /></button>
                  <button data-testid={`inv-share-${inv.id}`} onClick={() => shareInvoice(inv, user?.name)} title="Share on WhatsApp" className="flex items-center justify-center rounded-xl bg-emerald-500 py-2 text-white active:scale-95"><MessageCircle className="h-4 w-4" /></button>
                  <button onClick={() => { setEdit(inv); setOpen(true); }} title="Edit" className="flex items-center justify-center rounded-xl bg-slate-100 py-2 text-slate-700 active:scale-95"><Pencil className="h-4 w-4" /></button>
                  <button data-testid={`inv-pay-${inv.id}`} onClick={() => setPay(inv)} title="Record Payment" className="flex items-center justify-center rounded-xl bg-primary py-2 text-white active:scale-95"><IndianRupee className="h-4 w-4" /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <InvoiceModal open={open} onClose={() => setOpen(false)} onSaved={refresh} invoice={edit} />
      <PaymentModal open={!!pay} onClose={() => setPay(null)} onSaved={refresh} invoice={pay} />
    </div>
  );
}
