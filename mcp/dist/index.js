import { createHash } from "node:crypto";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
const server = new McpServer({ name: "fanbase-audit", version: "0.1.0" });
const text = (value) => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }] });
server.registerTool("get_fairness_policy", {
    title: "Get FanBase fairness policy",
    description: "Returns the public scoring caps and verifiable draw policy. It never exposes raw social evidence.",
    annotations: { readOnlyHint: true },
}, async () => text({
    rubric: "fanbase-v1",
    neutralScore: 50,
    scoreBands: [{ range: "0–39", weight: 1 }, { range: "40–59", weight: 1.15 }, { range: "60–74", weight: 1.3 }, { range: "75–89", weight: 1.45 }, { range: "90–100", weight: 1.6 }],
    draw: "Weighted sampling without replacement after a committed close; score is a capped probability multiplier, not a rank.",
}));
server.registerTool("verify_score_commitment", {
    title: "Verify an application score commitment",
    description: "Recomputes a SHA-256 score commitment from public inputs. Use only with applicant-provided values.",
    inputSchema: { matchId: z.string(), wallet: z.string().regex(/^0x[a-fA-F0-9]{40}$/), score: z.number().int().min(0).max(100), commitment: z.string().length(64) },
    annotations: { readOnlyHint: true },
}, async ({ matchId, wallet, score, commitment }) => {
    const actual = createHash("sha256").update(JSON.stringify({ matchId, wallet, score, rubric: "fanbase-v1" })).digest("hex");
    return text({ valid: actual === commitment, expectedCommitment: actual });
});
server.registerTool("get_live_world_cup_match", {
    title: "Get live World Cup match",
    description: "Reads the public current FIFA World Cup match feed. It has no write capability.",
    annotations: { readOnlyHint: true },
}, async () => {
    const response = await fetch("https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard");
    if (!response.ok)
        return text({ available: false });
    const data = await response.json();
    return text({ available: Boolean(data.events?.[0]), match: data.events?.[0] ?? null });
});
await server.connect(new StdioServerTransport());
//# sourceMappingURL=index.js.map