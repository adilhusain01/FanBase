import { createX402Server, x402Enabled, x402PayTo, x402UsdcAddress } from "@/lib/x402";
import { withX402 } from "@x402/next";
import { NextResponse } from "next/server";

const handler = async () => NextResponse.json({
  status: "deposited", receipt: "Settlement receipt returned by the configured x402 facilitator.",
});
const unconfigured = async () => NextResponse.json(
  { error: "x402 is not configured. Set X402_PAY_TO and an Injective-compatible X402_FACILITATOR_URL to enable real USDC testnet deposits." }, { status: 503 },
);

export const POST = x402Enabled ? withX402(handler, {
  accepts: {
    scheme: "exact",
    // Do not use a dollar string here: Injective is not in x402's default token map.
    price: { asset: x402UsdcAddress, amount: "5000000", extra: { name: "USDC", decimals: 6 } },
    network: "eip155:1439",
    payTo: x402PayTo!,
  },
  description: "FanBase refundable allocation deposit",
}, createX402Server(), undefined, undefined, false) : unconfigured;
