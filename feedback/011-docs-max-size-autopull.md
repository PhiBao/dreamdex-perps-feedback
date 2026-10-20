# Developer docs' max-size example omits `autoPull: true`

Severity: normal
Area: docs

## Steps to reproduce

1. Read the "Size and place an order" example in
   `docs/developers/perps-testnet/README.md`. It calls
   `getMaxPerpOrderSize` without `autoPull`, then calls
   `markets.trader.placePerpOrder` from the same account.
2. Use an owner account with an empty MarginBank, 1,000 USDso in its wallet and
   an allowance to the bank. The pool auto-pulls the shortfall for the owner.
3. Compare `getMaxPerpOrderSize` with `autoPull` omitted vs `autoPull: true`.

Run `node tools/autopull-docs.mjs` against a local fork.

## Expected

The example works for the ordinary owner path. The SDK's own
`getMaxPerpOrderSize` docs say: "Pass `autoPull` when the transaction sender
will be the order owner."

## Actual

With `autoPull` omitted, the method models no wallet pull. The example therefore
tells a wallet-funded owner that the bank cannot size the order (its bank is
empty), even though the owner `placeOrder` path auto-pulls and succeeds, as the
fork simulation below shows. With `autoPull: true` the method returns a positive
size.

## Evidence

Fork run in `tools/autopull-docs.mjs`:

```text
wallet usd 1000000000000000000000
bank state before [ 0n, 0n, [] ]
place SIM OK [ true, 10090369008319131252620n ]
```

(The simulation succeeds with bank 0 and wallet 1,000 / allowance; the
`eth_call` does not persist, so the bank state after is unchanged.)

## Environment

- Network: local Anvil fork at Hideki block `28480000`
- SDK: `@somnia-chain/markets-sdk@0.32.1`

## Suggested fix

Add `autoPull: true` to the example, or split it into "bank-funded" and
"wallet-funded" variants and explain when each applies.
