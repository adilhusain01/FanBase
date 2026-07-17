import { z } from "zod";

export const INJECTIVE_CCTP_DOMAIN = 29;
const attestationSchema = z.object({
  messages: z.array(z.object({ status: z.string(), message: z.string().optional(), attestation: z.string().optional() })).default([]),
});

export async function getCctpAttestation(sourceDomain: number, transactionHash: string) {
  const response = await fetch(`https://iris-api-sandbox.circle.com/v2/messages/${sourceDomain}?transactionHash=${transactionHash}`, { cache: "no-store" });
  if (!response.ok) throw new Error("Circle attestation lookup failed.");
  const message = attestationSchema.parse(await response.json()).messages[0];
  return message?.status === "complete" && message.message && message.attestation
    ? { status: "complete" as const, message: message.message, attestation: message.attestation }
    : { status: "pending" as const };
}
