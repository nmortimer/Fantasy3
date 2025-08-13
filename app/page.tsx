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

type LeaguePayload = { league: { id: string; name: string }; teams: Team[] };

export default function Page() {
  const [leagueId, setLeagueId] = useState("");
  const [league, setLeague] = useState<LeaguePayload | null>(null);
  const [loading, setLoading] = useState(false);

  const loadLeague = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/league?leagueId=${leagueId}`);
      const data: LeaguePayload | { error: string } = await res.json();
      if (!res.ok) throw new Error((data as any).error || "Failed to load league");
      setLeague(data as LeaguePayload);
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const updateTeam = (teamId: string, patch: Partial<Team>) => {
    if (!league) return;
    setLeague({
      ...league,
      teams: league.teams.map((t) => (t.teamId === teamId ? { ...t, ...patch } : t))
    });
  };

  return (
    <main className="container">
      <h1>Fantasy Football AI — Free Logo MVP</h1>

      <div className="card row">
        <input
          placeholder="Enter Sleeper League ID"
          value={leagueId}
          onChange={(e) => setLeagueId(e.target.value)}
          style={{ width: 420 }}
        />
        <button onClick={loadLeague} disabled={loading || !leagueId}>
          {loading ? "Loading…" : "Load League"}
        </button>
      </div>

      {league && (
        <>
          <h2>{league.league.name}</h2>
          <div className="cards">
            {league.teams.map((t) => (
              <TeamCard key={t.teamId} team={t} onUpdate={updateTeam} />
            ))}
          </div>
        </>
      )}

      <div className="footer">
        Provider: Pollinations (FLUX). For production, pin images to S3/CDN.
      </div>
    </main>
  );
}
