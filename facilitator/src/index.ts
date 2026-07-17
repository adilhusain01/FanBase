import { x402Facilitator } from "@x402/core/facilitator";
import type { PaymentPayload, PaymentRequirements } from "@x402/core/types";
import { toFacilitatorEvmSigner } from "@x402/evm";
import { registerExactEvmScheme } from "@x402/evm/exact/facilitator";
import "dotenv/config";
import express from "express";
import { createWalletClient, http, publicActions } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { injectiveTestnet } from "viem/chains";

const network = "eip155:1439";
const port = Number(process.env.PORT ?? 4022);
const privateKey = process.env.FANBASE_FACILITATOR_PRIVATE_KEY as `0x${string}` | undefined;
const rpcUrl = process.env.FANBASE_FACILITATOR_RPC_URL;

if (!privateKey || privateKey === "0x" || !rpcUrl) {
  throw new Error("Set FANBASE_FACILITATOR_PRIVATE_KEY and FANBASE_FACILITATOR_RPC_URL before starting the facilitator.");
}

const account = privateKeyToAccount(privateKey);
const client = createWalletClient({
  account,
  chain: injectiveTestnet,
  transport: http(rpcUrl),
}).extend(publicActions);

const signer = toFacilitatorEvmSigner({
  address: account.address,
  getCode: client.getCode,
  readContract: client.readContract,
  verifyTypedData: (args) => client.verifyTypedData(args as never),
  writeContract: client.writeContract,
  sendTransaction: client.sendTransaction,
  waitForTransactionReceipt: client.waitForTransactionReceipt,
});

const facilitator = new x402Facilitator();
registerExactEvmScheme(facilitator, { signer, networks: network });

// Avoid two concurrent settle requests spending the facilitator's gas for one authorization.
const settling = new Set<string>();
const app = express();
app.use(express.json({ limit: "32kb" }));

app.get("/health", (_request, response) => {
  response.json({ ok: true, network, address: account.address });
});

app.get("/supported", (_request, response) => {
  response.json(facilitator.getSupported());
});

app.post("/verify", async (request, response) => {
  const { paymentPayload, paymentRequirements } = request.body as {
    paymentPayload?: PaymentPayload;
    paymentRequirements?: PaymentRequirements;
  };
  if (!paymentPayload || !paymentRequirements) {
    return response.status(400).json({ error: "paymentPayload and paymentRequirements are required." });
  }
  try {
    return response.json(await facilitator.verify(paymentPayload, paymentRequirements));
  } catch (error) {
    return response.status(400).json({ error: error instanceof Error ? error.message : "Payment verification failed." });
  }
});

app.post("/settle", async (request, response) => {
  const { paymentPayload, paymentRequirements } = request.body as {
    paymentPayload?: PaymentPayload;
    paymentRequirements?: PaymentRequirements;
  };
  if (!paymentPayload || !paymentRequirements) {
    return response.status(400).json({ error: "paymentPayload and paymentRequirements are required." });
  }
  const key = JSON.stringify(paymentPayload);
  if (settling.has(key)) return response.status(409).json({ success: false, errorReason: "Duplicate settlement in progress." });
  settling.add(key);
  try {
    return response.json(await facilitator.settle(paymentPayload, paymentRequirements));
  } catch (error) {
    return response.status(400).json({ error: error instanceof Error ? error.message : "Payment settlement failed." });
  } finally {
    settling.delete(key);
  }
});

app.listen(port, () => {
  console.info(`FanBase facilitator (${network}) listening on http://localhost:${port}`);
});
