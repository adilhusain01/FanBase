export type Match = {
  id: string;
  name: string;
  date: string;
  venue: string;
  stage: string;
  teams: Array<{ name: string; abbreviation: string; logo?: string; player?: string }>;
};

type EspnEvent = {
  id: string;
  name: string;
  date: string;
  season?: { type?: { name?: string } };
  competitions?: Array<{
    venue?: { fullName?: string };
    competitors?: Array<{
      team?: { displayName?: string; abbreviation?: string; logo?: string };
      leaders?: Array<{ leaders?: Array<{ athlete?: { displayName?: string } }> }>;
    }>;
  }>;
};

export async function getLiveWorldCupMatch(): Promise<Match | null> {
  try {
    const response = await fetch(
      "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard",
      { next: { revalidate: 60 } },
    );
    if (!response.ok) return null;
    const data = (await response.json()) as { events?: EspnEvent[] };
    const event = data.events?.[0];
    const competition = event?.competitions?.[0];
    if (!event || !competition?.competitors?.length) return null;
    return {
      id: event.id,
      name: event.name,
      date: event.date,
      venue: competition.venue?.fullName ?? "Venue to be confirmed",
      stage: event.season?.type?.name ?? "FIFA World Cup",
      teams: competition.competitors.map((competitor) => ({
        name: competitor.team?.displayName ?? "TBD",
        abbreviation: competitor.team?.abbreviation ?? "TBD",
        logo: competitor.team?.logo,
        player: competitor.leaders?.[0]?.leaders?.[0]?.athlete?.displayName,
      })),
    };
  } catch { return null; }
}
