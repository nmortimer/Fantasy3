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
    const imageUrl = pollinationsURL(prompt, seed ?? Math.floor(Math.random() * 1e9));

    return NextResponse.json({
      teamId,
      teamName,
      mascot,
      primary: primaryColor,
      secondary: secondaryColor,
      provider: "pollinations",
      model: "flux",
      prompt,
      seed: seed ?? "random",
      imageUrl
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "Bad Request" }, { status: 400 });
  }
}
