import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export function useMeta() {
  const { data } = useQuery({
    queryKey: ["meta"],
    queryFn: async () => (await api.get("/meta")).data,
    staleTime: Infinity,
  });
  return data || {
    categories: [], sources: [], statuses: [], priorities: [],
    call_outcomes: [], loss_reasons: [], proposal_statuses: [], daily_call_target: 40,
  };
}
