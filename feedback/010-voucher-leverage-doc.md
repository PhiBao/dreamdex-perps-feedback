# Docs say voucher leverage cannot be changed; a stricter `setMaxLeverage` succeeds

Severity: normal
Area: docs

## Steps to reproduce

1. Use a voucher-funded account, e.g. `0x8749f3a55df81ccfdabdb0c8f2de00c7b769c95f`
   with a 1,000 USDso credit floor on the Hideki fork.
2. Read `getMaxLeverage(account, BTC-PERP)` (0 = unset).
3. Send `setMaxLeverage(BTC-PERP, 5)` from the account.
4. Read `getMaxLeverage` and `getCreditFloor` again.

Run `node tools/leverage-voucher.mjs` against a local fork.

## Expected

`docs/trading/perps-testnet/margin-and-liquidations.md` says: "Your leverage
setting can't be changed while it remains." The transaction should revert or
leave the setting unchanged.

## Actual

The transaction succeeds and stores 5x; the 1,000 USDso floor is unchanged. The
voucher cap still forces the effective leverage to at most 20x when the user
setting is unset or looser, so a **stricter** setting is accepted. The docs'
absolute wording is wrong; a user can reduce leverage, just not loosen it.

## Evidence

Fork run:

```text
before 0 floor 1000000000000000000000
tx success
after 5 floor 1000000000000000000000
```

The same behavior is described in the SDK's `getPerpLeverage` comments:
"forces leverage to `voucherLeverageCap` whenever the user's own setting is
unset or looser."

## Environment

- Network: local Anvil fork at Hideki block `28480000`
- SDK: `@somnia-chain/markets-sdk@0.32.1`
- Account: `0x8749f3a55df81ccfdabdb0c8f2de00c7b769c95f`

## Suggested fix

Say "you can lower your leverage, but cannot set it above the voucher cap while
the credit remains" (or block all changes if that is the intended product rule).
