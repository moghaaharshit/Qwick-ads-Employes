import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import LeadCard from "@/components/LeadCard";
import CallOutcomeModal from "@/components/CallOutcomeModal";
import { PageHeader, CardSkeleton, EmptyState } from "@/components/Shared";

export default function Calls() {
  const qc = useQueryClient();
  const [callLead, setCallLead] = useState(null);
  const { data, isLoading } = useQuery({ queryKey: ["calls-today"], queryFn: async () => (await api.get("/calls/today")).data });
  const list = data || [];
  const refresh = () => { qc.invalidateQueries({ queryKey: ["calls-today"] }); qc.invalidateQueries({ queryKey: ["emp-dash"] }); qc.invalidateQueries({ queryKey: ["follow-ups"] }); };

  return (
    <div>
      <PageHeader title="Today's Calls" subtitle={`${list.length} leads ready to call`} />
      {isLoading ? <CardSkeleton count={6} /> : list.length === 0 ? (
        <EmptyState icon="PhoneOff" title="No calls queued" subtitle="You're all caught up for today!" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((lead, i) => <LeadCard key={lead.id} lead={lead} index={i} showComplete onComplete={setCallLead} />)}
        </div>
      )}
      <CallOutcomeModal lead={callLead} open={!!callLead} onClose={() => setCallLead(null)} onSaved={refresh} />
    </div>
  );
}
