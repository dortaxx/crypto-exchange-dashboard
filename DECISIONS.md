# Decisions

Each entry covers what was chosen, what else was considered, and why. The README has the short version.

## Real-time data

### 1. `miniTicker` stream on the market-data endpoint

- **Chosen:** `wss://data-stream.binance.vision/ws` with one `<symbol>@miniTicker` stream per pair.
- **Alternatives:** `@trade` (one message per trade, often dozens per second for BTC), `@ticker` (a larger payload with fields we don't use), or `@bookTicker`, which is best bid/ask rather than a last price.
- **Why:** `miniTicker` sends the last price (`c`) and event time (`E`) about once per second per pair. That is exactly what a price board needs, at a predictable rate. `data-stream.binance.vision` is Binance's public market-data-only host.
- **Gotcha:** stream names must be **lowercase**. Binance acknowledges `BTCUSDT@miniTicker` but never sends data for it, so `toStreamName` lowercases.

### 2. One socket, with `SUBSCRIBE` / `UNSUBSCRIBE` messages

- **Chosen:** connect once to `/ws` and manage streams with JSON `SUBSCRIBE` / `UNSUBSCRIBE` requests. The socket remembers what the server currently has and sends only the difference from what the app wants.
- **Alternatives:** a combined-stream URL (`/stream?streams=a/b/c`), which has to reconnect whenever the pair list changes.
- **Why:** adding or removing a pair never drops the other streams (bonus task 3). After every (re)connect, the socket subscribes to the full current set again, because Binance forgets subscriptions when a connection closes.
- **Pacing:** Binance allows about 5 control messages per second per connection. Beyond that it goes quiet and then closes the socket (`1008 Too many requests`). The first change is sent at once. Further changes within the next 500ms are folded together, so a burst of clicks in "Edit pairs" becomes at most one `UNSUBSCRIBE` and one `SUBSCRIBE` every half second.

### 3. REST snapshot first, then the stream

- **Chosen:** on load, one `GET /api/v3/ticker/24hr?symbols=[…]&type=MINI` fills the prices, then the WebSocket keeps them fresh. Later additions fetch a snapshot only for the pairs that have no price yet.
- **Alternatives:** wait for the first WebSocket message for every pair.
- **Why:** the table has real numbers within one request instead of skeletons until the socket is up. Both sources write through the same function (`nextPairPrice`), which ignores anything older than the price it already holds (compared by exchange timestamp), so a slow snapshot can't overwrite a newer live price.

### 4. Reconnect: exponential backoff with full jitter, then give up

- **Chosen:** the delay is `random(0, min(30s, 1s × 2^(attempt-1)))`. After 10 failed attempts the state becomes `error` and the header shows **Retry**.
- **Alternatives:** a fixed delay; backoff without jitter; retrying forever.
- **Why:** backoff avoids hammering a server that is down, and jitter stops many clients from reconnecting in lockstep. Giving up after 10 tries is more honest than a spinner that never ends, and Retry hands control back to the user.
- **Detail:** the attempt counter resets on the **first price message**, not on `open`. A socket that opens but never delivers data would otherwise reset the counter each time and retry quickly forever.

### 5. Intentional close vs dropped connection

- **Chosen:** before closing a socket on purpose (unmount, going offline, the watchdog), the class clears its reference to it (`this.socket = null`, then `close()`). Every event handler first checks `socket !== this.socket` and ignores events from a socket that is no longer current.
- **Why:** `onclose` fires for both kinds of close. Without this guard, an intentional close would trigger a reconnect, and late events from an old socket could corrupt state after a newer socket had opened.

### 6. Watchdog for silent connections, with a liveness check

- **Chosen:** if nothing arrives for 10 seconds while pairs are subscribed, the socket sends `LIST_SUBSCRIPTIONS`. Any reply (a price, an ack or an error) proves the connection is alive and restarts the timer. Only if nothing answers within 5 more seconds is the socket treated as dead and replaced.
- **Alternatives:** drop the socket after N seconds of silence; rely on `onclose` alone.
- **Why:** a half-open TCP connection (laptop sleep, Wi-Fi change) can stay "open" without delivering anything, and `onclose` may never fire. Binance also closes every connection after 24 hours. But `miniTicker` only sends when a price changes: a live test showed ETC sending 2 messages in 40 seconds. A plain silence timer would keep killing healthy connections for quiet coins. Asking before hanging up separates "quiet" from "dead".

### 7. Offline / online events

- **Chosen:** on the browser's `offline` event, stop retrying and show **Offline**. On `online`, reconnect straight away with a fresh attempt count.
- **Why:** retrying while there is no network only burns through the 10 attempts and ends in a misleading error.

### 8. Batching updates every 250ms

- **Chosen:** incoming tickers go into a `Map` keyed by symbol (the latest one wins), which is flushed to the store every 250ms.
- **Alternatives:** write to the store on every message; throttle per symbol; `requestAnimationFrame`; debounce.
- **Why:** there is one store write, and so at most one render pass, every 250ms however many messages arrive, while prices still feel live. Only the latest price per pair matters for display, so dropping the in-between prices is safe. Debounce would be wrong here: a steady stream would keep postponing the update forever.
- **Trade-off:** a spike that crosses ±2% and comes back within 250ms would not trigger an alert. At about 1 message per second per pair, that almost never happens.

### 9. Pair changes filter the stream at two layers

- **Chosen:** the socket drops tickers for symbols it no longer follows. The feed hook also filters the pending batch against the current pair list before flushing. Removing a pair forgets its prices and alert state.
- **Why:** after `UNSUBSCRIBE`, Binance can still deliver a message or two, and a ticker may already be waiting in the batch. Without the filters, a removed pair could reappear or raise an alert.

## State

### 10. Two stores

- **Chosen:** `marketStore` (prices, alert state, alerts, connection; in memory only) and `preferencesStore` (pairs, favorites, hidden, view, sort, price targets, theme; persisted).
- **Alternatives:** one store with a `partialize` filter; React Context.
- **Why:** they change at very different rates. Prices update several times per second, and Zustand's `persist` writes on every `set`, so one combined store would write `localStorage` constantly. Context would re-render every consumer on every price change. Zustand selectors re-render only the components whose slice changed.

### 11. Validate saved preferences on load

- **Chosen:** `persist`'s `merge` passes the saved JSON through `sanitizePreferences`. It keeps only known symbols, removes duplicates, checks every enum and price target, and falls back to defaults for anything else. Favorites, hidden pairs and targets for pairs that are no longer followed are dropped.
- **Why:** `localStorage` is user-editable and survives app updates. A corrupted or old value must never crash the app or subscribe to a symbol that doesn't exist.

### 12. Containers vs presentational components, enforced by lint

- **Chosen:** `containers/` read stores and build view data, and `components/` only take props. ESLint `no-restricted-imports` makes it a lint error for a component to import a store, service, hook or container, or for `domain/` / `services/` to import React.
- **Why:** components stay reusable and easy to reason about, and the separation the brief asks for is checked automatically, not just by convention.

## Product rules

### 13. "Price change" = % since you opened the page

- **Chosen:** for sorting, the "Since open" column, stats and alerts, the change is measured from the first price received for each pair after the page loads.
- **Alternatives:** Binance's 24-hour change (`P` in the full ticker).
- **Why:** the brief defines the alert baseline as the first price after load. Using the same number everywhere means the column, the sort and the alerts never disagree. The baseline is not persisted and survives reconnects, so a dropped connection doesn't reset it.

### 14. ±2% alert with hysteresis

- **Chosen:** alert at |change| ≥ 2% (inclusive). Once a pair has alerted, it must return inside **±1.5%** before it can alert again. Going straight from +2.5% to −2.5% is a new alert, because the direction changed.
- **Alternatives:** alert again every time the price is outside 2%; re-arm as soon as the price is back under 2%.
- **Why:** the brief forbids duplicate alerts while a pair stays beyond the threshold. Without a gap between the "fire" and "re-arm" levels, a price oscillating around 2.00% would alert on every tick.
- **Detail:** the check uses the change **rounded to 2 decimals, as shown on screen**. Floating point makes `2.5 → 2.55` equal `1.9999999999999927%`. Without rounding, the screen would show "+2.00%" but no alert would fire.

### 15. Hidden pairs don't raise ±2% alerts

- **Why:** hiding means "I don't want to see this". Their prices keep updating, so restoring a pair is instant and its baseline stays correct. Price targets are explicit requests, so they still fire for hidden pairs.

### 16. Hide vs remove

- **Hide** (§6) keeps the pair subscribed and restorable, and is saved. **Remove** (Edit pairs) unsubscribes it, forgets its data, and drops its favorite, hidden and target entries.
- **Why:** they solve different problems, a temporary declutter versus changing what you follow. Remove lives in a separate panel so it can't be clicked by accident next to hide. At least one pair always stays followed.

### 17. Converter goes through USDT

- **Chosen:** every tracked coin is priced in USDT, so `amount × fromPrice / toPrice` converts any pair of coins. USDT itself is priced at exactly 1.
- **Why:** there are only USDT pairs, so a direct BTC→ETH price doesn't exist. Two USDT legs are exact enough for a dashboard, and the result updates whenever either price moves.

### 18. Own number parser, text input

- **Chosen:** `<input type="text" inputMode="decimal">` with `parseAmount`, which accepts digits with one `.` or `,` and rejects signs, negatives, exponents (`1e5`) and anything else, with a specific message for each.
- **Alternatives:** `<input type="number">`.
- **Why:** number inputs accept `e`, `+` and `-`, return an empty string for invalid text instead of reporting it, and behave differently across browsers. Accepting `,` supports locales where it is the decimal separator.

### 19. Price targets

- **Chosen:** the direction is fixed when the target is created: a target above the current price waits for a rise, one below waits for a fall. A target equal to the current price is refused. Each target fires once and is deleted, and targets are saved. The feed checks them on every batch.
- **Why:** fixing the direction removes any ambiguity about "reaching" a price. One-shot targets match how exchange price alerts behave and avoid repeat alerts. Duplicates are refused, and there is a limit of 10.

## UI

### 20. Hand-drawn SVG chart instead of a chart library

- **Chosen:** a pure `buildPriceChart` function turns the session history into SVG paths, round axis ticks and a frame, and the component draws it. Coordinates are percentages in a stretched `viewBox`. Text, grid lines, the crosshair and the dot are HTML overlays, so they stay crisp at any size.
- **Alternatives:** Recharts, Chart.js or lightweight-charts.
- **Why:** the brief asks for "a small price history chart". A library would add tens of kilobytes and its own styling system for one line, one area and two axes. The maths is small and fully unit-tested.
- **Details:**
  - **Scaling.** The vertical range is at least 0.05% of the price, so a one-cent move isn't stretched into a cliff.
  - **History size.** It is capped at 600 points per pair. When full, every second point is dropped, so the chart always spans the whole session at bounded memory (the first point, the opening price, is always kept).
  - **Time labels.** The chart measures its width, asks for fewer ticks when narrow, and pins the start and latest times to the edges.

### 21. Theme with `light-dark()` and a pre-paint script

- **Chosen:** each colour token is defined once as `light-dark(light, dark)`. Switching theme only sets `color-scheme` on `<html>`. Without a saved choice, it follows the system. A few lines of inline script in `index.html` read the saved theme and set it before React loads.
- **Alternatives:** duplicate token blocks for `[data-theme]` and the media query; applying the theme only from React.
- **Why:** there's a single source of truth for every colour. Without the pre-paint script, a light-theme user would see a dark flash on every reload while React loads.

### 22. Custom coin picker instead of `<select>`

- **Why:** a native `<select>` can't show coin icons or match the design. The custom picker follows the ARIA listbox pattern: arrow keys, Home/End, type-ahead, Enter/Space, Escape, and closing on an outside click.

### 23. Loading, empty and error states are separate

- Skeletons appear while the first prices load, staggered per row. An empty search, empty favorites and all pairs hidden each get their own message and a relevant action ("Clear search", "Show all pairs", "Show hidden pairs", or "Add Dogecoin" when you search for a coin you don't follow). A failed REST snapshot shows an error only while there are no prices at all. As soon as live data arrives, it clears.

### 24. Status labels follow the brief's wording

- The badge reads **Connected**, **Reconnecting (try n)…**, **Offline** (the browser has no network), **Connecting…**, and **Connection lost** + **Retry** once the socket has given up. The first three are the brief's Connected / Reconnecting / Disconnected states. "Offline" is the disconnected state named after its cause, because it resumes on its own when the network returns.
- On phones, the wordmark next to the logo is visually hidden (screen readers still read it) and the letter spacing tightens, so every state, including Retry, fits in 320px.

### 25. Screen readers and focus

- Live prices update several times a second, so they are **not** in live regions. Otherwise a screen reader would talk non-stop. Only things the user caused are announced: validation errors, the number of search results, connection changes and new alerts.
- When the control you used disappears (hiding a row, dismissing an alert, removing a target, restoring the last hidden pair), focus moves to the same control in the next row, or to a sensible neighbour, instead of falling back to the top of the page.

## Tooling

### 26. Strict TypeScript and lint

- `strict`, `noUncheckedIndexedAccess` (array and record lookups may be `undefined`), `verbatimModuleSyntax` and `erasableSyntaxOnly` are on. No `any`, and unknown JSON is narrowed with type guards (`isRecord`, `parseSocketMessage`).
- typescript-eslint `strictTypeChecked` + `stylisticTypeChecked`, React hooks rules, and Prettier via `eslint-config-prettier`.

### 27. React StrictMode in development

- StrictMode mounts effects twice in development, so the app briefly opens a socket and closes it again. Chrome may log one "closed before the connection is established" warning. This is expected and proves the cleanup works. The production build opens exactly one socket.
