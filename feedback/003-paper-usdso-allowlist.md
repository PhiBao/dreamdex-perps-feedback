# Docs mark six markets as blocked for paper USDso; the live bank allows all 21

Severity: major
Area: docs

## Steps to reproduce

1. Read the market table in `docs/trading/perps-testnet/README.md`.
   It marks `1000PEPE`, `LIT`, `PUMP`, `VVV`, `ZEC` and `ZRO` as **No** under
   **Paper USDso**, and says: "The six newest markets are not on that list."
2. Read the same rule in `docs/trading/perps-testnet/margin-and-liquidations.md`:
   "Only some markets. You can open or increase positions only in the markets
   marked Yes ... The six newest markets are not on that list."
3. Query `MarginBank.isVoucherMarketAllowed(pool)` for every perp pool.
4. From a voucher-funded account (`0x8749f3a55df81ccfdabdb0c8f2de00c7b769c95f`,
   floor 1,000 USDso), simulate a `placeOrder` on each of the six "No" markets.

Run `node tools/voucher-allowlist.mjs`.

## Expected

The six markets marked **No** reject position increases with
`VoucherMarketNotAllowed`, and `getMaxPerpOrderSize` reports
`limitedBy: "voucherBlocked"`.

## Actual

`isVoucherMarketAllowed(pool)` returns `true` for **all 21** pools. A voucher
account can place a valid order on each of the six "No" markets:

```text
1000PEPE SIM OK price 2099100000000000 qty 2700000000000000000000
LIT     SIM OK price 1583200000000000000 qty 2800000000000000000
PUMP    SIM OK price 2212000000000000 qty 1800000000
VVV     SIM OK price 12215000000000000000 qty 440000000000000000
ZEC     SIM OK price 572759000000000000000 qty 900000
ZRO     SIM OK price 894700000000000000 qty 5100000000000000000
```

The on-chain allowlist has been opened up (or retuned) after the docs were
written.

## Evidence

`tools/out/voucher-allowlist.out` contains the six successful simulations and prints
`all allowed: true count: 21` for the 21 pools.

Docs URLs:

- <https://app.testnet.dreamdex.io/docs/trading/perps-testnet/README.md>
- <https://app.testnet.dreamdex.io/docs/trading/perps-testnet/margin-and-liquidations.md>

## Environment

- SDK: `@somnia-chain/markets-sdk@0.32.1`
- Network: Hideki testnet, chain `50383`
- Block: captured in the script output (live head at run time)
- Voucher account: `0x8749f3a55df81ccfdabdb0c8f2de00c7b769c95f`
- `MarginBank`: `0x478769E1177C0773c43A593DCCc4Ad15F15F1394`

## Suggested fix

Update the table and the rule text to the live allowlist (all 21 at the tested
block), and state that the allowlist can change. Keep pointing developers at
`isVoucherMarketAllowed` / `getMaxPerpOrderSize().limitedBy` rather than a
static table.
