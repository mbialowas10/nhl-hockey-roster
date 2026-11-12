import { useEffect, useState } from "react";
import {Team, Player, TeamInput, PlayerInput } from "./types/types"


const emptyTeam: TeamInput = { name: "", code: "", city: "" };
const emptyPlayer: PlayerInput = { name: "", number: 0, position: "C", teamId: 0 };


const API = "http://localhost:3000/api";

async function request(path: string, method = "GET", body?: object) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) {
    const message = await response.json().catch(() => ({ error: "Request failed" }));
    throw new Error(message.error || `HTTP ${response.status}`);
  }
  // 204 means no content ie. no response body to return
  if (response.status === 204) return null;
  return response.json();
}

export default function App() {
  // state
  const [tab, setTab] = useState<"teams" | "players">("teams");
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [teamForm, setTeamForm] = useState<TeamInput>(emptyTeam);
  const [playerForm, setPlayerForm] = useState<PlayerInput>(emptyPlayer);
  const [teamId, setTeamId] = useState<number | null>(null);
  const [playerId, setPlayerId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function loadData() {
    const teamData = await request("/teams");
    const playerData = await request("/players");
    setTeams(teamData);
    setPlayers(playerData);
  }

  useEffect(() => {
    loadData().catch((e) => setError(e.message));
  }, []);

  async function saveTeam(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (teamId === null) {
        await request("/teams", "POST", teamForm);
      } else {
        await request(`/teams/${teamId}`, "PUT", teamForm);
      }
      setTeamForm(emptyTeam);
      setTeamId(null);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save team");
    } finally {
      setBusy(false);
    }
  }

  async function savePlayer(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (playerId === null) {
        await request("/players", "POST", playerForm);
      } else {
        await request(`/players/${playerId}`, "PUT", playerForm);
      }
      setPlayerForm(emptyPlayer);
      setPlayerId(null);
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save player");
    } finally {
      setBusy(false);
    }
  }

  async function remove(path: string) {
    if (!window.confirm("Delete this record?")) return;
    setBusy(true);
    setError("");
    try {
      await request(path, "DELETE");
      await loadData();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not delete");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="shell">
      <header>
        <div><span className="eyebrow">FULL STACK LEARNING LAB</span><h1>🏒 NHL Hockey Hub</h1><p>Practice create, read, update and delete with a real PostgreSQL database.</p></div>
        <span className="pill">React · Express · Prisma · PostgreSQL</span>
      </header>

      <div className="tabs">
        <button className={tab === "teams" ? "selected" : ""} onClick={() => { setTab("teams"); setError(""); }}>Teams ({teams.length})</button>
        <button className={tab === "players" ? "selected" : ""} onClick={() => { setTab("players"); setError(""); }}>Players ({players.length})</button>
      </div>
      {error && <p className="alert" role="alert">{error}</p>}

      {tab === "teams" ? (
        <div className="columns">
          <section className="panel">
            <h2>{teamId === null ? "Add a team" : "Edit team"}</h2>
            <p className="hint">All fields are required. Team code must be 2–4 letters.</p>
            <form onSubmit={saveTeam}>
              <label>Team name
                <input 
                  required 
                  value={teamForm.name} 
                  onChange={(e) => setTeamForm({ 
                    ...teamForm, name: e.target.value // recall spread operator makes copy of existing properties and replaces the name.
                    })} 
                    placeholder="Enter your favourite team!" 
                /></label>
              <label>Abbreviation<input required maxLength={4} value={teamForm.code} onChange={(e) => setTeamForm({ ...teamForm, code: e.target.value.toUpperCase() })} placeholder="WPG" /></label>
              <label>City<input required value={teamForm.city} onChange={(e) => setTeamForm({ ...teamForm, city: e.target.value })} placeholder="Winnipeg" /></label>
              <button className="primary" disabled={busy}>{busy ? "Working..." : teamId === null ? "Create team" : "Save changes"}</button>
              {teamId !== null && <button type="button" className="secondary" onClick={() => { setTeamId(null); setTeamForm(emptyTeam); }}>Cancel</button>}
            </form>
          </section>
          <section className="panel">
            <h2>Team directory</h2>
            {teams.length === 0 && <p className="hint">No teams yet. Add your first team.</p>}
            {teams.map((team) => (
              <div className="item" key={team.id}>
                <div><strong>{team.name}</strong><small>{team.code} · {team.city}</small></div>
                <div className="actions">
                  <button className="secondary" onClick={() => { setTeamId(team.id); setTeamForm({ name: team.name, code: team.code, city: team.city }); }}>Edit</button>
                  <button className="delete" disabled={busy} onClick={() => void remove(`/teams/${team.id}`)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      ) : (
        <div className="columns">
          <section className="panel">
            <h2>{playerId === null ? "Add a player" : "Edit player"}</h2>
            <p className="hint">Create a team before adding players.</p>
            <form onSubmit={savePlayer}>
              <label>Player name<input required value={playerForm.name} onChange={(e) => setPlayerForm({ ...playerForm, name: e.target.value })} placeholder="Mark Scheifele" /></label>
              <label>Jersey number<input type="number" min="0" max="99" required value={playerForm.number} onChange={(e) => setPlayerForm({ ...playerForm, number: Number(e.target.value) })} /></label>
              <label>Position<select value={playerForm.position} onChange={(e) => setPlayerForm({ ...playerForm, position: e.target.value })}>{["C", "LW", "RW", "D", "G"].map((p) => <option key={p}>{p}</option>)}</select></label>
              <label>Team<select required value={playerForm.teamId || ""} onChange={(e) => setPlayerForm({ ...playerForm, teamId: Number(e.target.value) })}>
                <option value="">Select a team</option>
                {teams.map((team) => <option value={team.id} key={team.id}>{team.name}</option>)}
              </select></label>
              <button className="primary" disabled={busy || teams.length === 0}>{busy ? "Working..." : playerId === null ? "Create player" : "Save changes"}</button>
              {playerId !== null && <button type="button" className="secondary" onClick={() => { setPlayerId(null); setPlayerForm(emptyPlayer); }}>Cancel</button>}
            </form>
          </section>
          <section className="panel">
            <h2>Players</h2>
            {players.length === 0 && <p className="hint">No players yet.</p>}
            {players.map((player) => (
              <div className="item" key={player.id}>
                <div><strong>#{player.number} {player.name}</strong><small>{player.position} · {player.team.name}</small></div>
                <div className="actions">
                  <button className="secondary" onClick={() => { setPlayerId(player.id); setPlayerForm({ name: player.name, number: player.number, position: player.position, teamId: player.teamId }); }}>Edit</button>
                  <button className="delete" disabled={busy} onClick={() => void remove(`/players/${player.id}`)}>Delete</button>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}
      <footer>Learning example with illustrative NHL team and player data. Database records persist in Docker's PostgreSQL volume.</footer>
    </main>
  );
}
