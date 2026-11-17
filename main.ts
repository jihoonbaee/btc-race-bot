// One entry in two cash-sized orders, followed by a 3% trailing stop.
import { runBars, type OrderInput } from './vendor/makefun-bars.ts';

let hasHeld = false;
let peak = 0n;

await runBars({
  onBatch(state): OrderInput[] {
    // Warm-up must not change either the entry latch or the trailing peak.
    if (state.warmingUp) return [];

    const holding = state.positions.get('CBBTC');
    const close = state.close('CBBTC');
    if (holding !== undefined && holding.qty > 0n) {
      // Only an observed positive position latches entry, never a submitted buy.
      hasHeld = true;
      // The SDK retains the latest close across missing bars; null means none yet.
      if (close === null) return [];
      peak = peak > close ? peak : close;
      if (close * 100n < peak * 97n) {
        return [{ side: 'sell', symbol: 'CBBTC', qty: holding.qty, max_slippage_bps: 1000 }];
      }
      return [];
    }

    // The entry window is absolute seq, including warm-up, and inclusive at 120.
    // Keep managing held positions after it; rejected sells can retry until done.
    if (hasHeld || state.seq < 5 || state.seq > 120 || state.cash <= 0n) return [];

    const cash = state.cash;
    const first = (cash * 3n) / 5n;
    const remainder = cash - first;
    // Preserve both orders even for tiny cash: market rejections leave us flat
    // and eligible to retry. Never round through Number or latch on submission.
    return [
      { side: 'buy', symbol: 'CBBTC', notional_quote_units: first, max_slippage_bps: 500 },
      { side: 'buy', symbol: 'CBBTC', notional_quote_units: remainder, max_slippage_bps: 500 },
    ];
  },
});
