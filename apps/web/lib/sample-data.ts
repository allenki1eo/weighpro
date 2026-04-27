type WeighSessionStatus = "awaiting_first_weight" | "awaiting_second_weight" | "completed" | "cancelled";

interface WeighSessionSummary {
  id: string;
  plate: string;
  customerName: string;
  product: string;
  status: WeighSessionStatus;
  firstWeightKg?: number;
  secondWeightKg?: number;
  netWeightKg?: number;
  lastPlateConfidence?: number;
}

export const sessions: WeighSessionSummary[] = [
  { id: "WB-1048", plate: "GX22 FBD", customerName: "East African Spirits", product: "Finished goods dispatch", status: "awaiting_second_weight", firstWeightKg: 14620, lastPlateConfidence: 0.94 },
  { id: "WB-1049", plate: "AB12 CDE", customerName: "GAKI Investment", product: "Seed cotton intake", status: "awaiting_first_weight", lastPlateConfidence: 0.89 },
  { id: "WB-1050", plate: "KT08 WPR", customerName: "GAKI Investment", product: "Lint bales transfer", status: "completed", firstWeightKg: 11200, secondWeightKg: 16440, netWeightKg: 5240, lastPlateConfidence: 0.98 },
];

export const pendingOrders = [
  { externalNoteId: "REQ-2026-00017", businessUnit: "East African Spirits", movementType: "finished_goods_dispatch", customerName: "Blue Coast Distributor", vehiclePlate: "GX22 FBD", product: "Assorted finished goods", scheduledAt: "08:30" },
  { externalNoteId: "REQ-2026-00018", businessUnit: "GAKI Investment", movementType: "raw_material_receipt", materialCategory: "raw_cotton", customerName: "Contract farmers group", vehiclePlate: "AB12 CDE", product: "Seed cotton", amcosName: "Mwenge AMCOS", collectionPoint: "Maswa", distanceKm: 74, fuelRatePerKm: 1800, fuelCurrency: "TZS", scheduledAt: "09:15" },
];

export const stationDevices = [
  { name: "XK3190-DS1 indicator", status: "connected", detail: "COM3 / 9600 baud" },
  { name: "ANPR front camera", status: "connected", detail: "Plate confidence 94%" },
  { name: "Supabase sync", status: "online", detail: "Last sync 18 seconds ago" },
  { name: "Remote clerk access", status: "ready", detail: "Web approvals enabled" },
];

export const movementTypes = [
  { name: "Raw cotton receipt", rule: "AMCOS, collection point, distance, fuel rate, first/second weigh" },
  { name: "Finished goods dispatch", rule: "Customer order, destination, product list, dispatch ticket" },
  { name: "Production input receipt", rule: "Supplier, material, purchase note, store confirmation" },
  { name: "Lint bale transfer", rule: "Internal location, bale count, transfer approval" },
  { name: "Return or empty movement", rule: "Reason, previous ticket link, supervisor review" },
];

export const rawCottonFuelRows = [
  { amcosName: "Mwenge AMCOS", collectionPoint: "Maswa", plate: "AB12 CDE", distanceKm: 74, fuelRatePerKm: 1800, fuelCurrency: "TZS", payable: 133200 },
  { amcosName: "Mwamala AMCOS", collectionPoint: "Kishapu", plate: "T442 DKL", distanceKm: 52, fuelRatePerKm: 1800, fuelCurrency: "TZS", payable: 93600 },
];

export const reportCards = [
  { title: "AMCOS fuel payable", value: "226,800 TZS", detail: "2 raw cotton movements" },
  { title: "Net cotton received", value: "28,540 kg", detail: "Awaiting quality review" },
  { title: "Finished goods out", value: "14,620 kg", detail: "1 second weigh pending" },
  { title: "Manual overrides", value: "0", detail: "No supervisor exceptions" },
];

export const auditItems = [
  "Camera matched GX22 FBD to WB-1048",
  "Remote clerk approved second-weigh readiness",
  "AMCOS fuel rate applied for Mwenge AMCOS",
  "XK3190-DS1 stable reading locked at 14,620 kg",
];

export const tickets = [
  { id: "WB-1048", plate: "GX22 FBD", movement: "Finished goods dispatch", netWeight: "Pending", status: "Second weigh" },
  { id: "WB-1049", plate: "AB12 CDE", movement: "Seed cotton intake", netWeight: "Pending", status: "First weigh" },
  { id: "WB-1050", plate: "KT08 WPR", movement: "Lint bales transfer", netWeight: "5,240 kg", status: "Completed" },
];

export const vehicles = [
  { plate: "GX22 FBD", driver: "A. Mensah", transporter: "Blue Coast Logistics", lastSeen: "Today 08:42" },
  { plate: "AB12 CDE", driver: "J. Mahona", transporter: "Mwenge AMCOS", lastSeen: "Today 09:15" },
  { plate: "KT08 WPR", driver: "S. Peter", transporter: "GAKI Fleet", lastSeen: "Yesterday 16:30" },
];

export const counterparties = [
  { name: "Mwenge AMCOS", type: "AMCOS", location: "Maswa", status: "Fuel rate active" },
  { name: "Blue Coast Distributor", type: "Customer", location: "Dar es Salaam", status: "Order integration" },
  { name: "Mwamala AMCOS", type: "AMCOS", location: "Kishapu", status: "Fuel rate active" },
  { name: "Packaging Supplier Ltd", type: "Supplier", location: "Mwanza", status: "Manual notes" },
];

export const materials = [
  { code: "COT-SEED", name: "Seed cotton", category: "Raw cotton", unit: "kg" },
  { code: "FG-ASSORTED", name: "Assorted finished goods", category: "Finished goods", unit: "kg" },
  { code: "LINT-BALE", name: "Lint bales", category: "Cotton output", unit: "kg" },
  { code: "PKG-GLASS", name: "Packaging glass", category: "Production input", unit: "kg" },
];

export const integrations = [
  { name: "Customer order software", direction: "Inbound", status: "Ready", endpoint: "/api/order-notes" },
  { name: "ANPR camera", direction: "Inbound", status: "Station bridge", endpoint: "Electron preload" },
  { name: "Supabase", direction: "Sync", status: "Configured by env", endpoint: "Database" },
  { name: "Finance export", direction: "Outbound", status: "Planned", endpoint: "CSV/API" },
];

export const approvals = [
  { item: "Manual weight override", requestedBy: "Station clerk", status: "Pending supervisor" },
  { item: "Remote second weigh", requestedBy: "Remote clerk", status: "Approved" },
  { item: "Ticket reprint", requestedBy: "Finance", status: "Pending review" },
];
