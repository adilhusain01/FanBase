import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

const facilitator = new HTTPFacilitatorClient({ url: process.env.X402_FACILITATOR_URL ?? "https://x402.org/facilitator" });
export const x402Server = new x402ResourceServer(facilitator).register("eip155:1439", new ExactEvmScheme());
export const x402PayTo = process.env.X402_PAY_TO;
