# GiNi OS — Blue & Green Reference Edition

A modern iOS-inspired personal workspace built with **Next.js 16**, **React 19**, CSS glassmorphism, and Lucide icons. The updated homepage opens on an Overview dashboard with six fully usable modules: Projects, Tasks, Calendar, Expenses, Habits and Notes.

## Getting started

Requirements: Node.js 20.9 or newer, npm.

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

The redesigned interface does not require a database, AI key or Clerk keys for **local, single-browser use**. All input is stored in the browser's `localStorage`. The first visit loads example content; use **Preferences → Start with empty workspace** to begin fresh. Preferences includes **Export JSON backup** and **Import backup**.

## Features

- Screenshot-matched near-black visual system, trust-blue controls, green habits/finance indicators, and subdued liquid glass cards with strong foreground/background separation. The light palette also stays within blue/green.
- **Dark is the default** for new workspaces, matching the supplied screenshots. Optional Auto appearance chooses light from 7:00–19:00 in the device’s local time and dark otherwise; manual light/dark modes remain available.
- Overview: screenshot-style blue/green dual activity rings, daily task/habit score, interactive tasks, schedule timeline, daily habits, finance entries, notes, projects, and GiNi insights.
- Projects: create, edit, adjust progress, change status, and delete.
- Tasks: add, complete, edit, filter and delete, grouped by project, with project assignment, priority and due date.
- Calendar: month navigation, choose a date, create events, delete events.
- Expenses: track income and expenses with categories and monthly breakdown.
- Habits: daily, weekly and monthly completion metrics plus check-offs across a rolling seven-day grid.
- Notes: create, edit, save and delete notes.
- Global `⌘ K` / `Ctrl+K` search of projects, tasks and notes, with instant navigation.
- GiNi companion panel calculates **local, rule-based** insights about task completion, daily habits and monthly spending. **It does not call an LLM or third-party AI service.** You can connect your own GiNi service later using a dedicated authenticated API route and explicit consent.
- Per-module React error boundaries, retryable storage errors, validation of imported backups, and browser cross-tab updates.
- Works without network connectivity for editing after the page has already loaded. There is no full offline app-shell service worker in this edition: reopening after completely closing the page while offline may require cached assets or an online connection.
- iPhone-style **swipe-to-select mobile dock**: the active glass indicator tracks horizontal pointer/finger movement continuously and navigates only when released. Taps and keyboard selection also work. Drag cancel does not navigate.
- Respects `prefers-reduced-motion`; provides an opaque fallback in browsers without `backdrop-filter` support.
- The Finance Center derives its values from the local transaction list: **it does not claim bank synchronization or represent real-time account balances**.

## Data and existing database integration

**The redesigned app is local-first, not synchronized with PostgreSQL.** Data stays **on each browser/device**, is not encrypted, and is not automatically shared across devices or accounts. Export a JSON backup regularly. Clearing site data, uninstalling the browser, or using private browsing can erase local data. Avoid keeping high-sensitivity information on shared devices. The included backup contains personal notes and financial entries in plaintext; store it carefully.

The original project files (`app/actions.ts` and the original `components/*Module.tsx` plus `Sidebar.tsx`) have been preserved. They still contain the legacy Clerk/PostgreSQL implementation, but the new `app/page.tsx` renders `components/LiquidOS.tsx` and **does not import or use the legacy database actions**. Existing PostgreSQL data **is not migrated automatically**. Before enabling the legacy backend in a multi-user environment, implement proper user ownership, authorization, data migration, audit logs and a real offline-sync/conflict strategy. The legacy SQL queries have no per-user ownership filter and should not be exposed to multiple users as-is.

### Authentication and deployment

The app can be run locally without Clerk keys. When you set **both** `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`, the original `proxy.ts` Clerk route protection is enabled. Ensure Clerk is properly configured before a multi-user or public deployment; local-only guest mode is **not** a production account/security solution. Never configure `POSTGRES_URL` / `DATABASE_URL` for a public guest deployment with the legacy unscoped database actions still present.

If you plan to deploy, the production-grade next phase is to replace local-only storage with user-scoped server persistence and a queued offline sync mechanism, add encrypted transport, configure Clerk sign-in/up routes and handle per-account storage separation.

## Main changed files

```
app/page.tsx                         # App entry point
app/layout.tsx                       # SEO, optional Clerk provider
app/globals.css                      # Liquid glass responsive styling
proxy.ts                             # Optional Clerk protection
components/LiquidOS.tsx              # App shell, dashboard, modules, search, settings
components/GlassErrorBoundary.tsx    # React error recovery
lib/workspace.ts                     # Typed data, demo seed, validation, insights
```

## Validation

All edited TS/TSX files passed TypeScript standalone syntax transpilation. A full `npm run build` and real-device swipe interaction test could not run because the package registry was not reachable and the project dependencies were not installed. Run `npm ci && npm run build` locally, then test swipe selection on iOS Safari and Android Chrome.

To test the dock on mobile: touch and hold any dock icon, drag sideways while observing the blue glass indicator, and release over another icon. The page must not navigate until release. Tapping an icon should still navigate. Test an interrupted gesture (browser interruption/pointer cancel) to ensure it does not switch pages.

This update intentionally keeps the same browser `STORAGE_KEY` as the preceding Liquid Glass edition to retain existing local edits when upgrading on the same origin; it does not migrate legacy PostgreSQL records.
