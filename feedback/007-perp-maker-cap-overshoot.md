# `perp-maker` can exceed `PERP_MM_MAX_POSITION_USDSO` when a quote fills

Severity: normal
Area: app

## Steps to reproduce

1. In the official bot kit, set:
   - `PERP_MM_MAX_POSITION_USDSO=100`
   - `PERP_MM_NOTIONAL_USDSO=25`
2. Start the bot with an existing long inventory of 90 USDso.
3. The code checks `inventory >= MAX_POSITION` (false for 90), then quotes a
   25 USDso bid.
4. A fill takes inventory to 115 USDso. If both bid and ask fill, it can reach
   140.

Code in `strategies/perp-maker/src/index.ts`:

```ts
const wouldExceed = side === "long"
  ? inventory >= MAX_POSITION
  : inventory <= -MAX_POSITION;
```

The check only tests the **current** inventory; it does not include the quote's
own notional or resting quotes.

## Expected

The configured `PERP_MM_MAX_POSITION_USDSO` is a cap on the position the bot can
build. A quote that would cross the cap is skipped or sized down.

## Actual

The bot can cross the cap by up to one quote per side (or more with both sides
resting), because it only refuses a side that is already at the cap.

## Evidence

The arithmetic above and the code path in
`strategies/perp-maker/src/index.ts` (`wouldExceed`, `wanted`,
`sizeOrder`, `placePerp`). The same function later checks `inventory` again only
on the next loop, after a fill has already happened.

## Environment

- Repo: <https://github.com/somnia-chain/dreamdex-bot-kit>
- Strategy: `strategies/perp-maker`
- Network: Hideki testnet, chain `50383`

## Suggested fix

Size each quote to the remaining capacity:

```ts
const remaining = side === "long"
  ? MAX_POSITION - inventory
  : MAX_POSITION + inventory;
```

Clamp `wanted` to `remaining` (and account for resting quotes already on the
book), or skip the side when `remaining` is below the market minimum.
