// Domain constants, label maps, color helpers, and formatting utilities.

export const STATUS_META = {
  new: { label: "New", cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400", ring: "ring-slate-200" },
  called: { label: "Called", cls: "bg-blue-50 text-blue-600", dot: "bg-blue-500", ring: "ring-blue-200" },
  interested: { label: "Interested", cls: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500", ring: "ring-emerald-200" },
  follow_up: { label: "Follow-up", cls: "bg-amber-50 text-amber-600", dot: "bg-amber-500", ring: "ring-amber-200" },
  proposal_sent: { label: "Proposal Sent", cls: "bg-purple-50 text-purple-600", dot: "bg-purple-500", ring: "ring-purple-200" },
  negotiation: { label: "Negotiation", cls: "bg-indigo-50 text-indigo-600", dot: "bg-indigo-500", ring: "ring-indigo-200" },
  converted: { label: "Converted", cls: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-600", ring: "ring-emerald-300" },
  not_interested: { label: "Not Interested", cls: "bg-red-50 text-red-600", dot: "bg-red-500", ring: "ring-red-200" },
};

export const PRIORITY_META = {
  hot: { label: "Hot", cls: "bg-red-50 text-red-600 border-red-200", dot: "bg-red-500" },
  warm: { label: "Warm", cls: "bg-orange-50 text-orange-600 border-orange-200", dot: "bg-orange-500" },
  cold: { label: "Cold", cls: "bg-blue-50 text-blue-600 border-blue-200", dot: "bg-blue-500" },
};

export const OUTCOME_META = {
  interested: { label: "Interested", btn: "bg-emerald-500 hover:bg-emerald-600 text-white", soft: "bg-emerald-50 text-emerald-600", emoji: "🟢" },
  call_later: { label: "Call Later", btn: "bg-amber-400 hover:bg-amber-500 text-white", soft: "bg-amber-50 text-amber-600", emoji: "🟡" },
  send_proposal: { label: "Send Proposal", btn: "bg-blue-500 hover:bg-blue-600 text-white", soft: "bg-blue-50 text-blue-600", emoji: "🔵" },
  asked_for_details: { label: "Asked For Details", btn: "bg-purple-500 hover:bg-purple-600 text-white", soft: "bg-purple-50 text-purple-600", emoji: "🟣" },
  owner_unavailable: { label: "Owner Unavailable", btn: "bg-orange-500 hover:bg-orange-600 text-white", soft: "bg-orange-50 text-orange-600", emoji: "🟠" },
  not_interested: { label: "Not Interested", btn: "bg-red-500 hover:bg-red-600 text-white", soft: "bg-red-50 text-red-600", emoji: "🔴" },
  wrong_number: { label: "Wrong Number", btn: "bg-slate-700 hover:bg-slate-800 text-white", soft: "bg-slate-100 text-slate-600", emoji: "⚫" },
};

export const ACTIVITY_META = {
  lead_created: { icon: "UserPlus", color: "text-purple-500 bg-purple-50" },
  lead_edited: { icon: "Pencil", color: "text-slate-500 bg-slate-100" },
  call: { icon: "Phone", color: "text-blue-500 bg-blue-50" },
  status_changed: { icon: "GitBranch", color: "text-indigo-500 bg-indigo-50" },
  follow_up_scheduled: { icon: "Bell", color: "text-amber-500 bg-amber-50" },
  follow_up_completed: { icon: "CheckCircle2", color: "text-emerald-500 bg-emerald-50" },
  proposal_sent: { icon: "FileText", color: "text-purple-500 bg-purple-50" },
  converted: { icon: "PartyPopper", color: "text-emerald-600 bg-emerald-100" },
  reassigned: { icon: "Users", color: "text-slate-500 bg-slate-100" },
};

export function labelOf(list, key) {
  const item = (list || []).find((x) => x.key === key);
  return item ? item.label : key;
}

export function inr(n) {
  const v = Number(n || 0);
  return "₹" + v.toLocaleString("en-IN");
}

export function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function initials(name = "") {
  return name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}

export function telLink(num) {
  return `tel:${(num || "").replace(/\s/g, "")}`;
}

export function waLink(num, msg = "") {
  let n = (num || "").replace(/\D/g, "");
  if (n.length === 10) n = "91" + n;
  return `https://wa.me/${n}${msg ? `?text=${encodeURIComponent(msg)}` : ""}`;
}

export function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export function fmtDateTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }) + " · " +
    d.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function fmtTime(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
}

export function relTime(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (Math.abs(mins) < 60) return mins <= 0 ? `in ${-mins}m` : `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (Math.abs(hrs) < 24) return hrs <= 0 ? `in ${-hrs}h` : `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return days <= 0 ? `in ${-days}d` : `${days}d ago`;
}

export function toIso(dateStr, timeStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = (timeStr || "10:00").split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm).toISOString();
}

export function tomorrowDate() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export function addDays(dateStr, days) {
  const d = dateStr ? new Date(dateStr) : new Date();
  if (isNaN(d)) return "";
  d.setDate(d.getDate() + (Number(days) || 0));
  return d.toISOString().slice(0, 10);
}

export function computeCampaign({ cabs, paidDays, freeDays, rate }) {
  const c = +cabs || 0, p = +paidDays || 0, f = +freeDays || 0, r = +rate || 0;
  return { amountPayable: c * p * r, totalExposure: p + f, campaignValue: c * (p + f) * r };
}

export const CAMPAIGN_STATUS_META = {
  draft: { label: "Draft", cls: "bg-slate-100 text-slate-600", dot: "bg-slate-400" },
  proposed: { label: "Proposed", cls: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  active: { label: "Active", cls: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
  expiring_soon: { label: "Expiring Soon", cls: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  expired: { label: "Expired", cls: "bg-red-50 text-red-600", dot: "bg-red-500" },
  renewed: { label: "Renewed", cls: "bg-purple-50 text-purple-600", dot: "bg-purple-500" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
};

export const INVOICE_STATUS_META = {
  pending: { label: "Pending", cls: "bg-amber-50 text-amber-600", dot: "bg-amber-500" },
  paid: { label: "Paid", cls: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
  partially_paid: { label: "Partially Paid", cls: "bg-blue-50 text-blue-600", dot: "bg-blue-500" },
  overdue: { label: "Overdue", cls: "bg-red-50 text-red-600", dot: "bg-red-500" },
  cancelled: { label: "Cancelled", cls: "bg-slate-100 text-slate-500", dot: "bg-slate-400" },
};

export function proposalWaMessage(p, { contactName, employeeName }) {
  return `Hi ${contactName || "Sir"},\n\nAs discussed, sharing the QwickAds advertising proposal for ${p.brand_name}. Please find the campaign details in the attached proposal.\n\nCampaign:\n${p.cabs} Cabs\n${p.paid_days} Days\n₹${p.rate}/day/cab\n\nLooking forward to working with you.\n\nRegards,\n${employeeName}\nQwickAds\nFAST ADS. REAL RESULTS.`;
}

export function invoiceWaMessage(inv, { contactName, employeeName }) {
  const amt = Number(inv.amount || 0).toLocaleString("en-IN");
  return `Hi ${contactName || "Sir"},\n\nThank you for choosing QwickAds. Please find your QwickAds invoice for ${inv.brand_name}.\n\nInvoice No: ${inv.invoice_no}\nCabs: ${inv.cabs}\nDuration: ${inv.paid_days} Days\nAmount Payable: ₹${amt}\n\nPlease let us know if you need any assistance.\n\nRegards,\n${employeeName}\nQwickAds\nFAST ADS. REAL RESULTS.`;
}
