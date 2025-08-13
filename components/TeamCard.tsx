"use client";
import { useState } from "react";
import ColorPicker from "@/components/ColorPicker";

type Team = {
  teamId: string;
  owner: string;
  teamName: string;
  mascot: string;
  primary: string;
  secondary: string;
  logo: string | null;
};

type Props = {
  team: Team;
  onUpdate: (teamId: string, patch: Partial<Team>) => void;
};

export default function TeamCard({ team, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState<string>(Math.floor(Math.random() * 1e9).toString());

  const generate = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      if (!res.ok) throw new Error(data.error || "Generation failed");
      onUpdate(team.teamId, { logo: data.imageUrl });
    } catch (e) {
      alert((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "grid", gap: 8 }}>
          <strong>{team.teamName}</strong>
          <span style={{ opacity: 0.8 }}>Owner: {team.owner}</span>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ opacity: 0.75, minWidth: 70 }}>Mascot</label>
              <input value={team.mascot} onChange={(e) => onUpdate(team.teamId, { mascot: e.target.value })} />
            </div>
            <ColorPicker label="Primary" value={team.primary} onChange={(v) => onUpdate(team.teamId, { primary: v })} />
            <ColorPicker label="Secondary" value={team.secondary} onChange={(v) => onUpdate(team.teamId, { secondary: v })} />
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ opacity: 0.75, minWidth: 70 }}>Seed</label>
              <input value={seed} onChange={(e) => setSeed(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={generate} disabled={loading}>{loading ? "Generating…" : "Generate"}</button>
            <button onClick={() => setSeed(Math.floor(Math.random() * 1e9).toString())}>New Seed</button>
          </div>
        </div>

        <div style={{
          width: 220, height: 220, display: "grid", placeItems: "center",
          overflow: "hidden", borderRadius: 12, background: "#09090a", border: "1px solid #222"
        }}>
          {team.logo ? (
            <img src={team.logo} alt="Team logo" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <span style={{ opacity: 0.6 }}>No logo yet</span>
          )}
        </div>
      </div>
    </div>
  );
}
