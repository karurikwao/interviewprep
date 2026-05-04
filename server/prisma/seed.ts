import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create default admin settings
  await prisma.adminSettings.upsert({
    where: { id: 'admin-settings' },
    update: {},
    create: { id: 'admin-settings' },
  });

  // Create default ad networks
  const networks = [
    { name: 'google-adsense', label: 'Google AdSense', priority: 10 },
    { name: 'media-net', label: 'Media.net', priority: 9 },
    { name: 'amazon-associates', label: 'Amazon Associates', priority: 8 },
    { name: 'propellerads', label: 'PropellerAds', priority: 7 },
    { name: 'ezoic', label: 'Ezoic', priority: 6 },
    { name: 'custom', label: 'Custom HTML/JS', priority: 0 },
  ];

  for (const net of networks) {
    await prisma.adNetwork.upsert({
      where: { name: net.name },
      update: {},
      create: net,
    });
  }

  // Create admin user
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@interviewready.app';
  const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!';
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const admin = await prisma.user.create({ data: { email: adminEmail, passwordHash, firstName: 'Admin', lastName: 'User', role: 'admin', emailVerified: true } });
    await prisma.userProgress.create({ data: { userId: admin.id } });
    console.log(`Admin user created: ${adminEmail}`);
  } else {
    console.log('Admin user already exists, skipping.');
  }

  console.log('Seed complete.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
