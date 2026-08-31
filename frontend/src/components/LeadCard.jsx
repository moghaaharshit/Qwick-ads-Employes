import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Phone, MessageCircle, MapPin, Clock, User } from "lucide-react";
import { StatusPill, PriorityBadge } from "./Pills";
import { telLink, waLink, fmtTime, labelOf } from "@/lib/qwick";
import { useMeta } from "@/hooks/useMeta";

export default function LeadCard({ lead, index = 0, onCall, onWhatsapp, onComplete, showComplete }) {
  const navigate = useNavigate();
  const meta = useMeta();

  return (
    <motion.div
      data-testid={`lead-card-${lead.id}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="rounded-3xl bg-white p-5 shadow-soft border border-purple-50"
    >
      <div className="flex items-start justify-between gap-3" onClick={() => navigate(`/leads/${lead.id}`)} role="button">
        <div className="min-w-0">
          <h3 className="font-heading text-lg font-bold text-slate-900 truncate">{lead.brand_name}</h3>
          <p className="text-sm text-slate-500">{labelOf(meta.categories, lead.category)}</p>
          <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
            <MapPin className="h-3.5 w-3.5" /> {lead.area || lead.location || "—"}
          </div>
        </div>
        <PriorityBadge priority={lead.priority} />
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-slate-600" onClick={() => navigate(`/leads/${lead.id}`)} role="button">
        <User className="h-4 w-4 text-purple-400" />
        <span className="font-medium">{lead.contact_person || "Contact"}</span>
        <span className="text-slate-300">·</span>
        <span className="tabular-nums">{lead.mobile}</span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <StatusPill status={lead.status} />
        {lead.follow_up_due && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
            <Clock className="h-3.5 w-3.5" /> {fmtTime(lead.follow_up_due)}
          </span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <a data-testid={`lead-call-${lead.id}`} href={telLink(lead.mobile)}
          onClick={(e) => { e.stopPropagation(); onCall && onCall(lead); }}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition-transform active:scale-95 hover:bg-primary/90">
          <Phone className="h-4 w-4" /> Call
        </a>
        <a data-testid={`lead-whatsapp-${lead.id}`} href={waLink(lead.whatsapp || lead.mobile)} target="_blank" rel="noreferrer"
          onClick={(e) => { e.stopPropagation(); onWhatsapp && onWhatsapp(lead); }}
          className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-500 py-3 text-sm font-semibold text-white transition-transform active:scale-95 hover:bg-emerald-600">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </a>
        {showComplete ? (
          <button data-testid={`lead-complete-${lead.id}`}
            onClick={(e) => { e.stopPropagation(); onComplete && onComplete(lead); }}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-transform active:scale-95 hover:bg-slate-200">
            ✓ Log
          </button>
        ) : (
          <button data-testid={`lead-view-${lead.id}`}
            onClick={(e) => { e.stopPropagation(); navigate(`/leads/${lead.id}`); }}
            className="flex items-center justify-center gap-1.5 rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-700 transition-transform active:scale-95 hover:bg-slate-200">
            View
          </button>
        )}
      </div>
    </motion.div>
  );
}
