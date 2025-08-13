"use client";
import { useMemo, useState } from "react";
import ColorPicker from "@/components/ColorPicker";
import Modal from "@/components/Modal";
import { colorsFor } from "@/lib/utils";

type Team = {
  teamId: string;
  owner: string;
  teamName: string;
  mascot: string;   // prefilled with teamName (prompt derives depict noun)
  primary: string;
  secondary: string;
  logo: string | null;
};

type Props = { team: Team; onUpdate: (teamId: string, patch: Partial<Team>) => void };

export default function TeamCard({ team, onUpdate }: Props) {
  const [seed, setSeed] = useState<string>(Math.floor(Math.random() * 1e9).toString());
  const [loading, setLoading] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [remixTick, setRemixTick] = useState(0);

  // deterministic suggestion that changes each click
  const suggestion = useMemo(
    () => colorsFor(team.teamName + "|" + remixTick, team.mascot),
    [team.teamName, team.mascot, remixTick]
  );

  const applySuggestion = () => {
    onUpdate(team.teamId, { primary: suggestion.primary, secondary: suggestion.secondary });
    setRemixTick(remixTick + 1);
  };

  const generate = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.teamId,
          teamName: team.teamName,     // full name in brand line
          mascot: team.mascot,         // may equal team name; prompt derives depict term
          primaryColor: team.primary,
          secondaryColor: team.secondary,
          seed
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      onUpdate(team.teamId, { logo: data.imageUrl });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="row" style={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        {/* Large inline preview (no popout editor) */}
        <div
          className={`preview ${team.logo ? "click" : ""}`}
          onClick={() => team.logo && setShowFull(true)}
        >
          {team.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logo} alt={`${team.teamName} logo`} />
          ) : (
            <span style={{ opacity: 0.6 }}>No logo yet</span>
          )}
        </div>

        {/* Tight inline editor */}
        <div className="editor" style={{ flex: 1 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{team.teamName}</div>
            <div style={{ color: "var(--muted)" }}>Owner: {team.owner}</div>
          </div>

          {/* Mascot (prefilled with team name) */}
          <div className="row" style={{ gap: 14 }}>
            <div style={{ flex: 1 }}>
              <label>Mascot</label>
              <input
                value={team.mascot}
                onChange={(e) => onUpdate(team.teamId, { mascot: e.target.value })}
                title="Prefilled with team name; prompt derives a clean mascot noun"
              />
            </div>
          </div>

          {/* Colors – pickers + live chips are inside component, but we also show 'Current' row below */}
          <div className="row" style={{ gap: 14 }}>
            <div style={{ flex: 1 }}>
              <ColorPicker label="Primary" value={team.primary} onChange={(v) => onUpdate(team.teamId, { primary: v })} />
            </div>
            <div style={{ flex: 1 }}>
              <ColorPicker label="Secondary" value={team.secondary} onChange={(v) => onUpdate(team.teamId, { secondary: v })} />
            </div>
          </div>

          {/* Current vs Suggested chips */}
          <div className="row" style={{ gap: 12 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>Current:</span>
            <div className="swatch" style={{ background: team.primary }} />
            <div className="swatch" style={{ background: team.secondary }} />
            <span style={{ marginLeft: 14, fontSize: 12, color: "var(--muted)" }}>Suggested:</span>
            <div className="swatch" style={{ background: suggestion.primary }} />
            <div className="swatch" style={{ background: suggestion.secondary }} />
            <button onClick={applySuggestion} title="Try a mascot‑guided palette">Remix Colors</button>
          </div>

          {/* Seed + Generate */}
          <div className="row" style={{ gap: 10 }}>
            <div style={{ flex: 1, maxWidth: 220 }}>
              <label>Seed</label>
              <input value={seed} onChange={(e) => setSeed(e.target.value)} />
            </div>
            <button onClick={() => setSeed(Math.floor(Math.random() * 1e9).toString())}>New Seed</button>
            <button onClick={generate} disabled={loading}>
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>
        </div>
      </div>

      {/* Full-size modal */}
      <Modal open={!!showFull && !!team.logo} onClose={() => setShowFull(false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={team.logo || ""}
          alt={`${team.teamName} logo full`}
          style={{ maxWidth: "86vw", maxHeight: "86vh", objectFit: "contain", background: "#fff" }}
        />
      </Modal>
    </div>
  );
}
