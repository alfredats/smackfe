// THIS FILE IS USED AS A RELAY FOR DYNAMICALLY ASSIGNED ENV VARS W/ DOCKER & K8s
(function(window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["backendHost"] = undefined;
  window["env"]["backendPort"] = undefined;
  window["env"]["wsRelayHost"] = undefined;
  window["env"]["wsRelayPort"] = undefined;
  window['env']['rabbitMQUser'] = undefined;
  window['env']['rabbitMQPass'] = undefined;
})(this);