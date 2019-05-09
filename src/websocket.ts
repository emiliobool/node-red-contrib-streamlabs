import { Red, NodeProperties, Node } from 'node-red'
import { WebSocketConfigNode } from './websocket-config'
import { inspect } from 'util'
import statusUpdater from './statusUpdater'

export interface StreamlabsWebSocketConfig extends NodeProperties {
  config: string
  type_filter: string
}

module.exports = function(RED: Red) {
  function StreamlabsWebSocket(this: Node, config: StreamlabsWebSocketConfig) {
    RED.nodes.createNode(this, config)
    const configNode = RED.nodes.getNode(config.config) as WebSocketConfigNode
    const client = configNode.client

    const clearStatusUpdater = statusUpdater(this, client)

    const onEvent = (payload: any): void => {
      if (!config.type_filter || payload.type === config.type_filter) {
        try {
          if (payload.type === 'streamlabels') {
            delete payload.message.underlying
          }
          payload = JSON.parse(JSON.stringify(payload))
          this.send({ payload })
        } catch (error) {
          this.error(error.toString())
          this.error(inspect(payload))
        }
      }
    }
    client.on('event', onEvent)

    this.on('close', done => {
      client.removeListener('event', onEvent)
      clearStatusUpdater()
      done()
    })
  }

  RED.nodes.registerType('streamlabs-websocket', StreamlabsWebSocket)
}
