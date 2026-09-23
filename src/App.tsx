import styles from './App.module.css'
import { AppHeader } from './components/AppHeader/AppHeader'
import { Card } from './components/Card/Card'
import { SectionHeading } from './components/SectionHeading/SectionHeading'
import { StatStrip } from './components/StatStrip/StatStrip'
import { DEFAULT_PAIRS } from './config/pairs'
import { PairTableContainer } from './containers/PairTableContainer'
import { useTickerSnapshot } from './hooks/useTickerSnapshot'

const sessionStats = [
  { label: 'Pairs tracked', value: String(DEFAULT_PAIRS.length) },
  { label: 'Top gainer since open' },
  { label: 'Top loser since open' },
  { label: 'Alerts' },
]

export function App() {
  useTickerSnapshot(DEFAULT_PAIRS)

  return (
    <>
      <AppHeader />

      <main className={styles.page}>
        <section className={styles.hero} aria-labelledby="page-title">
          <h1 id="page-title" className={styles.title}>
            Live crypto prices
          </h1>
          <p className={styles.subtitle}>Real-time spot prices from Binance, quoted in USDT.</p>
          <StatStrip stats={sessionStats} />
        </section>

        <div className={styles.cards}>
          <Card titleId="converter-title" title="Converter">
            <p className={styles.muted}>Available once live prices arrive.</p>
          </Card>
          <Card titleId="alerts-title" title="Alerts">
            <p className={styles.empty}>No alerts yet</p>
            <p className={styles.muted}>
              Pairs that move 2% or more since you opened the page will appear here.
            </p>
          </Card>
        </div>

        <section aria-labelledby="markets-heading">
          <SectionHeading id="markets-heading" title="Markets" />
          <PairTableContainer pairs={DEFAULT_PAIRS} />
        </section>
      </main>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>
          Market data from Binance’s public API. Prices are indicative, not financial advice.
        </p>
      </footer>
    </>
  )
}
