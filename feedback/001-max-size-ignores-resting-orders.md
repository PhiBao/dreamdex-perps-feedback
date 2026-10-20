# `getMaxPerpOrderSize` ignores resting same-side orders and returns a size that reverts

Severity: major
Area: SDK

## Steps to reproduce

1. Use `@somnia-chain/markets-sdk@0.32.1` against Hideki testnet.
2. For `SOL-PERP`, call `client.getMaxPerpOrderSize` for account
   `0x420691db9d2b5a79210fda48c177471386b6dfd1` with `isBid: true` and
   `price: 93870000000000000000`.
3. At the returned `asOfBlock` (`28492725`), call `placeOrder` with the returned
   `maxQuantity` (`7130000000000`).
4. Repeat with `maxQuantity - pendingBidQuantity` and with one lot more.

Run `node tools/max-size-cap.mjs` (fixed block and values are in the script).

## Expected

`getMaxPerpOrderSize().maxQuantity` is the largest quantity the account can
place at that block. The docs say it applies "the pool's own rule" and that a
caller can "check it before sending rather than reading a revert afterwards".

## Actual

The returned `maxQuantity` reverts with `MaxPositionSizeExceeded()` (`0x714b36d6`).
The account has a resting bid, and the pool counts that pending same-side
quantity toward the position cap; the SDK does not.

At block `28492725`:

- position size: `-2364560000000` raw (`-2,364.56` SOL, short)
- pending bid quantity: `960000000` raw (`0.96` SOL)
- market `maxPositionSize`: `4765440000000` raw (`4,765.44` SOL)
- SDK `maxQuantity`: `7130000000000` raw (`7,130.00` SOL)
- actual accepted boundary: `7129040000000` raw (`7,129.04` SOL)

`placeOrder` at `7129040000000` returns success; one lot (`10000000`) more
reverts `0x714b36d6`. The difference is exactly the pending bid quantity.

The same pattern reproduced on DOGE, ADA and ZRO at their SDK blocks:

| Market | SDK max | pending bid | SDK max - pending bid | result at boundary | result at boundary + lot |
|---|---:|---:|---:|---|---|
| DOGE | 13,359,000,000,000 | 8,207,000,000,000 | 5,152,000,000,000 | success | `0x714b36d6` |
| ADA | 363,400,000,000 | 79,912,000,000 | 283,488,000,000 | success | `0x714b36d6` |
| ZRO | 32,027,400,000,000,000,000,000 | 16,835,700,000,000,000,000,000 | 15,191,700,000,000,000,000,000 | success | `0x714b36d6` |

## Evidence

`tools/out/max-size-cap.out` (fixed historical block):

```text
{ block: '28492725', positionSize: '-2364560000000',
  pendingBid: '960000000', maxPositionSize: '4765440000000',
  sdkMax: '7130000000000', sdkMaxMinusPendingBid: '7129040000000' }
sdkMax 7130000000000 REVERT 0x714b36d6
sdkMax-pendingBid 7129040000000 OK 0x...0001
sdkMax-pendingBid+lot 7129050000000 REVERT 0x714b36d6
```

`tools/out/pending-cap-matrix.out` reproduces the same boundary on SOL, DOGE,
ADA and ZRO (the SOL row there is a later block than the fixed example above).

Code: `src/perp/margin.ts`, `withinPositionCap` uses only `positionSize`:

```ts
const newAbs = abs(positionSize + (p.isBid ? q : -q));
return newAbs <= params.maxPositionSize || newAbs <= absPosition;
```

`getReducingCapacity` is already read in `readPerpPlacementState` and exposes
`pendingBidQuantity` / `pendingAskQuantity`, but those fields never reach the
cap check.

## Environment

- SDK: `@somnia-chain/markets-sdk@0.32.1`
- Network: Somnia Tokyo / Hideki testnet, chain `50383`
- Block: `28492725` (SOL), live blocks for the other markets
- Account: `0x420691db9d2b5a79210fda48c177471386b6dfd1`
- RPC: `https://api.hideki2.infra.testnet.somnia.network`

## Suggested fix

Include the same-side pending quantity in the cap check (or subtract it from
`maxPositionSize` before the search), and add a regression test with a resting
bid/ask. The contract's rule is net position **plus pending same-side orders**,
not the position alone.
