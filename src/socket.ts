import { Red, NodeProperties, Node } from "node-red";
import { ConfigNode } from "./config";

export interface SocketConfig extends NodeProperties {
  config: string;
  type_filter: string;
}

module.exports = function(RED: Red) {
  function Socket(this: Node, config: SocketConfig) {
    RED.nodes.createNode(this, config)
    const configNode = RED.nodes.getNode(config.config) as ConfigNode
    configNode.getSocket().on("event", (payload: any) => {
      if(!config.type_filter || payload.type === config.type_filter){
        this.send({ payload });
      }
    })
  }
  RED.nodes.registerType("streamlabs-socket", Socket);
};
