import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Bell, Phone, Clock } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import api from "@/lib/api";
import { telLink, fmtTime } from "@/lib/qwick";

export default function Reminders() {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ["follow-ups"],
    queryFn: async () => (await api.get("/follow-ups")).data,
    refetchInterval: 60000,
  });
  const overdue = data?.overdue || [];
  const today = data?.today || [];
  const items = [...overdue, ...today];
  const count = items.length;

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (count > 0 && "Notification" in window && Notification.permission === "granted") {
      const notified = sessionStorage.getItem("qa_notified");
      if (!notified) {
        new Notification("QwickAds — Follow-ups due", { body: `You have ${count} follow-up(s) needing attention.` });
        sessionStorage.setItem("qa_notified", "1");
      }
    }
  }, [count]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button data-testid="reminders-bell" className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition-colors hover:bg-purple-50">
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 rounded-2xl p-0">
        <div className="border-b border-purple-50 p-3">
          <p className="font-heading font-bold text-slate-900">Reminders</p>
          <p className="text-xs text-slate-400">{count} follow-up(s) due now</p>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 && <p className="p-6 text-center text-sm text-slate-400">All caught up 🎉</p>}
          {items.slice(0, 8).map((it) => (
            <div key={it.id} data-testid={`reminder-${it.id}`} className="flex items-center justify-between gap-2 border-b border-purple-50 p-3 last:border-0">
              <div className="min-w-0" role="button" onClick={() => navigate(`/leads/${it.lead_id}`)}>
                <p className="truncate text-sm font-semibold text-slate-900">{it.brand_name}</p>
                <p className="flex items-center gap-1 text-xs text-amber-600"><Clock className="h-3 w-3" />{fmtTime(it.due_at)} · {it.contact_person}</p>
              </div>
              <a href={telLink(it.mobile)} className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
                <Phone className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
