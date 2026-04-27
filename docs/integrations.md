# Integrations

## Order request notes

Use `POST /api/order-notes` to push completed request notes from the external order platform.

Required header:

```http
Authorization: Bearer <ORDER_INGEST_TOKEN>
```

Example payload:

```json
{
  "externalNoteId": "REQ-2026-00017",
  "customerName": "Blue Coast Drinks",
  "vehiclePlate": "AB12CDE",
  "driverName": "A. Mensah",
  "product": "Bottled drinks",
  "destination": "Main depot",
  "quantity": 1200,
  "scheduledAt": "2026-04-27T08:30:00Z",
  "notes": "Load from bay 3"
}
```

The endpoint upserts the vehicle and order note so duplicate pushes are safe.

## XK3190-DS1

The station bridge reads from the serial port configured by:

- `XK3190_SERIAL_PORT`, for example `COM3`
- `XK3190_BAUD_RATE`, commonly `9600`, `4800`, `2400`, or `1200`
- `XK3190_WEIGHT_UNIT`, usually `kg`

The current parser handles common XK3190 ASCII frames such as `WG000123kg`, `wn000.000kg`, and plain signed numeric frames. Confirm the real output with the physical indicator before go-live.

## Camera and plate recognition

Start with one of these patterns:

- IP camera snapshot -> ANPR API -> plate result pushed to Supabase
- local USB camera -> desktop bridge -> ANPR SDK/API -> Supabase
- camera vendor webhook -> WeighPro API route -> Supabase

Store every read in `camera_reads`, even if confidence is low. This gives supervisors an audit trail and lets the UI show likely matches.
