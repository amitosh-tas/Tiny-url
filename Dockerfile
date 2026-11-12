
FROM node:22-bookworm-slim

WORKDIR /app

# Install native build dependencies for better-sqlite3
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Enable pnpm
RUN corepack enable && corepack prepare pnpm@12.16.1 --activate

# Install dependencies
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

# Copy application
COPY . .

# Generate Prisma Client
RUN pnpm exec prisma generate

# Set production database location
ENV DATABASE_URL="file:/app/data/dev.db"

# Create database directory
RUN mkdir -p /app/data

# Build Next.js
RUN pnpm build

EXPOSE 3000

# Run migrations and start application
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm start"]
