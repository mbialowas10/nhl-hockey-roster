import "dotenv/config";
import express from "express";
import cors from "cors";
import { prisma } from "./prisma";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

function validId(value: string): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function teamInput(body: any) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const code = typeof body?.code === "string" ? body.code.trim().toUpperCase() : "";
  const city = typeof body?.city === "string" ? body.city.trim() : "";
  if (!name || !city || !/^[A-Z]{2,4}$/.test(code)) return null;
  return { name, code, city };
}
function playerInput(body: any) {
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const position = typeof body?.position === "string" ? body.position : "";
  const number = Number(body?.number);
  const teamId = Number(body?.teamId);
  if (!name || !["C", "LW", "RW", "D", "G"].includes(position)
    || !Number.isInteger(number) || number < 0 || number > 99
    || !Number.isInteger(teamId) || teamId <= 0) return null;
  return { name, position, number, teamId };
}

// READ
app.get("/api/teams", async (_req, res) => {
  const teams = await prisma.team.findMany({ orderBy: { name: "asc" } });
  res.json(teams);
});
app.get("/api/players", async (_req, res) => {
  const players = await prisma.player.findMany({
    include: { team: true }, orderBy: { name: "asc" },
  });
  res.json(players);
});

// CREATE
app.post("/api/teams", async (req, res) => {
  const data = teamInput(req.body);
  if (!data) { 
    res.status(400).json(
      { 
        error: "Enter name, city, and 2–4 letter code." 
      }
    ); 
    return; 
  }
  const team = await prisma.team.create({ data });
  res.status(201).json(team);
});
app.post("/api/players", async (req, res) => {
  const data = playerInput(req.body);
  if (!data) { res.status(400).json({ error: "Invalid player details." }); return; }
  const player = await prisma.player.create({ data });
  res.status(201).json(player);
});

// UPDATE
app.put("/api/teams/:id", async (req, res) => {
  const id = validId(req.params.id);
  const data = teamInput(req.body);
  if (!id || !data) { res.status(400).json({ error: "Invalid ID or team details." }); return; }
  res.json(await prisma.team.update({ where: { id }, data }));
});
app.put("/api/players/:id", async (req, res) => {
  const id = validId(req.params.id);
  const data = playerInput(req.body);
  if (!id || !data) { res.status(400).json({ error: "Invalid ID or player details." }); return; }
  res.json(await prisma.player.update({ where: { id }, data }));
});

// DELETE
app.delete("/api/teams/:id", async (req, res) => {
  const id = validId(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid ID." }); return; }
  // Intentionally block deleting a team while it has players.
  if (await prisma.player.count({ where: { teamId: id } }) > 0) {
    res.status(409).json({ error: "Delete or move this team's players first." }); return;
  }
  await prisma.team.delete({ where: { id } });
  res.status(204).end();
});
app.delete("/api/players/:id", async (req, res) => {
  const id = validId(req.params.id);
  if (!id) { res.status(400).json({ error: "Invalid ID." }); return; }
  await prisma.player.delete({ where: { id } });
  res.status(204).end();
});

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Shared error handler, including common Prisma errors.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  if (err?.code === "P2002") { res.status(409).json({ error: "Duplicate code or jersey number on this team." }); return; }
  if (err?.code === "P2003") { res.status(400).json({ error: "Selected team does not exist, or this record is in use." }); return; }
  if (err?.code === "P2025") { res.status(404).json({ error: "Record not found." }); return; }
  res.status(500).json({ error: "Server error. Check backend terminal." });
});

const port = Number(process.env.PORT ?? 3000);
app.listen(port, () => console.log(`API running at http://localhost:${port}`));
