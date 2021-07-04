FROM node:12-alpine AS build

WORKDIR /src
COPY package*.json /src/
RUN npm ci
COPY tsconfig.json /src/
COPY src /src/src/
RUN npm run tsc
RUN npm ci --production

FROM alpine:3
RUN apk add nodejs --no-cache
WORKDIR /src
COPY --from=build /src/node_modules /src/node_modules
COPY --from=build /src/dist /src/
CMD node -r dotenv/config server.js