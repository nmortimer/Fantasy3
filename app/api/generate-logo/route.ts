import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildLogoPrompt, pollinationsURL } from "@/lib/prompt";

const Schema = z.object({
  teamId: z.string(),
  teamName: z.string().min(1),
  mascot: z.string().min(1),
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  seed: z.union([z.string(), z.number()]).optional(),
});

/**
 * Simple multi‑seed retriable URL generation. (We return the first; front‑end can click
 * "New Seed" for quick retries. If you want server‑side OCR/no‑text guard, say the word
 * and I’ll add it.)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, teamName, mascot, primaryColor, secondaryColor, seed } = Schema.parse(body);

    const prompt = buildLogoPrompt({ teamName, mascot, primaryColor, secondaryColor });

    // First seed is either provided or random; UI has a New Seed button for quick rerolls.
    const firstSeed = Number(seed ?? Math.floor(Math.random() * 1e9));
    const imageUrl = pollinationsURL(prompt, firstSeed, 1024, 1024);

    return NextResponse.json({
      teamId,
      teamName,
      mascot,
      primary: primaryColor,
      secondary: secondaryColor,
      provider: "pollinations",
      model: "flux",
      prompt,
      seed: firstSeed,
      imageUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Bad Request" }, { status: 400 });
  }
}
