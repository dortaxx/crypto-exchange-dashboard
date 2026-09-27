import styles from './App.module.css'
import { AppHeader } from './components/AppHeader/AppHeader'
import { Card } from './components/Card/Card'
import { AlertsContainer } from './containers/AlertsContainer'
import { ConnectionStatusContainer } from './containers/ConnectionStatusContainer'
import { ConverterContainer } from './containers/ConverterContainer'
import { MarketsContainer } from './containers/MarketsContainer'
import { PriceTargetsContainer } from './containers/PriceTargetsContainer'
import { SessionChartContainer } from './containers/SessionChartContainer'
import { StatsContainer } from './containers/StatsContainer'
import { ThemeToggleContainer } from './containers/ThemeToggleContainer'
import { useMarketFeed } from './hooks/useMarketFeed'
import { useTickerSnapshot } from './hooks/useTickerSnapshot'
import { useTrackedPairs } from './hooks/useTrackedPairs'

export function App() {
  const pairs = useTrackedPairs()
  useTickerSnapshot(pairs)
  const { retry } = useMarketFeed(pairs)

  return (
    <>
      <AppHeader
        status={<ConnectionStatusContainer onRetry={retry} />}
        controls={<ThemeToggleContainer />}
      />

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="page-title">
          <h1 id="page-title" className={styles.title}>
            Live crypto prices
          </h1>
          <p className={styles.subtitle}>Real-time spot prices from Binance, quoted in USDT.</p>
          <StatsContainer pairs={pairs} />
        </section>

        <div className={styles.workspace}>
          <Card titleId="chart-title" title="Session chart" className={styles.chartCard}>
            <SessionChartContainer pairs={pairs} />
          </Card>
          <div className={styles.side}>
            <Card titleId="converter-title" title="Converter">
              <ConverterContainer pairs={pairs} />
            </Card>
            <Card titleId="alerts-title" title="Alerts">
              <AlertsContainer />
              <PriceTargetsContainer pairs={pairs} />
            </Card>
          </div>
        </div>

        <MarketsContainer pairs={pairs} />
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          Market data from Binance’s public API. Prices are indicative, not financial advice.
        </p>
      </footer>
    </>
  )
}
