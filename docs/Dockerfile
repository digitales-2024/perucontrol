FROM node:22-alpine AS builder

WORKDIR /app

COPY public/ public/
COPY src/ src/
COPY astro.config.mjs astro.config.mjs
COPY package.json package.json
COPY pnpm-lock.yaml pnpm-lock.yaml
COPY tsconfig.json tsconfig.json

ARG VITE_PLANTUML_URL=""
ENV VITE_PLANTUML_URL=${VITE_PLANTUML_URL}

RUN npm i -g pnpm
RUN pnpm i
RUN pnpm build


FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]

