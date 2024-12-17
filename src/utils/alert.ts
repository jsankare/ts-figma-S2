export function toastAlert(type: "success" | "error", content: string): void {
  const body = document.getElementsByTagName("body")[0];

  let container = document.getElementById("toast-container") as HTMLDivElement;
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.classList.add("toast", type);
  toast.textContent = content;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => container.removeChild(toast), 500);
  }, 5000);
}

export function displayMessage(
  message: string,
  isError: boolean = true,
  container: string,
) {
  console.log(
    `Displaying message: ${message} (Error: ${isError}) in container: ${container}`,
  );

  const messageElement = document.createElement("p");
  messageElement.textContent = message;
  messageElement.style.color = isError ? "red" : "green";

  const targetContainer = document.querySelector(container);
  if (targetContainer) {
    console.log(`Container found: ${container}`);
    let messageContainer = targetContainer.querySelector(
      isError ? ".error" : ".success",
    ) as HTMLParagraphElement;

    if (!messageContainer) {
      // Créer un nouvel élément si nécessaire
      messageContainer = document.createElement("p");
      messageContainer.className = isError ? "error" : "success";
      targetContainer.insertBefore(
        messageContainer,
        targetContainer.firstChild,
      ); // Ajouter au début
    }

    messageContainer.textContent = message;

    // Ajouter un gestionnaire d'événement pour effacer le message lorsqu'un champ est modifié
    targetContainer
      .querySelectorAll("input, textarea, select")
      .forEach((input) => {
        input.addEventListener("input", () => {
          if (messageContainer) messageContainer.remove();
        });
      });
  } else {
    console.error(`Container not found: ${container}`);
  }
}
