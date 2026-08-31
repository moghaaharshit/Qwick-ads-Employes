import jsPDF from "jspdf";

const PURPLE = [124, 58, 237]; // #7C3AED
const DARK = [15, 23, 42]; // #0F172A
const GRAY = [100, 116, 139]; // #64748B
const LIGHT_BG = [248, 250, 252]; // #F8FAFC
const WHITE = [255, 255, 255];

function addBranding(doc, settings) {
  // Header bar
  doc.setFillColor(...PURPLE);
  doc.rect(0, 0, 210, 28, "F");

  doc.setTextColor(...WHITE);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(settings?.company_name || "QwickAds", 15, 17);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(settings?.tagline || "FAST ADS. REAL RESULTS.", 15, 23);

  doc.setFontSize(7);
  doc.text(settings?.address || "", 150, 12);
  if (settings?.phone) doc.text(`Ph: ${settings.phone}`, 150, 17);
  if (settings?.email) doc.text(settings.email, 150, 22);

  // Thin purple line
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.5);
  doc.line(0, 29, 210, 29);
}

function addFooter(doc, settings, pageNum) {
  doc.setFillColor(...LIGHT_BG);
  doc.rect(0, 275, 210, 22, "F");
  doc.setDrawColor(...PURPLE);
  doc.setLineWidth(0.3);
  doc.line(0, 275, 210, 275);

  doc.setTextColor(...GRAY);
  doc.setFontSize(7);
  doc.text(settings?.company_name || "QwickAds", 15, 282);
  doc.text(settings?.address || "", 15, 287);
  if (settings?.banking?.account_number) {
    doc.text(`A/c: ${settings.banking.account_name} | ${settings.banking.bank_name} | A/c No: ${settings.banking.account_number} | IFSC: ${settings.banking.ifsc}`, 15, 292);
  }
  doc.text(`Page ${pageNum}`, 185, 292);
}

function addSectionTitle(doc, title, y) {
  doc.setFillColor(...PURPLE);
  doc.roundedRect(15, y, 180, 8, 2, 2, "F");
  doc.setTextColor(...WHITE);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(title, 20, y + 5.5);
  return y + 12;
}

function addField(doc, label, value, x, y, w) {
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(label, x, y);
  doc.setTextColor(...DARK);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(String(value || "—"), x, y + 5);
  return y + 12;
}

function inr(n) {
  return "₹" + Number(n || 0).toLocaleString("en-IN");
}

// ─── Proposal PDF ──────────────────────────────────────────
export function buildProposalPdf(p, settings) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addBranding(doc, settings);

  let y = 38;

  // Title
  doc.setTextColor(...DARK);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("PROPOSAL", 105, y, { align: "center" });
  doc.setTextColor(...GRAY);
  doc.setFontSize(9);
  doc.text(`${p.proposal_no || "QP-000"}  •  ${new Date(p.created_at || Date.now()).toLocaleDateString("en-IN")}`, 105, y + 6, { align: "center" });
  y += 16;

  // Client info
  y = addSectionTitle(doc, "CLIENT DETAILS", y);
  y = addField(doc, "Brand Name", p.brand_name, 15, y, 85);
  y = addField(doc, "Contact Person", p.contact_person, 110, y - 12, 85);
  if (p.phone) { y = Math.max(y, y); y = addField(doc, "Phone", p.phone, 15, y, 85); }
  if (p.target_area) { y = addField(doc, "Target Area", p.target_area, 110, y - 12, 85); }
  y += 4;

  // Campaign details
  y = addSectionTitle(doc, "CAMPAIGN DETAILS", y);
  y = addField(doc, "Cabs", p.cabs || 0, 15, y, 40);
  y = addField(doc, "Paid Days", p.paid_days || 0, 65, y - 12, 40);
  y = addField(doc, "Free Days", p.free_days || 0, 110, y - 12, 40);
  y = addField(doc, "Rate / Day / Cab", inr(p.rate), 155, y - 12, 40);
  if (p.start_date) y = addField(doc, "Start Date", p.start_date, 15, y, 85);
  if (p.end_date) y = addField(doc, "End Date", p.end_date, 110, y - 12, 85);
  y += 4;

  // Pricing summary
  y = addSectionTitle(doc, "PRICING SUMMARY", y);

  // Table
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(15, y, 180, 32, 2, 2, "F");

  const rows = [
    ["Amount Payable", inr(p.amount_payable)],
    ["Total Exposure (days)", String(p.total_exposure || ((p.paid_days || 0) + (p.free_days || 0)))],
    ["Campaign Value", inr(p.campaign_value)],
  ];

  let ty = y + 8;
  for (const [label, val] of rows) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.text(label, 22, ty);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(val, 170, ty, { align: "right" });
    ty += 8;
  }

  // Ad type
  y = ty + 6;
  if (p.ad_type) y = addField(doc, "Ad Type", p.ad_type === "video" ? "Digital Video Screen" : p.ad_type, 15, y, 85);

  // Notes
  if (p.notes) {
    y += 4;
    y = addSectionTitle(doc, "NOTES", y);
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(p.notes, 175);
    doc.text(lines, 15, y);
    y += lines.length * 4 + 6;
  }

  // Terms
  y = Math.max(y, 200);
  y = addSectionTitle(doc, "TERMS & CONDITIONS", y);
  doc.setTextColor(...GRAY);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  const terms = [
    "1. This proposal is valid for 15 days from the date of issue.",
    "2. Payment to be made in advance before campaign start date.",
    "3. GST (18%) will be charged separately as applicable.",
    "4. Campaign dates are subject to cab availability.",
    "5. Cancellation within 48 hours of start may incur charges.",
  ];
  for (const t of terms) {
    doc.text(t, 15, y);
    y += 4;
  }

  // Signature
  y = Math.max(y + 10, 255);
  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("For " + (settings?.company_name || "QwickAds"), 15, y);
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signatory", 15, y + 5);

  addFooter(doc, settings, 1);

  return doc.output("arraybuffer");
}

// ─── Invoice PDF ───────────────────────────────────────────
export function buildInvoicePdf(inv, settings) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  addBranding(doc, settings);

  let y = 38;

  // Title
  doc.setTextColor(...DARK);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("TAX INVOICE", 105, y, { align: "center" });
  doc.setTextColor(...GRAY);
  doc.setFontSize(9);
  doc.text(`Invoice No: ${inv.invoice_no || "QW-000"}`, 105, y + 6, { align: "center" });
  y += 14;

  // Invoice details
  y = addSectionTitle(doc, "INVOICE DETAILS", y);
  y = addField(doc, "Invoice Number", inv.invoice_no, 15, y, 85);
  y = addField(doc, "Invoice Date", inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString("en-IN") : "—", 110, y - 12, 85);
  y = addField(doc, "Brand Name", inv.brand_name, 15, y, 85);
  if (inv.contact_person) y = addField(doc, "Contact Person", inv.contact_person, 110, y - 12, 85);
  if (inv.phone) y = addField(doc, "Phone", inv.phone, 15, y, 85);
  y += 4;

  // Campaign details
  y = addSectionTitle(doc, "CAMPAIGN DETAILS", y);
  y = addField(doc, "Cabs", inv.cabs || 0, 15, y, 40);
  y = addField(doc, "Paid Days", inv.paid_days || 0, 65, y - 12, 40);
  y = addField(doc, "Free Days", inv.free_days || 0, 110, y - 12, 40);
  y = addField(doc, "Rate / Day / Cab", inr(inv.rate), 155, y - 12, 40);
  if (inv.start_date) y = addField(doc, "Start Date", inv.start_date, 15, y, 85);
  if (inv.end_date) y = addField(doc, "End Date", inv.end_date, 110, y - 12, 85);
  y += 4;

  // Amount
  y = addSectionTitle(doc, "AMOUNT DETAILS", y);
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(15, y, 180, 28, 2, 2, "F");

  const amountRows = [
    ["Total Amount", inr(inv.amount)],
    ["Amount Paid", inr(inv.amount_paid || 0)],
    ["Balance Due", inr(inv.balance_due || inv.amount)],
  ];

  let ty = y + 8;
  for (const [label, val] of amountRows) {
    doc.setTextColor(...GRAY);
    doc.setFontSize(9);
    doc.text(label, 22, ty);
    doc.setTextColor(...DARK);
    doc.setFont("helvetica", "bold");
    doc.text(val, 170, ty, { align: "right" });
    ty += 6;
  }

  if (inv.notes) {
    y = ty + 6;
    y = addSectionTitle(doc, "NOTES", y);
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(inv.notes, 175);
    doc.text(lines, 15, y);
    y += lines.length * 4 + 6;
  }

  // Bank details
  if (settings?.banking?.account_number) {
    y = Math.max(y + 4, 200);
    y = addSectionTitle(doc, "BANK DETAILS", y);
    doc.setTextColor(...DARK);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text(`Account Name: ${settings.banking.account_name || "—"}`, 15, y); y += 5;
    doc.text(`Bank: ${settings.banking.bank_name || "—"}`, 15, y); y += 5;
    doc.text(`Account No: ${settings.banking.account_number || "—"}`, 15, y); y += 5;
    doc.text(`IFSC: ${settings.banking.ifsc || "—"}`, 15, y); y += 5;
    if (settings.banking.branch) { doc.text(`Branch: ${settings.banking.branch}`, 15, y); y += 5; }
  }

  if (settings?.gst) {
    y += 4;
    doc.setTextColor(...GRAY);
    doc.setFontSize(8);
    doc.text(`GSTIN: ${settings.gst}`, 15, y);
  }

  // Signature
  y = Math.max(y + 10, 255);
  doc.setTextColor(...DARK);
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.text("For " + (settings?.company_name || "QwickAds"), 15, y);
  doc.setFont("helvetica", "normal");
  doc.text("Authorized Signatory", 15, y + 5);

  addFooter(doc, settings, 1);

  return doc.output("arraybuffer");
}
