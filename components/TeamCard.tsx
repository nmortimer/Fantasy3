"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/Modal";
import ColorPicker from "@/components/ColorPicker";
import { colorsFor } from "@/lib/utils";

type Team = {
  teamId: string;
  owner: string;
  teamName: string;
  mascot: string;
  primary: string;
  secondary: string;
  logo: string | null;
};

type Props = { team: Team; onUpdate: (teamId: string, patch: Partial<Team>) => void };

export default function TeamCard({ team, onUpdate }: Props) {
  const [seed, setSeed] = useState<string>(String(Math.floor(Math.random() * 1e9)));
  const [generating, setGenerating] = useState(false);
  const [showFull, setShowFull] = useState(false);
  const [remixTick, setRemixTick] = useState(0);

  // A deterministic suggestion that changes each click but stays brand‑coherent
  const suggestion = useMemo(
    () => colorsFor(team.teamName + "|" + remixTick, team.mascot),
    [team.teamName, team.mascot, remixTick]
  );

  function applySuggestion() {
    onUpdate(team.teamId, { primary: suggestion.primary, secondary: suggestion.secondary });
    setRemixTick((x) => x + 1);
  }

  async function generate() {
    try {
      setGenerating(true);
      const res = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.teamId,
          teamName: team.teamName,     // full name as brand context
          mascot: team.mascot,         // may equal team name; server derives depict noun
          primaryColor: team.primary,
          secondaryColor: team.secondary,
          seed,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Generation failed");
      onUpdate(team.teamId, { logo: data.imageUrl });
    } catch (e: any) {
      alert(e.message);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <article className="card">
      <div className="row" style={{ alignItems: "flex-start", justifyContent: "space-between" }}>
        {/* Preview */}
        <div
          className={`preview ${team.logo ? "click" : ""}`}
          onClick={() => team.logo && setShowFull(true)}
          aria-label={`Preview for ${team.teamName}`}
        >
          {team.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={team.logo} alt={`${team.teamName} logo`} />
          ) : (
            <span className="subtle">No logo yet</span>
          )}
        </div>

        {/* Controls */}
        <section className="editor" style={{ flex: 1 }}>
          <header className="stack-sm">
            <div className="title">{team.teamName}</div>
            <div className="owner">Owner: {team.owner}</div>
          </header>

          <div className="col">
            {/* Mascot (prefilled with team name) */}
            <div className="row group" style={{ gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label>Mascot</label>
                <input
                  value={team.mascot}
                  onChange={(e) => onUpdate(team.teamId, { mascot: e.target.value })}
                  title="Prefilled with team name; prompt derives a clean mascot noun (e.g., Fox, Wolf)"
                  aria-label="Mascot"
                />
              </div>
            </div>

            {/* Colors */}
            <div className="row" style={{ gap: 16 }}>
              <div style={{ flex: 1 }}>
                <ColorPicker
                  label="Primary"
                  value={team.primary}
                  onChange={(v) => onUpdate(team.teamId, { primary: v })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <ColorPicker
                  label="Secondary"
                  value={team.secondary}
                  onChange={(v) => onUpdate(team.teamId, { secondary: v })}
                />
              </div>
            </div>

            {/* Live chips & suggestion */}
            <div className="row" style={{ gap: 12 }}>
              <span className="subtle" style={{ fontSize: 12 }}>
                Current:
              </span>
              <div className="swatch" style={{ background: team.primary }} />
              <div className="swatch" style={{ background: team.secondary }} />

              <span className="subtle" style={{ fontSize: 12, marginLeft: 14 }}>
                Suggested:
              </span>
              <div className="swatch" style={{ background: suggestion.primary }} />
              <div className="swatch" style={{ background: suggestion.secondary }} />
              <button className="btn" onClick={applySuggestion} title="Try a mascot‑guided palette">
                Remix Colors
              </button>
            </div>

            {/* Seed & actions */}
            <div className="row" style={{ gap: 12 }}>
              <div style={{ width: 220 }}>
                <label>Seed</label>
                <input value={seed} onChange={(e) => setSeed(e.target.value)} aria-label="Seed" />
              </div>
              <button
                className="btn"
                onClick={() => setSeed(String(Math.floor(Math.random() * 1e9)))}
                title="Randomize seed"
              >
                New Seed
              </button>
              <button className="btn btn-primary" onClick={generate} disabled={generating}>
                {generating ? "Generating…" : "Generate"}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Full‑size modal */}
      <Modal open={!!showFull && !!team.logo} onClose={() => setShowFull(false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={team.logo || ""}
          alt={`${team.teamName} logo full`}
          style={{ maxWidth: "86vw", maxHeight: "86vh", objectFit: "contain", background: "#fff" }}
        />
      </Modal>
    </article>
  );
}
