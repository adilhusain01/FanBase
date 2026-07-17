export type Match = {
  id: string;
  name: string;
  date: string;
  venue: string;
  stage: string;
  sourceName: string;
  sourceUrl: string;
  teams: Array<{ name: string; abbreviation: string; logo?: string; player?: string }>;
};

type FifaMatch = {
  IdMatch: string;
  Date: string;
  StageName?: Array<{ Description?: string }>;
  CompetitionName?: Array<{ Description?: string }>;
  Stadium?: { Name?: Array<{ Description?: string }> };
  Home?: FifaTeam;
  Away?: FifaTeam;
};

type FifaTeam = {
  TeamName?: Array<{ Description?: string }>;
  Abbreviation?: string;
  PictureUrl?: string;
};

type FootballDataMatch = {
  id: number;
  utcDate: string;
  stage: string;
  competition: { name: string };
  homeTeam: { name: string; tla: string; crest?: string };
  awayTeam: { name: string; tla: string; crest?: string };
};

const fifaCalendar = "https://api.fifa.com/api/v3/calendar/matches?language=en&count=500&idSeason=285023";
const fifaSchedule = "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums";
const footballDataMatches = "https://api.football-data.org/v4/competitions/WC/matches";

function label(values?: Array<{ Description?: string }>) {
  return values?.find((value) => value.Description)?.Description;
}

function team(team?: FifaTeam) {
  const name = label(team?.TeamName);
  if (!name || !team?.Abbreviation) return null;
  return {
    name,
    abbreviation: team.Abbreviation,
    logo: team.PictureUrl?.replace("{format}-{size}", "sq-4"),
  };
}

export function parseFifaFinal(matches: FifaMatch[]): Match | null {
  const final = matches.find((match) => label(match.StageName) === "Final");
  const teams = [team(final?.Home), team(final?.Away)].filter((value): value is NonNullable<typeof value> => Boolean(value));
  if (!final || teams.length !== 2) return null;
  return {
    id: final.IdMatch,
    name: `${teams[0].name} vs ${teams[1].name}`,
    date: final.Date,
    venue: label(final.Stadium?.Name) ?? "Venue to be confirmed",
    stage: label(final.StageName) ?? "FIFA World Cup",
    sourceName: "FIFA official schedule",
    sourceUrl: fifaSchedule,
    teams,
  };
}

export function parseFootballDataFinal(matches: FootballDataMatch[]): Match | null {
  const final = matches.find((match) => match.stage === "FINAL");
  if (!final?.homeTeam.name || !final.awayTeam.name) return null;
  return {
    id: String(final.id),
    name: `${final.homeTeam.name} vs ${final.awayTeam.name}`,
    date: final.utcDate,
    venue: "New York/New Jersey Stadium",
    stage: "Final",
    sourceName: "football-data.org fixture feed",
    sourceUrl: "https://www.football-data.org/",
    teams: [
      { name: final.homeTeam.name, abbreviation: final.homeTeam.tla, logo: final.homeTeam.crest },
      { name: final.awayTeam.name, abbreviation: final.awayTeam.tla, logo: final.awayTeam.crest },
    ],
  };
}

async function getFootballDataFinal() {
  const token = process.env.FOOTBALL_DATA_API_TOKEN;
  if (!token) return null;
  const response = await fetch(footballDataMatches, { headers: { "X-Auth-Token": token }, next: { revalidate: 60 } });
  if (!response.ok) return null;
  return parseFootballDataFinal(((await response.json()) as { matches?: FootballDataMatch[] }).matches ?? []);
}

export async function getLiveWorldCupMatch(): Promise<Match | null> {
  try {
    const footballDataMatch = await getFootballDataFinal();
    if (footballDataMatch) return footballDataMatch;
    const response = await fetch(fifaCalendar, { headers: { Origin: "https://www.fifa.com" }, next: { revalidate: 60 } });
    if (!response.ok) return null;
    const data = (await response.json()) as { Results?: FifaMatch[] };
    return parseFifaFinal(data.Results ?? []);
  } catch { return null; }
}
