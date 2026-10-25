# Reproducers

Install once:

```bash
npm install
```

Read-only against Hideki testnet:

```bash
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

Fork-only (start Anvil in another terminal first):

```bash
anvil --fork-url https://api.hideki2.infra.testnet.somnia.network \
  --fork-block-number 28480000 --chain-id 50383 --port 8545

node autopull-docs.mjs
node leverage-voucher.mjs
```

`max-size-cap.mjs` is pinned to block `28492725` and a known account so the
position-cap boundary is stable. `pending-cap-matrix.mjs` finds the current top
position on each market and reproduces the same pattern live.

`feedback/015` (read-after-write stale block) was captured from a live funded
flow; its output is `out/read-after-write.out`. It is not a standalone script
because it requires a funded key and sends orders.

