"use client";
import { useMemo, useState } from "react";
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

// --- local palette helper so you can remix colors client-side too ---
const MASCOT_PALETTE: Record<string, { primary: string; secondary: string }[]> = {
  fox: [
    { primary: "#ff6b00", secondary: "#222222" },
    { primary: "#e85d04", secondary: "#1f1f1f" },
    { primary: "#ffa94d", secondary: "#1a1a1a" }
  ],
  wolf: [
    { primary: "#626b73", secondary: "#cdd2d6" },
    { primary: "#4a5568", secondary: "#cbd5e0" }
  ],
  eagle: [
    { primary: "#002244", secondary: "#c60c30" },
    { primary: "#0b3d91", secondary: "#e6e6e6" }
  ],
  bear: [
    { primary: "#4b2e2b", secondary: "#d1b271" },
    { primary: "#5e3b2e", secondary: "#f0d190" }
  ],
  shark: [
    { primary: "#0a3d62", secondary: "#60a3bc" },
    { primary: "#0f4c5c", secondary: "#b1d4e0" }
  ],
  lion: [
    { primary: "#f4c542", secondary: "#8b4513" },
    { primary: "#d4a017", secondary: "#5a3815" }
  ],
  tiger: [
    { primary: "#ff6600", secondary: "#000000" },
    { primary: "#ff7a00", secondary: "#1a1a1a" }
  ],
  dragon: [
    { primary: "#006400", secondary: "#8b0000" },
    { primary: "#0b6b3a", secondary: "#7a1e1e" }
  ],
  stallion: [
    { primary: "#222222", secondary: "#cccccc" },
    { primary: "#2b2b2b", secondary: "#e5e7eb" }
  ]
};

const FALLBACK_POOL = [
  { primary: "#ff6b6b", secondary: "#1a1a1a" },
  { primary: "#1e90ff", secondary: "#f8f8ff" },
  { primary: "#2ecc71", secondary: "#145a32" },
  { primary: "#e67e22", secondary: "#1a1a1a" },
  { primary: "#9b59b6", secondary: "#2c3e50" },
  { primary: "#f1c40f", secondary: "#1a1a1a" },
  { primary: "#e74c3c", secondary: "#1a1a1a" }
];

function remixColorsForMascot(mascotRaw: string, attempt = 0) {
  const key = mascotRaw.toLowerCase();
  const bankKey = Object.keys(MASCOT_PALETTE).find(k => key.includes(k));
  const bank = bankKey ? MASCOT_PALETTE[bankKey] : FALLBACK_POOL;
  // deterministic-ish pick that changes with attempt
  const base = [...key].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) + attempt;
  return bank[base % bank.length];
}

export default function TeamCard({ team, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);
  const [seed, setSeed] = useState<string>(Math.floor(Math.random() * 1e9).toString());
  const [remixAttempt, setRemixAttempt] = useState(0);
  const [showFull, setShowFull] = useState(false);

  const suggestedColors = useMemo(
    () => remixColorsForMascot(team.mascot || team.teamName, remixAttempt),
    [team.mascot, team.teamName, remixAttempt]
  );

  const applyRemix = () => {
    onUpdate(team.teamId, { primary: suggestedColors.primary, secondary: suggestedColors.secondary });
    setRemixAttempt(remixAttempt + 1);
  };

  const generate = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/generate-logo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId: team.teamId,
          teamName: team.teamName,   // full name goes to prompt
          mascot: team.mascot,       // mascot stays explicit
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
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start" }}>
        {/* Left: controls */}
        <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
          <strong style={{ fontSize: 16, lineHeight: 1.2 }}>{team.teamName}</strong>
          <span style={{ opacity: 0.8, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}>
            Owner: {team.owner}
          </span>

          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ opacity: 0.75, minWidth: 70 }}>Mascot</label>
              <input
                value={team.mascot}
                onChange={(e) => onUpdate(team.teamId, { mascot: e.target.value })}
              />
            </div>

            <ColorPicker
              label="Primary"
              value={team.primary}
              onChange={(v) => onUpdate(team.teamId, { primary: v })}
            />
            <ColorPicker
              label="Secondary"
              value={team.secondary}
              onChange={(v) => onUpdate(team.teamId, { secondary: v })}
            />

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <label style={{ opacity: 0.75, minWidth: 70 }}>Seed</label>
              <input value={seed} onChange={(e) => setSeed(e.target.value)} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={generate} disabled={loading}>
              {loading ? "Generating…" : "Generate"}
            </button>
            <button onClick={() => setSeed(Math.floor(Math.random() * 1e9).toString())}>
              New Seed
            </button>
            <button onClick={applyRemix} title="Pick mascot-based colors">
              Remix Colors
            </button>
          </div>

          {/* small hint of suggested palette */}
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 12, opacity: 0.7 }}>Suggested:</span>
            <div style={{ width: 18, height: 18, borderRadius: 6, background: suggestedColors.primary, border: "1px solid #333" }} />
            <div style={{ width: 18, height: 18, borderRadius: 6, background: suggestedColors.secondary, border: "1px solid #333" }} />
          </div>
        </div>

        {/* Right: larger logo (click to view full size) */}
        <div
          onClick={() => team.logo && setShowFull(true)}
          style={{
            width: 360,
            height: 360,
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
            borderRadius: 12,
            background: "#0a0b0c",
            border: "1px solid var(--border)",
            cursor: team.logo ? "zoom-in" : "default"
          }}
        >
          {team.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={team.logo}
              alt="Team logo"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          ) : (
            <span style={{ opacity: 0.6 }}>No logo yet</span>
          )}
        </div>
      </div>

      {/* Simple full-size modal */}
      {showFull && team.logo && (
        <div
          onClick={() => setShowFull(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.6)",
            display: "grid",
            placeItems: "center",
            zIndex: 1000
          }}
        >
          <div
            style={{
              maxWidth: "90vw",
              maxHeight: "90vh",
              background: "#0a0b0c",
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 8
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={team.logo}
              alt={`${team.teamName} logo full size`}
              style={{ maxWidth: "86vw", maxHeight: "86vh", objectFit: "contain", display: "block" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
