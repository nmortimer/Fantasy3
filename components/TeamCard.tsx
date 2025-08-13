"use client";
import { useMemo, useState } from "react";
import ColorPicker from "@/components/ColorPicker";
import Modal from "@/components/Modal";
import { colorsFor } from "@/lib/utils";

type Team = {
  teamId: string;
  owner: string;
  teamName: string;
  mascot: string;   // prefilled with teamName
  primary: string;
  secondary: string;
  logo: string | null;
};

type Props = { team: Team; onUpdate: (teamId:string, patch:Partial<Team>) => void };

export default function TeamCard({ team, onUpdate }: Props){
  const [seed, setSeed] = useState<string>(Math.floor(Math.random()*1e9).toString());
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [remixTick, setRemixTick] = useState(0);

  const suggestion = useMemo(()=>{
    const c = colorsFor(team.teamName+"|"+remixTick, team.mascot);
    return c;
  }, [team.teamName, team.mascot, remixTick]);

  const applySuggestion = ()=>{ onUpdate(team.teamId, {primary: suggestion.primary, secondary: suggestion.secondary}); setRemixTick(remixTick+1); };

  const generate = async ()=>{
    try{
      setLoading(true);
      const res = await fetch("/api/generate-logo",{
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          teamId: team.teamId,
          teamName: team.teamName,
          mascot: team.mascot,
          primaryColor: team.primary,
          secondaryColor: team.secondary,
          seed
        })
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.error||"Generation failed");
      onUpdate(team.teamId, { logo: data.imageUrl });
    }catch(e:any){ alert(e.message); }finally{ setLoading(false); }
  };

  return (
    <div className="card">
      <div className="row" style={{alignItems:"flex-start", justifyContent:"space-between"}}>
        {/* Preview */}
        <div className={`preview ${team.logo?"click":""}`} onClick={()=>team.logo&&setShowFull(true)}>
          {team.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logo} alt={`${team.teamName} logo`} />
          ) : <span style={{opacity:.6}}>No logo yet</span>}
        </div>

        {/* Editor (compact) */}
        <div className="editor" style={{flex:1}}>
          <div className="row" style={{justifyContent:"space-between"}}>
            <div>
              <div className="h2">{team.teamName}</div>
              <div style={{color:"var(--muted)"}}>Owner: {team.owner}</div>
            </div>
            <button onClick={()=>setOpen(!open)}>{open?"Hide":"Edit"}</button>
          </div>

          {open && (
            <div className="disclosure" style={{display:"grid",gap:10}}>
              <div className="row">
                <label style={{minWidth:90}}>Mascot</label>
                <input value={team.mascot} onChange={(e)=>onUpdate(team.teamId, {mascot:e.target.value})} title="Prefilled with team name. Prompt picks the depict term automatically." />
              </div>

              <ColorPicker label="Primary" value={team.primary} onChange={(v)=>onUpdate(team.teamId,{primary:v})} />
              <ColorPicker label="Secondary" value={team.secondary} onChange={(v)=>onUpdate(team.teamId,{secondary:v})} />

              <div className="row">
                <label style={{minWidth:90}}>Seed</label>
                <input value={seed} onChange={(e)=>setSeed(e.target.value)} />
                <button onClick={()=>setSeed(Math.floor(Math.random()*1e9).toString())}>New Seed</button>
              </div>

              <div className="row">
                <button onClick={generate} disabled={loading}>{loading?"Generating…":"Generate"}</button>
                <button onClick={applySuggestion} title="Try a mascot‑guided palette">Remix Colors</button>
                <div className="row">
                  <span style={{fontSize:12,color:"var(--muted)"}}>Suggested:</span>
                  <div className="swatch" style={{background:suggestion.primary}} />
                  <div className="swatch" style={{background:suggestion.secondary}} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Full-size preview */}
      <Modal open={!!showFull && !!team.logo} onClose={()=>setShowFull(false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={team.logo || ""} alt={`${team.teamName} logo full`} style={{maxWidth:"86vw",maxHeight:"86vh",objectFit:"contain",background:"#fff"}} />
      </Modal>
    </div>
  );
}
