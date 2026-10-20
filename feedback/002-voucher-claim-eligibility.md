# Voucher eligibility says a clean EOA can claim, but `claim()` reverts

Severity: major
Area: SDK

## Steps to reproduce

1. With `@somnia-chain/markets-sdk@0.32.1`, call
   `client.getPerpVoucherEligibility(btc.marginBank, "0x0000000000000000000000000000000000000001")`.
2. Call `claim()` on the `VoucherDistributor` (`0x2ACD9EFdA721450906bfE1bef3edE269636E42C4`)
   from the same address with `eth_call`.
3. Compare with the campaign state and the public contest page.

Run `node tools/claim-eligibility.mjs`.

## Expected

`{ eligible: true }` means a claim sent now would succeed. The SDK's own
`PerpVoucherEligibility` docs say: "A claim sent now would succeed, unless state
changes before it lands." The developer docs say: "Any address can claim the
1,000 USDso perps credit once, as long as it holds no perp positions or orders."
The public contest page (`https://app.testnet.dreamdex.io/competition`) describes
a different flow: "No deposit required", "Each of them will receive the
weekly 1,000 paper USDso and 20 STT", and "No claim step."

## Actual

The SDK returns:

```json
{ "eligible": true, "grantAmount": "1000000000000000000000" }
```

The same address's `claim()` reverts with the undocumented custom error
`0x3e31dcc2`. The campaign is active, the budget is non-zero, the address has no
positions, no main funding and `isClaimed == false`:

```json
{
  "block": "28506455",
  "activePools": [],
  "mainFunded": "0",
  "claimed": false,
  "budgetRemaining": "431905000000000000000000000",
  "config": {
    "grantAmount": "1000000000000000000000",
    "campaignStart": "1790553600",
    "campaignEnd": "1798477478"
  }
}
```

The live path is the weekly paper-USDso/STT allocation and a batch credit, not
`claim()`. For example, tx
`0x1e80f36fd0bb56f65728b97f597a869ed987316c32163924565e8a3f758ab77d` credits many
accounts with 1,000 USDso through `creditAccount`-style logs.

## Evidence

`tools/out/claim-eligibility.out`:

```text
eligibility: { eligible: true, grantAmount: 1000000000000000000000 }
activePools: []
mainFunded: 0
claimed: false
claim(): REVERT 0x3e31dcc2
```

The SDK's declared error table does not name `0x3e31dcc2`, so a caller cannot
branch on it.

## Environment

- SDK: `@somnia-chain/markets-sdk@0.32.1`
- Network: Hideki testnet, chain `50383`
- Block: `28506455`
- Address: `0x0000000000000000000000000000000000000001`
- Distributor: `0x2ACD9EFdA721450906bfE1bef3edE269636E42C4`

## Suggested fix

Either add the missing distributor gate to `getPerpVoucherEligibility` (the
distributor has a condition that `getConfig()` does not expose), or remove the
self-claim path from the SDK/docs and document that credits are airdropped.
Also add `0x3e31dcc2` to the error table if it is kept.
