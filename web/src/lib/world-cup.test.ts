import { describe, expect, it } from "vitest";
import { parseFifaFinal, parseFootballDataFinal } from "./world-cup";

describe("parseFifaFinal", () => {
  it("selects the final and keeps FIFA's date", () => {
    const match = parseFifaFinal([{ IdMatch: "400021543", Date: "2026-07-19T19:00:00Z", StageName: [{ Description: "Final" }], Stadium: { Name: [{ Description: "New York/New Jersey Stadium" }] }, Home: { TeamName: [{ Description: "Spain" }], Abbreviation: "ESP" }, Away: { TeamName: [{ Description: "Argentina" }], Abbreviation: "ARG" } }]);
    expect(match).toMatchObject({ id: "400021543", name: "Spain vs Argentina", date: "2026-07-19T19:00:00Z" });
  });
});

describe("parseFootballDataFinal", () => {
  it("selects football-data.org's final", () => {
    const match = parseFootballDataFinal([{ id: 537390, utcDate: "2026-07-19T19:00:00Z", stage: "FINAL", competition: { name: "FIFA World Cup" }, homeTeam: { name: "Spain", tla: "ESP" }, awayTeam: { name: "Argentina", tla: "ARG" } }]);
    expect(match).toMatchObject({ id: "537390", name: "Spain vs Argentina", sourceName: "football-data.org fixture feed" });
  });
});
