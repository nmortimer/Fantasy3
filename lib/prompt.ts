export type LogoPromptInputs = {
  teamName: string;
  mascot: string;
  primaryColor: string;      // hex or color name
  secondaryColor: string;    // hex or color name
};

export function buildLogoPrompt({ teamName, mascot, primaryColor, secondaryColor }: LogoPromptInputs) {
  const base = `Minimal, modern sports logo of the ${mascot} for the ${teamName}. Flat vector mark, bold lines, balanced composition, limited palette, centered emblem, clean white background, high contrast, no small text, no watermark.`;
  const palette = ` Use only these colors: primary ${primaryColor}, secondary ${secondaryColor}.`;
  const negative = ` --no photorealistic, 3D render, busy background, watermark, signature, extra text, realistic people`;
  return (base + palette + negative).trim();
}

export function pollinationsURL(prompt: string, seed: string | number = "random", width = 1024, height = 1024) {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?seed=${seed}&width=${width}&height=${height}&nologo=true`;
}
