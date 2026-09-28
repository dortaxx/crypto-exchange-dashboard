# Technical decisions

The main choices in this project, why I made them, and what I didn't do instead.

## WebSocket

**1. The connection lives in a plain TypeScript class (`BinanceSocket`), not in a React hook.**
It contains no React code, so it can be tested with a fake WebSocket and fake timers. React uses it in exactly one place (`useMarketFeed`), which also closes it on unmount.

**2. One connection, with `SUBSCRIBE` / `UNSUBSCRIBE` messages.**
Adding or removing a pair sends only the difference on the open socket, so the other prices never stop. After a reconnect the app subscribes to every pair again, because Binance forgets subscriptions when a connection closes. _Not chosen:_ a stream URL that lists all pairs, which would need a reconnect every time the list changes.

**3. Reconnect with exponential backoff and jitter, then stop.**
Each wait is a random time up to 1 s, 2 s, 4 s… (at most 30 s), so clients don't all retry at the same moment. After 10 failed attempts the app shows **Retry** instead of trying forever.

**4. Closing on purpose is different from losing the connection.**
Before closing a socket itself, the app forgets it, and every event handler ignores sockets it no longer owns. So an intentional close never triggers a reconnect, and late events from an old socket are ignored.

**5. Silent connections are checked, not just dropped.**
If nothing arrives for 10 s, the app asks Binance for its subscription list. A reply means the connection is alive; no reply within 5 s means it's replaced. Quiet coins can go 20 s without a message, so dropping on silence alone would kill healthy connections.

## Data and state

**6. Price updates are applied every 250 ms.**
Messages are collected (the latest price per pair wins) and written to the store in one go, so the UI renders at most 4 times a second. _Not chosen:_ debounce, which would keep delaying updates while prices keep streaming.

**7. Two stores.**
Live prices stay in memory. Favorites, hidden pairs and other settings are saved to `localStorage`, and they're checked when loaded so corrupted data can't break the app. Keeping them apart means prices are never written to storage.

**8. Containers and components are separate, and ESLint enforces it.**
Containers read the stores; components only receive props. Lint fails if a component imports a store or service, or if `domain/` or `services/` import React.

## Product rules

**9. "Price change" means % change since the page was opened.**
The brief compares prices with the first price received, so the column, the sorting and the alerts all use this same number. _Not chosen:_ Binance's 24-hour change.

**10. ±2% alerts don't repeat.**
An alert fires when a pair reaches ±2%, and can fire again only after the pair comes back inside ±1.5%. Without that gap, a price hovering around 2% would alert on every update. Hidden pairs keep updating but don't raise these alerts.

**11. The converter goes through USDT.**
Every pair is quoted in USDT, so `amount × fromPrice ÷ toPrice` converts any two coins (USDT itself = 1). Inputs use a text field with our own check, which rejects negatives, signs and `1e5`. A number field would accept those.

**12. The chart is plain SVG.**
The brief asks for a small chart: one line and two axes. A chart library would add size for little gain, and the maths is small and unit-tested.
