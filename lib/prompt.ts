import { clean, mascotFromTeam } from "@/lib/utils";

export type LogoPromptInputs = {
  teamName: string;       // full team name (branding context)
  mascot: string;         // can be same as teamName; we'll derive the noun
  primaryColor: string;   // e.g. "#1e90ff"
  secondaryColor: string; // e.g. "#0a3a2a"
};

function depictNoun(teamName: string, mascot: string) {
  // Always resolve to a clean singular mascot noun (Fox, Wolf, Ram, Bear, Eagle, etc.)
  return mascotFromTeam(clean(teamName));
}

/**
 * Produces an on‑brand sports logo prompt:
 *  - flat vector, thick outline, 2–3 colors
 *  - centered bust/head mark
 *  - ZERO text/wordmarks/banners/rings
 *  - no gradients/3D/photorealism
 */
export function buildLogoPrompt({
  teamName,
  mascot,
  primaryColor,
  secondaryColor,
}: LogoPromptInputs) {
  const noun = depictNoun(teamName, mascot);

  return [
    // Style family
    `Modern professional sports team mascot logo (NHL / MiLB / esports quality).`,
    // What to draw
    `Subject: ${noun} mascot — head/bust emblem, dynamic yet simple, iconic silhouette.`,
    // Visual style
    `Flat vector illustration, bold clean lines, consistent thick outline, geometric simplification,`,
    `minimal interior detail, tight negative space, centered composition.`,
    // Color discipline
    `Use BOTH team colors prominently as SOLID fills: primary ${primaryColor}, secondary ${secondaryColor}.`,
    `Black and off‑white only for outline/contrast. Do NOT produce grayscale or monochrome.`,
    // Background & constraints
    `Plain white background (or transparent).`,
    // Hard bans (to avoid what we're seeing)
    `Absolutely NO text, letters, words, numbers, banners, ribbons, badges, rings with lettering,`,
    `shields with typography, jersey scripts, or watermarks.`,
    `No gradients, no drop shadows, no glow, no metallic/3D, no photorealism, no scene, no extra props.`,
  ].join(" ");
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
