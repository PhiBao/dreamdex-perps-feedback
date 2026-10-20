# Docs say no backstop bidders are registered; the liquidation engine has one

Severity: normal
Area: docs

## Steps to reproduce

1. Read `docs/trading/perps-testnet/margin-and-liquidations.md`:
   "No backstop bidders are registered on testnet, so the later stages come in
   sooner."
2. Query the `LiquidationEngine` (`0xA66d3C24Ad4a389d863846905D8173e1017e9F4D`):
   `getBidderCount()` and `getBidders()`.

Run `node tools/backstop-bidder.mjs`.

## Expected

`getBidderCount() == 0`, so the stage-3 takeover has no bidders and the
waterfall reaches the insurance fund / ADL sooner.

## Actual

```json
{
  "block": "28506584",
  "bidderCount": "1",
  "bidders": ["0xAF327764345c2f54C1F2bc3322D28E4f633793b9"],
  "liquidationPenaltyBps": "100"
}
```

A backstop bidder is registered. The engine's penalty is 1%, matching the docs,
but the bidder statement is stale.

## Evidence

`tools/out/backstop-bidder.out` is the captured output above.

## Environment

- Network: Hideki testnet, chain `50383`
- Block: `28506584`
- Engine: `0xA66d3C24Ad4a389d863846905D8173e1017e9F4D`

## Suggested fix

Update the paragraph to name the registered bidder and note that stage 3 can run
before ADL. Re-check the list before every bounty round; it is live config.
