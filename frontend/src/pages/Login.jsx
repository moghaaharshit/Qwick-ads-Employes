import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Phone, TrendingUp, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { apiErr } from "@/lib/api";

const ease = [0.22, 1, 0.36, 1];

const fadeUp = {
hidden: { opacity: 0, y: 24 },
visible: {
opacity: 1,
y: 0,
transition: { duration: 0.7, ease },
},
};

const stagger = {
hidden: {},
visible: {
transition: {
staggerChildren: 0.12,
},
},
};

export default function Login() {
const { login } = useAuth();
const navigate = useNavigate();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [err, setErr] = useState("");
const [loading, setLoading] = useState(false);

const submit = async (e) => {
e.preventDefault();
setErr("");
setLoading(true);

try {
await login(email, password);
navigate("/");
} catch (e2) {
setErr(apiErr(e2, "Invalid credentials"));
} finally {
setLoading(false);
}
};

const quick = (em, pw) => {
setEmail(em);
setPassword(pw || "QwickAds@123");
};

return (
<div className="flex min-h-screen overflow-hidden bg-white">
{/* =========================================================
BRAND PANEL
========================================================= */}
<motion.div
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
transition={{ duration: 0.8 }}
className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-primary p-12 text-white lg:flex"
>
{/* Animated background glow */}
<motion.div
initial={{ scale: 0.8, opacity: 0 }}
animate={{ scale: 1, opacity: 1 }}
transition={{ duration: 1.2, ease }}
className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl"
/>

<motion.div
animate={{
x: [0, 18, 0],
y: [0, -12, 0],
scale: [1, 1.04, 1],
}}
transition={{
duration: 8,
repeat: Infinity,
ease: "easeInOut",
}}
className="absolute -bottom-24 -left-10 h-80 w-80 rounded-full bg-purple-400/30 blur-3xl"
/>

{/* Small floating glow */}
<motion.div
animate={{
x: [0, -15, 0],
y: [0, 12, 0],
}}
transition={{
duration: 6,
repeat: Infinity,
ease: "easeInOut",
}}
className="absolute right-1/4 top-1/3 h-24 w-24 rounded-full bg-white/5 blur-2xl"
/>

{/* Logo */}
<motion.div
variants={fadeUp}
initial="hidden"
animate="visible"
className="relative flex items-center gap-2"
>
<motion.div
whileHover={{ rotate: 8, scale: 1.08 }}
transition={{ type: "spring", stiffness: 300 }}
className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg"
>
<Zap
className="h-6 w-6 text-primary"
fill="currentColor"
/>
</motion.div>

<span className="font-heading text-2xl font-extrabold">
QwickAds
</span>
</motion.div>

{/* Main brand content */}
<motion.div
variants={stagger}
initial="hidden"
animate="visible"
className="relative"
>
<motion.h1
variants={fadeUp}
className="font-heading text-5xl font-extrabold leading-tight"
>
Sales, on the move.
</motion.h1>

<motion.p
variants={fadeUp}
className="mt-4 max-w-md text-lg text-purple-100"
>
Call faster. Follow up smarter. Convert more brands
to QwickAds cab advertising.
</motion.p>

<motion.div
variants={stagger}
className="mt-8 flex gap-4"
>
{/* Feature card 1 */}
<motion.div
variants={fadeUp}
whileHover={{
y: -5,
scale: 1.03,
}}
transition={{ type: "spring", stiffness: 300 }}
className="cursor-default rounded-2xl bg-white/10 p-4 shadow-lg backdrop-blur-md"
>
<motion.div
whileHover={{ rotate: -8 }}
transition={{ type: "spring", stiffness: 300 }}
>
<Phone className="mb-2 h-6 w-6" />
</motion.div>

<p className="text-sm font-semibold">
One-tap calling
</p>
</motion.div>

{/* Feature card 2 */}
<motion.div
variants={fadeUp}
whileHover={{
y: -5,
scale: 1.03,
}}
transition={{ type: "spring", stiffness: 300 }}
className="cursor-default rounded-2xl bg-white/10 p-4 shadow-lg backdrop-blur-md"
>
<motion.div
whileHover={{ rotate: 8 }}
transition={{ type: "spring", stiffness: 300 }}
>
<TrendingUp className="mb-2 h-6 w-6" />
</motion.div>

<p className="text-sm font-semibold">
Live pipeline
</p>
</motion.div>
</motion.div>
</motion.div>

{/* Footer */}
<motion.p
variants={fadeUp}
initial="hidden"
animate="visible"
transition={{ delay: 0.8 }}
className="relative text-sm text-purple-200"
>
QwickAds Sales Manager · Internal platform
</motion.p>
</motion.div>

{/* =========================================================
LOGIN FORM
========================================================= */}
<div className="flex w-full items-center justify-center p-6 lg:w-1/2">
<motion.div
initial={{
opacity: 0,
x: 35,
}}
animate={{
opacity: 1,
x: 0,
}}
transition={{
duration: 0.75,
ease,
}}
className="w-full max-w-sm"
>
{/* Mobile logo */}
<motion.div
initial={{ opacity: 0, y: -15 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, ease }}
className="mb-8 lg:hidden"
>
<div className="flex items-center gap-2">
<motion.div
whileTap={{ scale: 0.92 }}
className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg"
>
<Zap
className="h-6 w-6 text-white"
fill="white"
/>
</motion.div>

<span className="font-heading text-2xl font-extrabold">
Qwick<span className="text-primary">Ads</span>
</span>
</div>
</motion.div>

{/* Heading */}
<motion.div
initial={{ opacity: 0, y: 15 }}
animate={{ opacity: 1, y: 0 }}
transition={{ delay: 0.15, duration: 0.6, ease }}
>
<h2 className="font-heading text-3xl font-extrabold text-slate-900">
Welcome back
</h2>

<p className="mt-1 text-slate-500">
Sign in to your sales workspace
</p>
</motion.div>

{/* Form */}
<motion.form
onSubmit={submit}
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{
delay: 0.25,
duration: 0.65,
ease,
}}
className="mt-8 space-y-4"
>
{/* Email */}
<div>
<Label>Email</Label>

<motion.div
whileFocus={{ scale: 1.01 }}
className="mt-1"
>
<Input
data-testid="login-email"
type="email"
value={email}
onChange={(e) => setEmail(e.target.value)}
placeholder="you@qwickads.com"
className="rounded-2xl py-6 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
required
/>
</motion.div>
</div>

{/* Password */}
<div>
<Label>Password</Label>

<motion.div
whileFocus={{ scale: 1.01 }}
className="mt-1"
>
<Input
data-testid="login-password"
type="password"
value={password}
onChange={(e) => setPassword(e.target.value)}
placeholder="••••••••"
className="rounded-2xl py-6 transition-all duration-200 focus:ring-2 focus:ring-primary/20"
required
/>
</motion.div>
</div>

{/* Error */}
<AnimatePresence>
{err && (
<motion.p
initial={{ opacity: 0, height: 0, y: -5 }}
animate={{ opacity: 1, height: "auto", y: 0 }}
exit={{ opacity: 0, height: 0, y: -5 }}
className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600"
data-testid="login-error"
>
{err}
</motion.p>
)}
</AnimatePresence>

{/* Sign In */}
<motion.div
whileHover={{ scale: 1.015 }}
whileTap={{ scale: 0.985 }}
>
<Button
data-testid="login-submit"
type="submit"
disabled={loading}
className="group w-full rounded-2xl py-6 text-base font-semibold shadow-sm transition-shadow duration-200 hover:shadow-lg"
>
{loading ? (
<Loader2 className="h-5 w-5 animate-spin" />
) : (
<span className="flex items-center gap-2">
Sign In
<motion.span
initial={{ x: 0 }}
whileHover={{ x: 3 }}
>
<ArrowRight className="h-4 w-4" />
</motion.span>
</span>
)}
</Button>
</motion.div>
</motion.form>

{/* Quick demo login */}
<motion.div
initial={{ opacity: 0, y: 15 }}
animate={{ opacity: 1, y: 0 }}
transition={{
delay: 0.45,
duration: 0.6,
ease,
}}
className="mt-6 rounded-2xl bg-purple-50/70 p-4"
>
<p className="text-xs font-semibold text-slate-500">
Quick demo login
</p>

<div className="mt-2 flex flex-wrap gap-2">
<motion.button
whileHover={{ scale: 1.04, y: -1 }}
whileTap={{ scale: 0.96 }}
data-testid="demo-admin"
onClick={() => quick("admin@qwickads.com", "QwickAds@123")}
className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-soft"
>
Admin
</motion.button>

<motion.button
whileHover={{ scale: 1.04, y: -1 }}
whileTap={{ scale: 0.96 }}
data-testid="demo-rahul"
onClick={() => quick("rahul@qwickads.com")}
className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-soft"
>
Rahul (Sales)
</motion.button>

<motion.button
whileHover={{ scale: 1.04, y: -1 }}
whileTap={{ scale: 0.96 }}
data-testid="demo-priya"
onClick={() => quick("priya@qwickads.com")}
className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-soft"
>
Priya (Sales)
</motion.button>
</div>
</motion.div>
</motion.div>
</div>
</div>
);
}
