import { toast } from "sonner";
import api from "@/lib/api";
import { waLink, proposalWaMessage, invoiceWaMessage } from "@/lib/qwick";
import { buildProposalPdf, buildInvoicePdf } from "@/lib/pdf";
import { getBusinessSettings } from "@/lib/firestore";

function validNumber(...vals) {
  return vals.find((v) => v && String(v).replace(/\D/g, "").length >= 10);
}

function downloadPdf(arrayBuffer, filename) {
  const blob = new Blob([arrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 15000);
}

export async function shareProposal(p, employeeName) {
  const number = validNumber(p.whatsapp, p.phone);
  if (!number) { toast.error("WhatsApp number not added"); return false; }
  try {
    const settings = await getBusinessSettings();
    const pdf = buildProposalPdf(p, settings);
    downloadPdf(pdf, `QwickAds_Proposal_${p.brand_name}.pdf`);
  } catch (e) { console.error("PDF generation failed", e); }
  try { await api.post(`/qw-proposals/${p.id}/share-whatsapp`); } catch (e) {}
  window.open(waLink(number, proposalWaMessage(p, { contactName: p.contact_person, employeeName })), "_blank");
  toast.success("Proposal PDF downloaded — attach it in WhatsApp");
  return true;
}

export async function shareInvoice(inv, employeeName) {
  const number = validNumber(inv.whatsapp, inv.phone);
  if (!number) { toast.error("WhatsApp number not added"); return false; }
  try {
    const settings = await getBusinessSettings();
    const pdf = buildInvoicePdf(inv, settings);
    downloadPdf(pdf, `QwickAds_Invoice_${inv.invoice_no}.pdf`);
  } catch (e) { console.error("PDF generation failed", e); }
  try { await api.post(`/invoices/${inv.id}/share-whatsapp`); } catch (e) {}
  window.open(waLink(number, invoiceWaMessage(inv, { contactName: inv.contact_person, employeeName })), "_blank");
  toast.success("Invoice PDF downloaded — attach it in WhatsApp");
  return true;
}
