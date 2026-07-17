import { describe, expect, it } from "vitest";
import { drawWeighted } from "./allocation";

describe("drawWeighted", () => {
  const applications = [{ id: "a", weight: 1 }, { id: "b", weight: 1.3 }, { id: "c", weight: 1.6 }];
  it("is deterministic and has no duplicate winner", async () => {
    const first = await drawWeighted(applications, 2, "committed-seed");
    const second = await drawWeighted(applications, 2, "committed-seed");
    expect(first).toEqual(second);
    expect(new Set(first.winners.map((winner) => winner.id)).size).toBe(2);
  });
  it("rejects duplicate applications", async () => {
    await expect(drawWeighted([{ id: "a", weight: 1 }, { id: "a", weight: 1 }], 1, "seed")).rejects.toThrow("Invalid draw entry.");
  });
});
