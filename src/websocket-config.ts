import { Red, Node, NodeProperties, NodeStatus } from 'node-red'
import io from 'socket.io-client'

export interface WebSocketConfigNode extends Node {
  name: string
  socket_token: string
  client: SocketIOClient.Socket
  streamlabels: any
  streamlabelsUnderlying: any
}
export interface Config extends NodeProperties {
  name: string
  access_token: string
  socket_token: string
}
export interface StreamlabsEvent {
  type: string
  message: any
  event_id: string
  for?: string
}

/*
TODO: make sure the connection is only active when there are nodes active
maybe by adding a method to check when a node is closed?
TODO: do whatever is needed to make use of identity properties to password protect
*/

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

export function statusUpdater(node: any, client: any) {
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

module.exports = function(RED: Red) {
  function StreamlabsWebSocketClient(
    this: WebSocketConfigNode,
    config: Config
  ) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.socket_token = config.socket_token
    this.streamlabels = {}
    this.streamlabelsUnderlying = {}

    this.client = io(
      `https://sockets.streamlabs.com/?token=${this.socket_token}`
    )
    this.client.on('event', (event: StreamlabsEvent) => {
      if (event.type === 'streamlabels') {
        this.streamlabels = event.message
        this.context().global.set(`${this.id}:streamlabels`, event.message)
      } else if (event.type === 'streamlabels.underlying')
        this.streamlabelsUnderlying = event.message
      this.context().global.set(
        `${this.id}:streamlabels.underlying`,
        event.message
      )
    })

    this.on('close', done => {
      if (this.client) {
        this.client.removeAllListeners()
        this.client.close()
      }
      done()
    })
  }
  RED.nodes.registerType(
    'streamlabs-websocket-config',
    StreamlabsWebSocketClient
  )
}
