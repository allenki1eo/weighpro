# WeighPro Architecture

## Goal

Create one system that serves both the physical weighbridge station and clerks working away from the station.

## Main parts

### Web app

The web app is the daily operating surface. Clerks can:

- see pending order notes from the drinks order platform
- match vehicles by plate number
- open first-weigh and second-weigh sessions
- review live or last stable weight from the bridge station
- confirm tickets and print/export records

### Electron station bridge

The Electron app runs on the weighbridge computer. It is responsible for hardware-adjacent work:

- reading RS232 data from the XK3190-DS1 indicator
- sending stable weight updates to the web app or Supabase
- connecting to a local camera or ANPR provider
- keeping the station usable even when a clerk operates remotely

### Supabase

Supabase is the shared source of truth:

- imported request notes
- known vehicles and plates
- weigh sessions
- first and second weigh events
- camera reads
- integration audit events

### Camera and ANPR

The camera pipeline should capture a plate read, then search for:

1. an active weigh session with that plate
2. a pending imported order with that plate
3. recent first-weigh sessions needing a second weigh

When a match is found, the clerk should land directly on the right workflow instead of typing details again.

## Weighing workflow

1. Order platform pushes a request note into WeighPro.
2. Vehicle arrives and the camera reads the plate.
3. WeighPro matches the plate against pending orders or open sessions.
4. Clerk confirms first weight.
5. Vehicle loads or unloads drinks.
6. Vehicle returns and the camera finds the existing session.
7. Clerk confirms second weight.
8. Net weight and ticket are finalized.

## Hardware note

The XK3190-DS1 provides RS232 serial communication. Different installations may use different baud rates and output formats, so the station bridge keeps baud rate, port name, and parser behavior configurable.
