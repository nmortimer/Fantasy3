"use client";
import { useState } from "react";
import TeamCard from "@/components/TeamCard";

type Team = {
  teamId:string; owner:string; teamName:string; mascot:string;
  primary:string; secondary:string; logo:string|null;
};
type League = { league:{id:string; name:string}; teams:Team[] };

export default function Page(){
  const [leagueId,setLeagueId]=useState("");
  const [league,setLeague]=useState<League|null>(null);
  const [loading,setLoading]=useState(false);

  const loadLeague=async()=>{
    try{
      setLoading(true);
      const r=await fetch(`/api/league?leagueId=${leagueId}`);
      const data=await r.json();
      if(!r.ok) throw new Error(data.error||"Failed to load league");
      setLeague(data);
    }catch(e:any){ alert(e.message); }finally{ setLoading(false); }
  };

  const updateTeam=(teamId:string, patch:Partial<Team>)=>{
    if(!league) return;
    setLeague({...league, teams: league.teams.map(t=>t.teamId===teamId?{...t,...patch}:t)});
  };

  return (
    <main className="container">
      <div className="h1">Fantasy Football AI — Free Logo MVP</div>

      <div className="toolbar">
        <input placeholder="Enter Sleeper League ID" value={leagueId} onChange={(e)=>setLeagueId(e.target.value)} />
        <button onClick={loadLeague} disabled={loading||!leagueId}>{loading?"Loading…":"Load League"}</button>
      </div>

      {league && <>
        <div className="h2">{league.league.name}</div>
        <div className="cards">
          {league.teams.map(t=>(
            <TeamCard key={t.teamId} team={t} onUpdate={updateTeam} />
          ))}
        </div>
      </>}

      <div style={{opacity:.7,fontSize:12}}>
        No text policy is enforced in prompting. Click an image to view full size. Consider S3 pinning for production.
      </div>
    </main>
  );
}
