#!/bin/bash

# Script d'installation avec des emojis stylés 🎉

# Fonction pour afficher les messages d'erreur avec un emoji
function error_message {
    echo "❌ $1"
    return 1
}

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null
then
    error_message "Node.js n'est pas installé. Veuillez l'installer avant de continuer."
fi

# Vérifier si Yarn est installé
if ! command -v yarn &> /dev/null
then
    echo "🚀 Yarn n'est pas installé. Installation en cours..."
    npm install -g yarn
    if [ $? -ne 0 ]; then
        error_message "Erreur lors de l'installation de Yarn. Veuillez l'installer manuellement."
    fi
    echo "✅ Yarn installé avec succès."
fi

# Vérifier la version de Node.js
REQUIRED_NODE_VERSION="18.6.0"
INSTALLED_NODE_VERSION=$(node -v | sed 's/v//')

if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$INSTALLED_NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE_VERSION" ]; then
    error_message "La version de Node.js doit être >= $REQUIRED_NODE_VERSION. Version actuelle : $INSTALLED_NODE_VERSION."
fi

# Installer les dépendances globales
echo "📦 Installation des dépendances globales..."
yarn add -D @lavamoat/allow-scripts \
              @lavamoat/preinstall-always-fail \
              @metamask/eslint-config \
              @metamask/eslint-config-jest \
              @metamask/eslint-config-nodejs \
              @metamask/eslint-config-typescript \
              @typescript-eslint/eslint-plugin \
              @typescript-eslint/parser \
              eslint \
              eslint-config-prettier \
              eslint-plugin-import \
              eslint-plugin-jest \
              eslint-plugin-jsdoc \
              eslint-plugin-n \
              eslint-plugin-prettier \
              eslint-plugin-promise \
              prettier \
              prettier-plugin-packagejson \
              sharp \
              typescript
if [ $? -ne 0 ]; then
    error_message "Erreur lors de l'installation des dépendances globales."
fi
echo "✅ Dépendances globales installées avec succès."

# Installer la dépendance spécifique dans "dependencies"
echo "📦 Installation des dépendances du projet..."
yarn add viem
if [ $? -ne 0 ]; then
    error_message "Erreur lors de l'installation des dépendances du projet."
fi
echo "✅ Dépendances du projet installées avec succès."

# Exécuter les scripts Yarn nécessaires
echo "⚙️ Construction du projet..."
yarn build
if [ $? -ne 0 ]; then
    error_message "Erreur lors de la construction du projet."
fi
echo "✅ Projet construit avec succès."

echo "🚀 Démarrage du projet..."
yarn start
if [ $? -ne 0 ]; then
    error_message "Erreur lors du démarrage du projet."
fi
echo "🎉 Projet démarré avec succès !"
return 0
