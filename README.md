# WeighPro

WeighPro is a modern weighbridge system for company-wide vehicle weighing. It is designed for GAKI Investment and East African Spirits style operations where vehicles may carry raw cotton, lint bales, packaging materials, production inputs, finished goods, returns, or customer-order dispatches.

## What is included

- `apps/web`: Next.js web app for clerks, supervisors, remote weighing workflows, reports, and admin setup.
- `apps/desktop`: Electron station bridge for the weighbridge PC, serial indicator, and local camera/ANPR integrations.
- `packages/core`: Shared workflow types, movement helpers, AMCOS fuel calculation, and XK3190 serial-frame parsing.
- `supabase/migrations`: Database schema for orders, vehicles, weigh sessions, weigh events, camera reads, station devices, approvals, audit logs, and AMCOS fuel rates.
- `docs`: Architecture, workflow, and integration notes for Supabase, movement notes, cameras, and the XK3190-DS1.

## First setup

1. Copy `.env.example` to `.env` and fill in Supabase keys.
2. Run the SQL migrations in `supabase/migrations`.
3. Install dependencies with `npm install`.
4. Start the web app with `npm run dev:web`.
5. On the weighbridge computer, configure `XK3190_SERIAL_PORT` and run the Electron bridge with `npm run dev:desktop`.

## Integration shape

External business system -> `POST /api/order-notes` -> Supabase movement records -> camera plate match -> active weigh session -> serial weight capture from XK3190-DS1 -> first/second weigh completion.

## UI foundation

The web app is prepared for shadcn/ui with Tailwind CSS v4, a `components.json` config, shared `cn()` utility, and local shadcn-style Button, Card, Badge, and Table components. The first screen is an operations cockpit for station weighing, movement queues, raw cotton AMCOS fuel, reports, and audit controls.

The XK3190-DS1 has a standard RS232 serial communication interface. The starter parser accepts common XK3190-style ASCII frames and should be confirmed against the exact indicator configuration on site.
