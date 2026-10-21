# syntax=docker/dockerfile:1

FROM node:24-alpine AS builder

RUN apk add git
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

ARG PUBLIC_COMMIT_HASH=0000000
ARG PUBLIC_RELEASE_CHANNEL=stable
ARG PUBLIC_SERVER_API_URL=http://localhost:8080/api/
ARG ORIGIN=http://localhost:5173

ENV PUBLIC_COMMIT_HASH=$PUBLIC_COMMIT_HASH
ENV PUBLIC_RELEASE_CHANNEL=$PUBLIC_RELEASE_CHANNEL
ENV PUBLIC_SERVER_API_URL=$PUBLIC_SERVER_API_URL
ENV ORIGIN=$ORIGIN
ENV PUBLIC_ORIGIN=$ORIGIN

COPY package*.json .
COPY pnpm-lock.yaml .
COPY pnpm-workspace.yaml .

RUN pnpm fetch
RUN pnpm install --frozen-lockfile
COPY .env.example .env

COPY . .

RUN pnpm run prepare
RUN --mount=type=secret,id=maintenance_bypass,env=MAINTENANCE_BYPASS_TOKEN pnpm run build
RUN pnpm prune --production

FROM node:24-alpine

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable pnpm && corepack install -g pnpm@latest-12

WORKDIR /app

ARG ORIGIN=http://localhost:5173
ENV ORIGIN=$ORIGIN
ENV PUBLIC_ORIGIN=$ORIGIN

COPY --from=builder /app/build build/
COPY --from=builder /app/node_modules node_modules/
COPY --from=builder /app/static static/
COPY --from=builder /app/drizzle drizzle/
COPY package.json .
COPY pnpm-lock.yaml .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "./build"]