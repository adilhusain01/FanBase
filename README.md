# FanBase

FanBase is a verifiable football-ticket allocation prototype for the Injective Global Cup. It makes fan enthusiasm a capped, auditable lottery boost—not a hidden ranking—and issues non-transferable, identity-bound entry passes to limit resale.

## Components

- `web/` — Next.js applicant experience, live World Cup data, x402 payment gate, public-evidence scoring, and a reproducible draw verifier.
- `facilitator/` — self-hosted x402 verifier/settler for Injective EVM testnet; built from the official x402 TypeScript SDK.
- `contracts/` — Foundry project containing the non-transferable `FanBasePass` ERC-721 for Injective EVM testnet.
- `mcp/` — read-only Model Context Protocol server for policy, score-commitment, anti-scalping, and live-fixture queries.
- `plan/README.md` — product rationale, threat model, and delivery plan.

## Run locally

```bash
git submodule update --init --recursive

cd web && pnpm install && pnpm dev
cd ../facilitator && pnpm install && pnpm start
cd ../contracts && forge test
cd ../mcp && pnpm install && pnpm dev
```

Copy `web/.env.example` to `web/.env.local` and set real provider credentials before enabling payments or public-post evidence. FanBase intentionally does not fabricate fixture data, X posts, AI scores, or payment receipts when those integrations are unavailable.

## Fixture data

FanBase reads World Cup fixtures from football-data.org when `FOOTBALL_DATA_API_TOKEN` is present, then falls back to FIFA's official calendar API. As verified on 17 July 2026, both sources return the final as Spain v Argentina at `2026-07-19T19:00:00Z`—20 July, 12:30 AM IST. The UI links to the provider that supplied the displayed fixture.

```bash
# web/.env.local (never commit this file)
FOOTBALL_DATA_API_TOKEN=your_football_data_token
X402_PAY_TO=0xYourInjectiveTestnetRecipient
X402_FACILITATOR_URL=http://localhost:4022
X402_USDC_ADDRESS=0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d
```

## Test it

```bash
cd web && pnpm install && pnpm dev
cd ../contracts && forge test
cd ../mcp && pnpm build
```

1. Open `http://localhost:3000` and confirm the match card shows Spain v Argentina at 20 July, 12:30 AM in an India timezone.
2. In MetaMask, add/switch to Injective EVM Testnet (chain ID `1439`) and connect. The app offers a network-switch button if the wallet is on another network.
3. Click **Create application**. Leave X evidence unchecked for a deterministic neutral-score test that does not require any additional provider credentials.
4. Verify a weighted draw with the public endpoint:

```bash
curl -X POST http://localhost:3000/api/draw/verify \
  -H 'content-type: application/json' \
  -d '{"seed":"fanbase-test-seed-2026","inventory":1,"entries":[{"id":"fan-a","weight":1},{"id":"fan-b","weight":1.6}]}'
```

The x402 route is fail-closed. It requires both `X402_PAY_TO` and an Injective-compatible `X402_FACILITATOR_URL`; the public x402 facilitator does not currently advertise `eip155:1439` support. Browser-side settlement also needs a payer client and test USDC, so this prototype never represents it as a fake success.

### Test a real x402 deposit

The repository includes a small self-hosted facilitator using x402's official `x402Facilitator` and `ExactEvmScheme` packages. It supports native Circle USDC on Injective EVM Testnet (chain `1439`) at `0x0C382e685bbeeFE5d3d9C29e29E341fEE8E84C5d`.

```bash
cd facilitator
cp .env.example .env
# set FANBASE_FACILITATOR_PRIVATE_KEY to a dedicated, funded testnet gas wallet
pnpm install && pnpm start

# in a second terminal
curl http://localhost:4022/health
curl http://localhost:4022/supported
```

Then set `X402_FACILITATOR_URL=http://localhost:4022` in `web/.env.local`, run `pnpm dev` in `web/`, connect MetaMask on Injective EVM Testnet, create an application, and click **Pay via x402**. The browser uses the official `@x402/fetch` client and asks MetaMask to sign the payment authorization; the facilitator verifies and settles it before the API returns success.

You need both test INJ for gas and at least 5 test USDC. Get USDC from the [Circle faucet](https://faucet.circle.com/); Injective’s docs list this address and faucet for the network. Never put a private key in a tracked file. The supplied test account was queried during setup and has 0 test USDC, so funding it is required before an end-to-end settlement can succeed.

Deploy the test pass with a test-only signer held in your shell (never commit it):

```bash
cd contracts
FANBASE_ISSUER=0xYourIssuer forge script script/DeployFanBasePass.s.sol:DeployFanBasePass \
  --rpc-url https://k8s.testnet.json-rpc.injective.network/ --broadcast --private-key "$PRIVATE_KEY"
```

A real test pass is deployed at [`0x951F…75ba`](https://testnet.blockscout.injective.network/address/0x951F2e74FA66Bec48d8Bd5481C6B95D8147f75ba) on Injective EVM Testnet. It was verified by issuing token `#1` and simulating a holder transfer, which reverted as required.

## Testnet targets

- Injective EVM testnet: chain ID `1439`
- Circle CCTP testnet domain: `29`
- Passes are issued only after allocation and cannot be transferred or approved for resale.
