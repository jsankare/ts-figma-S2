
# Template Frontend TypeScript + TailwindCSS (From Scratch)

Ce projet est un template frontend construit à partir de zéro en TypeScript, sans framework, et avec Tailwind CSS pour le styling. Il utilise `pnpm` pour la gestion des dépendances et propose un environnement de développement avec **surveillance automatique** (mode watch) pour les fichiers TypeScript et CSS.

## Installation du projet

### Prérequis
- [pnpm](https://pnpm.io/installation) (si ce n'est pas déjà installé)
- Node.js (version compatible avec TypeScript)

### Étapes d'installation

1. **Cloner le dépôt :**

   ```bash
   git clone https://github.com/ton-utilisateur/ton-repo.git
   cd ton-repo
   ```

2. **Installer les dépendances :**

   Utilisez `pnpm` pour installer les dépendances :

   ```bash
   pnpm install
   ```

3. **Configurer Tailwind CSS :**

   Si nécessaire, modifiez le fichier `tailwind.config.js` pour adapter le contenu à surveiller :

   ```js
   module.exports = {
     content: ["./public/**/*.{html,js}", "./src/**/*.{ts,js,css}"],
     theme: {
       extend: {},
     },
     plugins: [],
   }
   ```

## Architecture du projet

Voici la structure principale du projet :

```
mon-projet/
├── dist/                  # Fichiers générés après la compilation TypeScript
├── src/                   # Contient tous les fichiers TypeScript et styles source
│   ├── index.ts           # Entrée principale pour l'application
│   ├── about.ts           # Exemple de fichier TS pour une nouvelle page
│   ├── styles.css         # Fichier CSS source avec les directives Tailwind
├── public/                # Contient les fichiers statiques
│   ├── index.html         # Page principale HTML
│   ├── about.html         # Exemple de page supplémentaire HTML
│   ├── styles.css         # Fichier CSS généré après compilation de src/styles.css
├── postcss.config.cjs      # Configuration de PostCSS pour Tailwind
├── tailwind.config.js     # Configuration de Tailwind CSS
├── tsconfig.json          # Configuration de TypeScript
├── package.json           # Fichier de configuration des scripts et dépendances
└── pnpm-lock.yaml         # Verrouillage des versions de pnpm
```

### Utilité des fichiers principaux

- **`src/index.ts`** : Point d'entrée de l'application. Contient la logique TypeScript de la page principale.
- **`src/about.ts`** : Exemple de fichier TypeScript pour une nouvelle page `about.html`. 
- **`src/styles.css`** : Fichier source contenant les directives Tailwind CSS.
- **`public/index.html`** : Page principale HTML qui charge le JavaScript généré par TypeScript.
- **`public/about.html`** : Exemple d'une page HTML supplémentaire, avec navigation.
- **`postcss.config.cjs`** : Configuration de PostCSS pour gérer Tailwind CSS.
- **`tailwind.config.js`** : Configuration Tailwind qui permet d'ajuster les fichiers à surveiller et personnaliser les styles.

## Scripts de build et de développement

Le projet utilise `pnpm` pour gérer les commandes de build et de développement, et **les deux sont en mode watch**, c'est-à-dire qu'ils surveillent les modifications des fichiers en temps réel et recompilent automatiquement lorsque des changements sont détectés.

### Build (avec surveillance automatique)

Pour compiler les fichiers TypeScript et générer le CSS via PostCSS tout en surveillant les fichiers pour les modifications, exécutez la commande suivante :

```bash
pnpm run build
```

Cette commande :
- **Surveille** et compile automatiquement les fichiers TypeScript en JavaScript lorsqu'ils sont modifiés.
- **Surveille** et génère automatiquement le fichier `public/styles.css` à partir de `src/styles.css` en utilisant PostCSS et Tailwind CSS.

### Développement (avec surveillance automatique)

##### Dans un terminal: 

Pour démarrer un environnement de développement en mode **watch** (surveillance des fichiers TypeScript et CSS), exécutez :

```bash
pnpm run build
```

##### Dans un autre terminal: 

Cela compile automatiquement les fichiers TypeScript et CSS à chaque modification. Ensuite, lancez un serveur local pour voir les changements en direct dans le navigateur en exécutant :

```bash
pnpm run start
```

Ce serveur utilise `live-server`, qui recharge automatiquement les fichiers HTML/CSS/JS sur le navigateur dès qu'une modification est détectée.

## Ajouter une nouvelle page avec HTML, TypeScript et CSS

### Étapes pour ajouter une nouvelle page

1. **Créer un fichier HTML dans `public/`**  
   Exemple : `public/contact.html`

   ```html
   <!DOCTYPE html>
   <html lang="fr">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>Contact</title>
       <link href="styles.css" rel="stylesheet">
   </head>
   <body class="bg-gray-100 text-center">
       <h1 class="text-4xl font-bold text-red-600">Page Contact</h1>
       <p class="mt-4 text-lg text-gray-700">Ceci est une nouvelle page.</p>
       <button id="backButton" class="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">Retour à la page principale</button>

       <script type="module" src="../dist/contact.js"></script>
   </body>
   </html>
   ```

2. **Créer le fichier TypeScript correspondant dans `src/`**  
   Exemple : `src/contact.ts`

   ```ts
   // Ajout de la logique TypeScript pour la page Contact
   const backButton = document.getElementById('backButton');
   if (backButton) {
       backButton.addEventListener('click', () => {
           window.location.href = 'index.html';
       });
   }
   ```

3. **Mettre à jour les styles si nécessaire**  
   Vous pouvez ajouter des classes CSS supplémentaires directement dans `src/styles.css` si besoin, ou appliquer directement des classes Tailwind dans votre fichier HTML.

4. **Recompiler le projet**

   Après avoir ajouté la nouvelle page et la logique TypeScript, le mode **watch** se chargera de recompiler automatiquement vos fichiers. Assurez-vous que la commande `pnpm run build` est en cours d'exécution.

5. **Vérifier la navigation**  
   Dans le fichier `index.html`, ajoutez un lien pour accéder à la nouvelle page `contact.html` :

   ```html
   <a href="contact.html" class="mt-6 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700">Accéder à la page Contact</a>
   ```

Cela vous permet d'ajouter rapidement une nouvelle page avec du HTML, du TypeScript et du CSS tout en utilisant Tailwind pour le style. La re-compilation se fait automatiquement grâce au mode **watch** du build.

---

### Notes supplémentaires

- **Mode watch** : Lorsque la commande `pnpm run build` est lancée, le projet compile automatiquement les fichiers dès qu'une modification est détectée, ce qui simplifie le développement.
- Si vous modifiez fréquemment les fichiers, laissez tourner le processus `pnpm run build` pour ne pas avoir à relancer manuellement la compilation à chaque fois.
- Les fichiers compilés sont placés dans le dossier `dist/` pour le JavaScript et `public/` pour le CSS généré.
- `live-server` permet de visualiser rapidement les changements dans le navigateur sans avoir besoin de redémarrer le serveur à chaque fois.
