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
      loadingElement.textContent = "Chargement en cours...";
      loadingElement.style.fontStyle = "italic";
      loadingElement.style.color = "#666";
      loadingElement.style.textAlign = "center";
      loadingElement.style.padding = "20px";
      loadingElement.style.fontSize = "1.5rem";

      mainContent.replaceChildren(loadingElement); // Remplace le contenu de <main> par l'indicateur de chargement
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
