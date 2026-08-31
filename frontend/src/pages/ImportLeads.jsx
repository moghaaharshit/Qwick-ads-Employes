import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { PageHeader } from "@/components/Shared";

export default function ImportLeads() {
  const [preview, setPreview] = useState(null);
  const [assignTo, setAssignTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(null);
  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data });

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setLoading(true); setDone(null);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter((l) => l.trim());
      if (lines.length < 2) throw new Error('CSV must have a header row and at least one data row');
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const rows = lines.slice(1).map((line) => {
        const vals = line.split(',');
        const obj = {};
        headers.forEach((h, i) => { obj[h] = (vals[i] || '').trim(); });
        return obj;
      });
      const { data } = await api.post('/leads/import/preview', { rows });
      setPreview(data);
    } catch (err) { toast.error(apiErr(err, 'Could not read file. Use a CSV with Brand Name & Phone columns.')); }
    finally { setLoading(false); }
  };

  const commit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post("/leads/import/commit", { rows: preview.rows, assigned_to: assignTo || null, skip_duplicates: true });
      setDone(data.imported); setPreview(null); toast.success(`${data.imported} leads imported`);
    } catch (e) { toast.error(apiErr(e)); }
    finally { setLoading(false); }
  };

  const downloadTemplate = () => {
    const csv = "Brand Name,Contact Person,Phone,WhatsApp,Category,Location,Source,Notes\nSample Cafe,Ramesh,9876543210,9876543210,Restaurant,Vashi,Instagram,Interested in ads\n";
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a"); a.href = url; a.download = "qwickads_template.csv"; a.click();
  };

  return (
    <div>
      <PageHeader title="Import Leads" subtitle="Upload a CSV to add leads in bulk"
        action={<Button variant="outline" onClick={downloadTemplate} className="rounded-full" data-testid="download-template">Template</Button>} />

      {done != null && (
        <div className="mb-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-emerald-700 animate-fade-up">
          <CheckCircle2 className="h-5 w-5" /> <span className="font-semibold">{done} leads imported successfully!</span>
        </div>
      )}

      {!preview ? (
        <label data-testid="import-dropzone" className="flex cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-purple-200 bg-white/60 py-16 text-center transition-colors hover:border-primary hover:bg-purple-50/50">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-primary"><Upload className="h-7 w-7" /></div>
          <p className="font-heading text-lg font-bold text-slate-800">{loading ? "Reading file…" : "Click to upload CSV"}</p>
          <p className="mt-1 text-sm text-slate-400">Columns: Brand Name, Phone, Category, Location, Source, Notes</p>
          <input type="file" accept=".csv" className="hidden" onChange={onFile} data-testid="import-file-input" />
        </label>
      ) : (
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <div className="flex items-center gap-2"><FileSpreadsheet className="h-6 w-6 text-primary" /><h3 className="font-heading text-lg font-bold">{preview.total} leads found</h3></div>
          <div className="mt-3 flex gap-3">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">{preview.new} new</span>
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-600"><AlertTriangle className="h-3.5 w-3.5" />{preview.duplicates} duplicates</span>
          </div>

          <div className="mt-4">
            <label className="text-sm font-semibold text-slate-600">Assign imported leads to</label>
            <Select value={assignTo} onValueChange={setAssignTo}>
              <SelectTrigger className="mt-1 max-w-xs rounded-2xl" data-testid="import-assign"><SelectValue placeholder="Me (Admin)" /></SelectTrigger>
              <SelectContent>{(employees || []).map((e) => <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="mt-4 max-h-64 overflow-y-auto rounded-2xl border border-purple-50">
            {preview.rows.slice(0, 50).map((r, i) => (
              <div key={i} className="flex items-center justify-between border-b border-purple-50 px-4 py-2 last:border-0">
                <div><p className="text-sm font-semibold text-slate-800">{r.brand_name || "—"}</p><p className="text-xs text-slate-400">{r.mobile} · {r.location}</p></div>
                {r.is_duplicate && <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-600">Duplicate</span>}
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <Button data-testid="commit-import-btn" onClick={commit} disabled={loading} className="flex-1 rounded-2xl py-5 font-semibold">Import {preview.new} Leads</Button>
            <Button variant="outline" onClick={() => setPreview(null)} className="rounded-2xl py-5">Cancel</Button>
          </div>
        </div>
      )}
    </div>
  );
}
