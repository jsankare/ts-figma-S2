// Ajoute un écouteur d'événement sur le bouton "Retour"
const backButton = document.getElementById("backButton");
if (backButton) {
  backButton.addEventListener("click", () => {
    window.location.href = "index.html";
  });
}
