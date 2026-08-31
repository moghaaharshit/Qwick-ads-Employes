import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import AnimatedCounter from "./AnimatedCounter";
import { cn } from "@/lib/utils";

export default function StatCard({ icon, label, value, tone = "purple", prefix = "", suffix = "", index = 0, testId }) {
  const Icon = Icons[icon] || Icons.Activity;
  const tones = {
    purple: "text-purple-600 bg-purple-50",
    green: "text-emerald-600 bg-emerald-50",
    amber: "text-amber-600 bg-amber-50",
    blue: "text-blue-600 bg-blue-50",
    red: "text-red-600 bg-red-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };
  return (
    <motion.div
      data-testid={testId}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      className="rounded-2xl bg-white p-4 sm:p-5 shadow-soft border border-purple-50 cursor-default"
    >
      <div className={cn("mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl", tones[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-heading text-2xl sm:text-3xl font-bold text-slate-900">
        {prefix}<AnimatedCounter value={value} />{suffix}
      </div>
      <div className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500">{label}</div>
    </motion.div>
  );
}
