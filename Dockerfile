# Base image for build stages
FROM node:lts-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Primary build stage
FROM base AS build
COPY . .
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm run build

# Runtime static server
# https://github.com/lipanski/docker-static-website
FROM lipanski/docker-static-website:2.4.0 AS runtime
COPY --from=build /app/dist .
EXPOSE 3000
