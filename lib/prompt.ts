import { mascotFromTeam, clean } from "@/lib/utils";

export type LogoPromptInputs = {
  teamName: string;
  mascot: string;        // may be full team name; we derive depict term
  primaryColor: string;
  secondaryColor: string;
};

function depictTerm(teamName:string, mascot:string){
  const m=clean(mascot||"").toLowerCase();
  const t=clean(teamName);
  const derived=mascotFromTeam(t);
  if(!m || m===t.toLowerCase() || m.length<3) return derived;
  return derived; // keep it consistent/brandable
}

export function buildLogoPrompt({ teamName, mascot, primaryColor, secondaryColor }: LogoPromptInputs) {
  const depict = depictTerm(teamName, mascot);
  return (
    `Professional minor-league sports **mascot emblem** for ${teamName}. ` +
    `Depict a ${depict} as a flat vector mark: bold clean lines, thick outline, simple geometric shapes, strong silhouette, centered composition. ` +
    `Use only primary ${primaryColor} and secondary ${secondaryColor} plus black/white for contrast. ` +
    `Plain white or transparent background. ` +
    `Absolutely no text, letters, words, numbers, typography, captions, banners, wordmarks, jersey scripts, or watermarks. ` +
    `No gradients, no shadows, no 3D, no photo, no background scene.`
  );
}

export function pollinationsURL(prompt:string, seed:string|number="random", width=1024, height=1024){
  const encoded=encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?seed=${seed}&width=${width}&height=${height}&nologo=true`;
}
