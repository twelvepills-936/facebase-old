FROM node:20-alpine AS base

WORKDIR /app

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source files
COPY . .

# Build the application
RUN yarn build

# Copy admin components (they are not compiled by TypeScript)
RUN mkdir -p dist/admin/components && \
    cp -r src/admin/components/* dist/admin/components/ 2>/dev/null || true

# Production image
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies only
RUN yarn install --production --frozen-lockfile && \
    yarn cache clean

# Copy built application from base
COPY --from=base /app/dist ./dist
COPY --from=base /app/public ./public

# Expose port
EXPOSE 5001

# Set NODE_ENV
ENV NODE_ENV=production

# Disable npm update check
ENV NO_UPDATE_NOTIFIER=1

# Start the application
CMD ["node", "dist/index.js"]

