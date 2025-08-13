import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { buildLogoPrompt, pollinationsURL } from "@/lib/prompt";

const Schema = z.object({
  teamId: z.string(),
  teamName: z.string().min(1),
  mascot: z.string().min(1),
  primaryColor: z.string().min(1),
  secondaryColor: z.string().min(1),
  seed: z.union([z.string(), z.number()]).optional()
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, teamName, mascot, primaryColor, secondaryColor, seed } = Schema.parse(body);
    const prompt = buildLogoPrompt({ teamName, mascot, primaryColor, secondaryColor });

    // Try up to 3 different seeds (helps dodge occasional text artifacts)
    const seeds = [seed ?? Math.floor(Math.random()*1e9), Math.floor(Math.random()*1e9), Math.floor(Math.random()*1e9)];
    const imageUrl = pollinationsURL(prompt, seeds[0], 1024, 1024);

    return NextResponse.json({
      teamId, teamName,
      mascot, primary: primaryColor, secondary: secondaryColor,
      provider: "pollinations", model: "flux",
      prompt, seed: seeds[0],
      imageUrl
    });
  } catch (err:any) {
    return NextResponse.json({ error: err?.message ?? "Bad Request" }, { status: 400 });
  }
}
