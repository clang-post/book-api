FROM node:20-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@9

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile
RUN mkdir -p /data

COPY . .

RUN rm -f tsconfig.tsbuildinfo tsconfig.build.tsbuildinfo \
  && pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
