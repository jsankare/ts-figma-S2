// A update => ne charge pas les écouteurs d'évenements lors de refresh

export function displayLoading(isLoading: boolean): void {
  const mainContent = document.getElementById("main") as HTMLElement;
  let loadingElement = document.getElementById("loading");

  if (isLoading) {
    if (!loadingElement) {
      // Sauvegarde le contenu original de <main> si ce n'est pas déjà fait
      if (!mainContent.dataset.originalContent) {
        mainContent.dataset.originalContent = mainContent.innerHTML;
      }

      // Crée et ajoute l'indicateur de chargement
      loadingElement = document.createElement("div");
      loadingElement.id = "loading";

      // Ajoute le cercle de chargement animé
      const loader = document.createElement("div");
      loader.classList.add("loader");
      loadingElement.appendChild(loader);

      // Remplace le contenu de <main> par l'indicateur de chargement
      mainContent.replaceChildren(loadingElement);
    }
  } else {
    // Restaure le contenu original de <main> une fois le chargement terminé
    if (mainContent.dataset.originalContent) {
      mainContent.innerHTML = mainContent.dataset.originalContent;
      delete mainContent.dataset.originalContent; // Supprime la sauvegarde
    }
    loadingElement?.remove();
  }
}
