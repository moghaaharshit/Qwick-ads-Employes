import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import api from "@/lib/api";
import { useMeta } from "@/hooks/useMeta";
import { PageHeader } from "@/components/Shared";
import { OUTCOME_META, labelOf, initials } from "@/lib/qwick";

const PIE_COLORS = ["#EF4444", "#F59E0B", "#7C3AED", "#8B5CF6", "#A78BFA", "#C4B5FD", "#10B981", "#6366F1", "#0EA5E9", "#94A3B8"];

export default function Analytics() {
  const meta = useMeta();
  const [period, setPeriod] = useState("week");
  const { data: perf } = useQuery({ queryKey: ["emp-perf", period], queryFn: async () => (await api.get(`/analytics/employees?period=${period}`)).data });
  const { data: calls } = useQuery({ queryKey: ["call-analytics"], queryFn: async () => (await api.get("/analytics/calls")).data });
  const { data: loss } = useQuery({ queryKey: ["loss-reasons"], queryFn: async () => (await api.get("/analytics/loss-reasons")).data });

  const outcomeData = calls ? Object.entries(calls.outcomes || {}).map(([k, v]) => ({ name: OUTCOME_META[k]?.label || k, value: v })) : [];

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Understand what's working across your sales team"
        action={
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger data-testid="period-select" className="w-36 rounded-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        } />

      {/* Call analytics */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatBox label="Total Calls" value={calls?.total || 0} tone="text-primary" />
        <StatBox label="Connected" value={calls?.connected || 0} tone="text-blue-600" />
        <StatBox label="Contact Rate" value={`${calls?.contact_rate || 0}%`} tone="text-emerald-600" />
        <StatBox label="Interest Rate" value={`${calls?.interest_rate || 0}%`} tone="text-amber-600" />
      </div>

      {/* Employee performance */}
      <div className="rounded-3xl bg-white p-6 shadow-soft">
        <h3 className="mb-4 font-heading text-lg font-bold text-slate-900">Employee Performance</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead><TableHead className="text-center">Calls</TableHead>
                <TableHead className="text-center">Interested</TableHead><TableHead className="text-center">Follow-ups</TableHead>
                <TableHead className="text-center">Proposals</TableHead><TableHead className="text-center">Converted</TableHead>
                <TableHead className="text-center">Conv %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(perf || []).map((e) => (
                <TableRow key={e.id} data-testid={`perf-row-${e.id}`}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">{initials(e.name)}</span>
                      <span className="font-semibold text-slate-800">{e.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">{e.calls}</TableCell>
                  <TableCell className="text-center">{e.interested}</TableCell>
                  <TableCell className="text-center">{e.follow_ups}</TableCell>
                  <TableCell className="text-center">{e.proposals}</TableCell>
                  <TableCell className="text-center"><span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600">{e.converted}</span></TableCell>
                  <TableCell className="text-center font-bold text-primary">{e.conversion_rate}%</TableCell>
                </TableRow>
              ))}
              {(!perf || perf.length === 0) && <TableRow><TableCell colSpan={7} className="text-center text-slate-400">No data</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Call outcomes */}
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="mb-4 font-heading text-lg font-bold text-slate-900">Call Outcomes</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={outcomeData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
              <XAxis type="number" tick={{ fontSize: 11 }} />
              <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 11 }} />
              <Tooltip cursor={{ fill: "#F8FAFC" }} />
              <Bar dataKey="value" fill="#7C3AED" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Why lost */}
        <div className="rounded-3xl bg-white p-6 shadow-soft">
          <h3 className="mb-4 font-heading text-lg font-bold text-slate-900">Why Leads Are Lost</h3>
          {(!loss || loss.length === 0) ? <p className="py-16 text-center text-sm text-slate-400">No lost-lead data yet</p> : (
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={loss} dataKey="count" nameKey="reason" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={2}>
                    {loss.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="w-full space-y-1.5">
                {loss.map((r, i) => (
                  <div key={r.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />{r.reason}</span>
                    <span className="font-semibold text-slate-800">{r.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, tone }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-soft">
      <p className="text-sm text-slate-400">{label}</p>
      <p className={`font-heading text-3xl font-extrabold ${tone}`}>{value}</p>
    </div>
  );
}
