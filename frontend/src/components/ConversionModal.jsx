import { useState, useEffect } from "react";
import Confetti from "react-confetti";
import { PartyPopper } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { inr, tomorrowDate } from "@/lib/qwick";

export default function ConversionModal({ lead, open, onClose, onSaved }) {
  const [pkg, setPkg] = useState("Standard Cab Campaign");
  const [cabs, setCabs] = useState(20);
  const [duration, setDuration] = useState(30);
  const [price, setPrice] = useState(29);
  const [start, setStart] = useState(new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState(tomorrowDate());
  const [saving, setSaving] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [size, setSize] = useState({ w: 400, h: 600 });

  useEffect(() => {
    setSize({ w: window.innerWidth, h: window.innerHeight });
  }, [open]);

  useEffect(() => {
    const d = new Date(start);
    if (!isNaN(d) && Number(duration) > 0) {
      d.setDate(d.getDate() + Number(duration));
      setEnd(d.toISOString().slice(0, 10));
    }
  }, [start, duration]);

  const total = (Number(cabs) || 0) * (Number(price) || 0) * (Number(duration) || 0);

  const save = async () => {
    setSaving(true);
    try {
      await api.post(`/leads/${lead.id}/convert`, {
        package: pkg, cabs: Number(cabs), duration_days: Number(duration),
        price: Number(price), start_date: start, end_date: end, total_value: total,
      });
      setCelebrate(true);
      toast.success("🎉 Lead converted!");
      setTimeout(() => { setCelebrate(false); onSaved && onSaved(); onClose(); }, 2200);
    } catch (e) { toast.error(apiErr(e)); setSaving(false); }
  };

  if (!lead) return null;

  return (
    <>
      {celebrate && <Confetti width={size.w} height={size.h} recycle={false} numberOfPieces={320} className="!z-[100]" />}
      <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
        <DialogContent data-testid="conversion-modal" className="max-w-md rounded-3xl">
          <DialogHeader>
            <div className="mx-auto mb-1 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100">
              <PartyPopper className="h-6 w-6 text-emerald-600" />
            </div>
            <DialogTitle className="text-center font-heading text-xl">Convert {lead.brand_name}</DialogTitle>
            <p className="text-center text-sm text-slate-500">Set up the campaign & mark as customer</p>
          </DialogHeader>

          <div className="space-y-3">
            <div>
              <Label>Campaign package</Label>
              <Input data-testid="conv-package" value={pkg} onChange={(e) => setPkg(e.target.value)} className="mt-1 rounded-2xl" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div><Label>Cabs</Label><Input data-testid="conv-cabs" type="number" value={cabs} onChange={(e) => setCabs(e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>₹/day</Label><Input data-testid="conv-price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>Days</Label><Input data-testid="conv-duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="mt-1 rounded-2xl" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Start</Label><Input data-testid="conv-start" type="date" value={start} onChange={(e) => setStart(e.target.value)} className="mt-1 rounded-2xl" /></div>
              <div><Label>End</Label><Input data-testid="conv-end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} className="mt-1 rounded-2xl" /></div>
            </div>
            <div className="rounded-2xl bg-emerald-50 p-4 text-center">
              <div className="text-xs font-medium text-emerald-600">{cabs} Cabs × {inr(price)}/day × {duration} days</div>
              <div className="font-heading text-3xl font-bold text-emerald-700" data-testid="conv-total">{inr(total)}</div>
            </div>
          </div>

          <DialogFooter>
            <Button data-testid="confirm-conversion-btn" onClick={save} disabled={saving}
              className="w-full rounded-2xl bg-emerald-500 py-6 text-base font-semibold hover:bg-emerald-600">
              {saving ? "Converting..." : "🎉 Mark as Converted"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
