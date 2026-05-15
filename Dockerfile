# ─────────────────────────────────────────────
# Stage 1 — Build (Dépendances + Compilation)
# ─────────────────────────────────────────────
FROM node:16-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration
COPY package.json yarn.lock ./

# Installation de TOUTES les dépendances (prod + dev nécessaires pour builder)
RUN yarn install --frozen-lockfile

# Copie du reste du code source
COPY . .

# Build NestJS (Génère le dossier dist/)
RUN yarn build

# Nettoyage pour ne garder que les dépendances de production pour l'image finale
RUN rm -rf node_modules && yarn install --frozen-lockfile --production


# ─────────────────────────────────────────────
# Stage 2 — Runtime (Image de production finale et légère)
# ─────────────────────────────────────────────
FROM node:16-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Sécurité : Création d'un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nestjs

# Récupération du build NestJS et des dépendances de production épurées
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json ./

# Copie optionnelle de vos templates de mail
COPY --from=builder /app/src/mail/templates ./src/mail/templates

USER nestjs

# Attention : Assurez-vous que le port correspond bien à la variable BACKEND_PORT de votre stack Portainer !
EXPOSE 3000

# Lance l'app compilée
CMD ["node", "dist/src/main"]