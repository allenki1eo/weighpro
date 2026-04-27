# Integrations

## Movement and order request notes

Use `POST /api/order-notes` to push completed request notes from external business systems. This can include customer orders, procurement receipts, cotton movements, production transfers, finished goods dispatches, returns, or manual weighbridge bookings.

Required header:

```http
Authorization: Bearer <ORDER_INGEST_TOKEN>
```

Example payload:

```json
{
  "externalNoteId": "REQ-2026-00017",
  "businessUnit": "East African Spirits",
  "movementType": "finished_goods_dispatch",
  "materialCategory": "finished_goods",
  "counterpartyName": "Blue Coast Distributor",
  "customerName": "Blue Coast Distributor",
  "vehiclePlate": "AB12CDE",
  "driverName": "A. Mensah",
  "product": "Assorted beverages",
  "destination": "Main depot",
  "quantity": 1200,
  "scheduledAt": "2026-04-27T08:30:00Z",
  "notes": "Load from bay 3"
}
```

The endpoint upserts the vehicle and movement note so duplicate pushes are safe.

For raw cotton movements, include AMCOS transport details so WeighPro can calculate fuel support:

```json
{
  "externalNoteId": "COT-2026-00041",
  "businessUnit": "GAKI Investment",
  "movementType": "raw_material_receipt",
  "materialCategory": "raw_cotton",
  "counterpartyName": "Mwenge AMCOS",
  "customerName": "Mwenge AMCOS",
  "vehiclePlate": "T123ABC",
  "product": "Seed cotton",
  "amcosName": "Mwenge AMCOS",
  "collectionPoint": "Maswa",
  "distanceKm": 74,
  "fuelRatePerKm": 1800,
  "fuelCurrency": "TZS"
}
```

Fuel payable amount is calculated as `distanceKm * fuelRatePerKm` and stored with the movement note.

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
