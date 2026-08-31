import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { inr } from "@/lib/qwick";

export default function PaymentModal({ open, onClose, onSaved, invoice }) {
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [status, setStatus] = useState("");

  if (!invoice) return null;
  const balance = Math.max((invoice.amount || 0) - (+amount || 0), 0);

  const save = async () => {
    try {
      await api.post(`/invoices/${invoice.id}/payment`, {
        amount_paid: +amount || 0, payment_date: date, status: status || undefined,
      });
      toast.success("Payment recorded");
      onSaved && onSaved();
      onClose();
    } catch (e) { toast.error(apiErr(e)); }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent data-testid="payment-modal" className="max-w-sm rounded-3xl">
        <DialogHeader><DialogTitle className="font-heading text-xl">Record Payment · {invoice.invoice_no}</DialogTitle></DialogHeader>
        <div className="rounded-2xl bg-slate-50 p-3 text-center">
          <p className="text-xs text-slate-500">Invoice Amount</p>
          <p className="font-heading text-2xl font-bold text-slate-900">{inr(invoice.amount)}</p>
        </div>
        <div className="space-y-3">
          <div><Label>Amount Paid (₹)</Label><Input data-testid="pay-amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" className="rounded-full" onClick={() => setAmount(invoice.amount)}>Full amount</Button>
          </div>
          <div><Label>Payment Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="mt-1 rounded-2xl" /></div>
          <div>
            <Label>Status (optional)</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger data-testid="pay-status" className="mt-1 rounded-2xl"><SelectValue placeholder="Auto" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partially_paid">Partially Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-between rounded-2xl bg-purple-50 p-3 text-sm"><span className="text-slate-500">Balance Due</span><span className="font-heading font-bold text-primary">{inr(balance)}</span></div>
        </div>
        <DialogFooter><Button data-testid="save-payment-btn" onClick={save} className="w-full rounded-2xl py-5 font-semibold">Record Payment</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
