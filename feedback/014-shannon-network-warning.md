# Contest says no deposit required; docs/UX do not explain Shannon tUSDC or the paused deposit route

Severity: normal
Area: docs

## Steps to reproduce

1. Read the Perps Arena page (`https://app.testnet.dreamdex.io/competition`):
   - "No deposit required."
   - "Each of them will receive the weekly 1,000 paper USDso and 20 STT."
   - "No claim step."
2. Observe that the app currently shows deposits paused for the contest.
3. A user trying to fund a perps account sends tUSDC on **Shannon** (chain
   `50312`) instead of using the paper USDso/STT flow on **Hideki** (`50383`).
4. Example transaction:
   `0xc00df0462aedc0538447747e54e981536782ad7944e0c6776373a124022f017d`.
5. Query the same hash on the Hideki RPC: it returns `null`.

## Expected

The docs and the contest page make the funding path explicit in one place:

- Perps Arena gives paper USDso + 20 STT per wallet each week; no deposit and no
  claim step.
- Perps are Hideki `50383`; gas is STT; collateral is USDso
  `0xed7993A74dAe1e6656B704A424DcD8711aAf4F72`.
- Shannon `50312` is a different Somnia testnet; its tUSDC
  `0x70a86d8842fb63c4ad2b7cdddf530ebf1bb25d8e` is not perps collateral and has
  no code at that address on Hideki.
- If deposits are paused for the contest, say what is paused and what the user
  should use instead.

## Actual

The transaction is a successful Shannon transfer:

```text
chainId: 50312 (0xc488)
block:   519303985
to:      tUSDC 0x70a86d8842fb63c4ad2b7cdddf530ebf1bb25d8e
call:    transfer(0x21ad5f5569069b5c1defa50988849c421533f97b, 500000000)
amount:  500 tUSDC (6 decimals)
status:  success
```

The recipient has 500 tUSDC and 50 STT on Shannon, and **0 STT on Hideki**. The
transaction does not appear on Hideki. It is testnet value, not a real loss, but
it cannot be used as perps margin. The contest page says no deposit is required,
while the app pauses deposits and the docs do not explain how Shannon tUSDC
relates (or does not relate) to the paper USDso flow. This is a documentation/UX
gap, not a protocol bug, and it does not affect the code findings in the other
reports.

## Evidence

`tools/out/network-check.out` is the captured run of `tools/network-check.mjs`.

- Shannon RPC `eth_getTransactionByHash` returns the transfer above.
- Hideki RPC `eth_getTransactionByHash` returns `null`.
- `eth_getCode` for tUSDC `0x70a86d...` is `0x` on Hideki, non-empty on Shannon.
- Recipient balances: 500 tUSDC + 50 STT on Shannon; 0 STT on Hideki.
- Contest page: "No deposit required", "weekly 1,000 paper USDso and 20 STT",
  "No claim step".

## Environment

- Shannon: chain `50312`, RPC `https://api.infra.testnet.somnia.network`
- Hideki: chain `50383`, RPC `https://api.hideki2.infra.testnet.somnia.network`
- Tx: `0xc00df0462aedc0538447747e54e981536782ad7944e0c6776373a124022f017d`
- Contest: `https://app.testnet.dreamdex.io/competition`

## Suggested fix

Add a "Which network and how do I fund it?" callout to the contest page and the
perps docs: "Perps Arena is paper trading on Hideki 50383. You receive paper
USDso + 20 STT weekly; no deposit and no claim step. Shannon 50312 is a different
testnet; its tUSDC is not perps collateral. If deposits are paused, use the
weekly paper allocation / app top-up." Link the correct explorer and faucet for
each chain.
