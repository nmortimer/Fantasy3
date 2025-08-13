"use client";

import { useState } from "react";
import TeamCard from "@/components/TeamCard";

type Team = {
  teamId: string;
  owner: string;
  teamName: string;
  mascot: string;
  primary: string;
  secondary: string;
  logo: string | null;
};

type LeaguePayload = {
  league: { id: string; name: string };
  teams: Team[];
};

export default function Page() {
  const [leagueId, setLeagueId] = useState("");
  const [league, setLeague] = useState<LeaguePayload | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadLeague() {
    try {
      setLoading(true);
      const res = await fetch(`/api/league?leagueId=${encodeURIComponent(leagueId)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to load league");
      setLeague(data);
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  function updateTeam(teamId: string, patch: Partial<Team>) {
    if (!league) return;
    setLeague({
      ...league,
      teams: league.teams.map((t) => (t.teamId === teamId ? { ...t, ...patch } : t)),
    });
  }

  return (
    <main className="container">
      {/* Header */}
      <div className="row" style={{ justifyContent: "space-between", alignItems: "end" }}>
        <div>
          <h1 className="h1">Fantasy Football AI — Free Logo MVP</h1>
          <div className="subtle">Generate simple, pro‑quality mascot marks for your Sleeper league.</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <input
          placeholder="Enter Sleeper League ID"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          aria-label="Sleeper League ID"
        />
        <button className="btn btn-primary" onClick={loadLeague} disabled={loading || !leagueId}>
          {loading ? "Loading…" : "Load League"}
        </button>
      </div>

      {/* League Grid */}
      {league && (
        <>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <div className="subtle" style={{ fontSize: 16 }}>
              {league.league.name}
            </div>
            {/* (Optional) Generate All could go here later */}
          </div>

          <section className="cards">
            {league.teams.map((t) => (
              <TeamCard key={t.teamId} team={t} onUpdate={updateTeam} />
            ))}
          </section>
        </>
      )}

      <div className="footer">Tip: click a logo to see it full‑size. Use “New Seed” to try another composition.</div>
    </main>
  );
}
