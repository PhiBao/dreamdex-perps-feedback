# Trading docs say perp orders only use Perps-account margin; owner orders auto-pull from the wallet

Severity: normal
Area: docs

## Steps to reproduce

1. Read `docs/trading/perps-testnet/README.md`:
   "Perp orders only use margin that is already in the Perps account."
2. Read `docs/developers/perps-testnet/README.md`:
   "The owner's own `placeOrder` fails differently, with `ERC20: transfer amount
   exceeds balance`, because the pool tries to pull the shortfall from the
   wallet."
3. On a fork, give an owner account 0 USDso in the MarginBank, 1,000 USDso in its
   wallet and an allowance to the bank; simulate `placeOrder`.

Run `node tools/autopull-docs.mjs` against a local fork.

## Expected

The two pages agree. Either the owner path only uses bank margin, or it can pull
from the wallet.

## Actual

The owner path **does** auto-pull from the wallet: the fork simulation succeeds
with bank 0 and wallet 1,000 / allowance. The trading docs' absolute statement
is false for the SDK/contract owner path (the app may deposit first, but the
contract does not require it).

## Evidence

`tools/autopull-docs.mjs` output:

```text
wallet usd 1000000000000000000000
bank state before [ 0n, 0n, [] ]
place SIM OK [ true, 10090369008319131252620n ]
```

## Environment

- Network: local Anvil fork at Hideki block `28480000`
- SDK: `@somnia-chain/markets-sdk@0.32.1`

## Suggested fix

Qualify the trading docs: "The app moves margin into the Perps account before
placing; an owner-sent `placeOrder` can also auto-pull an approved wallet
shortfall." Or disable the auto-pull path if bank-only is the intended product
rule.
