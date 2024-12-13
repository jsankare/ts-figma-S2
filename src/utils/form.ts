import {
  getAllItems,
  addItemToDatabase,
  deleteItem,
  getItemById,
} from "./openDatabase.js";
import { displayMessage } from "./alert.js";
import { uploadImage } from "./uploadImage.js";
import { Budget, isBudget } from "../budgets.js";
import { Category, isCategory } from "../categories.js";
import { Transaction, isTransaction } from "../transactions.js";

// Gérer la soumission du formulaire
export async function handleFormSubmit(
  formId: string,
  listingId: string,
  dbName: string,
  storeName: string,
  keyPath: string,
  requiredFields: string[],
  optionalFields: string[] = [],
) {
  const form = document.getElementById(formId) as HTMLFormElement;

  if (form) {
    console.log(`Form found: ${formId}`);
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      console.log("Form Data:", formData);
      let item: { [key: string]: any } = {};

      // Collecter les données du formulaire
      requiredFields.concat(optionalFields).forEach((field) => {
        const value = formData.get(field);
        if (value) {
          item[field] = value;
        }
      });

      // Gérer la case à cocher d'alerte
      const alertCheckbox = form.querySelector(
        'input[name="alert"]',
      ) as HTMLInputElement;
      item.alert = alertCheckbox?.checked || false;

      // Valider les champs obligatoires
      for (const field of requiredFields) {
        if (!item[field]) {
          displayMessage("All required fields must be filled");
          console.error("Missing required field:", field);
          return;
        }
      }

      // Convertir item.category en nombre
      if (item.category) {
        item.category = Number(item.category);
      }

      // Gérer le téléchargement de fichiers
      const fileInput = form.querySelector("#categoryIcon") as HTMLInputElement;
      if (fileInput && fileInput.files?.length) {
        const file = fileInput.files[0];
        console.log("File selected for upload:", file);
        try {
          const pictureDataUrl = await uploadImage(file);
          item.icon = pictureDataUrl;
        } catch (error) {
          displayMessage("Error uploading image");
          return;
        }
      }

      console.log("Prepared item for DB:", item);

      try {
        await addItemToDatabase(dbName, storeName, keyPath, item, formData);
        form.reset();
        const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
        hiddenInputs.forEach((input) => {
          input.value = "";
        });
        const modalContent = document.getElementById("modal");
        if (modalContent) {
          modalContent.style.display = "none"; // Fermer la modal
        }
        displayMessage("Ajouté", false);
        updateListing(
          dbName,
          storeName,
          keyPath,
          requiredFields.concat(optionalFields),
        );
      } catch (error) {
        console.error(`Error saving item:`, error);
        alert("Error occurred while saving the item");
      }
    });
  } else {
    console.warn(`Form with ID: ${formId} not found`);
  }
}

// Afficher les éléments dans le listage
async function displayItems(
  items: (Category | Transaction | Budget)[],
  storeName: string,
  dbName: string,
  keyPath: string,
  fields: string[],
) {
  const listing = document.getElementById(`${storeName}Listing`);
  if (listing) {
    listing.innerHTML = "";
    for (const item of items) {
      const listItem = document.createElement("li");
      console.log("Processing item:", item);

      if (isTransaction(item)) {
        try {
          const categoryId = Number(item.category);
          const category = await getItemById(
            "CategoryDatabase",
            "categories",
            "id",
            categoryId,
          );
          let categoryName: string = "";
          let categoryIcon: string | undefined = "";
          if (isCategory(category)) {
            categoryName = category.name;
            categoryIcon = category.icon;
          }

          const transactionCard = document.createElement("article");
          transactionCard.className = "transaction-card";

          transactionCard.innerHTML = `
      <div class="transaction-card-top">
          <p class="transaction-card-name">${item.name}</p>
          <p class="transaction-card-value ${
            item.type === "credit"
              ? "transaction-card-value-positive"
              : "transaction-card-value-negative"
          }">
            <span class="transaction-card-sign">${
              item.type === "credit" ? "+" : "-"
            }</span>${Math.abs(item.amount).toFixed(2)}
            <span class="transaction-card-devise">€</span>
          </p>
      </div>
      <p class="transaction-card-middle">${new Date(
        item.date,
      ).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}</p>
      <div class="transaction-card-bottom">
          <span class="transaction-card-tag">
            <img class="category-icon-image" src="${categoryIcon}" alt="toto">
            ${categoryName}
          </span>
      </div>
    `;

          // Ajouter les boutons d'édition et suppression
          const editButton = createEditButton(item, storeName);
          const deleteButton = createDeleteButton(
            item,
            dbName,
            storeName,
            keyPath,
            fields,
          );

          const actionsContainer = document.createElement("div");
          actionsContainer.className = "transaction-card-actions";
          actionsContainer.appendChild(editButton);
          actionsContainer.appendChild(deleteButton);

          transactionCard.appendChild(actionsContainer);

          // Ajouter l'article au listing
          listing.appendChild(transactionCard);
        } catch (error) {
          console.error("Error fetching category for transaction:", error);
        }
      } else if (isCategory(item)) {
        listItem.innerHTML = `name: ${item.name}`;
        if (item.icon) {
          const iconImg = document.createElement("img");
          iconImg.src = item.icon;
          iconImg.alt = `${item.name} icon`;
          iconImg.style.width = "20px";
          iconImg.style.height = "20px";
          listItem.appendChild(iconImg);
        }
      } else if (isBudget(item)) {
        try {
          const categoryId = Number(item.category);
          const category = await getItemById(
            "CategoryDatabase",
            "categories",
            "id",
            categoryId,
          );
          let categoryName = "";
          if (isCategory(category)) {
            categoryName = category.name;
          }
          let alertText = "";
          if (item.alert) {
            alertText = "Alerte activée";
          }
          listItem.textContent = `category: ${categoryName}, budget: ${item.budget}, ${alertText}`;
        } catch (error) {
          console.error("Error fetching category for budget:", error);
        }
      }

      const editButton = createEditButton(item, storeName);
      const deleteButton = createDeleteButton(
        item,
        dbName,
        storeName,
        keyPath,
        fields,
      );

      // listItem.appendChild(editButton);
      // listItem.appendChild(deleteButton);
      // listing.appendChild(listItem);
    }
  } else {
    console.warn(`Listing element with ID ${storeName}Listing not found`);
  }
}

// Mettre à jour le listage avec les éléments de la base de données
export async function updateListing(
  dbName: string,
  storeName: string,
  keyPath: string,
  fields: string[],
) {
  try {
    console.log(`Updating listing for ${storeName}`);
    const items = await getAllItems(dbName, storeName, keyPath);
    console.log(`Items fetched for ${storeName}:`, items);
    await displayItems(items, storeName, dbName, keyPath, fields);
  } catch (error) {
    console.error(`Error updating listing:`, error);
  }
}

// Créer un bouton d'édition pour un élément
function createEditButton(
  item: Category | Transaction | Budget,
  storeName: string,
): HTMLButtonElement {
  const editButton = document.createElement("button");

  // Remplace `textContent` par `innerHTML` pour insérer le SVG
  editButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.6719 2.76104L21.2391 3.32822C21.6797 3.76885 21.6797 4.48135 21.2391 4.91729L19.875 6.28604L17.7141 4.1251L19.0781 2.76104C19.5188 2.32041 20.2313 2.32041 20.6672 2.76104H20.6719ZM9.83438 12.0095L16.125 5.71416L18.2859 7.8751L11.9906 14.1657C11.8547 14.3017 11.6859 14.4001 11.5031 14.4517L8.76094 15.2345L9.54375 12.4923C9.59531 12.3095 9.69375 12.1407 9.82969 12.0048L9.83438 12.0095ZM17.4891 1.17197L8.24063 10.4157C7.83281 10.8235 7.5375 11.3251 7.38281 11.8735L6.04219 16.561C5.92969 16.9548 6.0375 17.3767 6.32813 17.6673C6.61875 17.9579 7.04063 18.0657 7.43438 17.9532L12.1219 16.6126C12.675 16.4532 13.1766 16.1579 13.5797 15.7548L22.8281 6.51104C24.1453 5.19385 24.1453 3.05635 22.8281 1.73916L22.2609 1.17197C20.9438 -0.145215 18.8063 -0.145215 17.4891 1.17197ZM4.125 3.0001C1.84688 3.0001 0 4.84697 0 7.1251V19.8751C0 22.1532 1.84688 24.0001 4.125 24.0001H16.875C19.1531 24.0001 21 22.1532 21 19.8751V14.6251C21 14.0017 20.4984 13.5001 19.875 13.5001C19.2516 13.5001 18.75 14.0017 18.75 14.6251V19.8751C18.75 20.911 17.9109 21.7501 16.875 21.7501H4.125C3.08906 21.7501 2.25 20.911 2.25 19.8751V7.1251C2.25 6.08916 3.08906 5.2501 4.125 5.2501H9.375C9.99844 5.2501 10.5 4.74854 10.5 4.1251C10.5 3.50166 9.99844 3.0001 9.375 3.0001H4.125Z" fill="black"/>
    </svg>
  `;

  // Ajoute l'écouteur pour l'événement `click`
  editButton.addEventListener("click", () => {
    const modalContent = document.getElementById("modal");
    if (modalContent) {
      modalContent.style.display = "block";
    }
    console.log("Editing item:", item);
    fillFormWithItem(item, storeName);
  });

  return editButton;
}

// Créer un bouton de suppression pour un élément
function createDeleteButton(
  item: Category | Transaction | Budget,
  dbName: string,
  storeName: string,
  keyPath: string,
  fields: string[],
): HTMLButtonElement {
  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M9.13393 2.41875L8.11607 3.75H15.8839L14.8661 2.41875C14.7857 2.31562 14.6518 2.25 14.5071 2.25H9.4875C9.34286 2.25 9.20893 2.31094 9.12857 2.41875H9.13393ZM17.0089 1.17188L18.975 3.75H19.7143H22.2857H22.7143C23.4268 3.75 24 4.25156 24 4.875C24 5.49844 23.4268 6 22.7143 6H22.2857V20.25C22.2857 22.3219 20.3679 24 18 24H6C3.63214 24 1.71429 22.3219 1.71429 20.25V6H1.28571C0.573214 6 0 5.49844 0 4.875C0 4.25156 0.573214 3.75 1.28571 3.75H1.71429H4.28571H5.025L6.99107 1.16719C7.54821 0.440625 8.48571 0 9.4875 0H14.5071C15.5089 0 16.4464 0.440625 17.0036 1.16719L17.0089 1.17188ZM4.28571 6V20.25C4.28571 21.0797 5.05179 21.75 6 21.75H18C18.9482 21.75 19.7143 21.0797 19.7143 20.25V6H4.28571ZM8.57143 9V18.75C8.57143 19.1625 8.18571 19.5 7.71429 19.5C7.24286 19.5 6.85714 19.1625 6.85714 18.75V9C6.85714 8.5875 7.24286 8.25 7.71429 8.25C8.18571 8.25 8.57143 8.5875 8.57143 9ZM12.8571 9V18.75C12.8571 19.1625 12.4714 19.5 12 19.5C11.5286 19.5 11.1429 19.1625 11.1429 18.75V9C11.1429 8.5875 11.5286 8.25 12 8.25C12.4714 8.25 12.8571 8.5875 12.8571 9ZM17.1429 9V18.75C17.1429 19.1625 16.7571 19.5 16.2857 19.5C15.8143 19.5 15.4286 19.1625 15.4286 18.75V9C15.4286 8.5875 15.8143 8.25 16.2857 8.25C16.7571 8.25 17.1429 8.5875 17.1429 9Z" fill="black"/>
                            </svg>
  `;
  deleteButton.addEventListener("click", () => {
    deleteItem(dbName, storeName, item.id, fields);
    updateListing(dbName, storeName, keyPath, fields);
  });
  return deleteButton;
}

// Remplir le formulaire avec les données de l'élément pour l'édition
function fillFormWithItem(
  item: Category | Transaction | Budget,
  storeName: string,
) {
  const form = document.getElementById(`${storeName}Form`) as HTMLFormElement;
  const inputElements = form.querySelectorAll("input, select");

  inputElements.forEach((input) => {
    const fieldName = (input as HTMLInputElement | HTMLSelectElement).name;
    if (input instanceof HTMLInputElement && input.type === "file") {
      const fileInput = input as HTMLInputElement;
      if (item[fieldName] !== undefined && item[fieldName]) {
        fileInput.value = ""; // Vider le champ de fichier
        const fileName = item[fieldName] as string;
        const fileNameField = form.querySelector(
          `input[name="${fieldName}Name"]`,
        ) as HTMLInputElement;
        if (fileNameField) {
          fileNameField.value = fileName; // Remplir le champ texte avec le nom du fichier
        }
      }
    } else {
      if (item[fieldName] !== undefined) {
        (input as HTMLInputElement).value = item[fieldName] as string;
      }
    }
  });

  const submitButton = form.querySelector(
    'input[type="submit"]',
  ) as HTMLButtonElement;
  submitButton.value = `Mettre à jour`;
}
