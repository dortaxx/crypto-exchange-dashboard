# Technical decisions

The main choices in this project, why I made them, and what I didn't do instead.

## WebSocket

**1. The connection lives in a plain TypeScript class (`BinanceSocket`), not in a React hook.**
It contains no React code, so it can be tested with a fake WebSocket and fake timers. React uses it in exactly one place (`useMarketFeed`), which also closes it on unmount.

**2. One connection, with `SUBSCRIBE` / `UNSUBSCRIBE` messages.**
Adding or removing a pair sends only the difference on the open socket, so the other prices never stop. After a reconnect the app subscribes to every pair again, because Binance forgets subscriptions when a connection closes. _Not chosen:_ a stream URL that lists all pairs, which would need a reconnect every time the list changes.

**3. Reconnect with exponential backoff and jitter, then stop.**
Each wait is a random time up to 1 s, 2 s, 4 s… (at most 30 s), so clients don't all retry at the same moment. After 10 failed reconnect attempts in a row, the app shows **Retry** instead of trying forever.

**4. Closing on purpose is different from losing the connection.**
Before closing a socket itself, the app forgets it, and every event handler ignores sockets it no longer owns. So when the app closes a socket (on unmount or when the browser goes offline), that close is never mistaken for a dropped connection, and late events from an old socket are ignored.

## Data and state

**5. Price updates are applied every 250 ms.**
Messages are collected (the latest price per pair wins) and written to the store in one go, so price updates re-render the UI at most 4 times a second. _Not chosen:_ debounce, which would keep delaying updates while prices keep streaming.

**6. Two stores.**
Live prices stay in memory. Favorites, hidden pairs and other settings are saved to `localStorage`, and they're checked when loaded so corrupted data can't break the app. Keeping them apart means prices are never written to storage.

**7. Containers and components are separate, and ESLint enforces it.**
Containers read the stores; components only receive props. Lint fails if a component imports a store or service, or if `domain/` or `services/` import React.

## Product rules

**8. "Price change" means % change since the first price received for that pair.**
That is the price when the page loaded, or when the pair was added. The brief compares prices with the first price received, so the column, the sorting and the alerts all use this same number. _Not chosen:_ Binance's 24-hour change.

**9. ±2% alerts don't repeat.**
An alert fires when a pair reaches ±2%. It fires again in the same direction only after the pair comes back inside ±1.5%; a swing to the other side (from +2% to −2%) alerts straight away. Without that gap, a price hovering around 2% would alert on every update.

**10. The converter goes through USDT.**
Every pair is quoted in USDT, so `amount × fromPrice ÷ toPrice` converts any two coins (USDT itself = 1). Inputs use a text field with our own check, which rejects negatives, signs and `1e5`. A number field would accept those.

**11. The chart is hand-made, with no chart library.**
The brief only asks for a small chart of this session's prices. Ours is one SVG line with the session's low and high, so a chart library would add size for little gain, and the maths is small and unit-tested.
