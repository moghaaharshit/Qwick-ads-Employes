import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Trophy, Calendar } from "lucide-react";
import api from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/Shared";
import { inr, fmtDate } from "@/lib/qwick";

export default function Customers() {
  const navigate = useNavigate();
  const { data } = useQuery({ queryKey: ["customers"], queryFn: async () => (await api.get("/customers")).data });
  const list = data || [];
  const revenue = list.reduce((s, l) => s + (l.conversion?.total_value || l.expected_value || 0), 0);

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${list.length} converted · ${inr(revenue)} booked`} />
      {list.length === 0 ? <EmptyState icon="Trophy" title="No customers yet" subtitle="Convert leads to see them here." /> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((l) => (
            <button key={l.id} data-testid={`customer-${l.id}`} onClick={() => navigate(`/leads/${l.id}`)}
              className="rounded-3xl bg-white p-5 text-left shadow-soft border border-emerald-100 transition-transform hover:-translate-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600"><Trophy className="h-5 w-5" /></div>
                <div>
                  <h3 className="font-heading text-base font-bold text-slate-900">{l.brand_name}</h3>
                  <p className="text-xs text-slate-400">{l.assigned_to_name}</p>
                </div>
              </div>
              <p className="mt-3 font-heading text-2xl font-bold text-emerald-600">{inr(l.conversion?.total_value || l.expected_value)}</p>
              {l.conversion && <p className="text-sm text-slate-500">{l.conversion.cabs} cabs · {l.conversion.duration_days} days</p>}
              {l.conversion?.start_date && <p className="mt-1 flex items-center gap-1 text-xs text-slate-400"><Calendar className="h-3 w-3" />{fmtDate(l.conversion.start_date)}</p>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
