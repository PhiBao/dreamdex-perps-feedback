# SDK has no perp operator (`…For`) writes or perp batch placement, despite the docs

Severity: normal
Area: SDK

## Steps to reproduce

1. Inspect the public ABI exports of `@somnia-chain/markets-sdk@0.32.1`.
2. Search the SDK for perp `placeOrderFor`, `cancelOrderFor`,
   `reduceOrderFor`, or `placeOrdersFor`.

Run `node tools/sdk-surface.mjs`.

## Expected

The perps developer docs tell bot builders to call `placeOrderFor`,
`cancelOrderFor` and `reduceOrderFor` for a linked wallet. The same page
describes batch `placeOrdersFor` rejections and `listPerpOrderRejections`.
The SDK should expose those writes, or the docs should explain the raw-ABI
workaround.

## Actual

```text
perpPoolWriteAbi functions: [ 'placeOrder', 'cancelOrder', 'updateFunding', 'marginBank' ]
orderBookBatchWriteAbi functions: [ 'placeOrders', 'cancelOrders', 'reduceOrders', 'amendOrders' ]
placeOrderFor: false
cancelOrderFor: false
reduceOrderFor: false
placeOrdersFor: false
```

There is no perp operator write and no perp batch placement. The official bot
kit works around this by hand-rolling the ABI in
`packages/perp-core/src/operator.ts`:

> "The markets SDK has no perp `…For` writes, so the three calls are sent here
> with viem."

The `placeOrders` in `orderBookBatchWriteAbi` is spot-only (its own comment says
the generic path reverts `UseBinaryPlacement` on binary and is not the perp
batch).

## Evidence

`tools/out/sdk-surface.out` is the captured output above.

## Environment

- SDK: `@somnia-chain/markets-sdk@0.32.1`
- Network: Hideki testnet, chain `50383`

## Suggested fix

Add the three operator writes and `placeOrdersFor` to the perp write ABI and
the `Trader` surface, or document the viem workaround in the perps developer
page next to the raw `placeOrderFor` signature.
