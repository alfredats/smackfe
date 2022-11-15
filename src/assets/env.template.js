(function(window) {
  window["env"] = window["env"] || {};

  // Environment variables
  window["env"]["backendHost"] = "${BACKEND_HOST}";
  window["env"]["backendPort"] = "${BACKEND_PORT}";
  window["env"]["wsRelayHost"] = "${WS_RELAY_HOST}";
  window["env"]["wsRelayPort"] = "${WS_RELAY_PORT}";
  window['env']['rabbitMQUser'] = "${RABBITMQ_USER}";
  window['env']['rabbitMQPass'] = "${RABBITMQ_PASS}";
})(this);