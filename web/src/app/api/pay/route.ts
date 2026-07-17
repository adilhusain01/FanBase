import { x402PayTo, x402Server } from "@/lib/x402";
import { withX402 } from "@x402/next";
import { NextResponse } from "next/server";

const handler = async () => NextResponse.json({
  status: "deposited", receipt: "Settlement receipt returned by the configured x402 facilitator.",
});
const unconfigured = async () => NextResponse.json(
  { error: "x402 is not configured. Set X402_PAY_TO to enable real USDC testnet deposits." }, { status: 503 },
);

export const POST = x402PayTo ? withX402(handler, {
  accepts: { scheme: "exact", price: "$5.00", network: "eip155:1439", payTo: x402PayTo },
  description: "FanBase refundable allocation deposit",
}, x402Server) : unconfigured;
