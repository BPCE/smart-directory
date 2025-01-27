#!/bin/bash

# Script d'installation et démarrage 🎉

# Fonction pour afficher un message d'erreur et quitter
function error_message {
    echo "❌ $1"
    exit 1
}

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null
then
    error_message "Node.js n'est pas installé. Veuillez l'installer avant de continuer."
fi

# Vérifier la version de Node.js
REQUIRED_NODE_VERSION="18.20.0"
INSTALLED_NODE_VERSION=$(node -v | sed 's/v//')

if [ "$(printf '%s\n' "$REQUIRED_NODE_VERSION" "$INSTALLED_NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE_VERSION" ]; then
    error_message "La version de Node.js doit être >= $REQUIRED_NODE_VERSION. Version actuelle : $INSTALLED_NODE_VERSION."
fi

# Vérifier si Yarn est installé
if ! command -v yarn &> /dev/null
then
    error_message "Yarn n'est pas installé. Veuillez l'installer avant de continuer."
fi

# Exécuter yarn install
echo "📦 Installation des dépendances avec Yarn..."
yarn install
if [ $? -ne 0 ]; then
    error_message "Erreur lors de l'installation des dépendances avec Yarn."
fi
echo "✅ Dépendances installées avec succès."

# Lancer yarn start
echo "🚀 Démarrage du projet..."
yarn start
exit 0
