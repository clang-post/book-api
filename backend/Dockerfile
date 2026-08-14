FROM node:20-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@10

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/package.json

RUN pnpm install --frozen-lockfile --filter book-api...
RUN mkdir -p /data

COPY backend ./backend

WORKDIR /app/backend

RUN rm -f tsconfig.tsbuildinfo tsconfig.build.tsbuildinfo \
  && pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]

