-- Weighbridge OS — seed database for Turso / libSQL
-- Import with: turso db shell <db-name> < seed.sql
-- Or create new DB: turso db create weighpro --from-dump seed.sql

BEGIN TRANSACTION;

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- admin@weighpro.tz / admin123
INSERT INTO "User" VALUES('cmoq3m5pt00007dziguxf8h75','System Admin','admin@weighpro.tz','$2a$10$.zV0yNdjXtmZPlT/86wkMOTpi5YIsUNtt9bI8tw4Uxx3j/kFn4vUm','SUPER_ADMIN',1,'2025-01-01 00:00:00','2025-01-01 00:00:00');
-- clerk@weighpro.tz / clerk123
INSERT INTO "User" VALUES('cmoqriatl00017dngsbisoyq6','Demo Clerk','clerk@weighpro.tz','$2a$10$iboc91MnAvVl3bnB.u81sum3ie8HnulYkzFUrvSi94rGtRE/cMlEK','CLERK',1,'2025-01-01 00:00:00','2025-01-01 00:00:00');

CREATE TABLE IF NOT EXISTS "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plateNumber" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT,
    "defaultTare" REAL,
    "vehicleType" TEXT NOT NULL DEFAULT 'TRUCK',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "WeighingTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketNumber" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "operationType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "vehicleId" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT,
    "firstWeight" REAL,
    "firstWeightType" TEXT,
    "firstWeightAt" DATETIME,
    "secondWeight" REAL,
    "secondWeightType" TEXT,
    "secondWeightAt" DATETIME,
    "netWeight" REAL,
    "weightUnit" TEXT NOT NULL DEFAULT 'KG',
    "clerkId" TEXT NOT NULL,
    "weighingClerkId" TEXT,
    "notes" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedById" TEXT,
    "deletedAt" DATETIME,
    "cancelReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WeighingTicket_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WeighingTicket_clerkId_fkey" FOREIGN KEY ("clerkId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WeighingTicket_weighingClerkId_fkey" FOREIGN KEY ("weighingClerkId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "WeighingTicket_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "TicketItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" REAL NOT NULL,
    "unitPrice" REAL NOT NULL DEFAULT 0,
    "totalPrice" REAL NOT NULL DEFAULT 0,
    "grade" TEXT,
    "qualityNote" TEXT,
    CONSTRAINT "TicketItem_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "WeighingTicket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TicketItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CottonPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "distanceKm" REAL NOT NULL,
    "fuelRatePerKm" REAL NOT NULL DEFAULT 200,
    "fuelTotal" REAL NOT NULL,
    "cottonGrade" TEXT,
    "moisturePct" REAL,
    "deductionKg" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "CottonPurchase_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "WeighingTicket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CottonPurchase_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "LintBaleSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "baleCount" INTEGER NOT NULL DEFAULT 0,
    "contractRef" TEXT,
    CONSTRAINT "LintBaleSale_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "WeighingTicket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LintBaleSale_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "WasteSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "wasteType" TEXT,
    "pricePerKg" REAL NOT NULL DEFAULT 0,
    CONSTRAINT "WasteSale_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "WeighingTicket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WasteSale_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "SeedObligation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "villageId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "cottonSuppliedKg" REAL NOT NULL DEFAULT 0,
    "seedRatio" REAL NOT NULL DEFAULT 0.05,
    "seedOwedKg" REAL NOT NULL DEFAULT 0,
    "seedDispatchedKg" REAL NOT NULL DEFAULT 0,
    "remainingKg" REAL NOT NULL DEFAULT 0,
    "isFulfilled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SeedObligation_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "SeedDispatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "villageId" TEXT NOT NULL,
    "season" TEXT NOT NULL,
    "quantityKg" REAL NOT NULL,
    "obligationId" TEXT NOT NULL,
    CONSTRAINT "SeedDispatch_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "WeighingTicket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SeedDispatch_villageId_fkey" FOREIGN KEY ("villageId") REFERENCES "Village" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SeedDispatch_obligationId_fkey" FOREIGN KEY ("obligationId") REFERENCES "SeedObligation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "BeverageDispatch" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "routeId" TEXT,
    "deliveryProof" TEXT,
    "signature" TEXT,
    CONSTRAINT "BeverageDispatch_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "WeighingTicket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "BeverageDispatch_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "RawMaterialIntake" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "supplierId" TEXT NOT NULL,
    "materialType" TEXT NOT NULL,
    "storageLocation" TEXT,
    "qualityPass" BOOLEAN NOT NULL DEFAULT true,
    "moistureContent" REAL,
    CONSTRAINT "RawMaterialIntake_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "WeighingTicket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RawMaterialIntake_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "Supplier" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MaltWasteSale" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "collectionDate" DATETIME,
    CONSTRAINT "MaltWasteSale_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "WeighingTicket" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaltWasteSale_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Village" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "distanceKm" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Village" VALUES('cmoq3m5t700087dziprwxijon','Kilosa Village',45.0,1,'2025-01-01 00:00:00');
INSERT INTO "Village" VALUES('cmoq3m5t900097dzin40k82r9','Dodoma Central',120.0,1,'2025-01-01 00:00:00');
INSERT INTO "Village" VALUES('cmoq3m5tb000a7dzidkpkorzl','Iringa North',85.0,1,'2025-01-01 00:00:00');
INSERT INTO "Village" VALUES('cmoq3m5td000b7dzi2fdo246d','Morogoro East',60.0,1,'2025-01-01 00:00:00');

CREATE TABLE IF NOT EXISTS "Company" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contact" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Company" VALUES('cmoq3m5te000c7dzivv425o74','TanCot Exports Ltd','LINT_BUYER','+255 22 123 4567',1,'2025-01-01 00:00:00');
INSERT INTO "Company" VALUES('cmoq3m5tg000d7dzig7p3d6ji','AgroWaste Buyers Co','WASTE_BUYER','+255 22 987 6543',1,'2025-01-01 00:00:00');

CREATE TABLE IF NOT EXISTS "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "contact" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Customer" VALUES('cmoq3m5th000e7dzilfb54jt4','Safari Beverages Ltd','BEVERAGE_CUSTOMER','+255 755 100 200',1,'2025-01-01 00:00:00');
INSERT INTO "Customer" VALUES('cmoq3m5tj000f7dzixgwiaxqa','Mwananchi Farms','CATTLE_FARMER','+255 755 300 400',1,'2025-01-01 00:00:00');

CREATE TABLE IF NOT EXISTS "Supplier" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "materialTypes" TEXT NOT NULL DEFAULT '[]',
    "contact" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Supplier" VALUES('cmoq3mgc5000g7dcfd6j44bdz','Grain Masters TZ','["RICE","MALT","BARLEY"]','+255 713 500 600',1,'2025-01-01 00:00:00');

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "module" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "defaultPrice" REAL NOT NULL DEFAULT 0,
    "unit" TEXT NOT NULL DEFAULT 'KG',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO "Product" VALUES('cmoq3mgcn000h7dcfsb6obg1x','Raw Cotton','COTTON','COTTON_RAW',1200.0,'KG',1,'2025-01-01 00:00:00');
INSERT INTO "Product" VALUES('cmoq3mgcp000i7dcfatdinf6p','Lint Bale','COTTON','LINT_BALE',4500.0,'KG',1,'2025-01-01 00:00:00');
INSERT INTO "Product" VALUES('cmoq3mgcr000j7dcf2do9h74y','Cotton Waste','COTTON','COTTON_WASTE',200.0,'KG',1,'2025-01-01 00:00:00');
INSERT INTO "Product" VALUES('cmoq3mgct000k7dcfieeqtd8c','Cotton Seed','COTTON','COTTON_SEED',300.0,'KG',1,'2025-01-01 00:00:00');
INSERT INTO "Product" VALUES('cmoq3mgcu000l7dcfdkf1v7k3','Beer','BEVERAGE','BEER',2500.0,'CRATE',1,'2025-01-01 00:00:00');
INSERT INTO "Product" VALUES('cmoq3mgcw000m7dcff8ht482e','Soda','BEVERAGE','SODA',1800.0,'CRATE',1,'2025-01-01 00:00:00');
INSERT INTO "Product" VALUES('cmoq3mgcx000n7dcfygljt9xm','Rice','BEVERAGE','RICE',1100.0,'KG',1,'2025-01-01 00:00:00');
INSERT INTO "Product" VALUES('cmoq3mgcy000o7dcf9l27c343','Malt','BEVERAGE','MALT',1500.0,'KG',1,'2025-01-01 00:00:00');
INSERT INTO "Product" VALUES('cmoq3mgd0000p7dcf6r3js5c9','Barley','BEVERAGE','BARLEY',1400.0,'KG',1,'2025-01-01 00:00:00');
INSERT INTO "Product" VALUES('cmoq3mgd2000q7dcfjxbxk75v','Malt Waste','BEVERAGE','MALT_WASTE',50.0,'KG',1,'2025-01-01 00:00:00');

CREATE TABLE IF NOT EXISTS "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "reason" TEXT,
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "WeighingTicket" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO "SystemSetting" VALUES('cmoq3m5sy00037dzilzsslex4','FUEL_RATE_PER_KM','200','2025-01-01 00:00:00');
INSERT INTO "SystemSetting" VALUES('cmoq3m5t000047dzivxfa8mwq','SEED_RATIO','0.05','2025-01-01 00:00:00');
INSERT INTO "SystemSetting" VALUES('cmoq3m5t200057dzi29ez4yf0','CURRENT_SEASON','2025/2026','2025-01-01 00:00:00');
INSERT INTO "SystemSetting" VALUES('cmoq3m5t300067dzikenfi2lz','SCALE_PORT','COM3','2025-01-01 00:00:00');
INSERT INTO "SystemSetting" VALUES('cmoq3m5t500077dziacqvjnxv','SCALE_BAUD','1200','2025-01-01 00:00:00');

-- Indexes
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Vehicle_plateNumber_key" ON "Vehicle"("plateNumber");
CREATE UNIQUE INDEX "WeighingTicket_ticketNumber_key" ON "WeighingTicket"("ticketNumber");
CREATE UNIQUE INDEX "CottonPurchase_ticketId_key" ON "CottonPurchase"("ticketId");
CREATE UNIQUE INDEX "LintBaleSale_ticketId_key" ON "LintBaleSale"("ticketId");
CREATE UNIQUE INDEX "WasteSale_ticketId_key" ON "WasteSale"("ticketId");
CREATE UNIQUE INDEX "SeedObligation_villageId_season_key" ON "SeedObligation"("villageId", "season");
CREATE UNIQUE INDEX "SeedDispatch_ticketId_key" ON "SeedDispatch"("ticketId");
CREATE UNIQUE INDEX "BeverageDispatch_ticketId_key" ON "BeverageDispatch"("ticketId");
CREATE UNIQUE INDEX "RawMaterialIntake_ticketId_key" ON "RawMaterialIntake"("ticketId");
CREATE UNIQUE INDEX "MaltWasteSale_ticketId_key" ON "MaltWasteSale"("ticketId");
CREATE UNIQUE INDEX "Village_name_key" ON "Village"("name");
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");
CREATE UNIQUE INDEX "Customer_name_key" ON "Customer"("name");
CREATE UNIQUE INDEX "Supplier_name_key" ON "Supplier"("name");
CREATE UNIQUE INDEX "Product_name_key" ON "Product"("name");
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

COMMIT;
