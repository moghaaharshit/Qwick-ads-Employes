import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, FileText, Download, Eye, ArrowRightLeft, Search, Pencil, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { buildProposalPdf } from "@/lib/pdf";
import { getBusinessSettings } from "@/lib/firestore";
import { useAuth } from "@/context/AuthContext";
import { shareProposal } from "@/lib/share";
import ProposalGeneratorModal from "@/components/ProposalGeneratorModal";
import { PageHeader, EmptyState } from "@/components/Shared";
import { inr, fmtDate } from "@/lib/qwick";

const STATUS_CLS = {
  draft: "bg-slate-100 text-slate-600", sent: "bg-blue-50 text-blue-600",
  accepted: "bg-emerald-50 text-emerald-600", rejected: "bg-red-50 text-red-600",
};

export default function Proposals() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState(null);
  const [search, setSearch] = useState("");
  const { data } = useQuery({ queryKey: ["qw-proposals", search], queryFn: async () => (await api.get("/qw-proposals", { params: search ? { search } : {} })).data });
  const list = data || [];
  const refresh = () => { qc.invalidateQueries({ queryKey: ["qw-proposals"] }); qc.invalidateQueries({ queryKey: ["campaigns"] }); };

  const convert = async (p) => {
    try { await api.post(`/qw-proposals/${p.id}/convert-to-campaign`); toast.success("Converted to campaign"); refresh(); }
    catch (e) { toast.error(apiErr(e)); }
  };
  const pdf = async (p, download) => {
    try {
      const settings = await getBusinessSettings();
      const arrayBuf = buildProposalPdf(p, settings);
      const blob = new Blob([arrayBuf], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      if (download) {
        const a = document.createElement("a"); a.href = url; a.download = `QwickAds_Proposal_${p.brand_name}.pdf`; a.click();
      } else {
        window.open(url, "_blank");
      }
      setTimeout(() => URL.revokeObjectURL(url), 15000);
    } catch (e) { toast.error("Could not generate PDF"); }
  };

  return (
    <div>
      <PageHeader title="Proposals" subtitle={`${list.length} proposals`}
        action={<Button data-testid="create-proposal-btn" onClick={() => { setEdit(null); setOpen(true); }} className="rounded-full font-semibold"><Plus className="h-4 w-4" /> Create Proposal</Button>} />

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input data-testid="proposal-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brand or proposal no…" className="rounded-full pl-9" />
      </div>

      {list.length === 0 ? <EmptyState icon="FileText" title="No proposals yet" subtitle="Create a QwickAds proposal in seconds." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <div key={p.id} data-testid={`proposal-card-${p.id}`} className="rounded-3xl bg-white p-5 shadow-soft border border-purple-50">
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-primary"><FileText className="h-5 w-5" /></div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLS[p.status] || STATUS_CLS.draft}`}>{p.status}</span>
              </div>
              <p className="mt-3 text-xs font-semibold text-slate-400">{p.proposal_no}</p>
              <h3 className="font-heading text-lg font-bold text-slate-900">{p.brand_name}</h3>
              <p className="text-sm text-slate-500">{p.cabs} cabs × {inr(p.rate)}/day × {p.paid_days}d{p.free_days ? ` + ${p.free_days} free` : ""}</p>
              <p className="mt-1 font-heading text-2xl font-bold text-primary">{inr(p.amount_payable)}</p>
              <p className="text-xs text-slate-400">{p.total_exposure} days exposure · {fmtDate(p.created_at)}</p>
              <p className="mt-1 text-xs text-slate-400">By {p.created_by_name || "—"}{p.whatsapp_shared ? <span className="ml-1 font-semibold text-emerald-600">· ✓ Sent via WhatsApp</span> : ""}</p>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                <button data-testid={`prop-preview-${p.id}`} onClick={() => pdf(p, false)} title="Preview" className="flex items-center justify-center rounded-xl bg-slate-100 py-2 text-slate-700 active:scale-95"><Eye className="h-4 w-4" /></button>
                <button data-testid={`prop-download-${p.id}`} onClick={() => pdf(p, true)} title="Download" className="flex items-center justify-center rounded-xl bg-slate-100 py-2 text-slate-700 active:scale-95"><Download className="h-4 w-4" /></button>
                <button data-testid={`prop-share-${p.id}`} onClick={() => shareProposal(p, user?.name)} title="Share on WhatsApp" className="flex items-center justify-center rounded-xl bg-emerald-500 py-2 text-white active:scale-95"><MessageCircle className="h-4 w-4" /></button>
                <button onClick={() => { setEdit(p); setOpen(true); }} title="Edit" className="flex items-center justify-center rounded-xl bg-slate-100 py-2 text-slate-700 active:scale-95"><Pencil className="h-4 w-4" /></button>
                <button data-testid={`prop-convert-${p.id}`} onClick={() => convert(p)} title="Convert to Campaign" className="flex items-center justify-center rounded-xl bg-primary py-2 text-white active:scale-95"><ArrowRightLeft className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      <ProposalGeneratorModal open={open} onClose={() => setOpen(false)} onSaved={refresh} proposal={edit} />
    </div>
  );
}
