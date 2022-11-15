FROM node:19-alpine AS build
WORKDIR /app
COPY . .
RUN npm install -g @angular/cli@14.2.1 \ 
    && npm ci \ 
    && ng build --configuration production 

##################################################

FROM nginx:1.23-alpine
WORKDIR /app
COPY --from=build /app/dist/smack-fe /usr/share/nginx/html

ENV BACKEND_HOST=changethis
ENV BACKEND_PORT=8080
ENV WS_RELAY_HOST=changethis
ENV WS_RELAY_PORT=15670
ENV RABBITMQ_USER=guest
ENV RABBITMQ_PASS=guest

# When the container starts, replace the env.js with values from environment variables
CMD ["/bin/sh",  "-c",  "envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env.js && exec nginx -g 'daemon off;'"]
