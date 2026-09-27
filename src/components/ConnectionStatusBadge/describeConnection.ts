import type { ConnectionState } from '../../domain/types'

export type BadgeTone = 'live' | 'waiting' | 'off' | 'problem'

export function describeConnection(connection: ConnectionState): {
  label: string
  tone: BadgeTone
} {
  switch (connection.status) {
    case 'connecting':
      return { label: 'Connecting…', tone: 'waiting' }
    case 'connected':
      return { label: 'Live', tone: 'live' }
    case 'reconnecting':
      return { label: `Reconnecting (try ${connection.attempt})…`, tone: 'waiting' }
    case 'disconnected':
      return connection.reason === 'offline'
        ? { label: 'Offline', tone: 'off' }
        : { label: 'Disconnected', tone: 'off' }
    case 'error':
      return { label: 'Connection lost', tone: 'problem' }
  }
}
