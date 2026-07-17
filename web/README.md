# FanBase

FanBase is a fair-access prototype for high-demand football matches. It replaces first-come-first-served chaos with an explainable, capped weighted draw and an anti-scalping allocation pass design.

## Run locally

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`. The match card reads football-data.org's World Cup feed when `FOOTBALL_DATA_API_TOKEN` is configured, with FIFA's official calendar API as fallback. If both are unavailable, it intentionally shows no invented fixture.

## Real integrations

Copy `.env.example` to `.env.local`, set `FOOTBALL_DATA_API_TOKEN` for the primary fixture feed, and set `X402_PAY_TO` to activate the `POST /api/pay` x402 route on Injective EVM testnet (`eip155:1439`). Without a recipient, payment fails closed with `503`; it never pretends that a deposit occurred.

- `POST /api/application` validates a wallet-bound application and creates a deterministic score commitment.
- `GET /api/matches` returns the current final from football-data.org or FIFA's official fallback.
- `POST /api/pay` is wrapped with `@x402/next` when the recipient is configured.
- Wallet connection uses Wagmi + the Injective testnet chain definition from Viem.

The production design, security policy, fair draw algorithm, CCTP path, permissioned pass, and MCP scope are in [`../plan/README.md`](../plan/README.md).

## Intentionally not faked

This prototype does not claim a real FIFA integration, paid settlement, X evidence score, identity verification, CCTP settlement, or ticket issuance until the licensed-provider credentials and contracts are configured. Each absent integration fails closed rather than returning demo success.
