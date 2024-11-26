document.addEventListener("DOMContentLoaded", () => {
  const modalContent = document.getElementById("modal") as HTMLElement;
  const dataType = modalContent.getAttribute("data-type");

  if (dataType) {
    createModal(dataType, modalContent);
  }
  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const dateInput = document.getElementById("date") as HTMLInputElement;
  if (dateInput) {
    dateInput.value = formattedDate;
  }
  function createModal(type: string, modalContent: HTMLElement) {
    let formContent = "";

    switch (type) {
      case "category":
        formContent = `
                <h1 class="form-title">Ajouter une catégorie</h1>
                <hr class="form-separator"/>
                <form class="modal-form" id="categoryForm" action="">
                  <input class="input input-hidden" type="hidden" name="originalCategoryName">
                  <label class="label label-text" for="category">Nom de la catégorie</label>
                  <input class="input input-text" type="text" name="category" id="category" required>
                  <label class="label label-icons" for="icon">Choisir une icône</label>
                  <section class="category-icon-container">
                    <article class="category-icon-wrapper">
                      <svg class="category-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 1.125C0 0.501562 0.445833 0 1 0H2.89583C3.8125 0 4.625 0.6 5.00417 1.5H22.1292C23.225 1.5 24.025 2.67188 23.7375 3.8625L22.0292 11.0016C21.675 12.4734 20.4875 13.5 19.1333 13.5H7.1125L7.3375 14.8359C7.42917 15.3656 7.84167 15.75 8.32083 15.75H20.3333C20.8875 15.75 21.3333 16.2516 21.3333 16.875C21.3333 17.4984 20.8875 18 20.3333 18H8.32083C6.87917 18 5.64167 16.8469 5.375 15.2578L3.225 2.55469C3.19583 2.37656 3.05833 2.25 2.89583 2.25H1C0.445833 2.25 0 1.74844 0 1.125ZM5.33333 21.75C5.33333 21.4545 5.38507 21.1619 5.48557 20.889C5.58608 20.616 5.7334 20.3679 5.91912 20.159C6.10484 19.9501 6.32532 19.7843 6.56797 19.6713C6.81062 19.5582 7.07069 19.5 7.33333 19.5C7.59598 19.5 7.85605 19.5582 8.0987 19.6713C8.34135 19.7843 8.56183 19.9501 8.74755 20.159C8.93326 20.3679 9.08058 20.616 9.18109 20.889C9.2816 21.1619 9.33333 21.4545 9.33333 21.75C9.33333 22.0455 9.2816 22.3381 9.18109 22.611C9.08058 22.884 8.93326 23.1321 8.74755 23.341C8.56183 23.5499 8.34135 23.7157 8.0987 23.8287C7.85605 23.9418 7.59598 24 7.33333 24C7.07069 24 6.81062 23.9418 6.56797 23.8287C6.32532 23.7157 6.10484 23.5499 5.91912 23.341C5.7334 23.1321 5.58608 22.884 5.48557 22.611C5.38507 22.3381 5.33333 22.0455 5.33333 21.75ZM19.3333 19.5C19.8638 19.5 20.3725 19.7371 20.7475 20.159C21.1226 20.581 21.3333 21.1533 21.3333 21.75C21.3333 22.3467 21.1226 22.919 20.7475 23.341C20.3725 23.7629 19.8638 24 19.3333 24C18.8029 24 18.2942 23.7629 17.9191 23.341C17.544 22.919 17.3333 22.3467 17.3333 21.75C17.3333 21.1533 17.544 20.581 17.9191 20.159C18.2942 19.7371 18.8029 19.5 19.3333 19.5Z" fill="black"/>
                      </svg>
                      <p class="category-icon-label">Shopping</p>
                    </article>
                    <article class="category-icon-wrapper">
                      <svg class="category-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 1.125C0 0.501562 0.445833 0 1 0H2.89583C3.8125 0 4.625 0.6 5.00417 1.5H22.1292C23.225 1.5 24.025 2.67188 23.7375 3.8625L22.0292 11.0016C21.675 12.4734 20.4875 13.5 19.1333 13.5H7.1125L7.3375 14.8359C7.42917 15.3656 7.84167 15.75 8.32083 15.75H20.3333C20.8875 15.75 21.3333 16.2516 21.3333 16.875C21.3333 17.4984 20.8875 18 20.3333 18H8.32083C6.87917 18 5.64167 16.8469 5.375 15.2578L3.225 2.55469C3.19583 2.37656 3.05833 2.25 2.89583 2.25H1C0.445833 2.25 0 1.74844 0 1.125ZM5.33333 21.75C5.33333 21.4545 5.38507 21.1619 5.48557 20.889C5.58608 20.616 5.7334 20.3679 5.91912 20.159C6.10484 19.9501 6.32532 19.7843 6.56797 19.6713C6.81062 19.5582 7.07069 19.5 7.33333 19.5C7.59598 19.5 7.85605 19.5582 8.0987 19.6713C8.34135 19.7843 8.56183 19.9501 8.74755 20.159C8.93326 20.3679 9.08058 20.616 9.18109 20.889C9.2816 21.1619 9.33333 21.4545 9.33333 21.75C9.33333 22.0455 9.2816 22.3381 9.18109 22.611C9.08058 22.884 8.93326 23.1321 8.74755 23.341C8.56183 23.5499 8.34135 23.7157 8.0987 23.8287C7.85605 23.9418 7.59598 24 7.33333 24C7.07069 24 6.81062 23.9418 6.56797 23.8287C6.32532 23.7157 6.10484 23.5499 5.91912 23.341C5.7334 23.1321 5.58608 22.884 5.48557 22.611C5.38507 22.3381 5.33333 22.0455 5.33333 21.75ZM19.3333 19.5C19.8638 19.5 20.3725 19.7371 20.7475 20.159C21.1226 20.581 21.3333 21.1533 21.3333 21.75C21.3333 22.3467 21.1226 22.919 20.7475 23.341C20.3725 23.7629 19.8638 24 19.3333 24C18.8029 24 18.2942 23.7629 17.9191 23.341C17.544 22.919 17.3333 22.3467 17.3333 21.75C17.3333 21.1533 17.544 20.581 17.9191 20.159C18.2942 19.7371 18.8029 19.5 19.3333 19.5Z" fill="black"/>
                      </svg>
                      <p class="category-icon-label">Shopping</p>
                    </article><article class="category-icon-wrapper">
                      <svg class="category-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 1.125C0 0.501562 0.445833 0 1 0H2.89583C3.8125 0 4.625 0.6 5.00417 1.5H22.1292C23.225 1.5 24.025 2.67188 23.7375 3.8625L22.0292 11.0016C21.675 12.4734 20.4875 13.5 19.1333 13.5H7.1125L7.3375 14.8359C7.42917 15.3656 7.84167 15.75 8.32083 15.75H20.3333C20.8875 15.75 21.3333 16.2516 21.3333 16.875C21.3333 17.4984 20.8875 18 20.3333 18H8.32083C6.87917 18 5.64167 16.8469 5.375 15.2578L3.225 2.55469C3.19583 2.37656 3.05833 2.25 2.89583 2.25H1C0.445833 2.25 0 1.74844 0 1.125ZM5.33333 21.75C5.33333 21.4545 5.38507 21.1619 5.48557 20.889C5.58608 20.616 5.7334 20.3679 5.91912 20.159C6.10484 19.9501 6.32532 19.7843 6.56797 19.6713C6.81062 19.5582 7.07069 19.5 7.33333 19.5C7.59598 19.5 7.85605 19.5582 8.0987 19.6713C8.34135 19.7843 8.56183 19.9501 8.74755 20.159C8.93326 20.3679 9.08058 20.616 9.18109 20.889C9.2816 21.1619 9.33333 21.4545 9.33333 21.75C9.33333 22.0455 9.2816 22.3381 9.18109 22.611C9.08058 22.884 8.93326 23.1321 8.74755 23.341C8.56183 23.5499 8.34135 23.7157 8.0987 23.8287C7.85605 23.9418 7.59598 24 7.33333 24C7.07069 24 6.81062 23.9418 6.56797 23.8287C6.32532 23.7157 6.10484 23.5499 5.91912 23.341C5.7334 23.1321 5.58608 22.884 5.48557 22.611C5.38507 22.3381 5.33333 22.0455 5.33333 21.75ZM19.3333 19.5C19.8638 19.5 20.3725 19.7371 20.7475 20.159C21.1226 20.581 21.3333 21.1533 21.3333 21.75C21.3333 22.3467 21.1226 22.919 20.7475 23.341C20.3725 23.7629 19.8638 24 19.3333 24C18.8029 24 18.2942 23.7629 17.9191 23.341C17.544 22.919 17.3333 22.3467 17.3333 21.75C17.3333 21.1533 17.544 20.581 17.9191 20.159C18.2942 19.7371 18.8029 19.5 19.3333 19.5Z" fill="black"/>
                      </svg>
                      <p class="category-icon-label">Shopping</p>
                    </article>
                    <article class="category-icon-wrapper">
                      <svg class="category-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 1.125C0 0.501562 0.445833 0 1 0H2.89583C3.8125 0 4.625 0.6 5.00417 1.5H22.1292C23.225 1.5 24.025 2.67188 23.7375 3.8625L22.0292 11.0016C21.675 12.4734 20.4875 13.5 19.1333 13.5H7.1125L7.3375 14.8359C7.42917 15.3656 7.84167 15.75 8.32083 15.75H20.3333C20.8875 15.75 21.3333 16.2516 21.3333 16.875C21.3333 17.4984 20.8875 18 20.3333 18H8.32083C6.87917 18 5.64167 16.8469 5.375 15.2578L3.225 2.55469C3.19583 2.37656 3.05833 2.25 2.89583 2.25H1C0.445833 2.25 0 1.74844 0 1.125ZM5.33333 21.75C5.33333 21.4545 5.38507 21.1619 5.48557 20.889C5.58608 20.616 5.7334 20.3679 5.91912 20.159C6.10484 19.9501 6.32532 19.7843 6.56797 19.6713C6.81062 19.5582 7.07069 19.5 7.33333 19.5C7.59598 19.5 7.85605 19.5582 8.0987 19.6713C8.34135 19.7843 8.56183 19.9501 8.74755 20.159C8.93326 20.3679 9.08058 20.616 9.18109 20.889C9.2816 21.1619 9.33333 21.4545 9.33333 21.75C9.33333 22.0455 9.2816 22.3381 9.18109 22.611C9.08058 22.884 8.93326 23.1321 8.74755 23.341C8.56183 23.5499 8.34135 23.7157 8.0987 23.8287C7.85605 23.9418 7.59598 24 7.33333 24C7.07069 24 6.81062 23.9418 6.56797 23.8287C6.32532 23.7157 6.10484 23.5499 5.91912 23.341C5.7334 23.1321 5.58608 22.884 5.48557 22.611C5.38507 22.3381 5.33333 22.0455 5.33333 21.75ZM19.3333 19.5C19.8638 19.5 20.3725 19.7371 20.7475 20.159C21.1226 20.581 21.3333 21.1533 21.3333 21.75C21.3333 22.3467 21.1226 22.919 20.7475 23.341C20.3725 23.7629 19.8638 24 19.3333 24C18.8029 24 18.2942 23.7629 17.9191 23.341C17.544 22.919 17.3333 22.3467 17.3333 21.75C17.3333 21.1533 17.544 20.581 17.9191 20.159C18.2942 19.7371 18.8029 19.5 19.3333 19.5Z" fill="black"/>
                      </svg>
                      <p class="category-icon-label">Shopping</p>
                    </article>
                    <article class="category-icon-wrapper">
                      <svg class="category-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 1.125C0 0.501562 0.445833 0 1 0H2.89583C3.8125 0 4.625 0.6 5.00417 1.5H22.1292C23.225 1.5 24.025 2.67188 23.7375 3.8625L22.0292 11.0016C21.675 12.4734 20.4875 13.5 19.1333 13.5H7.1125L7.3375 14.8359C7.42917 15.3656 7.84167 15.75 8.32083 15.75H20.3333C20.8875 15.75 21.3333 16.2516 21.3333 16.875C21.3333 17.4984 20.8875 18 20.3333 18H8.32083C6.87917 18 5.64167 16.8469 5.375 15.2578L3.225 2.55469C3.19583 2.37656 3.05833 2.25 2.89583 2.25H1C0.445833 2.25 0 1.74844 0 1.125ZM5.33333 21.75C5.33333 21.4545 5.38507 21.1619 5.48557 20.889C5.58608 20.616 5.7334 20.3679 5.91912 20.159C6.10484 19.9501 6.32532 19.7843 6.56797 19.6713C6.81062 19.5582 7.07069 19.5 7.33333 19.5C7.59598 19.5 7.85605 19.5582 8.0987 19.6713C8.34135 19.7843 8.56183 19.9501 8.74755 20.159C8.93326 20.3679 9.08058 20.616 9.18109 20.889C9.2816 21.1619 9.33333 21.4545 9.33333 21.75C9.33333 22.0455 9.2816 22.3381 9.18109 22.611C9.08058 22.884 8.93326 23.1321 8.74755 23.341C8.56183 23.5499 8.34135 23.7157 8.0987 23.8287C7.85605 23.9418 7.59598 24 7.33333 24C7.07069 24 6.81062 23.9418 6.56797 23.8287C6.32532 23.7157 6.10484 23.5499 5.91912 23.341C5.7334 23.1321 5.58608 22.884 5.48557 22.611C5.38507 22.3381 5.33333 22.0455 5.33333 21.75ZM19.3333 19.5C19.8638 19.5 20.3725 19.7371 20.7475 20.159C21.1226 20.581 21.3333 21.1533 21.3333 21.75C21.3333 22.3467 21.1226 22.919 20.7475 23.341C20.3725 23.7629 19.8638 24 19.3333 24C18.8029 24 18.2942 23.7629 17.9191 23.341C17.544 22.919 17.3333 22.3467 17.3333 21.75C17.3333 21.1533 17.544 20.581 17.9191 20.159C18.2942 19.7371 18.8029 19.5 19.3333 19.5Z" fill="black"/>
                      </svg>
                      <p class="category-icon-label">Shopping</p>
                    </article><article class="category-icon-wrapper">
                      <svg class="category-icon-svg" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 1.125C0 0.501562 0.445833 0 1 0H2.89583C3.8125 0 4.625 0.6 5.00417 1.5H22.1292C23.225 1.5 24.025 2.67188 23.7375 3.8625L22.0292 11.0016C21.675 12.4734 20.4875 13.5 19.1333 13.5H7.1125L7.3375 14.8359C7.42917 15.3656 7.84167 15.75 8.32083 15.75H20.3333C20.8875 15.75 21.3333 16.2516 21.3333 16.875C21.3333 17.4984 20.8875 18 20.3333 18H8.32083C6.87917 18 5.64167 16.8469 5.375 15.2578L3.225 2.55469C3.19583 2.37656 3.05833 2.25 2.89583 2.25H1C0.445833 2.25 0 1.74844 0 1.125ZM5.33333 21.75C5.33333 21.4545 5.38507 21.1619 5.48557 20.889C5.58608 20.616 5.7334 20.3679 5.91912 20.159C6.10484 19.9501 6.32532 19.7843 6.56797 19.6713C6.81062 19.5582 7.07069 19.5 7.33333 19.5C7.59598 19.5 7.85605 19.5582 8.0987 19.6713C8.34135 19.7843 8.56183 19.9501 8.74755 20.159C8.93326 20.3679 9.08058 20.616 9.18109 20.889C9.2816 21.1619 9.33333 21.4545 9.33333 21.75C9.33333 22.0455 9.2816 22.3381 9.18109 22.611C9.08058 22.884 8.93326 23.1321 8.74755 23.341C8.56183 23.5499 8.34135 23.7157 8.0987 23.8287C7.85605 23.9418 7.59598 24 7.33333 24C7.07069 24 6.81062 23.9418 6.56797 23.8287C6.32532 23.7157 6.10484 23.5499 5.91912 23.341C5.7334 23.1321 5.58608 22.884 5.48557 22.611C5.38507 22.3381 5.33333 22.0455 5.33333 21.75ZM19.3333 19.5C19.8638 19.5 20.3725 19.7371 20.7475 20.159C21.1226 20.581 21.3333 21.1533 21.3333 21.75C21.3333 22.3467 21.1226 22.919 20.7475 23.341C20.3725 23.7629 19.8638 24 19.3333 24C18.8029 24 18.2942 23.7629 17.9191 23.341C17.544 22.919 17.3333 22.3467 17.3333 21.75C17.3333 21.1533 17.544 20.581 17.9191 20.159C18.2942 19.7371 18.8029 19.5 19.3333 19.5Z" fill="black"/>
                      </svg>
                      <p class="category-icon-label">Shopping</p>
                    </article>
                  </section>
                `;
        break;
      case "budget":
        formContent = `
                <h1 class="form-title">Ajouter un budget</h1>
                <hr class="form-separator"/>
                <form class="modal-form" action="" id="budgetForm">
                  <label class="label label-text" for="name">Nom du budget</label>
                  <input class="input input-text" placeholder="Le nom du budget" type="text" name="name" id="name" required>
                  <label class="label label-select" for="category">Catégorie</label>
                  <select class="input input-select" name="category" id="category" required>
                      <option class="select-option" value="">Loisirs</option>
                      <option class="select-option" value="">Salaires</option>
                      <option class="select-option" value="">Charges</option>
                      <option class="select-option" value="">Transports</option>
                  </select>
                  <label class="label label-number" for="budget">Budget</label>
                  <input class="input input-number" type="number" name="budget" id="budget" required>
                  <div class="checkbox-input-container">
                    <label class="label label-checkbox" for="alert">Être alerté lors du dépassement</label>
                    <div class="custom-checkbox-container">
                      <input type="checkbox" id="alert" class="input-checkbox">
                      <label for="alert" class="custom-checkbox"></label>
                    </div>
                  </div>
                  `;
        break;
      case "transaction":
        formContent = `
                <h1 class="form-title">Ajouter une transaction</h1>
                <hr class="form-separator"/>
                <form class="modal-form" action="" id="transactionForm">
                  <label class="label label-text" for="name">Libellé</label>
                  <input class="input input-text" placeholder="Achat compulsif sur amazon .." type="text" name="name" id="name" required>
                  <label class="label label-select" for="type">Type de transaction</label>
                  <select class="input input-select" name="type" id="type" required>
                      <option class="select-option" value="credit">Crédit</option>
                      <option class="select-option" value="debit">Débit</option>
                  </select>
                  <label class="label label-number" for="amount">Montant</label>
                  <input class="input input-number" type="number" name="amount" id="amount" required>
                  <label class="label label-select" for="category">Catégorie</label>
                  <select class="input input-select" name="category" id="category" required>
                      <option class="select-option" value="">Loisirs</option>
                      <option class="select-option" value="">Charges</option>
                      <option class="select-option" value="">Santé</option>
                  </select>
                  <label class="label label-date" for="date">Date</label>
                  <input class="input input-date" type="date" name="date" id="date" required>
                  `;
        break;
      default:
        console.log("Unknown modal type");
        return;
    }

    modalContent.innerHTML = `
          <div class="modal-content">
                  ${formContent}
                  <div class="form-buttons">
                    <input id="close" class="button button-secondary" type="button" value="Annuler">
                    <input class="button button-primary" type="submit" value="Ajouter">
                  </div>
              </form>
              </section>
          </div>`;
  }

  const btn = document.getElementById("openModal");
  const span = document.getElementById("close");

  if (btn) {
    btn.onclick = function () {
      if (modalContent) {
        modalContent.style.display = "block";
      }
    };
  }

  if (span) {
    span.onclick = function () {
      if (modalContent) {
        modalContent.style.display = "none";
      }
    };
  }
});
