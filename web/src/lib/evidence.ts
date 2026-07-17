import { z } from "zod";

const postSchema = z.object({ id: z.string(), text: z.string(), created_at: z.string().optional() });
const agentSchema = z.object({ score: z.number().int().min(0).max(100), includedPostIds: z.array(z.string()), excludedPostIds: z.array(z.string()), rationale: z.string().max(500) });

export async function scorePublicEvidence(handle: string, terms: string[]) {
  const token = process.env.X_API_BEARER_TOKEN;
  const baseUrl = process.env.FANBASE_AI_BASE_URL;
  const apiKey = process.env.FANBASE_AI_API_KEY;
  const model = process.env.FANBASE_AI_MODEL;
  if (!token || !baseUrl || !apiKey || !model) return null;

  const query = `(from:${handle}) (${terms.map((term) => `"${term.replaceAll('"', "")}"`).join(" OR ")}) -is:retweet`;
  const response = await fetch(`https://api.x.com/2/tweets/search/recent?${new URLSearchParams({ query, max_results: "25", "tweet.fields": "created_at" })}`, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error("X evidence provider rejected the request.");
  const posts = z.object({ data: z.array(postSchema).optional() }).parse(await response.json()).data ?? [];
  if (!posts.length) return { score: 50, includedPostIds: [], excludedPostIds: [], rationale: "No eligible public posts were found in the provider window." };

  const completion = await fetch(`${baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model, response_format: { type: "json_object" }, temperature: 0,
      messages: [
        { role: "system", content: "You score opt-in football fandom evidence. Return JSON {score:0..100,includedPostIds:string[],excludedPostIds:string[],rationale:string}. Score only relevance/originality in supplied posts. Do not infer protected traits, popularity, wealth, or follower count. A score cannot exceed 100." },
        { role: "user", content: JSON.stringify({ terms, posts }) },
      ],
    }),
  });
  if (!completion.ok) throw new Error("Evidence classifier did not return a valid response.");
  const body = z.object({ choices: z.array(z.object({ message: z.object({ content: z.string() }) })).min(1) }).parse(await completion.json());
  return agentSchema.parse(JSON.parse(body.choices[0].message.content));
}
