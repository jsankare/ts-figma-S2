import { getAllItems } from "../../core/database/openDatabase.js";
import { Category } from "../../pages/categories.js";
import { getIcons } from "../../utils/get-icons.js";

const icons = getIcons();

const today = new Date().toISOString().split('T')[0];

function getCategoryIcons(): void {
  const iconsContainer = document.getElementById("iconsContainer");
  if (!iconsContainer) {
    console.error("Icons container not found");
    return;
  }

  iconsContainer.innerHTML = "";

  icons.forEach((icon) => {
    const imgwrapper = document.createElement("div");
    const img = document.createElement("img");
    imgwrapper.className = "wrapper-icon";
    img.src = icon.icon; // Set the icon source
    img.alt = icon.name; // Set the alt text
    img.title = icon.name;
    img.className = "category-icon";
    imgwrapper.appendChild(img);

    // Optional: Add a click handler to select an icon
    img.addEventListener("click", () => {
      const iconPreview = document.getElementById(
        "iconPreview",
      ) as HTMLImageElement;
      if (iconPreview) {
        iconPreview.style.display = "block";
        iconPreview.src = icon.icon; // Set the preview image to selected icon
      }
    });

    iconsContainer.appendChild(imgwrapper);
  });
}

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
      const categories = await getAllItems("CategoryDatabase", "categories");
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

    // Generate and set the form content
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
                    <input id="close" class="button button-secondary" type="button" value="Annuler"/>
                    <input class="button button-primary" type="submit" value="Ajouter"/>
                  </div>
              </form>
              </section>
          </div>`;

    // Call getCategoryIcons after the modal content is rendered
    if (type === "category") {
      getCategoryIcons();
    }

    // Fetch categories and update the selects
    const categories = await fetchCategories();
    const categoryOptions = categories
      .map((category) =>
        category.id && category.name
          ? `<option value="${category.id}">${category.name}</option>`
          : "",
      )
      .join("");
    console.log("Generated category options:", categoryOptions);

    const categorySelects = modalContent.querySelectorAll(
      ".categorySelect",
    ) as NodeListOf<HTMLSelectElement>;

    categorySelects.forEach((select) => {
      select.innerHTML = `<option value="" disabled selected>Choisir une catégorie</option>${categoryOptions}`;
    });

    // Initialize close button
    const closeButton = modalContent.querySelector("#close") as HTMLElement;
    if (closeButton) {
      closeButton.onclick = () => {
        console.log("Closing modal...");
        modalContent.style.display = "none";
        const form = modalContent.querySelector("form") as HTMLFormElement;
        if (form) {
          form.reset();
          const previewImage = form.querySelector(
            "#iconPreview",
          ) as HTMLImageElement;
          if (previewImage) {
            previewImage.style.display = "none";
            previewImage.src = "";
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
        getCategoryIcons();
        return ` 
          <h1 class="form-title">Ajouter une catégorie</h1>
          <hr class="form-separator"/>
          <form class="modal-form" id="categoriesForm" action="">
            <input class="" type="hidden" name="id">
            <label class="label label-text" for="category">Nom de la catégorie</label>
            <input class="input input-text" type="text" name="name" id="category" required>
            <label class="label label-icons" for="icon">Choisir une icône</label>
            <img id="iconPreview" style="display: none; max-width: 100px;" alt="Aperçu de l'icône" />
                      <div id="iconsContainer"></div>
            <button type="button" id="deleteIconButton" style="display: none;">Supprimer l'image</button>
            <input type="file" name="icon" id="categoryIcon" accept="image/*">
        `;
      case "budget":
        return `
          <h1 class="form-title">Ajouter un budget</h1>
          <hr class="form-separator"/>
          <form class="modal-form" id="budgetsForm" action="">
            <input type="hidden" name="id" id="budgetId">
            <input type="hidden" id="month" name="month"> 
            <input type="hidden" id="year" name="year">
            <label class="label label-select" for="budgetCategorySelect">Catégorie</label>
            <select name="category" id="budgetCategorySelect" class="categorySelect input input-select" required>
            </select>
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
            <input type="hidden" name="id" id="transactionId">
            <label class="label label-text" for="type">Type de transaction</label>
            <select class="input input-text" name="type" id="type" required>
              <option class="input input-select" value="" disabled selected>Choisir un type</option>
              <option class="select-option" value="credit">Crédit</option>
              <option class="select-option" value="debit">Débit</option>
            </select>
            <label class="label label-text" for="name">Libellé</label>
            <input placeholder="Achat compulsif sur amazon .." class="input input-text" type="text" name="name" id="name" required>
            <label class="label label-text" for="name">Description</label>
            <textarea class="input input-text" name="description" id="description"></textarea>
            <label class="label label-number" for="amount">Montant</label>
            <input class="label label-number" type="number" name="amount" id="amount" step="0.01" required>
            <label class="label label-select" for="transactionCategorySelect">Catégorie</label>
            <select name="category" id="transactionCategorySelect" class="input input-select categorySelect" required></select>
            <label class="label label-date" for="date">Date</label>
            <input class="input input-date" type="date" name="date" id="date" value="${today}" required>
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
