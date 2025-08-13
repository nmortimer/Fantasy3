"use client";
import { useMemo, useState } from "react";
import ColorPicker from "@/components/ColorPicker";
import Modal from "@/components/Modal";
import { assignColorsForTeam } from "@/lib/utils";

type Team = {
  teamId: string;
  owner: string;
  teamName: string;
  mascot: string;          // prefilled with full team name
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
  const [showFull, setShowFull] = useState(false);
  const [remixBump, setRemixBump] = useState(0);

  const suggested = useMemo(() => {
    // change suggestion each click while staying deterministic per team/mascot
    const temp = assignColorsForTeam(team.teamName + "|" + remixBump, team.mascot);
    return temp;
  }, [team.teamName, team.mascot, remixBump]);

  const applyRemix = () => {
    onUpdate(team.teamId, { primary: suggested.primary, secondary: suggested.secondary });
    setRemixBump(remixBump + 1);
  };

  const autoFromName = () => {
    // just set mascot equal to the full team name again (prompt chooses a depict term)
    onUpdate(team.teamId, { mascot: team.teamName });
  };

  const generate = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.teamId,
          teamName: team.teamName,   // full name used in prompt header
          mascot: team.mascot,       // may equal full name; prompt picks depict term
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
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
        {/* Preview */}
        <div
          className={`logoBox ${team.logo ? "clickable" : ""}`}
          onClick={() => team.logo && setShowFull(true)}
        >
          {team.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="logoImg" src={team.logo} alt={`${team.teamName} logo`} />
          ) : (
            <span style={{ opacity: .6 }}>No logo yet</span>
          )}
        </div>

        {/* Controls */}
        <div className="col" style={{ minWidth: 0, flex: 1 }}>
          <div>
            <strong style={{ fontSize: 16 }}>{team.teamName}</strong>
            <div style={{ color: "#a6adbb" }}>Owner: {team.owner}</div>
          </div>

          <div className="col">
            <div className="row">
              <label style={{ minWidth: 90 }}>Mascot</label>
              <input
                value={team.mascot}
                onChange={(e) => onUpdate(team.teamId, { mascot: e.target.value })}
                title="Used for what to depict (auto is team name)"
              />
              <button onClick={autoFromName} title="Reset mascot to team name">Auto</button>
            </div>

            <ColorPicker label="Primary" value={team.primary} onChange={(v) => onUpdate(team.teamId, { primary: v })} />
            <ColorPicker label="Secondary" value={team.secondary} onChange={(v) => onUpdate(team.teamId, { secondary: v })} />

            <div className="row">
              <label style={{ minWidth: 90 }}>Seed</label>
              <input value={seed} onChange={(e) => setSeed(e.target.value)} />
              <button onClick={() => setSeed(Math.floor(Math.random() * 1e9).toString())}>New Seed</button>
              <button onClick={applyRemix} title="Try another mascot‑guided palette">Remix Colors</button>
            </div>
          </div>

          <div className="row">
            <button onClick={generate} disabled={loading}>
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>

          {/* Suggestion swatches */}
          <div className="row" style={{ marginTop: 4 }}>
            <span style={{ fontSize:12, opacity:.7 }}>Suggested:</span>
            <div className="colorDot" style={{ background: suggested.primary }} />
            <div className="colorDot" style={{ background: suggested.secondary }} />
          </div>
        </div>
      </div>

      {/* Full-size modal */}
      <Modal open={!!showFull && !!team.logo} onClose={() => setShowFull(false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={team.logo || ""} alt={`${team.teamName} logo full`} style={{ maxWidth: "86vw", maxHeight: "86vh", objectFit: "contain" }} />
      </Modal>
    </div>
  );
}
