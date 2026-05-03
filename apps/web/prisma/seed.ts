import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Default admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@weighpro.tz' },
    update: {},
    create: {
      name: 'System Admin',
      email: 'admin@weighpro.tz',
      password: adminPassword,
      role: 'SUPER_ADMIN',
    },
  })

  // Gate clerk
  const clerkPassword = await bcrypt.hash('clerk123', 10)
  await prisma.user.upsert({
    where: { email: 'gate@weighpro.tz' },
    update: {},
    create: {
      name: 'Gate Clerk',
      email: 'gate@weighpro.tz',
      password: clerkPassword,
      role: 'GATE_CLERK',
    },
  })

  // Bridge clerk
  await prisma.user.upsert({
    where: { email: 'bridge@weighpro.tz' },
    update: {},
    create: {
      name: 'Bridge Clerk',
      email: 'bridge@weighpro.tz',
      password: clerkPassword,
      role: 'BRIDGE_CLERK',
    },
  })

  // System settings
  const settings = [
    { key: 'FUEL_RATE_PER_KM', value: '200' },
    { key: 'SEED_RATIO', value: '0.05' },
    { key: 'CURRENT_SEASON', value: '2025/2026' },
    { key: 'SCALE_PORT', value: 'COM3' },
    { key: 'SCALE_BAUD', value: '1200' },
  ]
  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }

  // Sample villages
  const villages = [
    { name: 'Kilosa Village', distanceKm: 45 },
    { name: 'Dodoma Central', distanceKm: 120 },
    { name: 'Iringa North', distanceKm: 85 },
    { name: 'Morogoro East', distanceKm: 60 },
  ]
  for (const v of villages) {
    await prisma.village.upsert({
      where: { name: v.name },
      update: {},
      create: v,
    })
  }

  // Sample companies
  await prisma.company.upsert({
    where: { name: 'TanCot Exports Ltd' },
    update: {},
    create: { name: 'TanCot Exports Ltd', type: 'LINT_BUYER', contact: '+255 22 123 4567' },
  })
  await prisma.company.upsert({
    where: { name: 'AgroWaste Buyers Co' },
    update: {},
    create: { name: 'AgroWaste Buyers Co', type: 'WASTE_BUYER', contact: '+255 22 987 6543' },
  })

  // Sample customers
  await prisma.customer.upsert({
    where: { name: 'Safari Beverages Ltd' },
    update: {},
    create: { name: 'Safari Beverages Ltd', type: 'BEVERAGE_CUSTOMER', contact: '+255 755 100 200' },
  })
  await prisma.customer.upsert({
    where: { name: 'Mwananchi Farms' },
    update: {},
    create: { name: 'Mwananchi Farms', type: 'CATTLE_FARMER', contact: '+255 755 300 400' },
  })

  // Sample supplier
  await prisma.supplier.upsert({
    where: { name: 'Grain Masters TZ' },
    update: {},
    create: {
      name: 'Grain Masters TZ',
      materialTypes: JSON.stringify(['RICE', 'MALT', 'BARLEY']),
      contact: '+255 713 500 600',
    },
  })

  // Products
  const products = [
    { name: 'Raw Cotton', module: 'COTTON', type: 'COTTON_RAW', defaultPrice: 1200, unit: 'KG' },
    { name: 'Lint Bale', module: 'COTTON', type: 'LINT_BALE', defaultPrice: 4500, unit: 'KG' },
    { name: 'Cotton Waste', module: 'COTTON', type: 'COTTON_WASTE', defaultPrice: 200, unit: 'KG' },
    { name: 'Cotton Seed', module: 'COTTON', type: 'COTTON_SEED', defaultPrice: 300, unit: 'KG' },
    { name: 'Beer', module: 'BEVERAGE', type: 'BEER', defaultPrice: 2500, unit: 'CRATE' },
    { name: 'Soda', module: 'BEVERAGE', type: 'SODA', defaultPrice: 1800, unit: 'CRATE' },
    { name: 'Rice', module: 'BEVERAGE', type: 'RICE', defaultPrice: 1100, unit: 'KG' },
    { name: 'Malt', module: 'BEVERAGE', type: 'MALT', defaultPrice: 1500, unit: 'KG' },
    { name: 'Barley', module: 'BEVERAGE', type: 'BARLEY', defaultPrice: 1400, unit: 'KG' },
    { name: 'Malt Waste', module: 'BEVERAGE', type: 'MALT_WASTE', defaultPrice: 50, unit: 'KG' },
  ]
  for (const p of products) {
    await prisma.product.upsert({
      where: { name: p.name },
      update: {},
      create: p,
    })
  }

  console.log('Seed complete.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
