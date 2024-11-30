# Utiliser une image de base Node.js pour la compilation
FROM node:14 AS build

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste des fichiers du projet
COPY . .

# Compiler le projet TypeScript
RUN npm run build

# Utiliser une image de base plus légère pour l'exécution
FROM node:14-alpine

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers compilés depuis l'étape de build
COPY --from=build /app/dist ./dist

# Installer uniquement les dépendances de production
COPY package*.json ./
RUN npm install --only=production

# Exposer le port sur lequel l'application va tourner
EXPOSE 3000

# Démarrer l'application
CMD ["node", "dist/index.js"]