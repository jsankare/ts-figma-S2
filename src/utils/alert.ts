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
