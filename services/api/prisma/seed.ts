import { PrismaClient } from "@prisma/client";

const DEV_USER_ID = "00000000-0000-0000-0000-000000000001";
const DEV_ACCOUNT_ID = "00000000-0000-0000-0000-0000000000a1";
const WATER_PROFILES_SOURCE = "brunwater_1_25";

function slug(s: string) {
  return s
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function profileKey(type: "water" | "dilution", name: string) {
  return `${WATER_PROFILES_SOURCE}:${type}:${slug(name)}`;
}

const SYSTEM_WATER_PROFILES: Array<{
  type: "water" | "dilution";
  name: string;
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
}> = [
  // BrunWater 1.25 — sheet 4 “Water Profiles” (rows 38–103) + “Dilution Water Profiles” (rows 108–109)
  { type: "water", name: "Burton", calcium: 275, magnesium: 40, sodium: 25, sulfate: 610, chloride: 35, bicarbonate: 270 },
  { type: "water", name: "Dortmund", calcium: 230, magnesium: 15, sodium: 40, sulfate: 330, chloride: 130, bicarbonate: 235 },
  { type: "water", name: "Dublin", calcium: 120, magnesium: 4, sodium: 12, sulfate: 55, chloride: 19, bicarbonate: 315 },
  { type: "water", name: "Dublin (boiled)", calcium: 43, magnesium: 4, sodium: 12, sulfate: 55, chloride: 19, bicarbonate: 80 },
  { type: "water", name: "Edinburgh", calcium: 100, magnesium: 20, sodium: 55, sulfate: 140, chloride: 50, bicarbonate: 285 },
  { type: "water", name: "Edinburgh (boiled)", calcium: 33, magnesium: 20, sodium: 55, sulfate: 140, chloride: 50, bicarbonate: 80 },
  { type: "water", name: "London", calcium: 70, magnesium: 6, sodium: 15, sulfate: 40, chloride: 38, bicarbonate: 166 },
  { type: "water", name: "London (boiled)", calcium: 42, magnesium: 6, sodium: 15, sulfate: 40, chloride: 38, bicarbonate: 80 },
  { type: "water", name: "Munich", calcium: 77, magnesium: 17, sodium: 4, sulfate: 18, chloride: 8, bicarbonate: 295 },
  { type: "water", name: "Munich (boiled)", calcium: 12, magnesium: 17, sodium: 4, sulfate: 18, chloride: 8, bicarbonate: 100 },
  { type: "water", name: "Pilsen", calcium: 7, magnesium: 2, sodium: 2, sulfate: 8, chloride: 6, bicarbonate: 16 },
  { type: "water", name: "Vienna", calcium: 75, magnesium: 15, sodium: 10, sulfate: 60, chloride: 15, bicarbonate: 225 },
  { type: "water", name: "Vienna (boiled)", calcium: 27, magnesium: 15, sodium: 10, sulfate: 60, chloride: 15, bicarbonate: 80 },
  { type: "water", name: "Dusseldorf", calcium: 40, magnesium: 15, sodium: 25, sulfate: 80, chloride: 45, bicarbonate: 81 },
  { type: "water", name: "Dusseldorf (boiled)", calcium: 39, magnesium: 15, sodium: 25, sulfate: 80, chloride: 45, bicarbonate: 80 },
  { type: "water", name: "Beerse", calcium: 73, magnesium: 13, sodium: 52, sulfate: 125, chloride: 80, bicarbonate: 128 },
  { type: "water", name: "Beerse (boiled)", calcium: 57, magnesium: 13, sodium: 52, sulfate: 125, chloride: 80, bicarbonate: 80 },
  { type: "water", name: "Brugse", calcium: 132, magnesium: 13, sodium: 20, sulfate: 99, chloride: 38, bicarbonate: 326 },
  { type: "water", name: "Brugse (boiled)", calcium: 51, magnesium: 13, sodium: 20, sulfate: 99, chloride: 38, bicarbonate: 80 },
  { type: "water", name: "Brussels", calcium: 100, magnesium: 11, sodium: 18, sulfate: 70, chloride: 41, bicarbonate: 250 },
  { type: "water", name: "Brussels (boiled)", calcium: 44, magnesium: 11, sodium: 18, sulfate: 70, chloride: 41, bicarbonate: 80 },
  { type: "water", name: "Hoegaarden", calcium: 90, magnesium: 11, sodium: 16, sulfate: 82, chloride: 53, bicarbonate: 171 },
  { type: "water", name: "Hoegaarden (boiled)", calcium: 60, magnesium: 11, sodium: 16, sulfate: 82, chloride: 53, bicarbonate: 80 },
  { type: "water", name: "Willebroek", calcium: 68, magnesium: 8, sodium: 33, sulfate: 70, chloride: 60, bicarbonate: 143 },
  { type: "water", name: "Willebroek (boiled)", calcium: 48, magnesium: 8, sodium: 33, sulfate: 70, chloride: 60, bicarbonate: 80 },
  { type: "water", name: "Antwerpen/Anvers", calcium: 65, magnesium: 7, sodium: 16, sulfate: 48, chloride: 30, bicarbonate: 159 },
  { type: "water", name: "Antwerpen/Anvers (boiled)", calcium: 39, magnesium: 7, sodium: 16, sulfate: 48, chloride: 30, bicarbonate: 80 },
  { type: "water", name: "Brabant", calcium: 111, magnesium: 12, sodium: 14, sulfate: 74, chloride: 40, bicarbonate: 270 },
  { type: "water", name: "Brabant (boiled)", calcium: 49, magnesium: 12, sodium: 14, sulfate: 74, chloride: 40, bicarbonate: 80 },
  { type: "water", name: "Henegouwen/Hainaut", calcium: 113, magnesium: 17, sodium: 15, sulfate: 65, chloride: 41, bicarbonate: 315 },
  { type: "water", name: "Henegouwen/Hainaut (boiled)", calcium: 36, magnesium: 17, sodium: 15, sulfate: 65, chloride: 41, bicarbonate: 80 },
  { type: "water", name: "Achouffe", calcium: 29, magnesium: 4, sodium: 12, sulfate: 12, chloride: 35, bicarbonate: 70 },
  { type: "water", name: "Orval", calcium: 96, magnesium: 4, sodium: 5, sulfate: 25, chloride: 13, bicarbonate: 270 },
  { type: "water", name: "Orval (boiled)", calcium: 34, magnesium: 4, sodium: 5, sulfate: 25, chloride: 13, bicarbonate: 80 },
  { type: "water", name: "Rochefort", calcium: 82, magnesium: 10, sodium: 6, sulfate: 32, chloride: 17, bicarbonate: 245 },
  { type: "water", name: "Rochefort (boiled)", calcium: 28, magnesium: 10, sodium: 6, sulfate: 32, chloride: 17, bicarbonate: 80 },
  { type: "water", name: "Chimay", calcium: 70, magnesium: 7, sodium: 7, sulfate: 21, chloride: 21, bicarbonate: 205 },
  { type: "water", name: "Chimay (boiled)", calcium: 29, magnesium: 7, sodium: 7, sulfate: 21, chloride: 21, bicarbonate: 80 },
  { type: "water", name: "Luik/Liege", calcium: 60, magnesium: 15, sodium: 11, sulfate: 28, chloride: 24, bicarbonate: 210 },
  { type: "water", name: "Luik/Liege (boiled)", calcium: 18, magnesium: 15, sodium: 11, sulfate: 28, chloride: 24, bicarbonate: 80 },
  { type: "water", name: "East Flanders", calcium: 134, magnesium: 22, sodium: 52, sulfate: 76, chloride: 47, bicarbonate: 475 },
  { type: "water", name: "East Flanders (boiled)", calcium: 4, magnesium: 22, sodium: 52, sulfate: 76, chloride: 47, bicarbonate: 80 },
  { type: "water", name: "West Flanders", calcium: 114, magnesium: 10, sodium: 125, sulfate: 145, chloride: 139, bicarbonate: 305 },
  { type: "water", name: "West Flanders (boiled)", calcium: 40, magnesium: 10, sodium: 125, sulfate: 145, chloride: 139, bicarbonate: 80 },
  { type: "water", name: "Ardennes", calcium: 60, magnesium: 13, sodium: 11, sulfate: 25, chloride: 24, bicarbonate: 200 },
  { type: "water", name: "Ardennes (boiled)", calcium: 20, magnesium: 13, sodium: 11, sulfate: 25, chloride: 24, bicarbonate: 80 },
  { type: "water", name: "Pale Ale Profile", calcium: 140, magnesium: 18, sodium: 25, sulfate: 300, chloride: 55, bicarbonate: 110 },
  { type: "water", name: "Mild Ale Profile", calcium: 50, magnesium: 0, sodium: 20, sulfate: 40, chloride: 65, bicarbonate: 45 },
  { type: "water", name: "American Lager", calcium: 13, magnesium: 6, sodium: 8, sulfate: 37, chloride: 13, bicarbonate: 20 },
  { type: "water", name: "Yellow Full", calcium: 50, magnesium: 5, sodium: 5, sulfate: 55, chloride: 70, bicarbonate: 0 },
  { type: "water", name: "Yellow Balanced", calcium: 50, magnesium: 7, sodium: 5, sulfate: 75, chloride: 60, bicarbonate: 0 },
  { type: "water", name: "Yellow Dry", calcium: 50, magnesium: 10, sodium: 5, sulfate: 105, chloride: 45, bicarbonate: 0 },
  { type: "water", name: "Amber Full", calcium: 50, magnesium: 5, sodium: 15, sulfate: 55, chloride: 65, bicarbonate: 35 },
  { type: "water", name: "Amber Balanced", calcium: 50, magnesium: 10, sodium: 15, sulfate: 75, chloride: 63, bicarbonate: 40 },
  { type: "water", name: "Amber Dry", calcium: 50, magnesium: 15, sodium: 15, sulfate: 110, chloride: 50, bicarbonate: 45 },
  { type: "water", name: "Brown Full", calcium: 50, magnesium: 5, sodium: 27, sulfate: 50, chloride: 60, bicarbonate: 85 },
  { type: "water", name: "Brown Balanced", calcium: 50, magnesium: 10, sodium: 27, sulfate: 70, chloride: 55, bicarbonate: 90 },
  { type: "water", name: "Brown Dry", calcium: 50, magnesium: 15, sodium: 27, sulfate: 99, chloride: 45, bicarbonate: 95 },
  { type: "water", name: "Black Full", calcium: 50, magnesium: 5, sodium: 33, sulfate: 35, chloride: 45, bicarbonate: 140 },
  { type: "water", name: "Black Balanced", calcium: 50, magnesium: 10, sodium: 33, sulfate: 57, chloride: 44, bicarbonate: 142 },
  { type: "water", name: "Black Dry", calcium: 50, magnesium: 15, sodium: 33, sulfate: 84, chloride: 39, bicarbonate: 145 },
  { type: "water", name: "PseudoBohPils", calcium: 20, magnesium: 0, sodium: 8, sulfate: 15, chloride: 35, bicarbonate: 0 },
  { type: "water", name: "Jever (boiled)", calcium: 46, magnesium: 5, sodium: 15, sulfate: 75, chloride: 30, bicarbonate: 60 },
  { type: "water", name: "Wicklow Mtn", calcium: 18, magnesium: 2, sodium: 13, sulfate: 22, chloride: 20, bicarbonate: 35 },
  { type: "water", name: "User Custom", calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 },
  { type: "water", name: "Burton (boiled)", calcium: 255, magnesium: 40, sodium: 25, sulfate: 610, chloride: 35, bicarbonate: 210 },
  { type: "dilution", name: "Distilled Water", calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 },
  { type: "dilution", name: "RO Water", calcium: 1, magnesium: 0, sodium: 8, sulfate: 1, chloride: 4, bicarbonate: 16 },
];

async function main() {
  const prisma = new PrismaClient();

  await prisma.user.upsert({
    where: { id: DEV_USER_ID },
    create: {
      id: DEV_USER_ID,
      email: "dev@brewery.local",
    },
    update: {
      email: "dev@brewery.local",
    },
  });

  await prisma.account.upsert({
    where: { id: DEV_ACCOUNT_ID },
    create: {
      id: DEV_ACCOUNT_ID,
      name: "Dev Brewery",
      members: {
        create: {
          userId: DEV_USER_ID,
          role: "owner",
        },
      },
    },
    update: {
      name: "Dev Brewery",
    },
  });

  // Ensure membership exists (in case account already existed without relation)
  await prisma.accountMember.upsert({
    where: {
      accountId_userId: {
        accountId: DEV_ACCOUNT_ID,
        userId: DEV_USER_ID,
      },
    },
    create: {
      accountId: DEV_ACCOUNT_ID,
      userId: DEV_USER_ID,
      role: "owner",
    },
    update: {
      role: "owner",
    },
  });

  for (const p of SYSTEM_WATER_PROFILES) {
    const key = profileKey(p.type, p.name);
    await prisma.waterProfile.upsert({
      where: { key },
      create: {
        key,
        scope: "system",
        type: p.type,
        name: p.name,
        calcium: p.calcium,
        magnesium: p.magnesium,
        sodium: p.sodium,
        sulfate: p.sulfate,
        chloride: p.chloride,
        bicarbonate: p.bicarbonate,
        verificationStatus: "verified",
        source: WATER_PROFILES_SOURCE,
      },
      update: {
        name: p.name,
        calcium: p.calcium,
        magnesium: p.magnesium,
        sodium: p.sodium,
        sulfate: p.sulfate,
        chloride: p.chloride,
        bicarbonate: p.bicarbonate,
        verificationStatus: "verified",
        source: WATER_PROFILES_SOURCE,
      },
    });
  }

  await prisma.$disconnect();

  // Print stable IDs for convenience (safe, not secrets).
  // eslint-disable-next-line no-console
  console.log("Seeded dev identities:");
  // eslint-disable-next-line no-console
  console.log(`X-User-Id: ${DEV_USER_ID}`);
  // eslint-disable-next-line no-console
  console.log(`X-Account-Id: ${DEV_ACCOUNT_ID}`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

