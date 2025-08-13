import { mascotFromTeam, clean } from "@/lib/utils";

export type LogoPromptInputs = {
  teamName: string;
  mascot: string;        // can be the full team name; we derive a depict term
  primaryColor: string;  // hex like #1e90ff
  secondaryColor: string;
};

function depictTerm(teamName: string, mascot: string) {
  // Single, brandable mascot noun (e.g., "Foxes" -> "Fox")
  const t = clean(teamName);
  return mascotFromTeam(t);
}

export function buildLogoPrompt({ teamName, mascot, primaryColor, secondaryColor }: LogoPromptInputs) {
  const depict = depictTerm(teamName, mascot);
  return (
    // Framing
    `Professional minor‑league sports **mascot emblem** for ${teamName}. ` +
    // What to draw
    `Depict a ${depict} as a flat vector mark with bold, clean lines, consistent thick outline, simple geometric shapes, strong silhouette, centered composition. ` +
    // Color: force real color usage (no monochrome)
    `Use BOTH team colors prominently as solid fills: primary ${primaryColor} and secondary ${secondaryColor}. ` +
    `Use black/white only for outline and contrast; do **not** produce a grayscale or monochrome logo. ` +
    // Background + constraints
    `Plain white background. ` +
    // NO TEXT under any circumstance
    `Absolutely **no text**, letters, words, numbers, banners, rings with lettering, badges with lettering, or wordmarks anywhere. ` +
    // Keep it simple, MiLB‑style
    `No gradients, no shadows, no 3D, no photo, no extra objects, no scene.`
  );
}

export function pollinationsURL(
  prompt: string,
  seed: string | number = "random",
  width = 1024,
  height = 1024
) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?seed=${seed}&width=${width}&height=${height}&nologo=true`;
}
