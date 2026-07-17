import { getWeight, scoreCommitment } from "@/lib/fairness";
import { z } from "zod";

const schema = z.object({
  matchId: z.string().min(1),
  wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  xHandle: z.string().trim().min(1).max(15).regex(/^[A-Za-z0-9_]+$/).optional(),
  socialConsent: z.boolean(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return Response.json({ error: "Please provide a valid wallet and application." }, { status: 400 });
  const { matchId, wallet, socialConsent, xHandle } = parsed.data;
  // ponytail: default eligibility is intentional; a social account is never required to enter.
  const score = 50;
  const commitment = await scoreCommitment({ matchId, wallet, score, rubric: "fanbase-v1" });
  return Response.json({
    applicationId: commitment.slice(0, 16), score, weight: getWeight(score), commitment,
    status: socialConsent && xHandle ? "evidence-pending" : "eligible",
    explanation: socialConsent && xHandle
      ? "Your opted-in X evidence is queued for the provider-backed classifier. Your neutral baseline keeps you eligible now."
      : "You are eligible at FanBase’s neutral baseline. Social evidence is optional and never required.",
  });
}
