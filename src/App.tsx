import styles from './App.module.css'
import { AppHeader } from './components/AppHeader/AppHeader'
import { Card } from './components/Card/Card'
import { DEFAULT_PAIRS } from './config/pairs'
import { AlertsContainer } from './containers/AlertsContainer'
import { ConnectionStatusContainer } from './containers/ConnectionStatusContainer'
import { ConverterContainer } from './containers/ConverterContainer'
import { MarketsContainer } from './containers/MarketsContainer'
import { StatsContainer } from './containers/StatsContainer'
import { useMarketFeed } from './hooks/useMarketFeed'
import { useTickerSnapshot } from './hooks/useTickerSnapshot'

export function App() {
  useTickerSnapshot(DEFAULT_PAIRS)
  const { retry } = useMarketFeed(DEFAULT_PAIRS)

  return (
    <>
      <AppHeader status={<ConnectionStatusContainer onRetry={retry} />} />

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="page-title">
          <h1 id="page-title" className={styles.title}>
            Live crypto prices
          </h1>
          <p className={styles.subtitle}>Real-time spot prices from Binance, quoted in USDT.</p>
          <StatsContainer pairs={DEFAULT_PAIRS} />
        </section>

        <div className={styles.cards}>
          <Card titleId="converter-title" title="Converter">
            <ConverterContainer pairs={DEFAULT_PAIRS} />
          </Card>
          <Card titleId="alerts-title" title="Alerts">
            <AlertsContainer />
          </Card>
        </div>

        <MarketsContainer pairs={DEFAULT_PAIRS} />
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          Market data from Binance’s public API. Prices are indicative, not financial advice.
        </p>
      </footer>
    </>
  )
}
