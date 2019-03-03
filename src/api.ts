import { Red, NodeProperties, Node } from "node-red";
import axios, { AxiosRequestConfig } from "axios";
import { ConfigNode } from "./config";

export interface APIConfig extends NodeProperties {
  config: string;
  method: string;
  endpoint: string;
  payload: string;
}

module.exports = function(RED: Red) {
  function API(this: Node, config: APIConfig) {
    RED.nodes.createNode(this, config);
    this.on("input", msg => {
      const configNode = RED.nodes.getNode(config.config) as ConfigNode;
      const method = msg.method || config.method || "GET";
      const endpoint = msg.topic || config.endpoint;
      const payload = msg.payload || config.payload || {};
      payload.access_token = configNode.access_token;
      const url = `https://streamlabs.com/api/v1.0${endpoint}`;
      const options: AxiosRequestConfig = { method, url };
      if (method.toUpperCase() === "GET") {
        options.params = payload;
      } else {
        options.data = payload;
      }
      axios(options)
        .then(response => {
            this.send(response.data)
        }).catch(error => {
            this.error(error)
        })
    })
  }
  RED.nodes.registerType("streamlabs-api", API);
};
