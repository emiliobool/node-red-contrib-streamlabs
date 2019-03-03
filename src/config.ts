import { Red, Node, NodeProperties } from "node-red";
import io from "socket.io-client"

export interface ConfigNode extends Node{
    name: string;
    access_token: string;
    socket_token: string;
    getSocket(): SocketIOClient.Socket;
    socket: SocketIOClient.Socket | null;
}
export interface Config extends NodeProperties{
    name: string;
    access_token: string;
    socket_token: string;
}
module.exports = function(RED: Red) {
  function TwitchJsClient(
    this: ConfigNode,
    config: Config
  ) {
    RED.nodes.createNode(this, config);
    this.name = config.name
    this.access_token = config.access_token
    this.socket_token = config.socket_token
    this.getSocket = () => {
        if(!this.socket){
            this.socket = io(`https://sockets.streamlabs.com/?token=${this.socket_token}`)
            this.socket.on("event", (event: object) => this.log(event))
        }
        return this.socket
    }
  }
  RED.nodes.registerType("streamlabs-config", TwitchJsClient);
};
