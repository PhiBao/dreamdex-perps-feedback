# Reads after a successful order can sample a stale block, so the next max-size quote reverts

Severity: major
Area: SDK

## Steps to reproduce

1. Deposit margin and set leverage (the live run used 50 USDso, 5x, BTC-PERP).
2. Query `getMaxPerpOrderSize` at a resting price (`0.8 * mark`). It returns
   `776000` sats.
3. Place a resting bid for half of that (`388000` sats) and wait for
   `placePerpOrder` to resolve with a success receipt.
4. Immediately call `getMarginAccount` and `getMaxPerpOrderSize` again.
5. Place a second order at the returned `maxQuantity`.

The live reproduction is `tools/out/read-after-write.out`; the wallet was
`0xDbFe5c4d0256D2459bB216caB905999Ca41bE349` on Hideki.

## Expected

After `placePerpOrder` resolves, the order's margin is locked and the next
`getMaxPerpOrderSize` reflects it: `lockedCollateral` is non-zero and
`maxQuantity` drops from `776000` to about `388000`. A second order at that max
should succeed.

## Actual

In 3 of 4 live runs, the reads sampled a block **six blocks behind** the
successful receipt:

```text
placeHash 0x4e6f...5fd7
receiptBlock 33057124
readHead     33057124
marginBlock  33057118
maxBlock     33057118
unlocked     99920398400000000000
locked       0
max1         776000
second       ERR
```

The successful receipt was at block `33057124`, but `getMarginAccount` and
`getMaxPerpOrderSize` returned `asOfBlock 33057118`; `lockedCollateral` was still
`0` and `maxQuantity` was still `776000`. The second order at that max reverted.
The same happened at receipts `33057140` and `33057154`.

The one run where the read block equaled the receipt block behaved correctly:

```text
placeHash 0x0955...bc1b
receiptBlock 33057108
marginBlock  33057108
maxBlock     33057108
locked       49960044000000000000
max1         388000
second       ok
```

So the failure is a read-consistency race, not an order-size calculation.

## Evidence

`tools/out/read-after-write.out` contains the four live runs, including:

- `0x09555e29109e7f3345b62ed911dd415933dc477bce3bd22e8c5925bcf6b4bc1b`
  (receipt block 33057108; correct read; second order ok)
- `0x4e6f526b6df4d4f2f584ec82734a8799ce8a93a682c03066305aa50118cb5fd7`
  (receipt block 33057124; read block 33057118; second order reverted)
- `0xba2cf2c414b155baae38bb92b54c5adc71984e51b0c78fa10de4ad1e49de0cb6`
- `0x1d69e51a2c28484460bbfb70174bd37942542c43888126c504bfa3560bea73a9`

The second order's revert was not decoded in every run; one run returned
`rpc eth_call failed: RPC Request failed`, another `Execution reverted for an
unknown reason`. The key observable is the stale `asOfBlock` and unchanged
`maxQuantity` after a successful resting order.

## Environment

- SDK: `@somnia-chain/markets-sdk@0.32.1`
- Network: Hideki testnet, chain `50383`
- Live blocks: `33057108` to `33057154`
- Wallet: `0xDbFe5c4d0256D2459bB216caB905999Ca41bE349`
- RPC: `https://api.hideki2.infra.testnet.somnia.network`
- WS: `wss://api.hideki2.infra.testnet.somnia.network/ws`

## Suggested fix

After a write, do not sample an arbitrary head for the next sizing read. Use the
receipt's `blockNumber` as a floor and wait until the read client's head is at
least that block before returning `getMarginAccount` / `getMaxPerpOrderSize`, or
add an explicit `blockNumber` option to those reads. Document that an immediate
read after `placePerpOrder` can be stale on Hideki. This also affects the
official `perp-maker`, which places a bid and an ask back to back.
