# Hideki address set omits `operatorPermissionsRegistry`, so perp stops throw `NotConfiguredError`

Severity: normal
Area: SDK

## Steps to reproduce

1. Inspect `SOMNIA_HIDEKI_TESTNET_ADDRESSES`.
2. Build a perp stop with `trader.buildPlacePerpStopOrder({ registry, pool, ... })`
   and omit `operatorRegistry`.
3. Compare with the developer docs, which list
   `OperatorPermissionsRegistry 0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3a`.

Run `node tools/address-set.mjs`.

## Expected

The bundled Hideki address set contains the registry used by the stop path, as
the docs do, so the one-time operator grant works without a manual override.

## Actual

```text
operatorPermissionsRegistry: undefined
keys: binaryModule, binaryPoolBeacon, binaryPoolImpl, binarySettlement,
clobFactory, collateral, marginBank, marketCreator, marketCreatorFactory,
marketsCore, oracleHub, perpPoolFactory, priceFeedScheduler, testUsdc
docs address: 0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3a
```

`placePerpStopOrder` / `buildPlacePerpStopOrder` then throws
`NotConfiguredError: operatorRegistry or addresses.operatorPermissionsRegistry`.
The bot kit passes the address explicitly and notes that the SDK's bundled set
does not carry it.

## Evidence

`tools/out/address-set.out`; `tools/out/stop-no-registry.out` shows the resulting
error from `buildPlacePerpStopOrder` with `operatorRegistry` omitted:

```text
NotConfiguredError @somnia-chain/markets-sdk: a perp stop order — needs operatorRegistry or addresses.operatorPermissionsRegistry
```

The SDK's `perp/stops.ts` `operatorGrantCall` resolves
`p.operatorRegistry ?? w.addresses().operatorPermissionsRegistry`.

## Environment

- SDK: `@somnia-chain/markets-sdk@0.32.1`
- Network: Hideki testnet, chain `50383`

## Suggested fix

Add `operatorPermissionsRegistry: "0x6B2FbfeD328FF5F20C0BE7D3C3437613aFFE8D3a"`
to `SOMNIA_HIDEKI_TESTNET_ADDRESSES`, and add a test that the stop path works
with the bundled set.
