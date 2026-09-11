# CAPACITY CONNECT — Tech Stack Mapped to the Workflow
### Which technology fires at which step, across the role/feature workflows

Stack recap: **Next.js 14 + TS** (frontend+light BE) · **Tailwind + shadcn/ui** (UI) · **Zustand + TanStack Query** (state/data) · **React Hook Form + Zod** (forms/validation) · **Node/Express or Next API routes** (backend) · **NextAuth.js/Clerk** (auth) · **UploadThing / Multer+S3** (uploads) · **Supabase Realtime / Socket.io** (live updates) · **PostgreSQL via Supabase/Neon** (DB) · **Prisma** (ORM) · **Postgres full-text search** (search) · **Vercel + Supabase/Neon** (deploy) · **Vidstack** (video player) · **Cloudinary Video/Mux** (video hosting/transcode) · **custom onTimeUpdate** (watch progress) · **date-fns + Vercel/node-cron** (deadlines) · **server-side comparison** (auto-grading) · **Recharts** (analytics).

---

## 0. Cross-Cutting Layer → Tech

| Workflow step | Tech firing |
|---|---|
| Request lifecycle (rate limit → auth → RBAC → validate → controller → DB → audit) | **Express/Next API route** as the pipeline; **Zod** for input validation schemas |
| JWT/session issue, refresh, rotate | **NextAuth.js (Auth.js) or Clerk** — handles token issue/rotation so you don't hand-roll it |
| `requireAuth` / `requireRole` middleware | Auth.js/Clerk middleware + custom RBAC guard functions on top |
| DB writes (users, audit_logs, etc.) | **Prisma** client → **PostgreSQL (Supabase/Neon)** |
| Audit log table + queries | Prisma model `audit_logs`, plain Postgres table, no extra service |

---

## 1. Signup / Login / RBAC Onboarding → Tech

| Step | Tech |
|---|---|
| Signup form (name, email, password) | **React Hook Form + Zod** (client validation) — same Zod schema reused server-side |
| Password hashing, session issuance | **NextAuth.js/Clerk** (handles hashing/JWT under the hood — you don't write bcrypt calls yourself) |
| `status='pending'` gating | Prisma `users.status` column, checked in RBAC middleware |
| Admin notification on new signup | Insert into `notifications` table (Postgres) → optionally pushed live via **Supabase Realtime/Socket.io** if Admin dashboard is open |
| Approve/reject action | Next.js API route → Prisma update → **audit_logs** insert |
| Trainer credential upload for verification | **UploadThing** (or Multer+S3) upload widget on the signup/profile form |

---

## 2. TRAINEE Workflows → Tech

**2.1 Profile build:** React Hook Form + Zod form → Prisma `users` update. Skills tag-picker is a shadcn/ui combobox component hitting a `skills_taxonomy` Postgres table.

**2.2 Course discovery/enrollment:** TanStack Query for `GET /courses` (caches list, background refetch); enroll mutation via TanStack Query mutation → Prisma insert into `enrollments`.

**2.3 Learning resources access:**
- Resource metadata: TanStack Query fetch, gated by ownership check in the API route.
- **Video resources**: rendered with **Vidstack** player; files served from **Cloudinary Video/Mux** (adaptive bitrate — this is what actually satisfies the offline/low-bandwidth requirement for field staff, not the PWA layer alone).
- PDFs/slides: served from **UploadThing** CDN links.
- Watch-progress: Vidstack's `timeupdate` event → custom handler batches `watched_seconds` → `POST /progress` → Prisma update on `enrollments.progress`. Anti-skip logic added here to prevent gaming completion by seeking.
- Offline caching for field connectivity: Next.js PWA service-worker cache layer on top of the Vidstack/Cloudinary-served assets.

**2.4 MCQ assessment:**
- Quiz-taking UI: React Hook Form (dynamic question list) + Zod.
- Deadline enforcement: **date-fns** for countdown/comparison logic; **Vercel Cron (or node-cron)** job auto-locks/auto-submits past-deadline attempts server-side (never trust client clock).
- Grading: **server-side comparison logic** in the API route — `submitted option_id` vs `correct_option` in Prisma `questions` — writes `attempts.score`. No external service.

**2.5 Skill-gap tracker & recommendations:** Postgres aggregate query (via Prisma) comparing `role_required_skills` vs profile+completed-course tags; ranking via **Postgres full-text search / tsvector** on skill tags for the recommendation match, no external search service needed at this scale.

**2.6 Certificate issuance:** Prisma insert on `certificates`, hash/QR generated server-side (Node crypto, no new tool); PDF render can use a lightweight Node PDF lib — not called out separately in the stack doc, treat as part of the Express/Next API layer.

**2.7 Portfolio:** Pure read-composition — TanStack Query fetching a single `GET /portfolio/:id` route that Prisma-joins enrollments+certificates+profile; no new tech, just query composition.

**2.8 Notifications:** Row insert on event triggers (Prisma); delivered either via **Supabase Realtime** (if using Supabase — subscribe-to-table) or **Socket.io** if self-hosting Postgres via Neon; falls back to TanStack Query polling/refetch-on-focus if realtime isn't wired up yet (matches the report's "polling is fine for MVP" note).

---

## 3. TRAINER Workflows → Tech

**3.1 Profile & verification:** Same RHF+Zod+Prisma pattern as trainee; `verified_trainer` flag flips only via Admin API route.

**3.2 Course creation/publishing:** RHF+Zod multi-step form (shadcn/ui tabs/stepper) → Prisma `courses` insert/update. Status transition `draft→pending→published` is just an enum field update — no extra tech.

**3.3 Trainer Library uploads:** **UploadThing** (or Multer+S3) for PDFs/slides; **Cloudinary Video/Mux** specifically for lecture video uploads (auto-transcode on upload so playback adapts to bandwidth). Type/size validation happens in the upload tool's config, not hand-rolled.

**3.4 Questionnaire creation:** Custom dynamic form — **React Hook Form + Zod**, per the Video & Quiz Layer doc's explicit note that no off-the-shelf quiz-builder library fits the RBAC/forum-linked schema, so this is bespoke on top of the existing form stack. Deadlines set via a date-picker (shadcn/ui) feeding the same **date-fns**-driven lock logic as 2.4.

**3.5 Monitor participation/performance:** **Recharts** renders drop-off rate, score distribution, completion-time charts; data comes from Prisma aggregate queries (`GROUP BY`, `AVG`, percentile) — same charting library reused for Admin dashboards, no new dependency.

**3.6 Forum moderation (own course):** Next.js API route + Prisma update on `forum_replies`/`reports`; no special tech beyond the core stack.

**3.7 Feedback loop:** Prisma aggregate (`AVG(rating)`) surfaced on trainer profile — read-only composition, same pattern as portfolio.

---

## 4. ADMIN Workflows → Tech

**4.1 User approval/role mgmt:** Admin dashboard built with shadcn/ui data-table; TanStack Query for list+mutations; Prisma + audit_logs on every action.

**4.2 Course validation:** Same admin-table pattern; triggers course `status='published'`.

**4.3 Certificate validation:** Same pattern; Prisma update on `certificates.status`.

**4.4 Dashboards:** **Recharts** for all visualizations; heavy aggregate queries run through Prisma (or `$queryRaw` for the more complex joins Prisma's query builder can't express cleanly — the stack doc flags this as Prisma's known limitation). For scale, a Postgres materialized view refreshed via **Vercel Cron/node-cron** keeps dashboard reads fast.

**4.5 Competency mapping:** Postgres query joining `competency_map` × `skills_taxonomy`; **Postgres full-text search** used if admin searches "who can teach X" by free text.

**4.6 Homepage publishing:** RHF+Zod content form → Prisma insert; public `GET /homepage` cached via TanStack Query on the client, servable even to unauthenticated Visitors (SSR via Next.js for SEO/fast first paint, per the frontend framework's stated strength).

**4.7 Bulk import/export:** CSV parse in an API route (Node, no special lib called out — treat as vanilla Node/Express); PDF/CSV export streamed from the same route.

**4.8 Moderation queue:** Same admin-table + Prisma + audit_logs pattern as 4.1–4.3.

---

## 5. Forum Module → Tech

| Step | Tech |
|---|---|
| Thread/reply CRUD | Next.js API routes + Prisma models (`forum_threads`, `forum_replies`) |
| Nested reply depth cap | Enforced in the API route logic at insert time — no library, just a depth check against `parent_reply_id` chain |
| Voting (upsert pattern) | Prisma unique constraint `(user_id, reply_id)` on `votes` table; TanStack Query optimistic update for instant UI feedback |
| "Best/Top/New" sort | Postgres query ordering (`votes DESC`, `created_at DESC`, or a weighted score computed in SQL) |
| Live "new reply" notification | **Supabase Realtime** subscribe-to-table (if on Supabase) or **Socket.io** — this is the exact "forum notifications" use case the stack doc calls out |
| Media in forum posts | **UploadThing** (same upload pipeline as Trainer Library), reused rather than a second upload system |
| Search/filter threads by tag | **Postgres full-text search (tsvector)** on thread title/body/tags |
| Report/flag → auto-hide | Prisma `reports` table + a count-check in the same API route (no new tech) |
| Soft delete / edit history | Prisma boolean/timestamp fields (`is_deleted`, `edited_at`) — no new tech |

---

## 6. Cross-Module Integration → Tech

- Course↔Forum scoping: enforced entirely through Prisma relations (`forum_threads.course_id` FK) — no separate "forum service," it's one Postgres schema queried via one Prisma client, which is exactly what the stack doc's relational-DB rationale is built around.
- Deep-linking: **Next.js file-based routing** (`/courses/[id]`, `/courses/[id]/forum`) — a direct benefit of choosing Next.js over plain React+Vite.

---

## 7. Video & Quiz Layer — Direct Mapping (this PDF's second half)

| Feature from Report | Tech from this stack doc |
|---|---|
| Course video playback + progress hooks | **Vidstack** player component |
| Adaptive playback for poor-connectivity field staff | **Cloudinary Video (or Mux)** — auto-transcode + adaptive bitrate + CDN |
| Watch-progress → `enrollments.progress` | Custom `onTimeUpdate` handler batching to DB, with anti-skip logic |
| Trainer quiz builder UI | **React Hook Form + Zod** custom dynamic fields (no off-the-shelf quiz lib fits the RBAC/forum-linked schema) |
| Quiz deadline lock + auto-submit | **date-fns** (comparison/countdown) + **Vercel Cron / node-cron** (scheduled lock job) |
| MCQ auto-grading | Server-side comparison logic in the API route — deterministic, no AI/external grader needed |
| Trainer/Admin analytics charts | **Recharts** (same library across trainer and admin dashboards) |

---

## 8. Deployment & Infra → Tech

| Concern | Tech |
|---|---|
| App hosting | **Vercel** — pairs natively with Next.js, git-push deploys |
| Database hosting | **Supabase or Neon** (managed Postgres, zero DB-ops) |
| Auth | **NextAuth.js/Clerk**, no self-hosted auth server |
| File/video storage | **UploadThing** (docs/slides) + **Cloudinary/Mux** (video) — both offload storage/CDN concerns from your own infra |
| Realtime | **Supabase Realtime** (free if already on Supabase) or **Socket.io** if not |
| Scheduled jobs | **Vercel Cron** (free-tier, ≥1-min interval) or **node-cron** if self-hosting a long-running server |

---

## 9. What This Stack Deliberately Skips (and why, per the source doc)

- **No GraphQL** — REST fits the CRUD-heavy course/enrollment/forum model; GraphQL adds complexity not needed here.
- **No Redux** — Zustand + TanStack Query covers global state + server cache with far less boilerplate.
- **No raw AWS S3/self-hosted FFmpeg** — Cloudinary/Mux and UploadThing trade some control for near-zero setup time, which matters under hackathon/early-build time pressure.
- **No BullMQ-style job queues** — deadline locking and dashboard refresh are simple enough for Vercel Cron/node-cron.
- **No dedicated search engine (Meilisearch/Algolia)** yet — Postgres full-text search is "good enough for now," explicitly flagged as a stretch-goal upgrade path, not a rebuild.
- **No third-party proctoring/assessment SaaS** — MCQs are objectively gradable server-side; only becomes relevant if short-answer/essay questions are added later (would need manual review or an LLM grader at that point).
