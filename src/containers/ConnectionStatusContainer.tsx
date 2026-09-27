import { ConnectionStatusBadge } from '../components/ConnectionStatusBadge/ConnectionStatusBadge'
import { useMarketStore } from '../store/marketStore'

type ConnectionStatusContainerProps = {
  onRetry: () => void
}

export function ConnectionStatusContainer({ onRetry }: ConnectionStatusContainerProps) {
  const connection = useMarketStore((state) => state.connection)
  return <ConnectionStatusBadge connection={connection} onRetry={onRetry} />
}
