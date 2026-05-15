# ─────────────────────────────────────────────
# Stage 1 — Dépendances
# ─────────────────────────────────────────────
FROM node:16-alpine AS deps

WORKDIR /app

# Copie des fichiers de lock pour un cache optimal
COPY package.json yarn.lock ./

# Installation des dépendances de production + dev (nécessaire pour le build)
RUN yarn install --frozen-lockfile


# ─────────────────────────────────────────────
# Stage 2 — Build
# ─────────────────────────────────────────────
FROM node:16-alpine AS builder

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build NestJS → génère dist/
RUN yarn build

# Génération du client Prisma si tu migres vers Prisma
# (à décommenter si le projet passe de TypeORM à Prisma)
# RUN npx prisma generate


# ─────────────────────────────────────────────
# Stage 3 — Runtime (image minimale)
# ─────────────────────────────────────────────
FROM node:16-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Création d'un utilisateur non-root pour la sécurité
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

# On copie uniquement ce qui est nécessaire à l'exécution
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Si tu as des templates Handlebars (src/templates/) utilisés par @nestjs-modules/mailer
COPY --from=builder /app/src/mail/templates ./src/mail/templates

USER nestjs

EXPOSE 3000

# Lance l'app compilée
CMD ["node", "dist/main"]