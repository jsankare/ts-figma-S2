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
        <button id="close">&times;</button>
        ${formContent}
        <input type="submit" value="Ajouter">
      </div>
    `;

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
        console.log(form);
        if (form) {
          form.reset();
          const previewImage = form.querySelector(
            "#iconPreview",
          ) as HTMLImageElement;
          if (previewImage) {
            previewImage.style.display = "none";
            previewImage.src = ""; // Supprime l'aperçu de l'image
          }
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
          <form id="categoriesForm" action="">
            <input type="hidden" name="id">
            <label for="category">Nom de la catégorie</label>
            <input type="text" name="name" id="category" required>
            <label for="categoryIcon">Icône</label>
            <img id="iconPreview" style="display: none; max-width: 100px;" alt="Aperçu de l'icône" />
            <button type="button" id="deleteIconButton" style="display: none;">Supprimer l'image</button>
            <input type="file" name="icon" id="categoryIcon" accept="image/*">
        `;
      case "budget":
        return `
          <form id="budgetsForm" action="">
            <input type="hidden" name="id" id="budgetId">
            <label for="budgetCategorySelect">Catégorie</label>
            <select name="category" id="budgetCategorySelect" class="categorySelect" required>
            </select>
            <label for="budget">Budget</label>
            <input type="number" name="budget" id="budget" step="0.01" required>
            <input type="checkbox" name="alert" id="alert">
            <label for="alert">Recevoir une alerte</label>
          `;
      case "transaction":
        return `
          <form id="transactionsForm" action="">
            <input type="hidden" name="id" id="budgetId">
            <label for="type">Type de transaction</label>
            <select name="type" id="type" required>
              <option value="" disabled selected>Choisir un type</option>
              <option value="credit">Crédit</option>
              <option value="debit">Débit</option>
            </select>
            <label for="name">Libellé</label>
            <input type="text" name="name" id="name" required>
            <label for="name">Description</label>
            <textarea name="description" id="description"></textarea>
            <label for="amount">Montant</label>
            <input type="number" name="amount" id="amount" step="0.01" required>
            <label for="transactionCategorySelect">Catégorie</label>
            <select name="category" id="transactionCategorySelect" class="categorySelect" required>
            </select>
            <label for="date">Date</label>
            <input type="date" name="date" id="date" required>
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
