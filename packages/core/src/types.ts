// ─── Enums ──────────────────────────────────────────────────────────────────

export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'CLERK'
  | 'GATE_CLERK'
  | 'BRIDGE_CLERK'
  | 'MANAGER_COTTON'
  | 'MANAGER_BEVERAGE'

export type Module = 'COTTON' | 'BEVERAGE'

export type OperationType =
  | 'COTTON_PURCHASE'
  | 'COTTON_LINT_SALE'
  | 'COTTON_WASTE_SALE'
  | 'COTTON_SEED_DISPATCH'
  | 'BEVERAGE_DISPATCH'
  | 'BEVERAGE_RAW_INTAKE'
  | 'BEVERAGE_WASTE_SALE'

export type TicketStatus =
  | 'PENDING'
  | 'FIRST_WEIGHT_SAVED'
  | 'COMPLETED'
  | 'CANCELLED'

export type WeightType = 'GROSS' | 'TARE'

export type VehicleType = 'TRUCK' | 'PICKUP'

export type MaterialType = 'RICE' | 'MALT' | 'BARLEY'

export type CottonGrade = 'A' | 'B' | 'C'

export type ProductType =
  | 'COTTON_RAW'
  | 'LINT_BALE'
  | 'COTTON_WASTE'
  | 'COTTON_SEED'
  | 'BEER'
  | 'SODA'
  | 'RICE'
  | 'MALT'
  | 'BARLEY'
  | 'MALT_WASTE'

export type AuditAction =
  | 'CREATE_JOB'
  | 'EDIT_FIRST_WEIGHT'
  | 'EDIT_SECOND_WEIGHT'
  | 'DELETE_TICKET'
  | 'CANCEL_TICKET'
  | 'OVERRIDE_FUEL'
  | 'COMPLETE_TICKET'
  | 'CAPTURE_FIRST_WEIGHT'
  | 'CAPTURE_SECOND_WEIGHT'

// ─── Domain Entities ─────────────────────────────────────────────────────────

export interface UserDTO {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: string
}

export interface VehicleDTO {
  id: string
  plateNumber: string
  driverName: string
  driverPhone?: string | null
  defaultTare?: number | null
  vehicleType: VehicleType
  isActive: boolean
  lastVisit?: string | null
}

export interface TicketListItem {
  id: string
  ticketNumber: string
  module: Module
  operationType: OperationType
  status: TicketStatus
  plateNumber: string
  driverName: string
  partyName: string // village / company / customer / supplier name
  firstWeight?: number | null
  secondWeight?: number | null
  netWeight?: number | null
  clerkName: string
  createdAt: string
  completedAt?: string | null
}

export interface TicketDetail extends TicketListItem {
  vehicleId: string
  driverPhone?: string | null
  firstWeightType?: WeightType | null
  firstWeightAt?: string | null
  secondWeightType?: WeightType | null
  secondWeightAt?: string | null
  weightUnit: string
  weighingClerkName?: string | null
  notes?: string | null
  cancelReason?: string | null
  cottonPurchase?: CottonPurchaseDetail | null
  lintBaleSale?: LintBaleSaleDetail | null
  wasteSale?: WasteSaleDetail | null
  seedDispatch?: SeedDispatchDetail | null
  beverageDispatch?: BeverageDispatchDetail | null
  rawMaterialIntake?: RawMaterialIntakeDetail | null
  maltWasteSale?: MaltWasteSaleDetail | null
  auditLogs?: AuditLogDTO[]
}

export interface CottonPurchaseDetail {
  villageId: string
  villageName: string
  distanceKm: number
  fuelRatePerKm: number
  fuelTotal: number
  cottonGrade?: string | null
  moisturePct?: number | null
  deductionKg: number
}

export interface LintBaleSaleDetail {
  companyId: string
  companyName: string
  baleCount: number
  contractRef?: string | null
}

export interface WasteSaleDetail {
  companyId: string
  companyName: string
  wasteType?: string | null
  pricePerKg: number
}

export interface SeedDispatchDetail {
  villageId: string
  villageName: string
  season: string
  quantityKg: number
  remainingBefore: number
}

export interface BeverageDispatchDetail {
  customerId: string
  customerName: string
  routeId?: string | null
}

export interface RawMaterialIntakeDetail {
  supplierId: string
  supplierName: string
  materialType: MaterialType
  storageLocation?: string | null
  qualityPass: boolean
  moistureContent?: number | null
}

export interface MaltWasteSaleDetail {
  customerId: string
  customerName: string
  collectionDate?: string | null
}

export interface AuditLogDTO {
  id: string
  action: AuditAction
  oldValue?: string | null
  newValue?: string | null
  reason?: string | null
  userName: string
  createdAt: string
}

// ─── Master Data DTOs ────────────────────────────────────────────────────────

export interface VillageDTO {
  id: string
  name: string
  distanceKm: number
  isActive: boolean
}

export interface CompanyDTO {
  id: string
  name: string
  type: 'LINT_BUYER' | 'WASTE_BUYER'
  contact?: string | null
  isActive: boolean
}

export interface CustomerDTO {
  id: string
  name: string
  type: 'BEVERAGE_CUSTOMER' | 'CATTLE_FARMER'
  contact?: string | null
  isActive: boolean
}

export interface SupplierDTO {
  id: string
  name: string
  materialTypes: MaterialType[]
  contact?: string | null
  isActive: boolean
}

export interface ProductDTO {
  id: string
  name: string
  module: Module
  type: ProductType
  defaultPrice: number
  unit: string
  isActive: boolean
}

// ─── Serial / Scale ──────────────────────────────────────────────────────────

export interface ScaleReading {
  raw: string
  weightKg: number
  isStable: boolean
  timestamp: number
}

// ─── Workflow helpers ────────────────────────────────────────────────────────

export interface OperationConfig {
  module: Module
  operationType: OperationType
  label: string
  firstWeightType: WeightType
  secondWeightType: WeightType
  partyType: 'village' | 'company_lint' | 'company_waste' | 'customer_beverage' | 'customer_cattle' | 'supplier'
  requiresSecondWeight: boolean
}

export const OPERATION_CONFIGS: Record<OperationType, OperationConfig> = {
  COTTON_PURCHASE: {
    module: 'COTTON',
    operationType: 'COTTON_PURCHASE',
    label: 'Cotton Purchase',
    firstWeightType: 'GROSS',
    secondWeightType: 'TARE',
    partyType: 'village',
    requiresSecondWeight: true,
  },
  COTTON_LINT_SALE: {
    module: 'COTTON',
    operationType: 'COTTON_LINT_SALE',
    label: 'Lint Sale',
    firstWeightType: 'TARE',
    secondWeightType: 'GROSS',
    partyType: 'company_lint',
    requiresSecondWeight: true,
  },
  COTTON_WASTE_SALE: {
    module: 'COTTON',
    operationType: 'COTTON_WASTE_SALE',
    label: 'Waste Sale',
    firstWeightType: 'GROSS',
    secondWeightType: 'TARE',
    partyType: 'company_waste',
    requiresSecondWeight: true,
  },
  COTTON_SEED_DISPATCH: {
    module: 'COTTON',
    operationType: 'COTTON_SEED_DISPATCH',
    label: 'Seed Dispatch',
    firstWeightType: 'GROSS',
    secondWeightType: 'TARE',
    partyType: 'village',
    requiresSecondWeight: true,
  },
  BEVERAGE_DISPATCH: {
    module: 'BEVERAGE',
    operationType: 'BEVERAGE_DISPATCH',
    label: 'Beverage Dispatch',
    firstWeightType: 'TARE',
    secondWeightType: 'GROSS',
    partyType: 'customer_beverage',
    requiresSecondWeight: true,
  },
  BEVERAGE_RAW_INTAKE: {
    module: 'BEVERAGE',
    operationType: 'BEVERAGE_RAW_INTAKE',
    label: 'Raw Material Intake',
    firstWeightType: 'GROSS',
    secondWeightType: 'TARE',
    partyType: 'supplier',
    requiresSecondWeight: true,
  },
  BEVERAGE_WASTE_SALE: {
    module: 'BEVERAGE',
    operationType: 'BEVERAGE_WASTE_SALE',
    label: 'Waste Sale',
    firstWeightType: 'GROSS',
    secondWeightType: 'TARE',
    partyType: 'customer_cattle',
    requiresSecondWeight: true,
  },
}

export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin / Finance',
  CLERK: 'Weighbridge Clerk',
  GATE_CLERK: 'Weighbridge Clerk',
  BRIDGE_CLERK: 'Weighbridge Clerk',
  MANAGER_COTTON: 'Cotton Manager',
  MANAGER_BEVERAGE: 'Beverage Manager',
}

export const ROLE_HOME: Record<UserRole, string> = {
  SUPER_ADMIN: '/dashboard',
  ADMIN: '/dashboard',
  CLERK: '/station',
  GATE_CLERK: '/station',
  BRIDGE_CLERK: '/station',
  MANAGER_COTTON: '/reports',
  MANAGER_BEVERAGE: '/reports',
}
