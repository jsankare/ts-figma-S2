function enableFullscreenFeature() {
    const fullscreenButton = document.createElement('button');
    fullscreenButton.id = 'fullscreenButton';
    fullscreenButton.innerHTML = '&#x26F6;'; // Icône "Plein écran" (utilise une icône Unicode)
    fullscreenButton.style.position = 'fixed';
    fullscreenButton.style.top = '10px';
    fullscreenButton.style.right = '10px';
    fullscreenButton.style.padding = '10px';
    fullscreenButton.style.zIndex = '1000';
    fullscreenButton.style.cursor = 'pointer';
    fullscreenButton.style.fontSize = '24px';
    fullscreenButton.style.border = 'none';
    fullscreenButton.style.background = 'none';

    document.body.appendChild(fullscreenButton);

    fullscreenButton.addEventListener('click', () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
                .then(() => {
                    fullscreenButton.innerHTML = '&#x2715;'; // Icône "Quitter plein écran" (croix)
                })
                .catch((err) => {
                    console.error(`Erreur lors de l'activation du mode plein écran: ${err}`);
                });
        } else {
            document.exitFullscreen()
                .then(() => {
                    fullscreenButton.innerHTML = '&#x26F6;'; // Icône "Plein écran"
                })
                .catch((err) => {
                    console.error(`Erreur lors de la sortie du mode plein écran: ${err}`);
                });
        }
    });

    // Met à jour l'icône du bouton lorsque l'utilisateur entre ou sort du mode plein écran
    document.addEventListener('fullscreenchange', () => {
        if (document.fullscreenElement) {
            fullscreenButton.innerHTML = '&#x2715;'; // Icône "Quitter plein écran"
        } else {
            fullscreenButton.innerHTML = '&#x26F6;'; // Icône "Plein écran"
        }
    });
}

// Appelez la fonction pour ajouter le bouton
enableFullscreenFeature();