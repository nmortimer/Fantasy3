import { NextRequest, NextResponse } from "next/server";

function deriveMascot(teamName: string) {
  if (!teamName) return "Fox";
  const cleaned = teamName
    .replace(/\b(the|team|club|fc|sc|cf|afc|of|and|&)\b/gi, "")
    .replace(/[^a-z0-9\s-]/gi, "")
    .trim()
    .replace(/\s+/g, " ");
  const parts = cleaned.split(" ").filter(Boolean);
  const pick = parts.length ? parts[parts.length - 1] : teamName;
  return pick.charAt(0).toUpperCase() + pick.slice(1);
}

// Predefined mascot-based colors
const mascotColors: Record<string, { primary: string; secondary: string }> = {
  fox: { primary: "#ff6b00", secondary: "#333333" },
  wolf: { primary: "#555555", secondary: "#c0c0c0" },
  eagle: { primary: "#002244", secondary: "#c60c30" },
  bear: { primary: "#4b2e2b", secondary: "#d1b271" },
  shark: { primary: "#0a3d62", secondary: "#60a3bc" },
  lion: { primary: "#f4c542", secondary: "#8b4513" },
  tiger: { primary: "#ff6600", secondary: "#000000" },
  dragon: { primary: "#006400", secondary: "#8b0000" },
  stallion: { primary: "#222222", secondary: "#cccccc" }
};

// Generic palette if mascot is not in the map
const palettePool = [
  { primary: "#ff6b6b", secondary: "#1a1a1a" },
  { primary: "#1e90ff", secondary: "#f8f8ff" },
  { primary: "#2ecc71", secondary: "#145a32" },
  { primary: "#e67e22", secondary: "#1a1a1a" },
  { primary: "#9b59b6", secondary: "#2c3e50" },
  { primary: "#f1c40f", secondary: "#1a1a1a" },
  { primary: "#e74c3c", secondary: "#1a1a1a" }
];

function assignColors(mascot: string) {
  const key = mascot.toLowerCase();
  if (mascotColors[key]) return mascotColors[key];
  // Fallback: deterministic selection from palette based on mascot string hash
  const hash = [...key].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  return palettePool[hash % palettePool.length];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId");
  if (!leagueId) return NextResponse.json({ error: "leagueId is required" }, { status: 400 });

  const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`, { cache: "no-store" });
  if (!leagueRes.ok) return NextResponse.json({ error: "League not found" }, { status: 404 });
  const league = await leagueRes.json();

  const usersRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`, { cache: "no-store" });
  const rostersRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`, { cache: "no-store" });
  const [users, rosters] = await Promise.all([usersRes.json(), rostersRes.json()]);

  const teams = rosters.map((r: any) => {
    const u = users.find((x: any) => x.user_id === r.owner_id);
    const teamName = u?.metadata?.team_name || `${league.name} Team ${r.roster_id}`;
    const mascot = deriveMascot(teamName);
    const colors = assignColors(mascot);
    return {
      teamId: String(r.roster_id),
      owner: u?.display_name ?? "Unknown",
      teamName,
      mascot,
      primary: colors.primary,
      secondary: colors.secondary,
      logo: null as string | null
    };
  });

  return NextResponse.json({ league: { id: leagueId, name: league.name }, teams });
}
