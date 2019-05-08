import { Red, NodeProperties, Node } from 'node-red'
import { WebSocketConfigNode } from './websocket-config'
import { inspect } from 'util'

export interface StreamlabsWebSocketConfig extends NodeProperties {
  config: string
  type_filter: string
}

module.exports = function(RED: Red) {
  function StreamlabsWebSocket(this: Node, config: StreamlabsWebSocketConfig) {
    RED.nodes.createNode(this, config)
    const configNode = RED.nodes.getNode(config.config) as WebSocketConfigNode
    configNode.socket.on('event', (payload: any) => {
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
    })
  }
  RED.nodes.registerType('streamlabs-websocket', StreamlabsWebSocket)
}
