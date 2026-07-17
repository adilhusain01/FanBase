export const scoreBands = [
  { min: 0, max: 39, weight: 1 }, { min: 40, max: 59, weight: 1.15 },
  { min: 60, max: 74, weight: 1.3 }, { min: 75, max: 89, weight: 1.45 },
  { min: 90, max: 100, weight: 1.6 },
] as const;

export function getWeight(score: number) { return scoreBands.find((band) => score >= band.min && score <= band.max)?.weight ?? 1; }

export async function scoreCommitment(input: { matchId: string; wallet: string; score: number; rubric: string }) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(JSON.stringify(input)));
  return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
