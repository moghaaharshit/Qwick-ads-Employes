import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "firebase/firestore";
import * as fs from "./firestore";

// ─── Error helper ──────────────────────────────────────────
export function apiErr(e, fallback = "Something went wrong") {
  if (typeof e === "string") return e;
  if (e?.message) return e.message;
  return fallback;
}

// ─── Auth helpers ──────────────────────────────────────────
export async function firebaseLogin(email, password) {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  const uid = cred.user.uid;
  const normalizedEmail = email.toLowerCase().trim();

  // Try to find user profile in Firestore by email
  const usersSnap = await getDocs(query(collection(db, "users"), where("email", "==", normalizedEmail)));

  if (usersSnap.empty) {
    // Auto-create Firestore profile for first-time login
    const isAdmin = normalizedEmail.includes("admin");
    const nameFromEmail = normalizedEmail.split("@")[0]
      .replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const profile = {
      id: uid,
      name: isAdmin ? "Admin" : nameFromEmail,
      email: normalizedEmail,
      role: isAdmin ? "admin" : "employee",
      active: true,
      avatar: null,
      created_at: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", uid), profile);
    return { id: uid, email: profile.email, name: profile.name, role: profile.role, avatar: null, active: true };
  }

  const profile = usersSnap.docs[0].data();
  return { id: uid, email: profile.email, name: profile.name, role: profile.role, avatar: profile.avatar || null, active: profile.active !== false };
}

export async function firebaseGetCurrentUser() {
  const user = auth.currentUser;
  if (!user) return null;
  const normalizedEmail = user.email.toLowerCase().trim();
  const usersSnap = await getDocs(query(collection(db, "users"), where("email", "==", normalizedEmail)));

  if (usersSnap.empty) {
    // Auto-create profile for existing Firebase Auth user (e.g. page reload)
    const isAdmin = normalizedEmail.includes("admin");
    const nameFromEmail = normalizedEmail.split("@")[0]
      .replace(/\./g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const profile = {
      id: user.uid,
      name: isAdmin ? "Admin" : nameFromEmail,
      email: normalizedEmail,
      role: isAdmin ? "admin" : "employee",
      active: true,
      avatar: null,
      created_at: new Date().toISOString(),
    };
    await setDoc(doc(db, "users", user.uid), profile);
    return { id: user.uid, email: profile.email, name: profile.name, role: profile.role, avatar: null, active: true };
  }

  const profile = usersSnap.docs[0].data();
  return { id: user.uid, email: profile.email, name: profile.name, role: profile.role, avatar: profile.avatar || null, active: profile.active !== false };
}

export async function firebaseSignOut() {
  await fbSignOut(auth);
}

// ─── Create Firebase Auth user via REST API ────────────────
// This does NOT sign in the new user, so admin session stays intact.
const FIREBASE_API_KEY = "AIzaSyBG4t_lFLJG35DY_FhD9RM4L0mbDzZvCSI";

export async function createFirebaseAuthUser(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${FIREBASE_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: false }),
    }
  );
  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error?.message || "Failed to create user";
    if (msg === "EMAIL_EXISTS") throw new Error("This email is already registered in Firebase Auth");
    throw new Error(msg);
  }
  return data.localId; // Firebase Auth UID
}

// ─── Route-based API wrapper ───────────────────────────────
// Mimics axios api.get/post/put/patch/delete calls and returns { data: result }
// so existing page code works with minimal changes.

async function route(method, url, body, params) {
  // Auth routes
  if (url === "/auth/login") {
    const result = await firebaseLogin(body.email, body.password);
    return { data: { token: "firebase-managed", user: result } };
  }
  if (url === "/auth/me") {
    const result = await firebaseGetCurrentUser();
    if (!result) throw new Error("Not authenticated");
    return { data: result };
  }

  // Meta
  if (url === "/meta" && method === "GET") return { data: fs.getMeta() };

  // Employees
  if (url === "/employees" && method === "GET") return { data: await fs.listEmployees() };
  if (url === "/employees" && method === "POST") {
    // Step 1: Create Firebase Auth user
    const authUid = await createFirebaseAuthUser(body.email, body.password);
    // Step 2: Create Firestore profile with the Firebase Auth UID
    const result = await fs.createEmployee({ ...body, authUid });
    return { data: result };
  }
  const empPatchMatch = url.match(/^\/employees\/(.+)$/);
  if (empPatchMatch && method === "PATCH") return { data: await fs.updateEmployee(empPatchMatch[1], body) };
  if (empPatchMatch && method === "DELETE") { await fs.deleteEmployee(empPatchMatch[1]); return { data: { ok: true } }; }

  // Leads
  if (url === "/leads" && method === "GET") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.listLeads(user, params || {}) };
  }
  if (url === "/leads" && method === "POST") {
    const user = await firebaseGetCurrentUser();
    const force = params?.force || url.includes("force=true");
    return { data: await fs.createLead(user, body, force) };
  }
  if (url === "/leads/check-duplicate" && method === "POST") {
    return { data: { duplicate: await fs.checkDuplicate(body.mobile, body.brand_name, body.email) } };
  }
  if (url === "/leads/export/csv" && method === "GET") {
    const csv = await fs.exportCsv();
    // Create and trigger download
    const blob = new Blob([csv], { type: "text/csv" });
    const url2 = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url2; a.download = "qwickads_leads.csv"; a.click();
    URL.revokeObjectURL(url2);
    return { data: { ok: true } };
  }
  const leadMatch = url.match(/^\/leads\/([^/]+)$/);
  if (leadMatch && method === "GET") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.getLead(user, leadMatch[1]) };
  }
  if (leadMatch && method === "PUT") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.updateLead(user, leadMatch[1], body) };
  }
  if (leadMatch && method === "DELETE") {
    await fs.deleteLead(leadMatch[1]);
    return { data: { ok: true } };
  }
  // Lead force create (url includes ?force=true)
  const leadForceMatch = url.match(/^\/leads\?force=(.+)$/);
  if (leadForceMatch && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.createLead(user, body, true) };
  }

  // Calls
  if (url === "/calls/today" && method === "GET") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.callsToday(user) };
  }
  const callMatch = url.match(/^\/leads\/([^/]+)\/call$/);
  if (callMatch && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.logCall(user, callMatch[1], body) };
  }

  // Follow-ups
  if (url === "/follow-ups" && method === "GET") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.listFollowUps(user) };
  }
  const fuCompleteMatch = url.match(/^\/follow-ups\/([^/]+)\/complete$/);
  if (fuCompleteMatch && method === "POST") {
    const user = await firebaseGetCurrentUser();
    await fs.completeFollowUp(user, fuCompleteMatch[1]);
    return { data: { ok: true } };
  }
  const fuRescheduleMatch = url.match(/^\/follow-ups\/([^/]+)\/reschedule$/);
  if (fuRescheduleMatch && method === "POST") {
    const user = await firebaseGetCurrentUser();
    await fs.rescheduleFollowUp(user, fuRescheduleMatch[1], body.due_at);
    return { data: { ok: true } };
  }

  // Proposals (simple)
  const simplePropMatch = url.match(/^\/leads\/([^/]+)\/proposals$/);
  if (simplePropMatch && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.createSimpleProposal(user, simplePropMatch[1], body) };
  }
  if (url === "/proposals" && method === "GET") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.listSimpleProposals(user) };
  }

  // Conversion
  const convertMatch = url.match(/^\/leads\/([^/]+)\/convert$/);
  if (convertMatch && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.convertLead(user, convertMatch[1], body) };
  }

  // Customers
  if (url === "/customers" && method === "GET") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.listCustomers(user) };
  }

  // Dashboard
  if (url === "/dashboard/employee" && method === "GET") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.employeeDashboard(user) };
  }
  if (url === "/dashboard/admin" && method === "GET") return { data: await fs.adminDashboard() };
  if (url === "/dashboard/business" && method === "GET") return { data: await fs.businessDashboard() };

  // Analytics
  if (url.startsWith("/analytics/employees") && method === "GET") {
    const period = params?.period || "week";
    return { data: await fs.employeePerformance(period) };
  }
  if (url === "/analytics/calls" && method === "GET") return { data: await fs.callAnalytics() };
  if (url === "/analytics/loss-reasons" && method === "GET") return { data: await fs.lossReasons() };

  // QW Proposals
  if (url === "/qw-proposals" && method === "GET") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.listQwProposals(user, params || {}) };
  }
  if (url === "/qw-proposals" && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.createQwProposal(user, body) };
  }
  const qwPropMatch = url.match(/^\/qw-proposals\/([^/]+)$/);
  if (qwPropMatch && method === "PUT") return { data: await fs.updateQwProposal(qwPropMatch[1], body) };
  if (qwPropMatch && method === "DELETE") { await fs.deleteQwProposal(qwPropMatch[1]); return { data: { ok: true } }; }

  const qwConvertMatch = url.match(/^\/qw-proposals\/([^/]+)\/convert-to-campaign$/);
  if (qwConvertMatch && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.convertProposalToCampaign(user, qwConvertMatch[1]) };
  }
  const qwShareMatch = url.match(/^\/qw-proposals\/([^/]+)\/share-whatsapp$/);
  if (qwShareMatch && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.shareQwProposalWhatsapp(user, qwShareMatch[1]) };
  }

  // Campaigns
  if (url === "/campaigns" && method === "GET") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.listCampaigns(user, params || {}) };
  }
  if (url === "/campaigns" && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.createCampaign(user, body) };
  }
  const campMatch = url.match(/^\/campaigns\/([^/]+)$/);
  if (campMatch && method === "PUT") return { data: await fs.updateCampaign(campMatch[1], body) };
  const campGenInvMatch = url.match(/^\/campaigns\/([^/]+)\/generate-invoice$/);
  if (campGenInvMatch && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.generateInvoiceFromCampaign(user, campGenInvMatch[1]) };
  }

  // Invoices
  if (url === "/invoices" && method === "GET") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.listInvoices(user, params || {}) };
  }
  if (url === "/invoices" && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.createInvoice(user, body) };
  }
  if (url === "/invoices/next-number" && method === "GET") {
    return { data: { invoice_no: await fs.previewInvoiceNumber() } };
  }
  const invMatch = url.match(/^\/invoices\/([^/]+)$/);
  if (invMatch && method === "PUT") return { data: await fs.updateInvoice(invMatch[1], body) };
  const invPaymentMatch = url.match(/^\/invoices\/([^/]+)\/payment$/);
  if (invPaymentMatch && method === "POST") return { data: await fs.recordPayment(invPaymentMatch[1], body) };
  const invShareMatch = url.match(/^\/invoices\/([^/]+)\/share-whatsapp$/);
  if (invShareMatch && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.shareInvoiceWhatsapp(user, invShareMatch[1]) };
  }

  // Business settings
  if (url === "/business-settings" && method === "GET") return { data: await fs.getBusinessSettings() };
  if (url === "/business-settings" && method === "PUT") return { data: await fs.updateBusinessSettings(body) };

  // Templates
  if (url === "/templates" && method === "GET") return { data: await fs.listTemplates() };
  const tmplMatch = url.match(/^\/templates\/([^/]+)$/);
  if (tmplMatch && method === "PUT") return { data: await fs.updateTemplate(tmplMatch[1], body) };

  // Cabs
  if (url === "/cabs" && method === "GET") return { data: await fs.listCabs() };
  if (url === "/cabs" && method === "POST") return { data: await fs.createCab(body) };
  const cabMatch = url.match(/^\/cabs\/([^/]+)$/);
  if (cabMatch && method === "PUT") return { data: await fs.updateCab(cabMatch[1], body) };
  if (cabMatch && method === "DELETE") { await fs.deleteCab(cabMatch[1]); return { data: { ok: true } }; }

  // Admin
  if (url === "/admin/reset-demo" && method === "POST") return { data: await fs.resetDemo() };
  if (url === "/admin/backup" && method === "GET") {
    const data = await fs.backupData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url2 = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url2; a.download = `qwickads_backup_${new Date().toISOString().slice(0, 10)}.json`; a.click();
    URL.revokeObjectURL(url2);
    return { data: { ok: true } };
  }

  // Import
  if (url === "/leads/import/preview" && method === "POST") {
    return { data: await fs.importPreview(body.rows || []) };
  }
  if (url === "/leads/import/commit" && method === "POST") {
    const user = await firebaseGetCurrentUser();
    return { data: await fs.importCommit(body.rows || [], body.assigned_to, user) };
  }

  throw new Error(`Unhandled API route: ${method} ${url}`);
}

// ─── API object (drop-in replacement for axios instance) ───
const api = {
  async get(url, config) { return await route("GET", url, null, config?.params); },
  async post(url, body, config) { return await route("POST", url, body, config?.params); },
  async put(url, body, config) { return await route("PUT", url, body, config?.params); },
  async patch(url, body, config) { return await route("PATCH", url, body, config?.params); },
  async delete(url, config) { return await route("DELETE", url, null, config?.params); },
};

export default api;

// Re-export openAuthedFile as no-op (PDFs now handled client-side)
export function openAuthedFile() {
  console.warn("openAuthedFile is no longer needed with Firebase — PDFs are generated client-side.");
}

// Re-export API_BASE for CSV export
export const API_BASE = "";
