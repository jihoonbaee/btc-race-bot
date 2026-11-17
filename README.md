# BTC single-entry trailing stop

![make.fun bounty](https://make.fun/badge/btc-race-24h-20261117-0603.svg)
![Rank](https://make.fun/badge/btc-race-24h-20261117-0603/jihoonbaee/btc-race-bot/rank.svg)
![Reward](https://make.fun/badge/btc-race-24h-20261117-0603/jihoonbaee/btc-race-bot/reward.svg)

A deterministic Node 22 / TypeScript bot for the [make.fun BTC race](https://make.fun/bounty/btc-race-24h-20261117-0603), trading CBBTC against USDC through `agent-fun/bars-replay/v1`.

Starting at batch sequence 5, outside warmup, it spends all cash in two buy orders: `cash * 3 // 5` and the exact remainder. If still flat, it retries through sequence 120 inclusive. Once any position is held, it never buys again. It tracks the highest close since entry and requests a full sale when `close * 100 < peak * 97`. Buy and sell slippage limits are 500 and 1000 bps respectively. Orders fill at the next bar's open; the replay liquidates remaining holdings at the end.

Run with `node main.ts` using Node 22 with TypeScript type stripping enabled. The bot uses only the standard library and the byte-identical vendored kit SDK. All strategy amounts, prices, and price comparisons use `bigint`, with constant work and storage per batch.
