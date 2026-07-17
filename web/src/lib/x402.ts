import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";

export const x402PayTo = process.env.X402_PAY_TO;
export const x402FacilitatorUrl = process.env.X402_FACILITATOR_URL;
// Circle's native USDC on Injective EVM Testnet, 6 decimals.
export const x402UsdcAddress = process.env.X402_USDC_ADDRESS ?? "0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d";
export const x402Enabled = Boolean(x402PayTo && x402FacilitatorUrl);

export function createX402Server() {
  if (!x402FacilitatorUrl) throw new Error("X402_FACILITATOR_URL is required.");
  return new x402ResourceServer(new HTTPFacilitatorClient({ url: x402FacilitatorUrl }))
    .register("eip155:1439", new ExactEvmScheme());
}
