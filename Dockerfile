# TanStack Start builds a Node server (Nitro, node-server preset) into .output:
# build with Bun, run the bundled server with Node, nothing else in the image.

FROM oven/bun:1.4.4 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
# Built under Bun, Nitro would otherwise target Bun's server API
ENV NITRO_PRESET=node-server
RUN bun run build

FROM node:24-slim
WORKDIR /app
ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000
# .output is self-contained: the server bundles its own dependencies
COPY --from=build --chown=node:node /app/.output ./.output
USER node
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
