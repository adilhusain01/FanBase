import { drawWeighted } from "@/lib/allocation";
import { z } from "zod";

const schema = z.object({
  seed: z.string().min(16).max(256), inventory: z.number().int().positive(),
  entries: z.array(z.object({ id: z.string().min(1).max(128), weight: z.number().positive().max(1.6) })).min(1).max(10_000),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "A valid seed, inventory, and entries list are required." }, { status: 400 });
  try { return Response.json(await drawWeighted(parsed.data.entries, parsed.data.inventory, parsed.data.seed)); }
  catch (error) { return Response.json({ error: error instanceof Error ? error.message : "Unable to verify draw." }, { status: 400 }); }
}
