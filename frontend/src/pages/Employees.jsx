import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Shield, User, Power } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import api, { apiErr } from "@/lib/api";
import { PageHeader } from "@/components/Shared";
import { initials } from "@/lib/qwick";

export default function Employees() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const { data } = useQuery({ queryKey: ["employees"], queryFn: async () => (await api.get("/employees")).data });
  const list = data || [];

  const create = async () => {
    if (!form.name || !form.email || !form.password) { toast.error("All fields required"); return; }
    try { await api.post("/employees", form); toast.success("Employee added"); setOpen(false); setForm({ name: "", email: "", password: "" }); qc.invalidateQueries({ queryKey: ["employees"] }); }
    catch (e) { toast.error(apiErr(e)); }
  };
  const toggle = async (emp) => { await api.patch(`/employees/${emp.id}`, { active: !emp.active }); qc.invalidateQueries({ queryKey: ["employees"] }); };

  return (
    <div>
      <PageHeader title="Employees" subtitle={`${list.length} team members`}
        action={<Button data-testid="add-employee-btn" onClick={() => setOpen(true)} className="rounded-full font-semibold"><UserPlus className="h-4 w-4" /> Add</Button>} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((e) => (
          <div key={e.id} data-testid={`employee-${e.id}`} className="rounded-3xl bg-white p-5 shadow-soft border border-purple-50">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl text-sm font-bold ${e.role === "admin" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-600"}`}>{initials(e.name)}</div>
              <div className="min-w-0 flex-1">
                <h3 className="font-heading font-bold text-slate-900 truncate">{e.name}</h3>
                <p className="truncate text-xs text-slate-400">{e.email}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${e.role === "admin" ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-600"}`}>
                {e.role === "admin" ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}{e.role}
              </span>
              {e.role !== "admin" && (
                <button data-testid={`toggle-emp-${e.id}`} onClick={() => toggle(e)} className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${e.active ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                  <Power className="h-3 w-3" />{e.active ? "Active" : "Inactive"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent data-testid="employee-modal" className="max-w-sm rounded-3xl">
          <DialogHeader><DialogTitle className="font-heading text-xl">Add Employee</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Name</Label><Input data-testid="emp-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 rounded-2xl" /></div>
            <div><Label>Email</Label><Input data-testid="emp-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1 rounded-2xl" /></div>
            <div><Label>Password</Label><Input data-testid="emp-password" type="text" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1 rounded-2xl" /></div>
          </div>
          <DialogFooter><Button data-testid="save-emp-btn" onClick={create} className="w-full rounded-2xl py-5 font-semibold">Add Employee</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
