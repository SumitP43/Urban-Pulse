import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/crypto.js';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('[SEED] Starting UrbanPulse Database Seed Operation...');

  // 1. Seed Admin User
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@urbanpulse.ai').toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || 'UrbanPulseAdmin2026!SecureKey';

  console.log(`[SEED] Seeding Admin User: ${adminEmail}`);
  const passwordHash = await hashPassword(adminPassword);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'UrbanPulse System Administrator',
      role: 'ADMIN',
      passwordHash,
      isActive: true,
    },
    create: {
      email: adminEmail,
      name: 'UrbanPulse System Administrator',
      role: 'ADMIN',
      passwordHash,
      isActive: true,
    },
  });

  console.log(`[SEED] Admin User configured with UUID: ${admin.id}`);

  // 2. Seed 10 Realistic Indian Urban Locations
  const locationsData = [
    {
      code: 'DEL-NCR-CENTRAL',
      name: 'Delhi Central (Connaught Place)',
      city: 'Delhi',
      district: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      latitude: 28.6315,
      longitude: 77.2167,
      elevationMeters: 216.0,
      areaKm2: 25.5,
      population: 142000,
    },
    {
      code: 'DEL-NCR-ANANDVIHAR',
      name: 'Anand Vihar Transit & Air Quality Hotspot',
      city: 'Delhi',
      district: 'East Delhi',
      state: 'Delhi',
      country: 'India',
      latitude: 28.6469,
      longitude: 77.3164,
      elevationMeters: 208.0,
      areaKm2: 18.2,
      population: 285000,
    },
    {
      code: 'DEL-NCR-NOIDA',
      name: 'Noida Sector 62 Urban Corridor',
      city: 'Noida',
      district: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
      country: 'India',
      latitude: 28.6280,
      longitude: 77.3649,
      elevationMeters: 200.0,
      areaKm2: 32.0,
      population: 340000,
    },
    {
      code: 'DEL-NCR-GRNOIDA',
      name: 'Greater Noida Knowledge Park Cluster',
      city: 'Greater Noida',
      district: 'Gautam Buddha Nagar',
      state: 'Uttar Pradesh',
      country: 'India',
      latitude: 28.4744,
      longitude: 77.5040,
      elevationMeters: 198.0,
      areaKm2: 45.0,
      population: 180000,
    },
    {
      code: 'DEL-NCR-GURUGRAM',
      name: 'Gurugram Cyber City Drainage & Heat Hotspot',
      city: 'Gurugram',
      district: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      latitude: 28.4950,
      longitude: 77.0895,
      elevationMeters: 220.0,
      areaKm2: 28.4,
      population: 410000,
    },
    {
      code: 'MUM-BKC-FIN',
      name: 'Mumbai Bandra-Kurla Complex (BKC)',
      city: 'Mumbai',
      district: 'Mumbai Suburban',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0657,
      longitude: 72.8685,
      elevationMeters: 8.0,
      areaKm2: 12.5,
      population: 195000,
    },
    {
      code: 'BLR-WHITEFIELD',
      name: 'Bengaluru Whitefield Tech Corridor',
      city: 'Bengaluru',
      district: 'Bengaluru Urban',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.9698,
      longitude: 77.7500,
      elevationMeters: 920.0,
      areaKm2: 35.8,
      population: 360000,
    },
    {
      code: 'HYD-HITECH',
      name: 'Hyderabad HITEC City Urban Basin',
      city: 'Hyderabad',
      district: 'Ranga Reddy',
      state: 'Telangana',
      country: 'India',
      latitude: 17.4435,
      longitude: 78.3772,
      elevationMeters: 536.0,
      areaKm2: 26.2,
      population: 290000,
    },
    {
      code: 'CHN-GUINDY',
      name: 'Chennai Guindy Industrial Basin',
      city: 'Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      latitude: 13.0067,
      longitude: 80.2025,
      elevationMeters: 12.0,
      areaKm2: 19.1,
      population: 220000,
    },
    {
      code: 'KOL-SALTLAKE',
      name: 'Kolkata Salt Lake Sector V',
      city: 'Kolkata',
      district: 'North 24 Parganas',
      state: 'West Bengal',
      country: 'India',
      latitude: 22.5726,
      longitude: 88.4312,
      elevationMeters: 9.0,
      areaKm2: 15.6,
      population: 175000,
    },
  ];

  console.log(`[SEED] Seeding ${locationsData.length} Indian urban locations...`);

  for (const loc of locationsData) {
    const created = await prisma.location.upsert({
      where: { code: loc.code },
      update: {
        name: loc.name,
        city: loc.city,
        district: loc.district,
        state: loc.state,
        country: loc.country,
        latitude: loc.latitude,
        longitude: loc.longitude,
        elevationMeters: loc.elevationMeters,
        areaKm2: loc.areaKm2,
        population: loc.population,
        isDeleted: false,
      },
      create: {
        code: loc.code,
        name: loc.name,
        city: loc.city,
        district: loc.district,
        state: loc.state,
        country: loc.country,
        latitude: loc.latitude,
        longitude: loc.longitude,
        elevationMeters: loc.elevationMeters,
        areaKm2: loc.areaKm2,
        population: loc.population,
      },
    });

    // Populate PostGIS Point geometry explicitly if postgis extension is enabled
    try {
      await prisma.$executeRawUnsafe(
        `UPDATE locations SET "locationPoint" = ST_SetSRID(ST_MakePoint($1, $2), 4326) WHERE id = $3;`,
        loc.longitude,
        loc.latitude,
        created.id
      );
    } catch {
      // Ignored if PostGIS extension is not installed in the current environment
    }
  }

  console.log('[SEED] UrbanPulse Database Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error('[SEED] Seeding failed with error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
