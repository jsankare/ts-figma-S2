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

export function displayMessage(message: string, isError: boolean = true) {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageElement.style.color = isError ? 'red' : 'green';

  if (isError) {
      const form = document.querySelector('form');
      if (form) {
          let errorElement = form.querySelector('.error') as HTMLParagraphElement;
          if (!errorElement) {
              errorElement = document.createElement('p');
              errorElement.className = 'error';
              form.appendChild(errorElement);
          }
          errorElement.textContent = message;
          errorElement.style.color = 'red';

          form.querySelectorAll('input, textarea, select').forEach((input) => {
            input.addEventListener('input', () => {
              if (errorElement) errorElement.remove();
            });
          });
      }
  } else {
      const listing = document.querySelector('.listing');
      if (listing) {
          let successElement = listing.querySelector('.success') as HTMLParagraphElement;
          if (!successElement) {
              successElement = document.createElement('p');
              successElement.className = 'success';
              listing.insertBefore(successElement, listing.firstChild);
          }
          successElement.textContent = message;
          successElement.style.color = 'green';

        }
  }
}