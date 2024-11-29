import { getAllItems } from "./openDatabase.js";
import { Category } from "../categories.js";

document.addEventListener("DOMContentLoaded", () => {
  const modalContent = document.getElementById("modal") as HTMLElement;
  const dataType = modalContent?.getAttribute("data-type");

  console.log("Modal content:", modalContent);
  console.log("Data-type attribute:", dataType);

  if (dataType) {
    console.log(`Creating modal for type: ${dataType}`);
    createModal(dataType, modalContent);
  } else {
    console.error("No data-type attribute found on modal element");
  }

  // Fetch categories from IndexedDB
  async function fetchCategories(): Promise<Category[]> {
    console.log("Fetching categories...");
    try {
      const categories = await getAllItems(
        "CategoryDatabase",
        "categories",
        "id",
      );
      console.log("Categories:", categories);
      return categories as Category[];
    } catch (error) {
      console.error("Error opening database:", error);
      return [];
    }
  }

  // Create the modal based on the type
  async function createModal(type: string, modalContent: HTMLElement) {
    console.log(`Creating modal for type: ${type}`);

    // Start by creating the form structure without category options
    const formContent = getFormContent(type);
    if (!formContent) {
      console.error("Unknown modal type");
      return;
    }

    console.log("Setting modal content...");
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

    // Fetch categories and update the category select elements
    const categories = await fetchCategories();
    const categoryOptions = categories
      .map((category) =>
        category.id && category.name
          ? `<option value="${category.id}">${category.name}</option>`
          : "",
      )
      .join("");
    console.log("Generated category options:", categoryOptions);

    // Populate the category selects in the modal
    const categorySelects = modalContent.querySelectorAll(
      ".categorySelect",
    ) as NodeListOf<HTMLSelectElement>;
    categorySelects.forEach((select) => {
      select.innerHTML = `<option value="" disabled selected>Choisir une catégorie</option>${categoryOptions}`;
    });

    // Initialize close button
    const closeButton = modalContent.querySelector("#close") as HTMLElement;
    if (closeButton) {
      console.log("Close button found");
      closeButton.onclick = () => {
        console.log("Closing modal...");
        modalContent.style.display = "none";
        const form = modalContent.querySelector("form") as HTMLFormElement;
        if (form) {
          form.reset();
          clearErrorMessage();
        }
      };
    }
  }

  // Generate form content based on modal type
  function getFormContent(type: string): string | null {
    console.log(`Getting form content for type: ${type}`);
    switch (type) {
      case "category":
        return ` 
          <h1 class="form-title">Ajouter une catégorie</h1>
          <hr class="form-separator"/>
          <form class="modal-form" id="categoriesForm" action="">
            <input class="" type="hidden" name="id">
            <label class="label label-text" for="category">Nom de la catégorie</label>
            <input class="input input-text" type="text" name="name" id="category" required>
            <label class="label label-icons" for="icon">Choisir une icône</label>
            <input type="file" name="icon" id="categoryIcon" accept="image/*" required>
        `;
      case "budget":
        return `
          <h1 class="form-title">Ajouter un budget</h1>
          <hr class="form-separator"/>
          <form class="modal-form" id="budgetsForm" action="">
            <input type="hidden" name="id" id="budgetId">
            
            <label class="label label-text" for="name">Nom du budget</label>
            <input class="input input-text" placeholder="Le nom du budget" type="text" name="name" id="name" required>
            
            <label class="label label-select" for="budgetCategorySelect">Catégorie</label>
            <select class="categorySelect input input-select" name="category" id="budgetCategorySelect" required></select>
            
            <label class="label label-number" for="budget">Budget</label>
            <input class="input input-number" type="number" name="budget" id="budget" step="0.01" required>
            
            <div class="checkbox-input-container">
              <label class="label label-checkbox" for="alert">Être alerté lors du dépassement</label>
              <div class="custom-checkbox-container">
                <input type="checkbox" name="alert" id="alert" class="input-checkbox">
                <label for="alert" class="custom-checkbox"></label>
              </div>
            </div>
          `;
      case "transaction":
        return `
          <h1 class="form-title">Ajouter une transaction</h1>
          <hr class="form-separator"/>
          <form class="modal-form" id="transactionsForm" action="">
            <label class="label label-text" for="type">Type de transaction</label>
            <select class="input input-text" name="type" id="type" required>
              <option class="input input-select" value="" disabled selected>Choisir un type</option>
              <option class="select-option" value="credit">Crédit</option>
              <option class="select-option" value="debit">Débit</option>
            </select>
            <label class="label label-text" for="name">Libellé</label>
            <input placeholder="Achat compulsif sur amazon .." class="input input-text" type="text" name="name" id="name" required>
            <label class="label label-number" for="amount">Montant</label>
            <input class="input input-number" type="number" name="amount" id="amount" step="0.01" required>
            <label for="transactionCategorySelect">Catégorie</label>
            <select class="categorySelect input input-select" name="category" id="transactionCategorySelect" required></select>
            <label class="label label-date" for="date">Date</label>
            <input class="input input-date" type="date" name="date" id="date" required>
          `;
      default:
        console.error("Unknown form type");
        return null;
    }
  }

  const btn = document.getElementById("openModal");
  const span = document.getElementById("close");

  if (btn) {
    console.log("Open modal button found");
    btn.onclick = () => {
      if (modalContent) {
        console.log("Opening modal...");
        const submitButton = modalContent.querySelector(
          'input[type="submit"]',
        ) as HTMLInputElement;
        if (submitButton) {
          submitButton.value = "Ajouter";
        }
        modalContent.style.display = "block";
      }
    };
  }

  if (span) {
    console.log("Close button found");
    span.onclick = () => {
      if (modalContent) {
        console.log("Closing modal...");
        modalContent.style.display = "none";
        const form = modalContent.querySelector("form") as HTMLFormElement;
        if (form) {
          form.reset();
          clearErrorMessage();
        }
      }
    };
  }
});

function clearErrorMessage() {
  const errorElement = document.querySelector(".error");
  if (errorElement) {
    console.log("Clearing error message");
    errorElement.remove();
  }
}
