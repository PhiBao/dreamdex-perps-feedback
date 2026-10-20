# Docs say the account position cap is a tenth of OI on "most" markets; only 10 of 21 are

Severity: normal
Area: docs

## Steps to reproduce

1. Read the market table and the "Common pitfalls" section in
   `docs/developers/perps-testnet/README.md`:
   "Each account has a position cap per market, a tenth of the market's open
   interest cap on most markets."
2. Compare the table's **Open interest cap** column with
   `getPerpPoolParameters().maxPositionSize` at a single block.

Run `node tools/docs-position-cap.mjs`.

## Expected

`maxPositionSize` is about 10% of the documented open-interest cap on most
markets.

## Actual

Only 10 of 21 markets are at 10%. The rest are 20%, and two are much higher:

| Market | docs OI cap | maxPositionSize | ratio |
|---|---:|---:|---:|
| BTC | 246.81545 | 100 | **40.52%** |
| XRP | 344,632 | 68,926.4 | **20.00%** |
| ADA | 2,254,678 | 450,934 | **20.00%** |
| AVAX | 66,672.2 | 13,334.4 | **20.00%** |
| BNB | 693.975 | 140 | **20.17%** |
| DOGE | 5,613,590 | 1,122,700 | **20.00%** |
| LINK | 42,643.6 | 8,528.6 | **20.00%** |
| NEAR | 250,410 | 50,000 | **19.97%** |
| SUI | 635,009 | 127,000 | **20.00%** |
| XLM | 2,677,780 | 535,556 | **20.00%** |
| ZEC | 420 | 420 | **100.00%** |

Examples of the 10% group: ETH, HYPE, SOL, 1000PEPE, LIT, PUMP, TAO, VVV, WLD,
ZRO. The full table is in `tools/out/docs-position-cap.out`.

## Evidence

`tools/out/docs-position-cap.out` (block `28538756`) lists every market and the
ratio. The ZEC row is the clearest: the documented OI cap and the on-chain
`maxPositionSize` are both 420, so one account can hold the entire documented
cap, not a tenth of it.

## Environment

- Network: Hideki testnet, chain `50383`
- Block: `28538756`
- Documents:
  - <https://app.testnet.dreamdex.io/docs/developers/perps-testnet/README.md>
  - <https://app.testnet.dreamdex.io/docs/trading/perps-testnet/README.md>

## Suggested fix

Replace "a tenth ... on most markets" with "the cap varies per market; read
`getPerpPoolParameters().maxPositionSize`" and either list the exceptions or
show the ratio in the table.
