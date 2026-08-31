import { db } from "./firebase";
import {
  collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, limit as fsLimit, startAfter, onSnapshot,
  count as fsCount, writeBatch, increment, serverTimestamp,
} from "firebase/firestore";

// ─── Helpers ───────────────────────────────────────────────
function newId() {
  return crypto.randomUUID ? crypto.randomUUID()
    : "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
      });
}

function nowIso() {
  return new Date().toISOString();
}

function docRef(coll, id) {
  return doc(db, coll, id);
}

async function getColl(coll, qFn, sortFn) {
  let qRef = collection(db, coll);
  if (qFn) qRef = qFn(qRef);
  const snap = await getDocs(qRef);
  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (sortFn) items.sort(sortFn);
  return items;
}

// ─── Domain Constants (same as backend db.py) ──────────────
export const CATEGORIES = [
  { key: "restaurant", label: "Restaurant" }, { key: "hotel", label: "Hotel" },
  { key: "banquet", label: "Banquet" }, { key: "salon", label: "Salon" },
  { key: "real_estate", label: "Real Estate" }, { key: "hospital", label: "Hospital" },
  { key: "gym", label: "Gym" }, { key: "jeweller", label: "Jeweller" },
  { key: "retail", label: "Retail" }, { key: "education", label: "Education" },
  { key: "automobile", label: "Automobile" }, { key: "furniture", label: "Furniture" },
  { key: "interior_designer", label: "Interior Designer" }, { key: "other", label: "Other" },
];

export const SOURCES = [
  { key: "instagram", label: "Instagram" }, { key: "google", label: "Google" },
  { key: "website", label: "Website" }, { key: "referral", label: "Referral" },
  { key: "field_sales", label: "Field Sales" }, { key: "existing_contact", label: "Existing Contact" },
  { key: "other", label: "Other" },
];

export const STATUSES = [
  { key: "new", label: "New" }, { key: "called", label: "Called" },
  { key: "interested", label: "Interested" }, { key: "follow_up", label: "Follow-up" },
  { key: "proposal_sent", label: "Proposal Sent" }, { key: "negotiation", label: "Negotiation" },
  { key: "converted", label: "Converted" }, { key: "not_interested", label: "Not Interested" },
];

export const PRIORITIES = [
  { key: "hot", label: "Hot" }, { key: "warm", label: "Warm" }, { key: "cold", label: "Cold" },
];

export const CALL_OUTCOMES = [
  { key: "interested", label: "Interested", status: "interested" },
  { key: "call_later", label: "Call Later", status: "follow_up" },
  { key: "send_proposal", label: "Send Proposal", status: "proposal_sent" },
  { key: "asked_for_details", label: "Asked For Details", status: "follow_up" },
  { key: "owner_unavailable", label: "Owner Unavailable", status: "follow_up" },
  { key: "not_interested", label: "Not Interested", status: "not_interested" },
  { key: "wrong_number", label: "Wrong Number", status: "not_interested" },
];

export const LOSS_REASONS = [
  { key: "too_expensive", label: "Too Expensive" }, { key: "not_interested", label: "Not Interested" },
  { key: "already_advertising", label: "Already Advertising Elsewhere" },
  { key: "owner_unavailable", label: "Owner Unavailable" }, { key: "need_approval", label: "Need Approval" },
  { key: "bad_timing", label: "Bad Timing" }, { key: "wants_more_info", label: "Wants More Information" },
  { key: "business_closed", label: "Business Closed" }, { key: "wrong_contact", label: "Wrong Contact" },
  { key: "other", label: "Other" },
];

export const PROPOSAL_STATUSES = [
  { key: "not_sent", label: "Proposal Not Sent" }, { key: "sent", label: "Proposal Sent" },
  { key: "viewed", label: "Proposal Viewed" }, { key: "negotiation", label: "Negotiation" },
  { key: "accepted", label: "Accepted" }, { key: "rejected", label: "Rejected" },
];

export const DAILY_CALL_TARGET = 40;

export const INDUSTRIES = [
  "Real Estate", "Hotels", "Resorts", "Villas", "Premium Salons", "Restaurants",
  "Startups", "Finance", "Insurance", "Fashion", "Clothing", "Jewellery",
  "Healthcare", "Education", "Automobile", "Travel", "Fitness", "Beauty",
  "Events", "Banquets", "Entertainment", "Retail", "Technology",
  "Local Businesses", "Other",
];

export const AD_TYPES = [
  { key: "video", label: "Digital Video Screen" }, { key: "static", label: "Static Display" },
  { key: "qr", label: "QR / WhatsApp Lead Gen" }, { key: "combo", label: "Video + QR Combo" },
];

export const CAMPAIGN_STATUSES = [
  { key: "draft", label: "Draft" }, { key: "proposed", label: "Proposed" },
  { key: "active", label: "Active" }, { key: "expiring_soon", label: "Expiring Soon" },
  { key: "expired", label: "Expired" }, { key: "renewed", label: "Renewed" },
  { key: "cancelled", label: "Cancelled" },
];

export const INVOICE_STATUSES = [
  { key: "pending", label: "Pending" }, { key: "paid", label: "Paid" },
  { key: "partially_paid", label: "Partially Paid" }, { key: "overdue", label: "Overdue" },
  { key: "cancelled", label: "Cancelled" },
];

export const PRICING_PRESETS = [
  { key: "14_days", label: "14 Days", days: 14, rate: 39 },
  { key: "1_month", label: "1 Month", days: 30, rate: 29 },
  { key: "3_months", label: "3 Months", days: 90, rate: 19 },
];

export const TOTAL_AD_SLOTS = 6;

export const DEFAULT_BUSINESS_SETTINGS = {
  id: "default",
  company_name: "QwickAds",
  tagline: "FAST ADS. REAL RESULTS.",
  address: "Navi Mumbai, Maharashtra, India",
  phone: "",
  email: "",
  gst: "",
  total_slots: TOTAL_AD_SLOTS,
  banking: { account_name: "QwickAds", bank_name: "", account_number: "", ifsc: "", branch: "" },
  pricing_presets: PRICING_PRESETS,
};

// ─── Meta endpoint ─────────────────────────────────────────
export function getMeta() {
  return {
    categories: CATEGORIES, sources: SOURCES, statuses: STATUSES, priorities: PRIORITIES,
    call_outcomes: CALL_OUTCOMES, loss_reasons: LOSS_REASONS, proposal_statuses: PROPOSAL_STATUSES,
    daily_call_target: DAILY_CALL_TARGET, industries: INDUSTRIES, ad_types: AD_TYPES,
    campaign_statuses: CAMPAIGN_STATUSES, invoice_statuses: INVOICE_STATUSES, pricing_presets: PRICING_PRESETS,
  };
}

// ─── Employees / Users ─────────────────────────────────────
const USERS = "users";

export async function listEmployees() {
  const snap = await getDocs(collection(db, USERS));
  return snap.docs.map((d) => {
    const data = d.data();
    return { id: d.id, name: data.name, email: data.email, role: data.role, avatar: data.avatar || null, active: data.active !== false, created_at: data.created_at };
  });
}

export async function createEmployee({ name, email, password, role = "employee", authUid }) {
  const id = authUid || newId(); // Use Firebase Auth UID if provided
  await setDoc(docRef(USERS, id), {
    id, name, email: email.toLowerCase().trim(), role,
    active: true, avatar: null, created_at: nowIso(),
  });
  return { id, name, email: email.toLowerCase().trim(), role, avatar: null, active: true, created_at: nowIso() };
}

export async function updateEmployee(empId, data) {
  const allowed = {};
  for (const k of ["name", "active", "role"]) { if (k in data) allowed[k] = data[k]; }
  await updateDoc(docRef(USERS, empId), allowed);
  const snap = await getDoc(docRef(USERS, empId));
  const d = snap.data();
  return { id: snap.id, name: d.name, email: d.email, role: d.role, avatar: d.avatar, active: d.active, created_at: d.created_at };
}

export async function deleteEmployee(empId) {
  await updateDoc(docRef(USERS, empId), { active: false });
}

// ─── Leads ─────────────────────────────────────────────────
const LEADS = "leads";

function enrichLead(lead, employees) {
  if (lead.assigned_to && employees) {
    const emp = employees.find((e) => e.id === lead.assigned_to);
    lead.assigned_to_name = emp ? emp.name : null;
  } else {
    lead.assigned_to_name = null;
  }
  return lead;
}

export async function listLeads(user, { search, status, category, priority, source, assigned_to, location, page = 1, limit: lim = 20, sort = "recent" } = {}) {
  const employees = await listEmployees();
  const snap = await getDocs(collection(db, LEADS));
  let leads = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  // Filter by role
  if (user.role !== "admin") {
    leads = leads.filter((l) => l.assigned_to === user.id);
  } else if (assigned_to) {
    leads = leads.filter((l) => l.assigned_to === assigned_to);
  }

  // Apply filters
  if (status) leads = leads.filter((l) => l.status === status);
  if (category) leads = leads.filter((l) => l.category === category);
  if (priority) leads = leads.filter((l) => l.priority === priority);
  if (source) leads = leads.filter((l) => l.source === source);
  if (location) leads = leads.filter((l) => (l.location || "").toLowerCase().includes(location.toLowerCase()));

  // Search
  if (search) {
    const s = search.toLowerCase();
    leads = leads.filter((l) =>
      (l.brand_name || "").toLowerCase().includes(s) ||
      (l.mobile || "").includes(s) ||
      (l.contact_person || "").toLowerCase().includes(s) ||
      (l.location || "").toLowerCase().includes(s) ||
      (l.area || "").toLowerCase().includes(s)
    );
  }

  const total = leads.length;

  // Sort
  if (sort === "priority") {
    const po = { hot: 0, warm: 1, cold: 2 };
    leads.sort((a, b) => (po[a.priority] || 3) - (po[b.priority] || 3));
  } else {
    leads.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  }

  // Paginate
  leads = leads.slice((page - 1) * lim, page * lim);

  leads.forEach((l) => enrichLead(l, employees));
  return { leads, total, page, limit: lim };
}

export async function getLead(user, leadId) {
  const employees = await listEmployees();
  const snap = await getDoc(docRef(LEADS, leadId));
  if (!snap.exists()) throw new Error("Lead not found");
  const lead = { id: snap.id, ...snap.data() };

  if (user.role !== "admin" && lead.assigned_to !== user.id) throw new Error("Access denied");
  enrichLead(lead, employees);

  // Get activities
  const actSnap = await getDocs(query(collection(db, "activity_logs"), where("lead_id", "==", leadId)));
  const activities = actSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

  // Get proposals
  const propSnap = await getDocs(query(collection(db, "qw_proposals"), where("lead_id", "==", leadId)));
  const proposals = propSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));

  // Get follow-ups
  const fuSnap = await getDocs(query(collection(db, "follow_ups"), where("lead_id", "==", leadId)));
  const follow_ups = fuSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.due_at || "").localeCompare(b.due_at || ""));

  return { lead, activities, proposals, follow_ups };
}

export async function createLead(user, body, force = false) {
  // Duplicate check
  if (!force) {
    const snap = await getDocs(collection(db, LEADS));
    const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const dup = all.find((l) =>
      (body.mobile && l.mobile === body.mobile) ||
      (body.brand_name && (l.brand_name || "").toLowerCase() === body.brand_name.toLowerCase()) ||
      (body.email && l.email === body.email)
    );
    if (dup) throw new Error("Lead already exists");
  }

  const id = newId();
  const assigned = user.role !== "admin" ? user.id : (body.assigned_to || user.id);
  const doc = {
    ...body, id, assigned_to: assigned, proposal_status: "not_sent", conversion: null,
    created_by: user.id, created_at: nowIso(), updated_at: nowIso(), last_contact_at: null,
  };
  await setDoc(docRef(LEADS, id), doc);

  // Log activity
  await logActivity(id, user, "lead_created", `Lead created: ${body.brand_name}`);

  // Create follow-up if scheduled
  if (body.next_follow_up) {
    await createFollowUpInternal({ id, brand_name: body.brand_name, ...body }, user, body.next_follow_up, "Follow-up scheduled");
  }

  return doc;
}

export async function updateLead(user, leadId, body) {
  const snap = await getDoc(docRef(LEADS, leadId));
  if (!snap.exists()) throw new Error("Lead not found");
  const lead = { id: snap.id, ...snap.data() };
  if (user.role !== "admin" && lead.assigned_to !== user.id) throw new Error("Access denied");

  const fields = ["brand_name", "category", "contact_person", "mobile", "whatsapp", "email",
    "location", "area", "industry", "source", "status", "priority", "notes", "expected_value"];
  const updates = {};
  for (const k of fields) { if (k in body) updates[k] = body[k]; }

  if ("assigned_to" in body && user.role === "admin") {
    if (body.assigned_to !== lead.assigned_to) {
      await logActivity(leadId, user, "reassigned", `Lead reassigned`);
    }
    updates.assigned_to = body.assigned_to;
  }

  if (updates.status && updates.status !== lead.status) {
    await logActivity(leadId, user, "status_changed", `Status changed to ${updates.status}`);
  }

  updates.updated_at = nowIso();
  await updateDoc(docRef(LEADS, leadId), updates);
  await logActivity(leadId, user, "lead_edited", "Lead details updated");

  const updated = await getDoc(docRef(LEADS, leadId));
  const employees = await listEmployees();
  const result = { id: updated.id, ...updated.data() };
  enrichLead(result, employees);
  return result;
}

export async function deleteLead(leadId) {
  await deleteDoc(docRef(LEADS, leadId));
  // Clean up sub-collections
  const collections = ["activity_logs", "follow_ups", "qw_proposals", "call_logs"];
  for (const coll of collections) {
    const snap = await getDocs(query(collection(db, coll), where("lead_id", "==", leadId)));
    for (const d of snap.docs) await deleteDoc(d.ref);
  }
}

export async function checkDuplicate(mobile, brandName, email) {
  const snap = await getDocs(collection(db, LEADS));
  const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const dup = all.find((l) =>
    (mobile && l.mobile === mobile) ||
    (brandName && (l.brand_name || "").toLowerCase() === brandName.toLowerCase()) ||
    (email && l.email === email)
  );
  return dup || null;
}

// ─── Call Logging ──────────────────────────────────────────
const OUTCOME_MAP = Object.fromEntries(CALL_OUTCOMES.map((o) => [o.key, o]));

export async function logCall(user, leadId, { outcome, note, next_follow_up, loss_reason }) {
  const snap = await getDoc(docRef(LEADS, leadId));
  if (!snap.exists()) throw new Error("Lead not found");
  const lead = { id: snap.id, ...snap.data() };
  if (user.role !== "admin" && lead.assigned_to !== user.id) throw new Error("Access denied");

  const outcomeObj = OUTCOME_MAP[outcome];
  if (!outcomeObj) throw new Error("Invalid outcome");

  // Create call log
  const callId = newId();
  const callDoc = {
    id: callId, lead_id: leadId, brand_name: lead.brand_name, outcome, note: note || "",
    loss_reason: loss_reason || null, created_by: user.id, created_by_name: user.name, created_at: nowIso(),
  };
  await setDoc(docRef("call_logs", callId), callDoc);

  await logActivity(leadId, user, "call", "Call made", { outcome, outcome_label: outcomeObj.label, note, loss_reason });

  // Update lead status
  const leadUpdates = { last_contact_at: nowIso(), updated_at: nowIso() };
  if (lead.status !== "converted") leadUpdates.status = outcomeObj.status;
  if (outcome === "send_proposal") leadUpdates.proposal_status = "sent";
  await updateDoc(docRef(LEADS, leadId), leadUpdates);

  // Create follow-up if scheduled
  if (next_follow_up) {
    await updateDoc(docRef(LEADS, leadId), { next_follow_up });
    await createFollowUpInternal({ ...lead, ...leadUpdates }, user, next_follow_up, "Follow-up scheduled");
  }

  return { ok: true, call: callDoc };
}

// ─── Follow-ups ───────────────────────────────────────────
async function createFollowUpInternal(lead, user, dueAt, note) {
  // Supersede existing pending follow-ups for this lead
  const existingSnap = await getDocs(
    query(collection(db, "follow_ups"), where("lead_id", "==", lead.id), where("status", "==", "pending"))
  );
  const batch = writeBatch(db);
  for (const d of existingSnap.docs) {
    batch.update(d.ref, { status: "superseded" });
  }
  await batch.commit();

  const fuId = newId();
  const doc = {
    id: fuId, lead_id: lead.id, brand_name: lead.brand_name, contact_person: lead.contact_person || "",
    mobile: lead.mobile || "", whatsapp: lead.whatsapp || "", assigned_to: lead.assigned_to,
    due_at: dueAt, status: "pending", note, created_by: user.id, created_at: nowIso(), completed_at: null,
  };
  await setDoc(docRef("follow_ups", fuId), doc);

  await logActivity(lead.id, user, "follow_up_scheduled", "Follow-up scheduled", { due_at: dueAt });
  return doc;
}

export async function listFollowUps(user) {
  const snap = await getDocs(
    user.role === "admin"
      ? query(collection(db, "follow_ups"), where("status", "==", "pending"))
      : query(collection(db, "follow_ups"), where("status", "==", "pending"), where("assigned_to", "==", user.id))
  );
  const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.due_at || "").localeCompare(b.due_at || ""));

  const employees = await listEmployees();
  for (const it of items) {
    if (it.assigned_to) {
      const emp = employees.find((e) => e.id === it.assigned_to);
      it.assigned_to_name = emp ? emp.name : null;
    }
  }

  const now = new Date();
  const today = now.toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + 86400000).toISOString().slice(0, 10);
  const buckets = { overdue: [], today: [], tomorrow: [], upcoming: [] };

  for (const it of items) {
    const due = it.due_at ? new Date(it.due_at) : null;
    if (!due) { buckets.upcoming.push(it); continue; }
    const d = it.due_at.slice(0, 10);
    if (due < now && d < today) buckets.overdue.push(it);
    else if (d < today) buckets.overdue.push(it);
    else if (d === today) { due < now ? buckets.overdue.push(it) : buckets.today.push(it); }
    else if (d === tomorrow) buckets.tomorrow.push(it);
    else buckets.upcoming.push(it);
  }
  return buckets;
}

export async function completeFollowUp(user, fuId) {
  const snap = await getDoc(docRef("follow_ups", fuId));
  if (!snap.exists()) throw new Error("Follow-up not found");
  const fu = snap.data();
  if (user.role !== "admin" && fu.assigned_to !== user.id) throw new Error("Access denied");
  await updateDoc(docRef("follow_ups", fuId), { status: "completed", completed_at: nowIso() });
  await logActivity(fu.lead_id, user, "follow_up_completed", "Follow-up completed");
}

export async function rescheduleFollowUp(user, fuId, dueAt) {
  const snap = await getDoc(docRef("follow_ups", fuId));
  if (!snap.exists()) throw new Error("Follow-up not found");
  const fu = snap.data();
  if (user.role !== "admin" && fu.assigned_to !== user.id) throw new Error("Access denied");
  await updateDoc(docRef("follow_ups", fuId), { due_at: dueAt });
  await updateDoc(docRef(LEADS, fu.lead_id), { next_follow_up: dueAt });
  await logActivity(fu.lead_id, user, "follow_up_scheduled", "Follow-up rescheduled", { due_at: dueAt });
}

// ─── Conversion ────────────────────────────────────────────
export async function convertLead(user, leadId, body) {
  const snap = await getDoc(docRef(LEADS, leadId));
  if (!snap.exists()) throw new Error("Lead not found");
  const lead = { id: snap.id, ...snap.data() };
  if (user.role !== "admin" && lead.assigned_to !== user.id) throw new Error("Access denied");

  const conversion = { ...body, converted_at: nowIso() };
  await updateDoc(docRef(LEADS, leadId), {
    status: "converted", proposal_status: "accepted", conversion,
    expected_value: body.total_value, updated_at: nowIso(),
  });
  await logActivity(leadId, user, "converted", `Converted — ₹${Math.round(body.total_value).toLocaleString("en-IN")}`, { amount: body.total_value });

  const updated = await getDoc(docRef(LEADS, leadId));
  const employees = await listEmployees();
  const result = { id: updated.id, ...updated.data() };
  enrichLead(result, employees);
  return result;
}

export async function listCustomers(user) {
  const snap = await getDocs(collection(db, LEADS));
  const employees = await listEmployees();
  let leads = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  leads = leads.filter((l) => l.status === "converted");
  if (user.role !== "admin") leads = leads.filter((l) => l.assigned_to === user.id);
  leads.sort((a, b) => (b.updated_at || "").localeCompare(a.updated_at || ""));
  leads.forEach((l) => enrichLead(l, employees));
  return leads;
}

// ─── Dashboard: Employee ──────────────────────────────────
export async function employeeDashboard(user) {
  const uid = user.id;
  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);

  const callsSnap = await getDocs(
    query(collection(db, "call_logs"), where("created_by", "==", uid))
  );
  const calls = callsSnap.docs.map((d) => d.data());

  const leadsSnap = await getDocs(
    query(collection(db, LEADS), where("assigned_to", "==", uid))
  );
  const leads = leadsSnap.docs.map((d) => d.data());

  const fuSnap = await getDocs(
    query(collection(db, "follow_ups"), where("assigned_to", "==", uid), where("status", "==", "pending"))
  );
  const followUps = fuSnap.docs.length;

  return {
    calls_today: calls.filter((c) => new Date(c.created_at) >= todayStart).length,
    calls_week: calls.filter((c) => new Date(c.created_at) >= weekStart).length,
    interested: leads.filter((l) => l.status === "interested").length,
    proposals: leads.filter((l) => l.status === "proposal_sent").length,
    follow_ups: followUps,
    converted: leads.filter((l) => l.status === "converted").length,
    total_leads: leads.length,
    daily_target: DAILY_CALL_TARGET,
  };
}

// ─── Dashboard: Admin ─────────────────────────────────────
export async function adminDashboard() {
  const leadsSnap = await getDocs(collection(db, LEADS));
  const allLeads = leadsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  const callsSnap = await getDocs(collection(db, "call_logs"));
  const allCalls = callsSnap.docs.map((d) => d.data());

  const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - 7);

  const totalLeads = allLeads.length;
  const callsToday = allCalls.filter((c) => new Date(c.created_at) >= todayStart).length;
  const callsWeek = allCalls.filter((c) => new Date(c.created_at) >= weekStart).length;
  const interested = allLeads.filter((l) => l.status === "interested").length;
  const proposalsSent = allLeads.filter((l) => l.status === "proposal_sent").length;
  const converted = allLeads.filter((l) => l.status === "converted").length;
  const conversionRate = totalLeads ? Math.round((converted / totalLeads) * 1000) / 10 : 0;

  const pipeline = {};
  for (const s of STATUSES) pipeline[s.key] = allLeads.filter((l) => l.status === s.key).length;

  const pv = allLeads
    .filter((l) => !["converted", "not_interested"].includes(l.status))
    .reduce((sum, l) => sum + (l.expected_value || 0), 0);

  const revenue = allLeads
    .filter((l) => l.status === "converted")
    .reduce((sum, l) => sum + (l.conversion?.total_value || l.expected_value || 0), 0);

  const called = allLeads.filter((l) => l.status !== "new").length;
  const funnel = [
    { stage: "Leads", count: totalLeads },
    { stage: "Called", count: called },
    { stage: "Interested", count: interested + allLeads.filter((l) => ["follow_up", "proposal_sent", "negotiation", "converted"].includes(l.status)).length },
    { stage: "Proposals", count: allLeads.filter((l) => ["proposal_sent", "negotiation", "converted"].includes(l.status)).length },
    { stage: "Converted", count: converted },
  ];

  return { total_leads: totalLeads, calls_today: callsToday, calls_week: callsWeek,
    interested, proposals_sent: proposalsSent, converted, conversion_rate: conversionRate,
    pipeline_value: pv, revenue, pipeline, funnel };
}

// ─── Calls Today ──────────────────────────────────────────
export async function callsToday(user) {
  const now = new Date();
  const endToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59).toISOString();

  let fuQ = user.role === "admin"
    ? query(collection(db, "follow_ups"), where("status", "==", "pending"))
    : query(collection(db, "follow_ups"), where("status", "==", "pending"), where("assigned_to", "==", user.id));
  const fuSnap = await getDocs(fuQ);
  const dueFus = fuSnap.docs.map((d) => d.data()).filter((f) => f.due_at <= endToday).sort((a, b) => (a.due_at || "").localeCompare(b.due_at || ""));

  let newQ = user.role === "admin"
    ? query(collection(db, LEADS), where("status", "==", "new"))
    : query(collection(db, LEADS), where("status", "==", "new"), where("assigned_to", "==", user.id));
  const newSnap = await getDocs(newQ);
  const newLeads = newSnap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")).slice(0, 40);

  const employees = await listEmployees();
  const result = [];
  const seen = new Set();

  for (const f of dueFus) {
    const leadSnap = await getDoc(docRef(LEADS, f.lead_id));
    if (leadSnap.exists()) {
      const lead = { id: leadSnap.id, ...leadSnap.data() };
      if (lead.status !== "converted" && !seen.has(lead.id)) {
        enrichLead(lead, employees);
        lead.follow_up_due = f.due_at;
        lead.follow_up_note = f.note;
        result.push(lead);
        seen.add(lead.id);
      }
    }
  }

  for (const lead of newLeads) {
    if (!seen.has(lead.id)) { enrichLead(lead, employees); result.push(lead); seen.add(lead.id); }
  }

  return result;
}

// ─── Analytics ─────────────────────────────────────────────
export async function employeePerformance(period = "week") {
  const now = new Date();
  let startDate;
  if (period === "today") { startDate = new Date(now); startDate.setHours(0, 0, 0, 0); }
  else if (period === "month") { startDate = new Date(now.getTime() - 30 * 86400000); }
  else if (period === "all") { startDate = new Date("1970-01-01"); }
  else { startDate = new Date(now.getTime() - 7 * 86400000); }

  const employees = await listEmployees();
  const empList = employees.filter((e) => e.role === "employee" && e.active !== false);

  const callsSnap = await getDocs(collection(db, "call_logs"));
  const allCalls = callsSnap.docs.map((d) => d.data());

  const leadsSnap = await getDocs(collection(db, LEADS));
  const allLeads = leadsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const fuSnap = await getDocs(collection(db, "follow_ups"));
  const allFus = fuSnap.docs.map((d) => d.data());

  const propSnap = await getDocs(collection(db, "qw_proposals"));
  const allProps = propSnap.docs.map((d) => d.data());

  return empList.map((e) => {
    const uid = e.id;
    const calls = allCalls.filter((c) => c.created_by === uid && new Date(c.created_at) >= startDate);
    const interestedCalls = calls.filter((c) => c.outcome === "interested");
    const followUps = allFus.filter((f) => f.assigned_to === uid && f.status === "pending");
    const proposals = allProps.filter((p) => p.created_by === uid && new Date(p.created_at) >= startDate);
    const myLeads = allLeads.filter((l) => l.assigned_to === uid);
    const conv = myLeads.filter((l) => l.status === "converted").length;
    const total = myLeads.length;
    return {
      id: uid, name: e.name, calls: calls.length, interested: interestedCalls.length,
      follow_ups: followUps.length, proposals: proposals.length,
      converted: conv, conversion_rate: total ? Math.round((conv / total) * 1000) / 10 : 0,
    };
  });
}

export async function callAnalytics() {
  const snap = await getDocs(collection(db, "call_logs"));
  const calls = snap.docs.map((d) => d.data());
  const total = calls.length;
  const outcomes = {};
  for (const o of CALL_OUTCOMES) outcomes[o.key] = calls.filter((c) => c.outcome === o.key).length;
  const connected = total - (outcomes.wrong_number || 0) - (outcomes.owner_unavailable || 0);
  return {
    total, connected, outcomes,
    contact_rate: total ? Math.round((connected / total) * 1000) / 10 : 0,
    interest_rate: total ? Math.round((outcomes.interested / total) * 1000) / 10 : 0,
  };
}

export async function lossReasons() {
  const snap = await getDocs(collection(db, "call_logs"));
  const calls = snap.docs.map((d) => d.data());
  const withLoss = calls.filter((c) => c.loss_reason);
  const total = withLoss.length;
  const result = [];
  for (const r of LOSS_REASONS) {
    const c = calls.filter((cl) => cl.loss_reason === r.key).length;
    if (c > 0) result.push({ reason: r.label, key: r.key, count: c, percent: total ? Math.round((c / total) * 1000) / 10 : 0 });
  }
  result.sort((a, b) => b.count - a.count);
  return result;
}

// ─── Proposals (simple from leads) ─────────────────────────
const PROPOSALS = "proposals";

export async function createSimpleProposal(user, leadId, body) {
  const leadSnap = await getDoc(docRef(LEADS, leadId));
  if (!leadSnap.exists()) throw new Error("Lead not found");
  const lead = { id: leadSnap.id, ...leadSnap.data() };
  if (user.role !== "admin" && lead.assigned_to !== user.id) throw new Error("Access denied");

  const amount = body.amount || (body.cabs || 0) * (body.price_per_day || 0) * (body.duration_days || 0);
  const doc = {
    id: newId(), lead_id: leadId, brand_name: lead.brand_name, package: body.package || "",
    cabs: body.cabs || 0, price_per_day: body.price_per_day || 0, duration_days: body.duration_days || 0,
    amount, status: body.status || "sent", notes: body.notes || "", created_by: user.id, created_at: nowIso(),
  };
  await setDoc(docRef(PROPOSALS, doc.id), doc);

  const leadUpdates = { proposal_status: body.status || "sent", updated_at: nowIso() };
  if (lead.status !== "converted" && lead.status !== "negotiation") leadUpdates.status = "proposal_sent";
  if (body.amount && !lead.expected_value) leadUpdates.expected_value = amount;
  await updateDoc(docRef(LEADS, leadId), leadUpdates);
  await logActivity(leadId, user, "proposal_sent", `Proposal created: ₹${Math.round(amount).toLocaleString("en-IN")}`, { amount });

  return doc;
}

export async function listSimpleProposals(user) {
  const snap = await getDocs(collection(db, PROPOSALS));
  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (user.role !== "admin") {
    const myLeads = items.filter((p) => p.created_by === user.id).map((p) => p.lead_id);
    items = items.filter((p) => myLeads.includes(p.lead_id) || p.created_by === user.id);
  }
  return items.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

// ─── QW Proposals (branded) ────────────────────────────────
const QW_PROPOSALS = "qw_proposals";

function computeAmounts(cabs, paidDays, freeDays, rate) {
  cabs = parseInt(cabs) || 0; paidDays = parseInt(paidDays) || 0;
  freeDays = parseInt(freeDays) || 0; rate = parseFloat(rate) || 0;
  return {
    amount_payable: cabs * paidDays * rate,
    total_exposure: paidDays + freeDays,
    campaign_value: cabs * (paidDays + freeDays) * rate,
  };
}

export async function listQwProposals(user, { search, status } = {}) {
  const snap = await getDocs(collection(db, QW_PROPOSALS));
  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (user.role !== "admin") items = items.filter((p) => p.created_by === user.id);
  if (status) items = items.filter((p) => p.status === status);
  if (search) {
    const s = search.toLowerCase();
    items = items.filter((p) => (p.brand_name || "").toLowerCase().includes(s) || (p.proposal_no || "").toLowerCase().includes(s));
  }
  return items.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function createQwProposal(user, body) {
  const amt = computeAmounts(body.cabs, body.paid_days, body.free_days, body.rate);
  const countSnap = await getDocs(collection(db, QW_PROPOSALS));

  const doc = {
    ...body, id: newId(), proposal_no: `QP-${countSnap.size + 1}`.padStart(6, "0"),
    ...amt, created_by: user.id, created_by_name: user.name, created_at: nowIso(), updated_at: nowIso(),
  };
  await setDoc(docRef(QW_PROPOSALS, doc.id), doc);

  if (body.lead_id) {
    await logActivity(body.lead_id, user, "proposal_sent",
      `Proposal ${doc.proposal_no} created (₹${Math.round(amt.amount_payable).toLocaleString("en-IN")})`,
      { amount: amt.amount_payable });
  }

  return doc;
}

export async function updateQwProposal(pid, body) {
  const snap = await getDoc(docRef(QW_PROPOSALS, pid));
  if (!snap.exists()) throw new Error("Proposal not found");
  const p = { id: snap.id, ...snap.data() };

  const fields = ["brand_name", "contact_person", "phone", "cabs", "paid_days", "free_days", "rate", "start_date", "end_date", "target_area", "ad_type", "notes", "status"];
  const updates = {};
  for (const k of fields) { if (k in body) updates[k] = body[k]; }

  const merged = { ...p, ...updates };
  Object.assign(updates, computeAmounts(merged.cabs, merged.paid_days, merged.free_days, merged.rate));
  updates.updated_at = nowIso();

  await updateDoc(docRef(QW_PROPOSALS, pid), updates);
  const updated = await getDoc(docRef(QW_PROPOSALS, pid));
  return { id: updated.id, ...updated.data() };
}

export async function deleteQwProposal(pid) {
  await deleteDoc(docRef(QW_PROPOSALS, pid));
}

export async function shareQwProposalWhatsapp(user, pid) {
  const snap = await getDoc(docRef(QW_PROPOSALS, pid));
  if (!snap.exists()) throw new Error("Proposal not found");
  const p = snap.data();
  await updateDoc(docRef(QW_PROPOSALS, pid), {
    whatsapp_shared: true, shared_by: user.id, shared_by_name: user.name, shared_at: nowIso(),
    status: p.status === "draft" ? "sent" : p.status,
  });
  const updated = await getDoc(docRef(QW_PROPOSALS, pid));
  return { id: updated.id, ...updated.data() };
}

// ─── Campaigns ─────────────────────────────────────────────
const CAMPAIGNS = "campaigns";

function campaignDisplayStatus(camp) {
  const stored = camp.status;
  if (["draft", "proposed", "cancelled", "renewed"].includes(stored)) return stored;
  const end = camp.end_date;
  if (!end) return "active";
  try {
    const endDt = new Date(end);
    if (endDt < new Date()) return "expired";
    if ((endDt - new Date()) / 86400000 <= 7) return "expiring_soon";
    return "active";
  } catch { return "active"; }
}

function daysLeftCamp(camp) {
  const end = camp.end_date;
  if (!end) return null;
  try { return Math.round((new Date(end) - new Date()) / 86400000); } catch { return null; }
}

export async function listCampaigns(user, { search, status } = {}) {
  const snap = await getDocs(collection(db, CAMPAIGNS));
  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (user.role !== "admin") items = items.filter((c) => c.created_by === user.id);
  if (search) items = items.filter((c) => (c.brand_name || "").toLowerCase().includes(search.toLowerCase()));
  for (const c of items) { c.display_status = campaignDisplayStatus(c); c.days_left = daysLeftCamp(c); }
  if (status) items = items.filter((c) => c.display_status === status);
  return items.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function createCampaign(user, body) {
  const amt = computeAmounts(body.cabs, body.paid_days, body.free_days, body.rate);
  const doc = {
    ...body, id: newId(), proposal_id: null, invoice_id: null,
    campaign_name: body.campaign_name || `${body.brand_name} Campaign`,
    amount: amt.amount_payable, total_exposure: amt.total_exposure,
    created_by: user.id, created_at: nowIso(), updated_at: nowIso(),
  };
  await setDoc(docRef(CAMPAIGNS, doc.id), doc);
  doc.display_status = campaignDisplayStatus(doc);
  doc.days_left = daysLeftCamp(doc);
  return doc;
}

export async function updateCampaign(cid, body) {
  const snap = await getDoc(docRef(CAMPAIGNS, cid));
  if (!snap.exists()) throw new Error("Campaign not found");
  const c = { id: snap.id, ...snap.data() };
  const fields = ["brand_name", "campaign_name", "cabs", "paid_days", "free_days", "rate", "start_date", "end_date", "target_area", "ad_type", "status"];
  const updates = {};
  for (const k of fields) { if (k in body) updates[k] = body[k]; }
  const merged = { ...c, ...updates };
  const a = computeAmounts(merged.cabs, merged.paid_days, merged.free_days, merged.rate);
  updates.amount = a.amount_payable; updates.total_exposure = a.total_exposure; updates.updated_at = nowIso();
  await updateDoc(docRef(CAMPAIGNS, cid), updates);
  const res = await getDoc(docRef(CAMPAIGNS, cid));
  const result = { id: res.id, ...res.data() };
  result.display_status = campaignDisplayStatus(result);
  result.days_left = daysLeftCamp(result);
  return result;
}

export async function convertProposalToCampaign(user, pid) {
  const snap = await getDoc(docRef(QW_PROPOSALS, pid));
  if (!snap.exists()) throw new Error("Proposal not found");
  const p = snap.data();

  // Check existing campaign
  const existingSnap = await getDocs(query(collection(db, CAMPAIGNS), where("proposal_id", "==", pid)));
  if (!existingSnap.empty) {
    await updateDoc(docRef(QW_PROPOSALS, pid), { status: "accepted" });
    return { id: existingSnap.docs[0].id, ...existingSnap.docs[0].data() };
  }

  const camp = {
    id: newId(), proposal_id: pid, lead_id: p.lead_id, brand_name: p.brand_name,
    campaign_name: `${p.brand_name} Campaign`, cabs: p.cabs, paid_days: p.paid_days,
    free_days: p.free_days, rate: p.rate, start_date: p.start_date, end_date: p.end_date,
    target_area: p.target_area || "", ad_type: p.ad_type || "video",
    amount: p.amount_payable, total_exposure: p.total_exposure, status: "active", invoice_id: null,
    created_by: user.id, created_at: nowIso(), updated_at: nowIso(),
  };
  await setDoc(docRef(CAMPAIGNS, camp.id), camp);
  await updateDoc(docRef(QW_PROPOSALS, pid), { status: "accepted" });

  if (p.lead_id) {
    await logActivity(p.lead_id, user, "converted", `Campaign started from proposal ${p.proposal_no || ""}`);
  }

  camp.display_status = "active";
  camp.days_left = daysLeftCamp(camp);
  return camp;
}

// ─── Invoices ──────────────────────────────────────────────
const INVOICES = "invoices";

async function nextInvoiceNumber() {
  const counterRef = doc(db, "counters", "invoice");
  const snap = await getDoc(counterRef);
  let seq = 1;
  if (snap.exists()) {
    seq = (snap.data().seq || 0) + 1;
    await updateDoc(counterRef, { seq });
  } else {
    await setDoc(counterRef, { seq: 1 });
  }
  return `QW-${String(seq).padStart(3, "0")}`;
}

export async function previewInvoiceNumber() {
  const snap = await getDoc(doc(db, "counters", "invoice"));
  const seq = (snap.exists() ? snap.data().seq : 0) + 1;
  return `QW-${String(seq).padStart(3, "0")}`;
}

export async function listInvoices(user, { search, status } = {}) {
  const snap = await getDocs(collection(db, INVOICES));
  let items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  if (user.role !== "admin") items = items.filter((i) => i.created_by === user.id);
  if (status) items = items.filter((i) => i.status === status);
  if (search) {
    const s = search.toLowerCase();
    items = items.filter((i) => (i.brand_name || "").toLowerCase().includes(s) || (i.invoice_no || "").toLowerCase().includes(s));
  }
  return items.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
}

export async function createInvoice(user, body) {
  const amount = (parseInt(body.cabs) || 0) * (parseInt(body.paid_days) || 0) * (parseFloat(body.rate) || 0);
  let invNo = body.invoice_no;

  if (invNo) {
    const existingSnap = await getDocs(query(collection(db, INVOICES), where("invoice_no", "==", invNo)));
    if (!existingSnap.empty) throw new Error(`Invoice number ${invNo} already exists`);
  } else {
    invNo = await nextInvoiceNumber();
  }

  const doc = {
    ...body, id: newId(), invoice_no: invNo, invoice_date: body.invoice_date || nowIso(),
    amount, amount_paid: 0, balance_due: amount, payment_date: null,
    created_by: user.id, created_by_name: user.name, created_at: nowIso(), updated_at: nowIso(),
  };
  await setDoc(docRef(INVOICES, doc.id), doc);

  if (body.campaign_id) {
    await updateDoc(docRef(CAMPAIGNS, body.campaign_id), { invoice_id: doc.id });
  }
  if (body.lead_id) {
    await logActivity(body.lead_id, user, "proposal_sent",
      `Invoice ${invNo} generated (₹${Math.round(amount).toLocaleString("en-IN")})`, { amount });
  }

  return doc;
}

export async function generateInvoiceFromCampaign(user, cid) {
  const campSnap = await getDoc(docRef(CAMPAIGNS, cid));
  if (!campSnap.exists()) throw new Error("Campaign not found");
  const c = campSnap.data();

  if (c.invoice_id) {
    const existingSnap = await getDoc(docRef(INVOICES, c.invoice_id));
    if (existingSnap.exists()) return { id: existingSnap.id, ...existingSnap.data() };
  }

  const invNo = await nextInvoiceNumber();
  const contact = {};
  if (c.lead_id) {
    const leadSnap = await getDoc(docRef(LEADS, c.lead_id));
    if (leadSnap.exists()) {
      const lead = leadSnap.data();
      contact.contact_person = lead.contact_person || "";
      contact.phone = lead.mobile || "";
      contact.whatsapp = lead.whatsapp || "";
    }
  }

  const doc = {
    id: newId(), invoice_no: invNo, brand_name: c.brand_name, lead_id: c.lead_id || null,
    ...contact, campaign_id: cid, proposal_id: c.proposal_id || null,
    invoice_date: nowIso(), description: "Advertising campaign on QwickAds digital cab screens",
    cabs: c.cabs, paid_days: c.paid_days, free_days: c.free_days, rate: c.rate,
    start_date: c.start_date, end_date: c.end_date, amount: c.amount,
    amount_paid: 0, balance_due: c.amount, payment_date: null,
    status: "pending", notes: "", created_by: user.id, created_by_name: user.name,
    created_at: nowIso(), updated_at: nowIso(),
  };
  await setDoc(docRef(INVOICES, doc.id), doc);
  await updateDoc(docRef(CAMPAIGNS, cid), { invoice_id: doc.id });
  return doc;
}

export async function updateInvoice(iid, body) {
  const snap = await getDoc(docRef(INVOICES, iid));
  if (!snap.exists()) throw new Error("Invoice not found");
  const inv = snap.data();

  if (body.invoice_no && body.invoice_no !== inv.invoice_no) {
    const existingSnap = await getDocs(query(collection(db, INVOICES), where("invoice_no", "==", body.invoice_no)));
    if (!existingSnap.empty) throw new Error("Invoice number already exists");
  }

  const fields = ["brand_name", "invoice_no", "invoice_date", "description", "cabs", "paid_days", "free_days", "rate", "start_date", "end_date", "status", "notes"];
  const updates = {};
  for (const k of fields) { if (k in body) updates[k] = body[k]; }
  const merged = { ...inv, ...updates };
  const amount = (parseInt(merged.cabs) || 0) * (parseInt(merged.paid_days) || 0) * (parseFloat(merged.rate) || 0);
  updates.amount = amount;
  updates.balance_due = Math.max(amount - (inv.amount_paid || 0), 0);
  updates.updated_at = nowIso();

  await updateDoc(docRef(INVOICES, iid), updates);
  const updated = await getDoc(docRef(INVOICES, iid));
  return { id: updated.id, ...updated.data() };
}

export async function recordPayment(iid, body) {
  const snap = await getDoc(docRef(INVOICES, iid));
  if (!snap.exists()) throw new Error("Invoice not found");
  const inv = snap.data();
  const invoiceAmount = parseFloat(inv.amount || 0);
  let paid = parseFloat(body.amount_paid || 0);
  let balance, status;

  if (body.status === "paid") {
    paid = invoiceAmount; balance = 0; status = "paid";
  } else {
    paid = Math.min(Math.max(paid, 0), invoiceAmount);
    balance = Math.max(invoiceAmount - paid, 0);
    if (body.status) status = body.status;
    else if (paid <= 0) status = "pending";
    else if (balance <= 0) status = "paid";
    else status = "partially_paid";
  }

  await updateDoc(docRef(INVOICES, iid), {
    amount_paid: paid, balance_due: balance, status,
    payment_date: body.payment_date || nowIso(), updated_at: nowIso(),
  });
  const updated = await getDoc(docRef(INVOICES, iid));
  return { id: updated.id, ...updated.data() };
}

export async function shareInvoiceWhatsapp(user, iid) {
  const snap = await getDoc(docRef(INVOICES, iid));
  if (!snap.exists()) throw new Error("Invoice not found");
  await updateDoc(docRef(INVOICES, iid), {
    whatsapp_shared: true, shared_by: user.id, shared_by_name: user.name, shared_at: nowIso(),
  });
  const updated = await getDoc(docRef(INVOICES, iid));
  return { id: updated.id, ...updated.data() };
}

// ─── Business Dashboard ────────────────────────────────────
export async function businessDashboard() {
  const settings = await getBusinessSettings();

  const campaignsSnap = await getDocs(collection(db, CAMPAIGNS));
  const campaigns = campaignsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
  for (const c of campaigns) { c.display_status = campaignDisplayStatus(c); c.days_left = daysLeftCamp(c); }

  const active = campaigns.filter((c) => ["active", "expiring_soon"].includes(c.display_status));
  const expiring = campaigns.filter((c) =>
    c.display_status === "expiring_soon" || (c.display_status === "expired" && (c.days_left || -99) >= -2)
  );
  expiring.sort((a, b) => (a.days_left || 999) - (b.days_left || 999));

  const activeBrands = new Set(active.map((c) => c.brand_name)).size;
  const totalSlots = settings.total_slots || TOTAL_AD_SLOTS;
  const occupiedSlots = Math.min(active.length, totalSlots);

  const invoicesSnap = await getDocs(collection(db, INVOICES));
  const invoices = invoicesSnap.docs.map((d) => d.data());
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  let monthlyRevenue = 0, totalRevenue = 0, pendingPayments = 0;
  for (const inv of invoices) {
    const amountPaid = parseFloat(inv.amount_paid || 0);
    totalRevenue += amountPaid;
    if (inv.payment_date && inv.payment_date >= monthStart) monthlyRevenue += amountPaid;
    if (["pending", "partially_paid", "overdue"].includes(inv.status)) pendingPayments += parseFloat(inv.balance_due || 0);
  }

  return {
    active_brands: activeBrands, active_campaigns: active.length,
    occupied_slots: occupiedSlots, total_slots: totalSlots,
    occupancy_pct: totalSlots ? Math.round((occupiedSlots / totalSlots) * 100) : 0,
    monthly_revenue: monthlyRevenue, total_revenue: totalRevenue,
    pending_payments: pendingPayments, total_invoices: invoices.length,
    expiring_campaigns: expiring.slice(0, 10),
  };
}

// ─── Business Settings ─────────────────────────────────────
const SETTINGS_DOC = doc(db, "business_settings", "default");

export async function getBusinessSettings() {
  const snap = await getDoc(SETTINGS_DOC);
  if (!snap.exists()) {
    await setDoc(SETTINGS_DOC, DEFAULT_BUSINESS_SETTINGS);
    return { ...DEFAULT_BUSINESS_SETTINGS };
  }
  return { id: snap.id, ...snap.data() };
}

export async function updateBusinessSettings(body) {
  const allowed = {};
  for (const k of ["company_name", "tagline", "address", "phone", "email", "gst", "total_slots", "banking", "pricing_presets"]) {
    if (k in body) allowed[k] = body[k];
  }
  await updateDoc(SETTINGS_DOC, allowed);
  return await getBusinessSettings();
}

// ─── Templates ─────────────────────────────────────────────
const TEMPLATES = "message_templates";

export async function listTemplates() {
  const snap = await getDocs(collection(db, TEMPLATES));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function updateTemplate(templateId, body) {
  await updateDoc(docRef(TEMPLATES, templateId), body);
  const snap = await getDoc(docRef(TEMPLATES, templateId));
  return { id: snap.id, ...snap.data() };
}

// ─── Cabs ──────────────────────────────────────────────────
const CABS = "cabs";

export async function listCabs() {
  const snap = await getDocs(collection(db, CABS));
  const cabs = snap.docs.map((d) => ({ id: d.id, ...d.data() })).sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  return {
    cabs,
    total_cabs: cabs.length,
    total_monthly_payment: cabs.filter((c) => c.active !== false).reduce((sum, c) => sum + (c.payment_per_month || 0), 0),
  };
}

export async function createCab(body) {
  const snap = await getDocs(query(collection(db, CABS), where("cab_number", "==", body.cab_number.trim())));
  if (!snap.empty) throw new Error("Cab number already exists");

  const doc = {
    id: newId(), name: body.name.trim(), cab_number: body.cab_number.trim(),
    mobile: body.mobile.trim(), area: (body.area || "").trim(), note: (body.note || "").trim(),
    active: body.active !== false, payment_per_month: body.payment_per_month || 500,
    created_at: nowIso(), updated_at: nowIso(),
  };
  await setDoc(docRef(CABS, doc.id), doc);
  return doc;
}

export async function updateCab(cabId, body) {
  const snap = await getDoc(docRef(CABS, cabId));
  if (!snap.exists()) throw new Error("Cab not found");

  const dupSnap = await getDocs(query(collection(db, CABS), where("cab_number", "==", body.cab_number.trim())));
  for (const d of dupSnap.docs) {
    if (d.id !== cabId) throw new Error("Another cab already uses this cab number");
  }

  const updates = {
    name: body.name.trim(), cab_number: body.cab_number.trim(), mobile: body.mobile.trim(),
    area: (body.area || "").trim(), note: (body.note || "").trim(),
    active: body.active !== false, payment_per_month: body.payment_per_month || 500, updated_at: nowIso(),
  };
  await updateDoc(docRef(CABS, cabId), updates);
  const updated = await getDoc(docRef(CABS, cabId));
  return { id: updated.id, ...updated.data() };
}

export async function deleteCab(cabId) {
  await deleteDoc(docRef(CABS, cabId));
}

// ─── CSV Import ────────────────────────────────────────────
export async function importPreview(rows) {
  const snap = await getDocs(collection(db, LEADS));
  const existing = snap.docs.map((d) => d.data());

  const result = [];
  let newCount = 0, dupCount = 0;

  for (const row of rows) {
    const mobile = row.phone || row.mobile || "";
    const brand = row["brand name"] || row.brand || row.brand_name || "";
    if (!brand && !mobile) continue;

    const isDup = existing.some((l) =>
      (mobile && l.mobile === mobile) ||
      (brand && (l.brand_name || "").toLowerCase() === brand.toLowerCase()) ||
      (row.email && l.email === row.email)
    );
    if (isDup) dupCount++; else newCount++;

    result.push({
      brand_name: brand, contact_person: row["contact person"] || row.contact || "",
      mobile, whatsapp: row.whatsapp || mobile, category: row.category || "other",
      location: row.location || "", source: row.source || "other", notes: row.notes || "",
      is_duplicate: isDup,
    });
  }
  return { total: result.length, new: newCount, duplicates: dupCount, rows: result };
}

export async function importCommit(rows, assignedTo, user) {
  let imported = 0;
  const catKeys = new Set(CATEGORIES.map((c) => c.key));
  const srcKeys = new Set(SOURCES.map((s) => s.key));

  for (const row of rows) {
    if (row.is_duplicate) continue;
    const cat = (row.category || "other").toLowerCase().replace(/ /g, "_");
    const src = (row.source || "other").toLowerCase().replace(/ /g, "_");
    const id = newId();
    const doc = {
      id, brand_name: row.brand_name || "", category: catKeys.has(cat) ? cat : "other",
      contact_person: row.contact_person || "", mobile: row.mobile || "",
      whatsapp: row.whatsapp || row.mobile || "", email: row.email || "",
      location: row.location || "", area: row.area || "",
      source: srcKeys.has(src) ? src : "other",
      assigned_to: assignedTo || user.id, status: "new", priority: "warm",
      notes: row.notes || "", expected_value: 0, proposal_status: "not_sent",
      conversion: null, next_follow_up: null,
      created_by: user.id, created_at: nowIso(), updated_at: nowIso(), last_contact_at: null,
    };
    await setDoc(docRef(LEADS, id), doc);
    await logActivity(id, user, "lead_created", `Imported: ${doc.brand_name}`);
    imported++;
  }
  return { imported };
}

// ─── CSV Export ────────────────────────────────────────────
export async function exportCsv() {
  const snap = await getDocs(collection(db, LEADS));
  const leads = snap.docs.map((d) => d.data());
  const fields = ["brand_name", "category", "contact_person", "mobile", "whatsapp", "email",
    "location", "area", "source", "status", "priority", "expected_value", "created_at"];
  const header = fields.join(",");
  const rows = leads.map((l) => fields.map((f) => `"${(l[f] || "").toString().replace(/"/g, '""')}"`).join(","));
  return [header, ...rows].join("\n");
}

// ─── Activity Log ──────────────────────────────────────────
async function logActivity(leadId, actor, type, description, extra = {}) {
  const id = newId();
  const doc = {
    id, lead_id: leadId, type, description,
    created_by: actor.id, created_by_name: actor.name, created_at: nowIso(),
    ...extra,
  };
  await setDoc(docRef("activity_logs", id), doc);
  return doc;
}

// ─── Admin Reset ───────────────────────────────────────────
export async function resetDemo() {
  const collections = ["leads", "call_logs", "follow_ups", "proposals", "qw_proposals", "campaigns", "invoices", "activity_logs"];
  const deleted = {};
  for (const coll of collections) {
    const snap = await getDocs(collection(db, coll));
    const count = snap.size;
    for (const d of snap.docs) await deleteDoc(d.ref);
    deleted[coll] = count;
  }
  await setDoc(doc(db, "counters", "invoice"), { seq: 0 });
  return { ok: true, deleted, message: "Demo data successfully cleared." };
}

// ─── Admin Backup ──────────────────────────────────────────
export async function backupData() {
  const data = {};
  const collections = ["leads", "call_logs", "follow_ups", "proposals", "qw_proposals", "campaigns", "invoices", "activity_logs"];
  for (const coll of collections) {
    const snap = await getDocs(collection(db, coll));
    data[coll] = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  }
  data._exported_at = nowIso();
  return data;
}
