import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL missing");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: url }) });

async function main() {
  const jets = await prisma.team.upsert({
    where: { code: "WPG" },
    update: { name: "Winnipeg Jets", city: "Winnipeg" },
    create: { name: "Winnipeg Jets", city: "Winnipeg", code: "WPG" },
  });
  const leafs = await prisma.team.upsert({
    where: { code: "TOR" },
    update: { name: "Toronto Maple Leafs", city: "Toronto" },
    create: { name: "Toronto Maple Leafs", city: "Toronto", code: "TOR" },
  });
  for (const player of [
    { name: "Mark Scheifele", number: 55, position: "C", teamId: jets.id },
    { name: "Kyle Connor", number: 81, position: "LW", teamId: jets.id },
    { name: "Auston Matthews", number: 34, position: "C", teamId: leafs.id },
  ]) {
    await prisma.player.upsert({
      where: { teamId_number: { teamId: player.teamId, number: player.number } },
      update: {}, // Keep student edits when seed is run again
      create: player,
    });
  }
  
  console.log("Seed complete: example teams and players added.");
}

main().catch(console.error).finally(() => prisma.$disconnect());


// await prisma.coach.deleteMany({where: {teamId: 1}});

await prisma.coach.create({
  data: {
    name: "Kang",
    role: "HEAD",
    team: {connect: {id: 1}}
  }
});

await prisma.team.update({
  where: {id: 1},
  data: {
    coaches: {
      create: [
        {name:"Coach A", role: "HEAD"},
        {name: "Coach B", role:" ASSISTANT_1"},
        {name: "Coach C", role: "ASSISTANT_2"},
        {name:"Coach D", role: "SAFETY"}
      ],
  },
},

})