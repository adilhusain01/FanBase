import { getCctpAttestation } from "@/lib/cctp";
import { z } from "zod";

const query = z.object({ sourceDomain: z.coerce.number().int().nonnegative(), transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/) });

export async function GET(request: Request) {
  const parsed = query.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsed.success) return Response.json({ error: "sourceDomain and a valid transactionHash are required." }, { status: 400 });
  try { return Response.json(await getCctpAttestation(parsed.data.sourceDomain, parsed.data.transactionHash)); }
  catch { return Response.json({ error: "Circle attestation lookup failed." }, { status: 502 }); }
}
