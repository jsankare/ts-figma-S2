export function toastAlert(
  type: "success" | "error" | "info" | "warning",
  content: string,
): void {
  const body = document.getElementsByTagName("body")[0];

  let container = document.getElementById("toast-container") as HTMLDivElement;
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.classList.add("toast", type);

  const timeIndicator = document.createElement("div");
  timeIndicator.classList.add("time-indicator");
  toast.appendChild(timeIndicator);

  const contentContainer = document.createElement("div");
  contentContainer.classList.add("toast-content");
  contentContainer.textContent = content;
  toast.appendChild(contentContainer);

  const dismissButton = document.createElement("button");
  dismissButton.classList.add("dismiss-button");
  dismissButton.innerHTML = "&times;";
  dismissButton.onclick = () => {
    container.removeChild(toast);
  };
  toast.appendChild(dismissButton);

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
    timeIndicator.style.transition = "width 5s linear";
    timeIndicator.style.width = "0";
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => container.removeChild(toast), 500);
  }, 5000);
}
