# ─── Étape 1 : dépendances ──────────────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ─── Étape 2 : build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables d'environnement nécessaires au BUILD (pas de secrets ici)
ARG NEXT_PUBLIC_SITE_URL=https://abou-maryam.com
ARG NEXT_PUBLIC_API_BASE_URL=
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

# Active le standalone output de Next.js pour un conteneur léger
ENV NEXT_TELEMETRY_DISABLED=1
RUN echo 'const nextConfig = { output: "standalone", images: { remotePatterns: [{ protocol: "https", hostname: "img.youtube.com" }, { protocol: "https", hostname: "i.ytimg.com" }] } }; export default nextConfig;' > /dev/null
RUN npm run build

# ─── Étape 3 : image de production ──────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Copie le build standalone (auto-contenu, sans node_modules complet)
COPY --from=builder /app/public          ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static     ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
