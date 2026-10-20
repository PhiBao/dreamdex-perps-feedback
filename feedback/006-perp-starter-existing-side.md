# `perp-starter` manages an existing position with the configured side, not the position's side

Severity: major
Area: app

## Steps to reproduce

1. Use the official bot kit (`somnia-chain/dreamdex-bot-kit`).
2. Open a **short** position on the configured market and leave it open.
3. Run `perp-starter` with `PERP_SIDE=long` (the default), a funded key and
   `DRY_RUN=false`.
4. Watch the `existing` branch and the bracket it arms.

The relevant code is in `strategies/perp-starter/src/index.ts`:

```ts
const existing = me ? await positionIn(ctx.exchange, market) : undefined;
if (existing) {
  console.log(`already ${existing.side} ... managing it instead of opening another`);
} else { /* open SIDE */ }

const takeProfit = SIDE === "long" ? up : down;
const stopLoss = SIDE === "long" ? down : up;

bracket = await armBracket({ ctx, market, position: SIDE, takeProfit, stopLoss });
```

The watched-exit branch uses the same `SIDE` comparisons.

## Expected

When a position already exists, the bot manages **that** position: its side
determines the closing order side (`isBid`), the TP/SL trigger operators, and
the watched-exit comparisons.

## Actual

The bot logs "already short ... managing it", then builds a **long** bracket:
`takeProfit = up` (above the mark), `stopLoss = down` (below), and
`armBracket({ position: "long" })`, which sets `closingIsBid = false` (a sell).
A short is closed by buying; the registry rejects the reduce-only placement
(a sell would increase the short), or the levels are on the wrong side. With a trading key (`watchedExits`), the loop also
compares the mark using the long direction, so it can close at the wrong level.
The position can be left unprotected.

## Evidence

Code path above; line references in
`strategies/perp-starter/src/index.ts` (the `existing` block, the `takeProfit` /
`stopLoss` assignment, and `armBracket({ position: SIDE, ... })`).
The same pattern is present in the watched-exit block:
`SIDE === "long" ? liveRaw >= takeProfit : ...`.

## Environment

- Repo: <https://github.com/somnia-chain/dreamdex-bot-kit>
- Strategy: `strategies/perp-starter`
- Network: Hideki testnet, chain `50383`

## Suggested fix

```ts
const managedSide = existing?.side ?? SIDE;
```

Use `managedSide` for `takeProfit`, `stopLoss`, `armBracket`, and both watched
exit comparisons. Add a test with an existing short and `PERP_SIDE=long`.
