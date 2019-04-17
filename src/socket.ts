import { Red, NodeProperties, Node } from "node-red"
import { ConfigNode } from "./config"
import { inspect } from 'util'

export interface SocketConfig extends NodeProperties {
    config: string
    type_filter: string
}

module.exports = function (RED: Red) {
    function Socket(this: Node, config: SocketConfig) {
        RED.nodes.createNode(this, config)
        const configNode = RED.nodes.getNode(config.config) as ConfigNode
        configNode.getSocket().on("event", (payload: any) => {
            
            if (!config.type_filter || payload.type === config.type_filter) {
                try{
                    if(payload.type === 'streamlabels'){
                        delete payload.message.underlying
                    }
                    payload = JSON.parse(JSON.stringify(payload))
                    this.send({ payload })
                }catch(error){
                    this.error(error.toString())
                    this.error(inspect(payload))
                }

            }
        })
    }
    RED.nodes.registerType("streamlabs-socket", Socket)
};
