import { FanBaseDashboard } from "@/components/fanbase-dashboard";
import { Providers } from "@/components/providers";
import { getLiveWorldCupMatch } from "@/lib/world-cup";

export default async function Home() {
  const match = await getLiveWorldCupMatch();
  return <Providers><FanBaseDashboard match={match} /></Providers>;
}
