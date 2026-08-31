import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, SlidersHorizontal, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useMeta } from "@/hooks/useMeta";
import api from "@/lib/api";
import LeadCard from "@/components/LeadCard";
import CallOutcomeModal from "@/components/CallOutcomeModal";
import LeadFormModal from "@/components/LeadFormModal";
import { PageHeader, CardSkeleton, EmptyState } from "@/components/Shared";

export default function Leads() {
  const { isAdmin } = useAuth();
  const meta = useMeta();
  const qc = useQueryClient();
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filters, setFilters] = useState({
    status: params.get("status") || "all", category: "all", priority: "all", source: "all", assigned_to: "all", sort: "recent",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [callLead, setCallLead] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const timer = useRef();

  useEffect(() => { clearTimeout(timer.current); timer.current = setTimeout(() => setDebounced(search), 350); return () => clearTimeout(timer.current); }, [search]);

  const { data: employees } = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data, enabled: isAdmin });

  const queryFn = useCallback(async () => {
    const p = { limit: 50, sort: filters.sort };
    if (debounced) p.search = debounced;
    ["status", "category", "priority", "source", "assigned_to"].forEach((k) => { if (filters[k] && filters[k] !== "all") p[k] = filters[k]; });
    return (await api.get("/leads", { params: p })).data;
  }, [debounced, filters]);

  const { data, isLoading } = useQuery({ queryKey: ["leads", debounced, filters], queryFn });
  const leads = data?.leads || [];

  const refresh = () => qc.invalidateQueries({ queryKey: ["leads"] });
  const openEdit = (lead) => { setEditLead(lead); setShowForm(true); };

  const exportCsv = async () => {
    try { await api.get("/leads/export/csv"); } catch (e) { /* CSV download handled inside api */ }
  };

  return (
    <div>
      <PageHeader title="Leads" subtitle={`${data?.total ?? 0} total leads`}
        action={
          <div className="flex gap-2">
            {isAdmin && <Button variant="outline" onClick={exportCsv} data-testid="export-csv-btn" className="rounded-full"><Download className="h-4 w-4" /></Button>}
            <Button data-testid="add-lead-btn" onClick={() => { setEditLead(null); setShowForm(true); }} className="rounded-full font-semibold"><Plus className="h-4 w-4" /> Add Lead</Button>
          </div>
        } />

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input data-testid="lead-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search brand, phone, contact, area..." className="rounded-full pl-9" />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((s) => !s)} data-testid="toggle-filters" className="rounded-full"><SlidersHorizontal className="h-4 w-4" /></Button>
      </div>

      {showFilters && (
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-2xl bg-white p-3 shadow-soft sm:grid-cols-3 lg:grid-cols-6 animate-fade-up">
          <FilterSelect label="Status" value={filters.status} onChange={(v) => setFilters((f) => ({ ...f, status: v }))} options={meta.statuses} />
          <FilterSelect label="Category" value={filters.category} onChange={(v) => setFilters((f) => ({ ...f, category: v }))} options={meta.categories} />
          <FilterSelect label="Priority" value={filters.priority} onChange={(v) => setFilters((f) => ({ ...f, priority: v }))} options={meta.priorities} />
          <FilterSelect label="Source" value={filters.source} onChange={(v) => setFilters((f) => ({ ...f, source: v }))} options={meta.sources} />
          {isAdmin && <FilterSelect label="Employee" value={filters.assigned_to} onChange={(v) => setFilters((f) => ({ ...f, assigned_to: v }))} options={(employees || []).map((e) => ({ key: e.id, label: e.name }))} />}
          <div>
            <Select value={filters.sort} onValueChange={(v) => setFilters((f) => ({ ...f, sort: v }))}>
              <SelectTrigger className="rounded-xl text-xs"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="recent">Recent</SelectItem><SelectItem value="priority">Priority</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
      )}

      {isLoading ? <CardSkeleton count={6} /> : leads.length === 0 ? (
        <EmptyState icon="Users" title="No leads found" subtitle="Try adjusting filters or add a new lead." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leads.map((lead, i) => <LeadCard key={lead.id} lead={lead} index={i} onComplete={setCallLead} showComplete />)}
        </div>
      )}

      <CallOutcomeModal lead={callLead} open={!!callLead} onClose={() => setCallLead(null)} onSaved={refresh} />
      <LeadFormModal open={showForm} onClose={() => setShowForm(false)} onSaved={refresh} lead={editLead} employees={employees || []} />
    </div>
  );
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="rounded-xl text-xs" data-testid={`filter-${label.toLowerCase()}`}><SelectValue placeholder={label} /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label}</SelectItem>
        {(options || []).map((o) => <SelectItem key={o.key} value={o.key}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  );
}
