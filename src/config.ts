import { Red, Node, NodeProperties } from "node-red";
import io from "socket.io-client"

export interface ConfigNode extends Node{
    name: string;
    access_token: string;
    socket_token: string;
    getSocket(): SocketIOClient.Socket;
    socket: SocketIOClient.Socket | null;
    streamlabels: any;
    streamlabelsUnderlying: any;
}
export interface Config extends NodeProperties{
    name: string;
    access_token: string;
    socket_token: string;
}
export interface StreamlabsEvent{
    type: string;
    message: any;
    event_id: string;
    for?: string;
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
    this.streamlabels = {}
    this.streamlabelsUnderlying = {}
    this.getSocket = () => {
        if(!this.socket){
            this.socket = io(`https://sockets.streamlabs.com/?token=${this.socket_token}`)
            this.socket.on("event", (event: StreamlabsEvent) => {
                if(event.type === "streamlabels"){
                    this.streamlabels = event.message
                    this.context().global.set(`${this.name}_streamlabels`, event.message)
                }else if(event.type === "streamlabels.underlying")
                    this.streamlabelsUnderlying = event.message
                    this.context().global.set(`${this.name}_streamlabels.underlying`, event.message)
            })
        }
        return this.socket
    }
    this.on('close', (done) => {
        if(this.socket){
            this.socket.close()
        }
        done()
    })
  }
  RED.nodes.registerType("streamlabs-config", TwitchJsClient);
};
