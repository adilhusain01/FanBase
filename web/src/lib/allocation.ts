export type DrawEntry = { id: string; weight: number };

async function randomUnit(seed: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(seed));
  const view = new DataView(digest);
  // Two 32-bit words avoid a BigInt requirement in the browser bundle.
  return (view.getUint32(0) / 2 ** 32) + (view.getUint32(4) + 1) / 2 ** 64;
}

export async function drawWeighted(entries: DrawEntry[], inventory: number, seed: string) {
  if (!Number.isInteger(inventory) || inventory < 1 || inventory > entries.length) throw new Error("Invalid inventory.");
  const seen = new Set<string>();
  for (const entry of entries) {
    if (!entry.id || entry.weight <= 0 || !Number.isFinite(entry.weight) || seen.has(entry.id)) throw new Error("Invalid draw entry.");
    seen.add(entry.id);
  }
  const keyed = await Promise.all(entries.map(async (entry) => ({ ...entry, key: -Math.log(await randomUnit(`${seed}:${entry.id}`)) / entry.weight })));
  const sorted = keyed.toSorted((a, b) => a.key - b.key);
  return { winners: sorted.slice(0, inventory).map(({ id, weight, key }) => ({ id, weight, key })), waitlist: sorted.slice(inventory).map(({ id, weight, key }) => ({ id, weight, key })) };
}
