/*
TODO: rename to apiv1 access token config
*/
import { Red, Node, NodeProperties } from 'node-red'
import io from 'socket.io-client'

export interface ConfigNode extends Node {
  name: string
  access_token: string
  socket_token: string
  getSocket(): SocketIOClient.Socket
  socket: SocketIOClient.Socket | null
  streamlabels: any
  streamlabelsUnderlying: any
}
export interface Config extends NodeProperties {
  name: string
  access_token: string
}

module.exports = function(RED: Red) {
  function TwitchJsClient(this: ConfigNode, config: Config) {
    RED.nodes.createNode(this, config)
    this.name = config.name
    this.access_token = config.access_token
  }
  RED.nodes.registerType('streamlabs-config', TwitchJsClient)
}
