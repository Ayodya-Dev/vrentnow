import 'dotenv/config';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEFAULT_EMAIL = 'admin@example.com';
const DEFAULT_USERNAME = 'admin';
const DEFAULT_PASSWORD = 'ChangeMe123!';

/** The three Featured Promotions that shipped as hardcoded UI on /deals. */
const FEATURED_DEALS = [
  {
    slug: 'summer-special',
    title: 'Summer Special',
    badge: 'LIMITED TIME',
    discountLabel: '25% OFF',
    description:
      'Experience the ultimate summer road trip with our convertible fleet. Perfect for coastal drives and sunny getaways.',
    validUntilLabel: 'Valid until Aug 31, 2026',
    code: 'SUMMER',
    imageFile: 'summer.png',
    sortOrder: 0,
  },
  {
    slug: 'weekend-getaway',
    title: 'Weekend Getaway',
    badge: 'POPULAR',
    discountLabel: '15% OFF',
    description:
      'Escape the city with our rugged SUV collection. Includes unlimited mileage for all weekend trips.',
    validUntilLabel: 'Valid until Dec 15, 2026',
    code: 'WEEKEND',
    imageFile: 'weekend.png',
    sortOrder: 1,
  },
  {
    slug: 'long-term-rental',
    title: 'Long Term Rental',
    badge: 'BEST VALUE',
    discountLabel: 'Save $200',
    description:
      'Monthly rentals designed for business travelers and digital nomads. Professional maintenance included.',
    validUntilLabel: 'Valid until Ongoing',
    code: 'LONGTERM',
    imageFile: 'longterm.png',
    sortOrder: 2,
  },
] as const;

async function ensureDealImage(
  filename: string,
): Promise<string | null> {
  const source = join(
    __dirname,
    '../../web/public/images/deals',
    filename,
  );
  let bytes: Buffer;
  try {
    bytes = await readFile(source);
  } catch {
    console.warn(`[seed] deal image missing: ${source}`);
    return null;
  }

  const id = randomUUID();
  const key = `public/deal/${id}.png`;
  const storageRoot = process.env.LOCAL_STORAGE_DIR ?? join(__dirname, '../storage');
  const diskPath = join(storageRoot, key);
  await mkdir(dirname(diskPath), { recursive: true });
  await writeFile(diskPath, bytes);
  await writeFile(`${diskPath}.meta`, 'image/png', 'utf8');

  const apiBase = (
    process.env.APP_API_URL ??
    process.env.API_URL ??
    'http://localhost:9000'
  ).replace(/\/$/, '');

  const asset = await prisma.fileAsset.create({
    data: {
      bucket: 'local',
      key,
      visibility: 'public',
      status: 'READY',
      kind: 'deal',
      originalName: filename,
      mimeType: 'image/png',
      sizeBytes: bytes.length,
      url: `${apiBase}/v1/files/local/${key}`,
    },
  });
  return asset.id;
}

async function seedFeaturedDeals() {
  for (const deal of FEATURED_DEALS) {
    const existing = await prisma.deal.findFirst({
      where: { slug: deal.slug, deletedAt: null },
    });
    if (existing) {
      console.log(`[seed] deal already exists: ${deal.slug}`);
      continue;
    }

    const imageFileId = await ensureDealImage(deal.imageFile);
    await prisma.deal.create({
      data: {
        title: deal.title,
        slug: deal.slug,
        badge: deal.badge,
        description: deal.description,
        discountLabel: deal.discountLabel,
        code: deal.code,
        validUntilLabel: deal.validUntilLabel,
        imageFileId,
        isActive: true,
        sortOrder: deal.sortOrder,
      },
    });
    console.log(`[seed] deal created: ${deal.slug}`);
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL ?? DEFAULT_EMAIL;
  const username = process.env.ADMIN_USERNAME ?? DEFAULT_USERNAME;
  const password = process.env.ADMIN_PASSWORD ?? DEFAULT_PASSWORD;

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  if (password === DEFAULT_PASSWORD && nodeEnv === 'production') {
    console.warn(
      '[seed] ADMIN_PASSWORD is still the default. Set ADMIN_PASSWORD before seeding production.',
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      username,
      password: passwordHash,
      roles: { create: { role: Role.SUPER_ADMIN } },
    },
  });

  const hasAdminRole = await prisma.userRole.findFirst({
    where: { userId: user.id, role: Role.SUPER_ADMIN },
  });

  if (!hasAdminRole) {
    await prisma.userRole.create({
      data: { userId: user.id, role: Role.SUPER_ADMIN },
    });
  }

  console.log(`[seed] SUPER_ADMIN ready: ${email}`);

  // Two example items — one published, one draft — so the public list and the
  // admin list visibly differ on a fresh database. Delete these along with the
  // items feature when you start a real one.
  await prisma.item.upsert({
    where: { slug: 'hello-world' },
    update: {},
    create: {
      title: 'Hello World',
      slug: 'hello-world',
      description: 'A published example item. It shows up on the public site.',
      published: true,
    },
  });

  await prisma.item.upsert({
    where: { slug: 'work-in-progress' },
    update: {},
    create: {
      title: 'Work In Progress',
      slug: 'work-in-progress',
      description:
        'A draft. Visible in the admin console, hidden from the public site.',
      published: false,
    },
  });

  console.log('[seed] 2 example items ready (1 published, 1 draft)');

  await seedFeaturedDeals();
  console.log('[seed] featured deals ready (Summer / Weekend / Long Term)');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
    void pool.end();
  });
