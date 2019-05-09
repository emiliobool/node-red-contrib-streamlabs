import { NodeStatus } from 'node-red'

export const connectedStatus: NodeStatus = {
  fill: 'green',
  shape: 'dot',
  text: 'connected',
}
export const connectingStatus: NodeStatus = {
  fill: 'green',
  shape: 'ring',
  text: 'connecting...',
}
export const disconnectedStatus: NodeStatus = {
  fill: 'red',
  shape: 'ring',
  text: 'disconnected',
}

export default function statusUpdater(node: any, client: any) {
  const onConnected = () => node.status(connectedStatus)
  const onConnecting = () => node.status(connectingStatus)
  const onDisconnected = () => node.status(disconnectedStatus)

  if (client.connected) onConnected()
  else onDisconnected()

  client.on('connect', onConnected)
  client.on('reconnect', onConnected)
  client.on('reconnecting', onConnecting)
  client.on('disconnect', onDisconnected)

  return function() {
    client.removeListener('connect', onConnected)
    client.removeListener('reconnect', onConnected)
    client.removeListener('reconnecting', onConnecting)
    client.removeListener('disconnect', onDisconnected)
  }
}
