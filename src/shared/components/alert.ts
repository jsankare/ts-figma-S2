export function toastAlert(
    type: "success" | "error" | "info" | "warning",
    content: string
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

  // Add content
  const contentContainer = document.createElement("div");
  contentContainer.classList.add("toast-content");
  contentContainer.textContent = content;

  // Add dismiss button
  const dismissButton = document.createElement("button");
  dismissButton.classList.add("dismiss-button");
  dismissButton.innerHTML = "&times;";
  dismissButton.onclick = () => {
    container.removeChild(toast);
  };

  // Add time indicator
  const timeIndicator = document.createElement("div");
  timeIndicator.classList.add("time-indicator");

  toast.appendChild(timeIndicator);
  toast.appendChild(contentContainer);
  toast.appendChild(dismissButton);
  container.appendChild(toast);

  // Trigger appearance
  setTimeout(() => {
    toast.classList.add("show");
    timeIndicator.style.width = "100%";
  }, 100);

  // Auto-remove after 5 seconds
  const timeoutDuration = 5000;
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => container.removeChild(toast), 500);
  }, timeoutDuration);

  // Animate time indicator
  setTimeout(() => {
    timeIndicator.style.transition = `width ${timeoutDuration}ms linear`;
    timeIndicator.style.width = "0";
  }, 100);
}
