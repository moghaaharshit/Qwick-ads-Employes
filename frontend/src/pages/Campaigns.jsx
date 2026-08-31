import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Receipt, Search, Clock, Pencil, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import CampaignModal from "@/components/CampaignModal";
import InvoiceModal from "@/components/InvoiceModal";
import { PageHeader, EmptyState } from "@/components/Shared";
import { useMeta } from "@/hooks/useMeta";
import { inr, fmtDate, CAMPAIGN_STATUS_META } from "@/lib/qwick";

export default function Campaigns() {
  const qc = useQueryClient();
  const meta = useMeta();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [invoicePrefill, setInvoicePrefill] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const { data } = useQuery({
    queryKey: ["campaigns", search, status],
    queryFn: async () => (await api.get("/campaigns", { params: { ...(search ? { search } : {}), ...(status !== "all" ? { status } : {}) } })).data,
  });
  const list = data || [];
  const refresh = () => { qc.invalidateQueries({ queryKey: ["campaigns"] }); qc.invalidateQueries({ queryKey: ["invoices"] }); qc.invalidateQueries({ queryKey: ["biz-dash"] }); };

  const genInvoice = async (c) => {
    try {
      const { data } = await api.post(`/campaigns/${c.id}/generate-invoice`);
      toast.success(`Invoice ${data.invoice_no} generated`);
      refresh();
    } catch (e) { toast.error(apiErr(e)); }
  };

  return (
    <div>
      <PageHeader title="Campaigns" subtitle={`${list.length} campaigns`}
        action={<Button data-testid="add-campaign-btn" onClick={() => { setEdit(null); setOpen(true); }} className="rounded-full font-semibold"><Plus className="h-4 w-4" /> Add Campaign</Button>} />

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input data-testid="campaign-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brand…" className="rounded-full pl-9" />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger data-testid="campaign-status-filter" className="w-44 rounded-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {(meta.campaign_statuses || []).map((s) => <SelectItem key={s.key} value={s.key}>{s.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {list.length === 0 ? <EmptyState icon="Megaphone" title="No campaigns yet" subtitle="Convert a proposal or add a campaign directly." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((c) => {
            const m = CAMPAIGN_STATUS_META[c.display_status] || CAMPAIGN_STATUS_META.active;
            return (
              <div key={c.id} data-testid={`campaign-card-${c.id}`} className="rounded-3xl bg-white p-5 shadow-soft border border-purple-50">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading text-base font-bold text-slate-900">{c.brand_name}</h3>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${m.cls}`}><span className={`h-1.5 w-1.5 rounded-full ${m.dot}`} />{m.label}</span>
                </div>
                <p className="text-sm text-slate-500">{c.cabs} cabs × {inr(c.rate)}/day × {c.paid_days}d{c.free_days ? ` + ${c.free_days} free` : ""}</p>
                <p className="mt-1 font-heading text-xl font-bold text-primary">{inr(c.amount)}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3 w-3" />{fmtDate(c.start_date)} → {fmtDate(c.end_date)}{c.days_left != null && c.days_left >= 0 ? ` · ${c.days_left}d left` : c.days_left != null ? " · expired" : ""}</p>
                <div className="mt-3 flex gap-1.5">
                  <button onClick={() => { setEdit(c); setOpen(true); }} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-slate-100 py-2 text-xs font-semibold text-slate-700 active:scale-95"><Pencil className="h-3.5 w-3.5" /> Edit</button>
                  {c.display_status === "expiring_soon" || c.display_status === "expired" ? (
                    <a href={`https://wa.me/?text=${encodeURIComponent(`Hi, your QwickAds campaign for ${c.brand_name} is ending soon. Shall we renew it?`)}`} target="_blank" rel="noreferrer"
                      className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-amber-500 py-2 text-xs font-semibold text-white active:scale-95"><MessageCircle className="h-3.5 w-3.5" /> Renew</a>
                  ) : null}
                  <button data-testid={`camp-invoice-${c.id}`} onClick={() => genInvoice(c)} className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-primary py-2 text-xs font-semibold text-white active:scale-95"><Receipt className="h-3.5 w-3.5" /> {c.invoice_id ? "Invoice" : "Invoice"}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      <CampaignModal open={open} onClose={() => setOpen(false)} onSaved={refresh} campaign={edit} />
      <InvoiceModal open={!!invoicePrefill} onClose={() => setInvoicePrefill(null)} onSaved={refresh} prefill={invoicePrefill} />
    </div>
  );
}
