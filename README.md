# dreamDEX Perps Builder Bounty — feedback

Reproducible feedback for the **dreamDEX Perps Builder Bounty** on Somnia Tokyo
(Hideki testnet).

- Network: Hideki, chain **50383**
- RPC: `https://api.hideki2.infra.testnet.somnia.network`
- Indexer: `https://hideki-dev.smk.somnia.host/v1/graphql`
- SDK: `@somnia-chain/markets-sdk@0.32.1`
- Collateral: USDso `0xed7993A74dAe1e6656B704A424DcD8711aAf4F72`

## Feedback items

Each file in `feedback/` follows the bounty template:
title, severity, area, steps to reproduce, expected, actual, evidence and
environment.

| # | Item | Severity | Area |
|---|---|---|---|
| 001 | `getMaxPerpOrderSize` ignores resting same-side orders and returns a reverting size | major | SDK |
| 002 | Voucher eligibility says a clean EOA can claim, but `claim()` reverts | major | SDK |
| 003 | Docs mark six markets blocked for paper USDso; the live bank allows all 21 | major | docs |
| 004 | Docs say the account position cap is a tenth of OI on "most" markets; only 10/21 are | normal | docs |
| 005 | Docs say no backstop bidders are registered; the liquidation engine has one | normal | docs |
| 006 | `perp-starter` manages an existing position with the configured side | major | app |
| 007 | `perp-maker` can exceed `PERP_MM_MAX_POSITION_USDSO` when a quote fills | normal | app |
| 008 | SDK has no perp operator (`…For`) writes or perp batch placement | normal | SDK |
| 009 | Hideki address set omits `operatorPermissionsRegistry` | normal | SDK |
| 010 | Docs say voucher leverage cannot change; a stricter setting succeeds | normal | docs |
| 011 | Developer docs' max-size example omits `autoPull: true` | normal | docs |
| 012 | Trading docs say bank-only margin; owner orders auto-pull from the wallet | normal | docs |
| 013 | Bot kit says testnet builder cap is 0; Hideki perps report 10,000 (0.1%) | normal | docs |
| 014 | Contest says no deposit required; docs/UX do not explain Shannon tUSDC or the paused deposit route | normal | docs |
| 015 | Reads after a successful order can sample a stale block, so the next max-size quote reverts | major | SDK |

## Reproduce

```bash
cd tools
npm install

node claim-eligibility.mjs
node voucher-allowlist.mjs
node max-size-cap.mjs
node pending-cap-matrix.mjs
node docs-position-cap.mjs
node backstop-bidder.mjs
node sdk-surface.mjs
node address-set.mjs
node stop-no-registry.mjs
node network-check.mjs
node builder-cap.mjs
```

Fork-only checks (start Anvil in another terminal first):

```bash
anvil --fork-url https://api.hideki2.infra.testnet.somnia.network \
  --fork-block-number 28480000 --chain-id 50383 --port 8545

node autopull-docs.mjs
node leverage-voucher.mjs
```

Captured output from the runs is in `tools/out/`.

## Notes

- Every report names the block or run time used. Live docs and market parameters
  can be retuned; re-run the relevant script before submitting an update.
- `feedback/001` is pinned to block `28492725` so the position-cap boundary is
  stable. `feedback/015` is a live read-after-write race captured in
  `tools/out/read-after-write.out`.
- The scripts are read-only against the public testnet. The Anvil scripts only
  change a local fork.
- No private keys are stored in this repository. The addresses in the reports
  are public testnet addresses.
- Security vulnerabilities are handled privately under the bounty rules and are
  intentionally not included in this repository.

## Scope

This repository covers the **Feedback track**: API/SDK correctness, documentation
gaps, and bot-kit issues. It does not contain an MVP submission.
