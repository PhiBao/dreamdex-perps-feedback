# Bot kit gotchas say the testnet builder-fee cap is 0; Hideki perps report 10,000 (0.1%)

Severity: normal
Area: docs

## Steps to reproduce

1. Read `dreamdex-bot-kit/docs/gotchas.md`, item 13:
   "On-chain reality: builder codes are enabled on mainnet — all four pools
   report `getMaxBuilderFeeBpsTimes1k() = 100000` (a 1% fee cap). Testnet
   currently reports a cap of 0."
   The section is introduced as the "spot and perp surface".
2. Query `getMaxBuilderFeeBpsTimes1k()` on the Hideki perp pools, e.g. BTC-PERP
   and ETH-PERP.

## Expected

The testnet/perps builder cap is 0, as the gotcha says, so a builder can assume
untagged orders are the only valid path.

## Actual

On Hideki perps:

```text
BTC-PERP getMaxBuilderFeeBpsTimes1k() = 10000
ETH-PERP getMaxBuilderFeeBpsTimes1k() = 10000
```

`10000` is 10 bps = 0.1% (the unit is bps × 1000), not 0. The mainnet figure in
the same gotcha is `100000` = 1%, so the doc's scale is internally consistent;
only the "testnet is 0" claim is stale for Hideki perps.

## Evidence

`tools/out/builder-cap.out` is the captured run.

`cast call 0x4181dd08E73BbCdd1Ba3E615A18f6abD941b94C0 "getMaxBuilderFeeBpsTimes1k()(uint256)"`
returns `10000`; the same call on ETH-PERP returns `10000`.

## Environment

- Network: Hideki testnet, chain `50383`
- SDK: `@somnia-chain/markets-sdk@0.32.1`
- Repo: <https://github.com/somnia-chain/dreamdex-bot-kit>

## Suggested fix

Scope the sentence: "On Shannon spot the cap is 0; on Hideki perps the live cap
is 10,000 (0.1%)." Read the cap per pool instead of assuming 0.
