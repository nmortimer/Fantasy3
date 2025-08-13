export function titleCase(s: string) {
  return s.replace(/\w\S*/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase());
}

export function cleanTeamName(name: string) {
  return name.replace(/[^\w\s-]/g, " ").replace(/\s+/g, " ").trim();
}

// Very simple singularize for sports-y plurals
export function singularize(word: string) {
  const w = word.toLowerCase();
  if (w.endsWith("ies")) return word.slice(0, -3) + "y";        // Bunnies -> Bunny
  if (w.endsWith("ves")) return word.slice(0, -3) + "f";        // Wolves -> Wolf
  if (w.endsWith("xes")) return word.slice(0, -2);              // Foxes -> Fox
  if (w.endsWith("s") && !w.endsWith("ss")) return word.slice(0, -1);
  return word;
}

// Derive a mascot term from the team name (drop numbers and filler words, take last meaningful token)
export function deriveMascotFromName(teamName: string) {
  const cleaned = cleanTeamName(teamName).toLowerCase();
  const stop = new Set(["the","team","club","fc","sc","cf","afc","of","and","league","nations"]);
  const tokens = cleaned.split(/\s+/).filter(Boolean).filter(t => !stop.has(t) && !/^\d+$/.test(t));
  const pick = tokens.length ? tokens[tokens.length - 1] : (tokens[0] || "Mascot");
  const sg = singularize(pick);
  return titleCase(sg);
}

export function hashString(s: string) {
  return [...s].reduce((acc, ch) => (acc + ch.charCodeAt(0)) >>> 0, 0);
}

const MASCOT_COLOR_BANK: Record<string, { primary: string; secondary: string }[]> = {
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

export function assignColorsForTeam(teamName: string, mascot: string) {
  const key = (mascot || teamName).toLowerCase();
  const bankKey = Object.keys(MASCOT_COLOR_BANK).find(k => key.includes(k));
  const bank = bankKey ? MASCOT_COLOR_BANK[bankKey] : FALLBACK_POOL;
  const idx = hashString(key + "|" + teamName) % bank.length;
  return bank[idx];
}

// Choose the best “depict” term for the art prompt
export function chooseDepictTerm(teamName: string, mascot: string) {
  const cleanedMascot = cleanTeamName(mascot);
  const cleanedTeam = cleanTeamName(teamName);
  // If mascot equals the team name or looks generic, derive a better mascot from the team name
  if (!cleanedMascot || cleanedMascot.toLowerCase() === cleanedTeam.toLowerCase() || cleanedMascot.length < 3) {
    return deriveMascotFromName(cleanedTeam);
  }
  return cleanedMascot;
}
