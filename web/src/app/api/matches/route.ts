import { getLiveWorldCupMatch } from "@/lib/world-cup";

export async function GET() {
  const match = await getLiveWorldCupMatch();
  if (!match) return Response.json({ error: "Live World Cup data is temporarily unavailable." }, { status: 503 });
  return Response.json(match);
}
