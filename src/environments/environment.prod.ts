// @ts-nocheck
export const environment = {
  production: true,
  backendHost: window['env']['backendHost'] || 'http://localhost',
  backendPort: window['env']['backendPort'] || 8080,
  wsRelayHost: window['env']['wsRelayHost'] || 'localhost',
  wsRelayPort: window['env']['wsRelayPort'] || 15670,
  rabbitmq_user: window['env']['rabbitMQUser'] || 'guest',
  rabbitmq_pass: window['env']['rabbitMQPass'] || 'guest',
};
