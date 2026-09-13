# 🌿 Pharmacon — UCS503 Software Engineering Project

Pharmacon is a React/TypeScript SPA for the UCS503 project, with Supabase providing authentication, PostgreSQL persistence, object storage, row-level security, and transactional database functions.

## Architecture

- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS
- **Database:** Supabase PostgreSQL
- **Authentication:** Supabase Auth
- **Storage:** Supabase Storage (`deliverables` bucket)
- **Server-side logic:** Supabase Edge Functions + PostgreSQL RPCs
- **Frontend hosting:** GitHub Pages via `.github/workflows/deploy.yml`

There is no Express server, SQLite database, local upload directory, custom JWT secret, or browser-side fake authentication path in the deployable application.

## Local development

Create `.env` from `.env.example`:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
```

Then:

```bash
npm install
npm run dev
```

Production validation:

```bash
npm run typecheck
npm run build
npm run preview
```

## Supabase setup

1. Create the Supabase project.
2. Run [`supabase_schema.sql`](supabase_schema.sql) in the Supabase SQL Editor.
3. Deploy the Edge Function at [`supabase/functions/bootstrap-demo-users`](supabase/functions/bootstrap-demo-users).
4. Invoke `POST /functions/v1/bootstrap-demo-users` once to provision the demo accounts and their role profiles.
5. Set the frontend environment variables from the Supabase project API settings.

The demo accounts use the username convention `<username>@pharmacon.local` internally and the default password `admin123`. The password is controlled by the `PHARMACON_DEMO_PASSWORD` Edge Function secret when provisioning the demo accounts.

## GitHub Pages deployment

The included GitHub Actions workflow builds the SPA and publishes `dist/` to GitHub Pages. Add these repository Actions secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The application does not fall back to local/demo persistence when Supabase is unavailable; the deployed environment therefore fails explicitly rather than silently losing writes.

## Main evaluation flow

1. Open the homepage.
2. Launch Planning Presentation v1/v2.
3. Sign in through `/login`.
4. Upload a presentation/package through the admin publishing flow.
5. Publish the deliverable.
6. Open its permanent deliverable page.
7. Verify the release remains present in Version History.
8. Verify dashboard inventory, prescription, refill, audit, team, and editable-content flows against Supabase.

## Team

| Member | Role |
| --- | --- |
| Aryan Sharma | Frontend Lead & UI/UX |
| Aniket Raj | Backend & Storage Lead |
| Amitesh Kumar Singh | AI / CV Engineer |
| Chirag Lamba | Frontend Assistance + Backend Integration|
