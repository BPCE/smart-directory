#!/bin/bash

# Script d'installation pour un projet Node.js
echo "🚀 Démarrage de l'installation des dépendances pour le projet..."

# 1. Initialisation du projet si package.json n'existe pas
if [ ! -f package.json ]; then
  echo "📦 Initialisation d'un nouveau projet Node.js..."
  npm init -y

  # Ajout des scripts au package.json
  echo "🛠️ Ajout des scripts dans le package.json..."
  npx json -I -f package.json -e 'this.scripts={"dev":"next dev","build":"next build","start":"next start","lint":"next lint"}'
fi

# 2. Liste des dépendances avec versions exactes
PACKAGES=(
  "@radix-ui/react-slot@1.1.1"
  "@tanstack/react-query@5.62.7"
  "class-variance-authority@0.7.1"
  "clsx@2.1.1"
  "lucide-react@0.468.0"
  "next@15.1.0"
  "react@19.0.0"
  "react-dom@19.0.0"
  "tailwind-merge@2.5.5"
  "tailwindcss-animate@1.0.7"
  "viem@2.21.55"
  "wagmi@2.14.1"
)

DEV_PACKAGES=(
  "@eslint/eslintrc@3.2.0"
  "@types/node@20.17.10"
  "@types/react@19.0.1"
  "@types/react-dom@19.0.2"
  "eslint@9.17.0"
  "eslint-config-next@15.1.0"
  "postcss@8.4.49"
  "tailwindcss@3.4.16"
  "typescript@5.7.2"
)

# 3. Installation des paquets
echo "📦 Installation des dépendances..."
npm install "${PACKAGES[@]}"

echo "🛠️ Installation des devDependencies..."
npm install --save-dev "${DEV_PACKAGES[@]}"

# 4. Lancer le projet avec "npm run dev"
echo "🚀 Lancement du serveur de développement..."
npm run dev

echo "✅ Installation et lancement terminés."
