import { getAllItems } from "../../core/database/openDatabase.js";
import { Category } from "../../pages/categories.js";
import { getIcons } from "../../utils/get-icons.js";

const icons = getIcons();

const today = new Date().toISOString().split("T")[0];

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
        const previouslySelected = iconsContainer.querySelector(".selected");
        if (previouslySelected) {
          previouslySelected.classList.remove("selected");
        }

        imgwrapper.classList.add("selected");
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
          <svg id="close" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15.5735 2.42596C15.7068 2.29689 15.8132 2.14246 15.8864 1.9717C15.9597 1.80095 15.9982 1.61727 15.9999 1.43139C16.0016 1.24552 15.9664 1.06116 15.8963 0.889084C15.8262 0.717008 15.7227 0.560657 15.5917 0.429155C15.4608 0.297653 15.305 0.193632 15.1335 0.123162C14.9621 0.0526925 14.7783 0.0171858 14.593 0.0187128C14.4077 0.0202398 14.2246 0.0587703 14.0543 0.132056C13.884 0.205342 13.73 0.311916 13.6012 0.445559L8.0079 6.05452L2.4165 0.445559C2.28874 0.30802 2.13468 0.197703 1.9635 0.12119C1.79231 0.0446766 1.60752 0.0035343 1.42014 0.000217862C1.23276 -0.00309858 1.04664 0.0314789 0.872874 0.101887C0.699106 0.172295 0.541256 0.277091 0.40874 0.410024C0.276223 0.542956 0.171755 0.701301 0.101568 0.875614C0.0313803 1.04993 -0.00308888 1.23664 0.00021718 1.4246C0.00352324 1.61257 0.0445368 1.79794 0.12081 1.96966C0.197084 2.14138 0.307055 2.29593 0.444164 2.42409L6.03184 8.03492L0.440443 13.6439C0.193938 13.9093 0.0597379 14.2603 0.0661168 14.6229C0.0724956 14.9856 0.218955 15.3316 0.474639 15.5881C0.730323 15.8446 1.07527 15.9915 1.4368 15.9979C1.79834 16.0043 2.14824 15.8697 2.41278 15.6224L8.0079 10.0135L13.5993 15.6243C13.8638 15.8716 14.2137 16.0062 14.5753 15.9998C14.9368 15.9934 15.2818 15.8465 15.5374 15.59C15.7931 15.3335 15.9396 14.9875 15.946 14.6248C15.9523 14.2621 15.8181 13.9111 15.5716 13.6457L9.98396 8.03492L15.5735 2.42596Z" fill="#F1F1FA"/>
          </svg>
                  ${formContent}
                  <input class="button button-primary" type="submit" value="Ajouter"/>
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
          <h2>Ajouter une catégorie</h2>
          <form class="modal-form" id="categoriesForm" action="">
            <input class="" type="hidden" name="id">
            <div class="form-group">
            <label class="label label-text" for="category">Nom de la catégorie</label>
            <input class="input input-text" type="text" name="name" id="category" required>
            </div>
            <div class="form-group double-gap">
            <div class="actualIcon">
              <label>Icône actuelle</label>
              <div class="form-group">
                <img id="iconPreview" style="display: none; max-width: 100px;" alt="Aperçu de l'icône" />
                <a type="button" id="deleteIconButton" style="display: none;">Supprimer l'image</a>
              </div>
            </div>
            <label class="label label-icons" for="icon">Choisir une icône</label>
            <div id="iconsContainer"></div>
            </div>
            <div class="form-group double-gap">
            <p>Ou choisir un fichier</p>
            <div class="input-file">
              <label for="file-input" class="file-label">
                  Choisir un fichier
              </label>
              <span class="file-name">Aucun fichier sélectionné</span>
              <input type="file" id="file-input" class="file-input">
            </div>
            </div>
        `;
      case "budget":
        return `
          <h2>Ajouter un budget</h2>
          <form class="modal-form" id="budgetsForm" action="">
            <input type="hidden" name="id" id="budgetId">
            <input type="hidden" id="month" name="month"> 
            <input type="hidden" id="year" name="year">
            <div class="form-group">
            <label class="label label-text" for="budget">Nom du budget</label>
            <input class="input input-text" type="text" name="name" id="budget" required>
            </div>
            <div class="form-group">
            <label class="label label-number" for="budget">Budget</label>
            <input class="input input-number" type="number" name="budget" id="budget" step="0.01" required>
            </div>
            <div class="form-group">
            <label class="label label-select" for="budgetCategorySelect">Catégorie</label>
            <div class="select-container">
            <select name="category" id="budgetCategorySelect" class="categorySelect input input-select" required>
            </select>
            </div>
            </div>
            <div class="checkbox-input-container">
              <label class="label label-checkbox" for="alert">Être alerté lors du dépassement</label>
              <div class="custom-checkbox-container">
                <input type="checkbox" name="alert" id="alert" class="input-checkbox">
                <label for="alert" class="custom-checkbox"></label>
                <p>Alerte désactivée</p>
              </div>
            </div>
          `;
      case "transaction":
        return `
         <h2 class="form-title">Ajouter une transaction</h2>
          <form class="modal-form" id="transactionsForm" action="">
          <div class="row">  
          <input type="hidden" name="id" id="transactionId">
            <div class="column">
              <div class="form-group">
              <label class="label label-text" for="type">Type de transaction</label>
              <div class="select-container">
              <select class="input input-text" name="type" id="type" required>
                <option class="input input-select" value="" disabled selected>Choisir un type</option>
                <option class="select-option" value="credit">Crédit</option>
                <option class="select-option" value="debit">Débit</option>
              </select>
              </div>
              </div>
              <div class="form-group">
              <label class="label label-text" for="name">Libellé</label>
              <input placeholder="Achat compulsif sur amazon .." class="input input-text" type="text" name="name" id="name" required>
              </div>
              <div class="form-group">
              <label class="label label-number" for="amount">Montant</label>
              <input class="label label-number" type="number" name="amount" id="amount" step="0.01" required>
              </div>
            </div>

            <div class="column">
              <div class="form-group">
              <label class="label label-select" for="transactionCategorySelect">Catégorie</label>
              <div class="select-container">
              <select name="category" id="transactionCategorySelect" class="input input-select categorySelect" required></select>
              </div>
              </div>
              <div class="form-group">
              <label class="label label-date" for="date">Date</label>
              <input class="input input-date" type="date" name="date" id="date" value="${today}" required>
              </div>
            </div>
            </div>
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
        modalContent.style.display = "flex";
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
