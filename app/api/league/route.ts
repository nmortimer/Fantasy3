import { NextRequest, NextResponse } from "next/server";
import { colorsFor, clean } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const leagueId = searchParams.get("leagueId");
  if (!leagueId) return NextResponse.json({ error: "leagueId is required" }, { status: 400 });

  const leagueRes = await fetch(`https://api.sleeper.app/v1/league/${leagueId}`, { cache: "no-store" });
  if (!leagueRes.ok) return NextResponse.json({ error: "League not found" }, { status: 404 });
  const league = await leagueRes.json();

  const [users, rosters] = await Promise.all([
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/users`, { cache: "no-store" }).then(r=>r.json()),
    fetch(`https://api.sleeper.app/v1/league/${leagueId}/rosters`, { cache: "no-store" }).then(r=>r.json())
  ]);

  const teams = rosters.map((r:any) => {
    const u = users.find((x:any)=>x.user_id===r.owner_id);
    const nameRaw = u?.metadata?.team_name || `${league.name} Team ${r.roster_id}`;
    const teamName = clean(nameRaw);
    const mascot = teamName; // prefilled; prompt derives depict term
    const colors = colorsFor(teamName, mascot);
    return {
      teamId: String(r.roster_id),
      owner: u?.display_name ?? "Unknown",
      teamName, mascot,
      primary: colors.primary, secondary: colors.secondary,
      logo: null as string | null
    };
  });

  return NextResponse.json({ league: { id: leagueId, name: league.name }, teams });
}
