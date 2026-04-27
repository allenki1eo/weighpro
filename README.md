# WeighPro

WeighPro is a modern weighbridge system for drink-order logistics. It is designed to reduce manual writing at the weighbridge by importing request notes from an external order platform, matching vehicles by plate number, and guiding clerks through first and second weighs.

## What is included

- `apps/web`: Next.js web app for clerks, supervisors, and remote weighing workflows.
- `apps/desktop`: Electron station bridge for the weighbridge PC, serial indicator, and local camera/ANPR integrations.
- `packages/core`: Shared workflow types and XK3190 serial-frame parsing helpers.
- `supabase/migrations`: Database schema for orders, vehicles, weigh sessions, weigh events, camera reads, and integration logs.
- `docs`: Architecture and integration notes for Supabase, order notes, cameras, and the XK3190-DS1.

## First setup

1. Copy `.env.example` to `.env` and fill in Supabase keys.
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql`.
3. Install dependencies with `npm install`.
4. Start the web app with `npm run dev:web`.
5. On the weighbridge computer, configure `XK3190_SERIAL_PORT` and run the Electron bridge with `npm run dev:desktop`.

## Integration shape

External order platform -> `POST /api/order-notes` -> Supabase order records -> camera plate match -> active weigh session -> serial weight capture from XK3190-DS1 -> first/second weigh completion.

The XK3190-DS1 has a standard RS232 serial communication interface. The starter parser accepts common XK3190-style ASCII frames and should be confirmed against the exact indicator configuration on site.
