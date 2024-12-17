import {
  addItemToDatabase,
  deleteItem,
  getAllItems,
  getItemById,
} from "./openDatabase.js";
import { displayMessage } from "./alert.js";
import { uploadImage } from "./uploadImage.js";
import { Budget, isBudget } from "../budgets.js";
import { Category, isCategory } from "../categories.js";
import { isTransaction, Transaction } from "../transactions.js";

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

  if (!form) {
    console.warn(`Form with ID: ${formId} not found`);
    return;
  }

  console.log(`Form found: ${formId}`);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Form submission started");

    const formData = new FormData(form);
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
    ) as HTMLInputElement | null;
    item.alert = alertCheckbox?.checked || false;

    // Valider les champs obligatoires
    for (const field of requiredFields) {
      if (!item[field]) {
        console.error(`Required field missing: ${field}`);
        displayMessage(`Field "${field}" is required.`, true, `#${formId}`);
        return;
      }
    }

    // Convertir `category` en nombre si nécessaire
    if (item.category) {
      item.category = Number(item.category);
    }

    // Récupérer l'icône existante
    const existingIcon = formData.get("existingIcon");
    if (existingIcon) {
      item.icon = existingIcon;
    }

    // Gérer le téléchargement de fichiers
    const fileInput = form.querySelector("#categoryIcon") as HTMLInputElement;
    if (fileInput && fileInput.files?.length) {
      const file = fileInput.files[0];
      const maxSize = 5 * 1024 * 1024; // Taille maximale en octets (ex. 5 Mo)
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"]; // Types MIME autorisés

      // Vérification de la taille et du type de fichier
      if (file.size > maxSize) {
        console.error("File is too large.");
        displayMessage(
          "The selected file is too large. Please select a file smaller than 5 MB.",
          true,
          `#${formId}`,
        );
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        console.error("File type is not allowed.");
        displayMessage(
          "Invalid file type. Please upload a JPEG, PNG, or GIF image.",
          true,
          `#${formId}`,
        );
        return;
      }

      console.log("File selected for upload:", file);

      try {
        item.icon = await uploadImage(file);
      } catch (error) {
        console.error("Error uploading image:", error);
        displayMessage(
          "Error uploading the image. Please try again.",
          true,
          `#${formId}`,
        );
        return;
      }
    }

    console.log("Prepared item for DB:", item);

    try {
      const hiddenIdInput = form.querySelector(
        'input[type="hidden"][name="id"]',
      ) as HTMLInputElement;
      const isUpdate = hiddenIdInput && hiddenIdInput.value.trim() !== "";
      console.log(isUpdate);
      // Ajouter l'élément dans la base de données
      await addItemToDatabase(dbName, storeName, keyPath, item, formData);
      form.reset();

      // Réinitialiser les champs cachés
      const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
      hiddenInputs.forEach((input) => {
        (input as HTMLInputElement).value = "";
      });

      // Fermer la modale
      const modalContent = document.getElementById("modal");
      if (modalContent) {
        modalContent.style.display = "none";
      }

      // Mettre à jour la liste des éléments (sans recharger la page)
      await updateListing(
        dbName,
        storeName,
        keyPath,
        requiredFields.concat(optionalFields),
      );
      console.log("Item added successfully:", item);

      if (isUpdate) {
        displayMessage("Item updated succesfully !", false, `#${listingId}`);
      } else {
        // Afficher un message de succès avant de mettre à jour la liste
        displayMessage("Item added successfully!", false, `#${listingId}`);
      }

      // Vibration pour confirmer
      if (navigator.vibrate) {
        navigator.vibrate(200);
      }
    } catch (error) {
      console.error("Error saving item:", error);
      displayMessage(
        "An error occurred while saving the item.",
        true,
        `#${formId}`,
      );
    }
  });
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
    listing.innerHTML = ""; // Réinitialise le contenu de la liste

    if (items.length === 0) {
      // Afficher un message si la liste est vide
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "Aucun élément à afficher.";
      emptyMessage.style.color = "gray";
      emptyMessage.style.textAlign = "center";
      listing.appendChild(emptyMessage);
      return; // Arrêter l'exécution si aucun élément à afficher
    }

    // Initialisation des variables pour le drag and drop
    let draggedItem: HTMLElement | null = null;

    for (const item of items) {
      const listItem = document.createElement("li");
      console.log("Processing item:", item);

      // Ajout des attributs pour le drag and drop
      listItem.draggable = true; // Rendre l'élément draggable
      listItem.setAttribute("data-id", item.id.toString()); // Stocker l'item sous forme de data

      // Gestion des événements drag and drop
      listItem.addEventListener("dragstart", () => {
        draggedItem = listItem;
        listItem.style.opacity = "0.5";
      });

      listItem.addEventListener("dragend", () => {
        draggedItem = null;
        listItem.style.opacity = "1";
      });

      listItem.addEventListener("dragover", (e) => {
        e.preventDefault(); // Permet de déposer l'élément
      });

      listItem.addEventListener("drop", (e) => {
        e.preventDefault();

        if (draggedItem && draggedItem !== listItem) {
          // Réorganise les éléments dans le DOM
          listing.insertBefore(draggedItem, listItem);
        }
      });

      // Ajout du contenu des items
      if (isTransaction(item)) {
        try {
          let categoryName = "";
          const categoryId = item.category ? Number(item.category) : null;

          if (categoryId !== null) {
            const category = await getItemById(
              "CategoryDatabase",
              "categories",
              "id",
              categoryId,
            );
            if (isCategory(category)) {
              categoryName = category.name;
            }
          } else {
            categoryName = "Non défini";
          }

          const transactionDiv = document.createElement("div");
          transactionDiv.classList.add("transaction");

          const headerDiv = document.createElement("div");
          headerDiv.classList.add("transaction_header");
          // Nom de la transaction
          const nameDiv = document.createElement("div");
          nameDiv.classList.add("name");
          nameDiv.textContent = `${item.name}`;
          headerDiv.appendChild(nameDiv);

          // Montant
          const amountDiv = document.createElement("div");
          amountDiv.classList.add("amount");
          amountDiv.textContent = `${item.amount} €`;
          headerDiv.appendChild(amountDiv);

          transactionDiv.appendChild(headerDiv);

          // Date
          const dateDiv = document.createElement("div");
          dateDiv.classList.add("date");
          dateDiv.textContent = item.date ? `${item.date}` : "";
          transactionDiv.appendChild(dateDiv);

          // Description
          if (item.description) {
            const descriptionDiv = document.createElement("div");
            descriptionDiv.classList.add("description");
            descriptionDiv.textContent = `${item.description}`;
            transactionDiv.appendChild(descriptionDiv);
          }

          // Conteneur des tags (type et catégorie)
          const tagDiv = document.createElement("div");
          tagDiv.classList.add("tags");

          // Tag type
          const typeDiv = document.createElement("div");
          typeDiv.classList.add("type", item.type.toLowerCase());
          typeDiv.textContent = `${item.type === "credit" ? "Crédit" : "Débit"}`;
          tagDiv.appendChild(typeDiv);

          // Tag catégorie
          const categoryDiv = document.createElement("div");
          categoryDiv.classList.add("category");
          categoryDiv.textContent = `${categoryName}`;
          tagDiv.appendChild(categoryDiv);

          transactionDiv.appendChild(tagDiv);

          // Ajouter l'ensemble au listItem
          listItem.appendChild(transactionDiv);
        } catch (error) {
          console.error("Error fetching category for transaction:", error);
        }
      } else if (isCategory(item)) {
        const categoryDiv = document.createElement("div");
        categoryDiv.classList.add("category-item");

        if (typeof item.icon === "string" && item.icon.trim() !== "") {
          // Si item.icon est une chaîne non vide, l'afficher directement
          const iconImg = document.createElement("img");
          iconImg.src = item.icon; // Utilise l'URL de l'icône dans le cas d'une chaîne
          iconImg.alt = `${item.name} icon`;
          iconImg.classList.add("item-icon");
          categoryDiv.appendChild(iconImg);
        } else {
          console.log("L'icône est vide ou invalide");
        }

        const nameSpan = document.createElement("p");
        nameSpan.classList.add("category-name");
        nameSpan.textContent = item.name;
        categoryDiv.appendChild(nameSpan);

        listItem.appendChild(categoryDiv);
      } else if (isBudget(item)) {
        try {
          let categoryName = "";
          let categoryId = null; // Déclarer `categoryId` dans la portée générale

          if (item.category) {
            categoryId = Number(item.category);
            const category = await getItemById(
              "CategoryDatabase",
              "categories",
              "id",
              categoryId,
            );
            if (isCategory(category)) {
              categoryName = category.name;
            }
          } else {
            categoryName = "Non défini";
          }

          // Calculer la somme des transactions pour la catégorie et le mois actuel
          const currentMonth = new Date().getMonth(); // Mois actuel (0-11)
          const transactions = await getAllItems(
            "TransactionDatabase",
            "transactions",
            "id",
          );

          // Vérifier si `categoryId` est défini avant de filtrer
          const filteredTransactions = transactions.filter((transaction) => {
            if (!isTransaction(transaction)) return false;
            if (!transaction.category || !transaction.date) return false;
            const transactionDate = new Date(transaction.date);
            return (
              categoryId !== null &&
              Number(transaction.category) === categoryId &&
              transactionDate.getMonth() === currentMonth
            );
          });

          const totalTransactionAmount = filteredTransactions.reduce(
            (sum, transaction) => {
              if (isTransaction(transaction)) {
                return sum + (transaction.amount || 0);
              }
              return sum;
            },
            0,
          );

          // Calculer le pourcentage de progression et vérifier si le budget est dépassé
          const isOverBudget = totalTransactionAmount > item.budget;
          const progressPercentage = Math.min(
            (totalTransactionAmount / item.budget) * 100,
            100,
          );
          const overBudgetAmount = totalTransactionAmount - item.budget;

          // Créer les éléments DOM
          const budgetDiv = document.createElement("div");
          budgetDiv.classList.add("budget");

          const categoryDiv = document.createElement("div");
          categoryDiv.classList.add("category");
          categoryDiv.textContent = `${categoryName}`;
          budgetDiv.appendChild(categoryDiv);

          const budgetAmountDiv = document.createElement("div");
          budgetAmountDiv.classList.add("budget-amount");
          budgetAmountDiv.textContent = `${totalTransactionAmount}/${item.budget}`;
          budgetDiv.appendChild(budgetAmountDiv);

          if (isOverBudget) {
            const overBudgetDiv = document.createElement("div");
            overBudgetDiv.classList.add("over-budget");
            overBudgetDiv.textContent = `Over Budget by: ${overBudgetAmount.toFixed(2)}`;
            budgetDiv.appendChild(overBudgetDiv);
          }

          // Ajouter la barre de progression
          const progressContainer = document.createElement("div");
          progressContainer.classList.add("progress-container");

          const progressBar = document.createElement("div");
          progressBar.classList.add("progress-bar");
          progressBar.style.width = `${progressPercentage}%`;

          // Changer la couleur si le budget est dépassé
          if (isOverBudget) {
            progressBar.style.backgroundColor = "#ff4d4d"; // Rouge
          }

          const progressLabel = document.createElement("span");
          progressLabel.classList.add("progress-label");
          progressLabel.textContent = isOverBudget
            ? `Over Budget (${progressPercentage.toFixed(1)}%)`
            : `${progressPercentage.toFixed(1)}%`;

          progressContainer.appendChild(progressBar);
          progressContainer.appendChild(progressLabel);
          budgetDiv.appendChild(progressContainer);

          const alertDiv = document.createElement("div");
          alertDiv.classList.add("alert");
          alertDiv.textContent = item.alert ? "Alert enabled" : "";
          budgetDiv.appendChild(alertDiv);

          listItem.appendChild(budgetDiv);
        } catch (error) {
          console.error("Error fetching category for budget:", error);
        }
      }

      // Ajout des boutons d'édition et de suppression
      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("action");
      const editButton = createEditButton(item, storeName);
      const copyButton = createCopyButton(item, storeName);
      const deleteButton = createDeleteButton(
        item,
        dbName,
        storeName,
        keyPath,
        fields,
      );

      buttonContainer.appendChild(editButton);
      buttonContainer.appendChild(copyButton);
      buttonContainer.appendChild(deleteButton);
      listItem.appendChild(buttonContainer);
      listing.appendChild(listItem);
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
  editButton.classList.add("action-button", "edit-button");
  editButton.title = "Modifier"; // Ajout d'un titre pour l'accessibilité

  const editIcon = document.createElement("i");
  editIcon.classList.add("fas", "fa-edit", "action-icon", "edit-icon");
  editIcon.setAttribute("aria-hidden", "true"); // Masquer pour les lecteurs d'écran

  editButton.appendChild(editIcon);

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
  deleteButton.classList.add("action-button", "delete-button");
  deleteButton.title = "Supprimer"; // Ajout d'un titre pour l'accessibilité

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fas", "fa-trash", "action-icon", "delete-icon");
  deleteIcon.setAttribute("aria-hidden", "true"); // Masquer pour les lecteurs d'écran

  deleteButton.appendChild(deleteIcon);

  deleteButton.addEventListener("click", () => {
    deleteItem(dbName, storeName, item.id, fields);
    updateListing(dbName, storeName, keyPath, fields);
  });

  return deleteButton;
}

function createCopyButton(
  item: Category | Transaction | Budget,
  storeName: string,
): HTMLButtonElement {
  const copyButton = document.createElement("button");
  copyButton.classList.add("action-button", "copy-button");
  copyButton.title = "Copy";

  const copyIcon = document.createElement("i");
  copyIcon.classList.add("fas", "fa-copy", "action-icon", "copy-icon");
  copyIcon.setAttribute("aria-hidden", "true");

  copyButton.appendChild(copyIcon);

  copyButton.addEventListener("click", async () => {
    try {
      let itemToCopy: any = { ...item };

      // Do not copy img path, find workaround later ?
      if ("icon" in itemToCopy) {
        delete itemToCopy.icon;
      }

      const itemData = JSON.stringify(itemToCopy, null, 2);

      await navigator.clipboard.writeText(itemData);
      console.log("Copied item to clipboard:", itemData);

      setTimeout(() => {
        copyButton.textContent = "";
        copyButton.appendChild(copyIcon);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy item:", err);
    }
  });

  return copyButton;
}

function fillFormWithItem(
  item: Category | Transaction | Budget,
  storeName: string,
) {
  const form = document.getElementById(`${storeName}Form`) as HTMLFormElement;
  if (!form) {
    console.error(`Formulaire introuvable pour ${storeName}`);
    return;
  }

  const inputElements = form.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input, select, textarea");
  const iconPreview = form.querySelector<HTMLImageElement>("#iconPreview");
  const fileInput = form.querySelector<HTMLInputElement>("#categoryIcon");
  const deleteButton =
    form.querySelector<HTMLButtonElement>("#deleteIconButton");
  let existingImageInput = form.querySelector<HTMLInputElement>(
    'input[name="existingIcon"]',
  );

  // Créer un champ caché pour conserver l'URL de l'image actuelle si nécessaire
  if (storeName === "categories" && !existingImageInput) {
    existingImageInput = document.createElement("input");
    existingImageInput.type = "hidden";
    existingImageInput.name = "existingIcon";
    form.appendChild(existingImageInput);
  }

  // Remplir les champs du formulaire
  inputElements.forEach((input) => {
    const fieldName = input.name;
    if (fieldName && fieldName in item) {
      if (input instanceof HTMLInputElement && input.type === "file") {
        input.style.display = "none";
      } else {
        input.value = String((item as any)[fieldName]);
      }
    }
  });

  // Gestion de l'aperçu de l'image
  if (
    existingImageInput &&
    iconPreview &&
    "icon" in item &&
    typeof item.icon === "string"
  ) {
    if (item.icon) {
      iconPreview.src = item.icon;
      iconPreview.style.display = "block";
      existingImageInput.value = item.icon;
    } else {
      iconPreview.style.display = "none";
      existingImageInput.value = "";
    }
  }

  // Gestion du bouton "Supprimer l'image"
  if (
    deleteButton &&
    existingImageInput &&
    "icon" in item &&
    typeof item.icon === "string"
  ) {
    if (item.icon) {
      deleteButton.style.display = "inline-block";
      deleteButton.onclick = () => {
        if (iconPreview) iconPreview.style.display = "none";
        if (fileInput) fileInput.style.display = "block";
        deleteButton.style.display = "none";
        existingImageInput!.value = "";
      };
    } else {
      deleteButton.style.display = "none";
    }
  } else {
    if (fileInput) fileInput.style.display = "block";
  }

  // Gérer l'événement "changement d'image"
  if (fileInput && existingImageInput && iconPreview) {
    fileInput.removeEventListener("change", handleFileChange);
    fileInput.addEventListener("change", handleFileChange);

    function handleFileChange(this: HTMLInputElement, event: Event): void {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (iconPreview) {
            iconPreview.src = reader.result as string;
            iconPreview.style.display = "block";
          }
          if (deleteButton) deleteButton.style.display = "inline-block";
          if (existingImageInput) existingImageInput.value = "";
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Mettre à jour le texte du bouton de soumission
  const submitButton = form.querySelector<HTMLInputElement>(
    'input[type="submit"]',
  );
  if (submitButton) {
    submitButton.value = "Mettre à jour";
  }
}
