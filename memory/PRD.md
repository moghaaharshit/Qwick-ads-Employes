# QwickAds Sales Manager — PRD

## Original Problem Statement
Production-quality, mobile-first sales CRM & calling management tool for QwickAds (cab-advertising business). Make calling & follow-up extremely fast for the sales employee while giving Admin complete visibility. Premium modern SaaS look (QwickAds purple/lavender), not a generic CRM.

## Architecture
- Frontend: React (CRA + craco), Tailwind, shadcn/ui, framer-motion, recharts, react-query, sonner, react-confetti.
- Backend: FastAPI, Motor (MongoDB), JWT Bearer auth (bcrypt hashing).
- Files: backend/{db,auth,crm,seed,server}.py; frontend/src/{pages,components,context,hooks,lib}.
- Auth: POST /api/auth/login -> {token,user}; Bearer token in localStorage (qa_token). Roles: admin, employee.

## User Personas
- Admin/Owner (gaikwadr9969@gmail.com): full visibility, analytics, employee mgmt, CSV import, pipeline, templates.
- Sales Employee (Rahul, Priya): assigned leads, fast call workflow, follow-ups, own performance.

## Core Requirements (static)
Role-based auth; leads DB with full schema; call workflow (7 outcomes + note + follow-up); pipeline; follow-up buckets (overdue/today/tomorrow/upcoming); reminders + browser notifications; WhatsApp deep links + editable templates; proposal tracking; conversion + revenue; admin analytics (funnel, employee performance, call analytics, loss reasons); CSV import w/ duplicate detection; search/filter; priority; mobile bottom nav + admin desktop sidebar; activity timeline.

## Implemented (2026-06)
- JWT auth, seeded admin + 2 employees, 34 realistic leads w/ calls/follow-ups/proposals/conversions.
- Employee dashboard (greeting, activity cards, animated daily target, today's calls).
- Admin dashboard (stat cards, animated sales funnel, revenue, pipeline stages).
- Leads list (search debounce, filters, priority sort, add/edit, duplicate protection), lead detail w/ activity timeline.
- Call outcome modal (loss-reason gating, note, follow-up scheduling), tel:/wa.me links.
- Follow-ups page (buckets, complete/reschedule, ownership-scoped).
- Pipeline, Proposals, Customers, Employees (add/activate), Analytics (perf table, outcome bar chart, loss-reason pie), Import Leads (preview+commit), Settings (WhatsApp templates).
- Reminders bell + browser notifications. Mobile admin menu on Profile page.
- Verified: backend 54/55 tests; HIGH fixes (follow-up authorization, mobile admin nav) + minor gaps resolved & curl-verified.

## Backlog / Remaining
- P1: Replace native date/time inputs with shadcn date picker.
- P2: Split crm.py/billing.py into smaller modules; incremental payment history + delete endpoints for invoices/campaigns.
- Future: WhatsApp Business API auto-send, AI call summaries/lead scoring, cloud telephony, leaderboards, commissions.

## Billing / Proposals / Invoices (2026-06)
- Proposal generator with presets (14d/₹39, 1mo/₹29, 3mo/₹19), free days, auto calc (cabs×paid×rate, exposure=paid+free); 2-page branded Proposal PDF (reportlab + DejaVu ₹).
- Invoices with auto QW-XXX numbering (unique, manual override 409-guarded), branded Invoice PDF, payment status + balance.
- Campaigns with expiry/renewal statuses (active/expiring_soon/expired), convert-proposal→campaign→invoice workflow.
- Business + Banking settings; admin-only Reset Demo Data (type RESET) + JSON backup; industry dropdown on brands.
- Admin dashboard: business cards (active brands/campaigns, 6-slot occupancy, revenue, pending, expiring) + quick actions + expiring alerts.

## Employee Proposal & Invoice Access + WhatsApp Sharing (2026-06)
- Employees can create/view/PDF/download proposals & invoices; records scoped to created_by (employees see only their own, admin sees all).
- WhatsApp share: downloads PDF + opens wa.me with prefilled branded message (auto employee name + brand/campaign details) + tracks whatsapp_shared/shared_by/shared_at.
- Brand profile (LeadDetail): Call / WhatsApp / Proposal / Invoice / Edit quick actions, prefilled from brand; "WhatsApp number not added" guard.
- Employees remain blocked (403) from reset-demo, business/banking settings, employees, analytics, import, pipeline, campaigns admin-only screens (proposals & invoices now allowed).

## Test Credentials
- Admin: gaikwadr9969@gmail.com / qwickads123
- Employees: rahul@qwickads.com, priya@qwickads.com / qwickads123
