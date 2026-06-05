import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import crypto from "crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("WedPass2024!", 12);

  const organizer = await prisma.user.upsert({
    where: { email: "organizer@wedpass.dev" },
    update: {},
    create: {
      email: "organizer@wedpass.dev",
      passwordHash,
      fullName: "Demo Organizer",
      role: "ORGANIZER",
    },
  });

  console.log(`Created organizer: ${organizer.email}`);

  const wedding = await prisma.wedding.upsert({
    where: { slug: "demo-wedding-2025" },
    update: {},
    create: {
      organizerId: organizer.id,
      name: "The Mbiye-Nkosi Wedding",
      coupleNames: "Joel & Amara",
      eventDate: new Date("2025-12-20"),
      location: "Kinshasa Grand Hotel",
      country: "DRC",
      slug: "demo-wedding-2025",
      status: "ACTIVE",
      galleryEnabled: true,
    },
  });

  console.log(`Created wedding: ${wedding.name} (${wedding.slug})`);

  const guestNames = [
    "Aminata Diallo",
    "Kwame Mensah",
    "Fatima Al-Rashid",
    "Chukwuemeka Obi",
    "Aisha Kamara",
    "Kofi Asante",
    "Ngozi Adeyemi",
    "Mamadou Coulibaly",
    "Zainab Ibrahim",
    "Thembi Dlamini",
  ];

  for (const fullName of guestNames) {
    const qrToken = crypto.randomUUID();
    await prisma.guest.create({
      data: {
        weddingId: wedding.id,
        fullName,
        qrToken,
        numberOfAllowedGuests: Math.floor(Math.random() * 3) + 1,
        tableName: `Table ${Math.floor(Math.random() * 10) + 1}`,
      },
    });
  }

  console.log(`Created ${guestNames.length} guests`);
  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
