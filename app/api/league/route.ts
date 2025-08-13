import { NextRequest, NextResponse } from "next/server";

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
    return {
      teamId: String(r.roster_id),
      owner: u?.display_name ?? "Unknown",
      teamName: u?.metadata?.team_name || `${league.name} Team ${r.roster_id}`,
      mascot: "Fox",
      primary: "#ff6b00",
      secondary: "#00a3ff",
      logo: null as string | null
    };
  });

  return NextResponse.json({ league: { id: leagueId, name: league.name }, teams });
}
