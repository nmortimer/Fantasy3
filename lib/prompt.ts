export type LogoPromptInputs = {
  teamName: string;
  mascot: string;
  primaryColor: string;
  secondaryColor: string;
};

export function buildLogoPrompt({ teamName, mascot, primaryColor, secondaryColor }: LogoPromptInputs) {
  return (
    `Professional minor league sports mascot logo for the ${teamName}. ` +
    `Depict a ${mascot} mascot in flat vector illustration style, with bold clean lines, thick outline, and simple geometric shapes. ` +
    `Dynamic but balanced composition, centered mascot emblem. ` +
    `Use a limited palette of primary ${primaryColor} and secondary ${secondaryColor}, plus black/white for contrast. ` +
    `No text or wordmarks, no gradients, no shadows, no bevels, no 3D, no background scene. ` +
    `Modern pro sports branding style, crisp edges, high contrast, versatile for jerseys or avatars. ` +
    `Plain white or transparent background.` +
    ` --no photorealism --no photograph --no extra objects --no clutter --no watermark`
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
