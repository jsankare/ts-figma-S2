import {
  addItemToDatabase,
  deleteItem,
  getAllItems,
  getItemById,
  openDatabase,
} from "../../core/database/openDatabase.js";
import { toastAlert } from "./alert.js";
import { uploadImage } from "../../core/database/uploadImage.js";
import { isBudget } from "../../pages/budgets.js";
import { Budget } from "../../core/database/types.js";
import { Category, isCategory } from "../../pages/categories.js";
import { isTransaction, Transaction } from "../../pages/transactions.js";
import { getCurrentUser } from "../../core/auth/getCurrentUser.js";

export async function getUser() {
  const db = await openDatabase("UserDatabase", "users");
  const userEmail = localStorage.getItem("userMail");

  if (!userEmail) {
    console.error("Aucun email trouvé dans localStorage.");
    return null;
  }

  try {
    // Attendez la résolution de la promesse retournée par `getCurrentUser`
    const token = await getCurrentUser(db, userEmail);
    console.log(token);

    // Vérifiez si l'objet `token` existe et contient un `id`
    if (token && token.id) {
      const userId = token.id;
      console.log(userId);
      return userId;
    } else {
      console.error("Le token ou l'ID utilisateur est introuvable.");
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    return null;
  }
}

// Gérer la soumission du formulaire
export async function handleFormSubmit(
  formId: string,
  listingId: string,
  dbName: string,
  storeName: string,
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

    let userId = await getUser();
    item.userId = userId;

    // Gérer la case à cocher d'alerte
    const alertCheckbox = form.querySelector(
      'input[name="alert"]',
    ) as HTMLInputElement | null;
    item.alert = alertCheckbox?.checked || false;

    // Valider les champs obligatoires
    for (const field of requiredFields) {
      if (!item[field]) {
        console.error(`Required field missing: ${field}`);
        toastAlert("error", `Field "${field}" is required.`);
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
    const svgIconInput = form.querySelector("#iconPreview") as HTMLInputElement;
    if (svgIconInput && svgIconInput.src) {
      console.log(svgIconInput);
      console.log("icon chosen");
      console.log(svgIconInput.src);
      try {
        item.icon = svgIconInput.src;
      } catch (error) {
        console.error("Error uploading image:", error);
        toastAlert("error", "Error uploading the image. Please try again.");
        return;
      }
    } else {
      if (fileInput && fileInput.files?.length) {
        const file = fileInput.files[0];
        const maxSize = 5 * 1024 * 1024; // Taille maximale en octets (ex. 5 Mo)
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"]; // Types MIME autorisés

        // Vérification de la taille et du type de fichier
        if (file.size > maxSize) {
          console.error("File is too large.");
          toastAlert(
            "error",
            "The selected file is too large. Please select a file smaller than 5 MB.",
          );
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          toastAlert(
            "error",
            "Invalid file type. Please upload a JPEG, PNG, or GIF image.",
          );
          return;
        }

        console.log("File selected for upload:", file);

        try {
          item.icon = await uploadImage(file);
        } catch (error) {
          toastAlert("error", "Error uploading the image. Please try again.");
          return;
        }
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
      await addItemToDatabase(dbName, storeName, item, formData);
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
        requiredFields.concat(optionalFields),
      );

      if (isUpdate) {
        toastAlert("info", `${storeName} updated successfully !`);
      } else {
        toastAlert("success", `${storeName} added successfully!`);
      }
    } catch (error) {
      toastAlert("error", "An error occurred while saving the item.");
    }
  });
}

// Afficher les éléments dans le listage
export async function displayItems(
  items: (Category | Transaction | Budget)[],
  storeName: string,
  dbName: string,
  fields: string[],
) {
  const listing = document.getElementById(`${storeName}Listing`);
  console.log("this log", storeName);
  if (listing) {
    listing.innerHTML = ""; // Réinitialise le contenu de la liste

    let userId = await getUser();
    console.log(userId);
    const userItems = items.filter((item) => item.userId === userId);
    console.log("Filtered user items:", userItems);

    if (userItems.length === 0) {
      // Afficher un message si la liste est vide
      const emptySection = document.createElement("section");
      emptySection.className = "empty-data";

      const emptyIcon = document.createElement("div");
      emptyIcon.className = "empty-icon";

      const svgElement = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg",
      );
      svgElement.setAttribute("xmlns", "http://www.w3.org/2000/svg");
      svgElement.setAttribute("viewBox", "0 0 576 512");
      svgElement.innerHTML = `
        <path d="M88.7 223.8L0 375.8 0 96C0 60.7 28.7 32 64 32l117.5 0c17 0 33.3 6.7 45.3 18.7l26.5 26.5c12 12 28.3 18.7 45.3 18.7L416 96c35.3 0 64 28.7 64 64l0 32-336 0c-22.8 0-43.8 12.1-55.3 31.8zm27.6 16.1C122.1 230 132.6 224 144 224l400 0c11.5 0 22 6.1 27.7 16.1s5.7 22.2-.1 32.1l-112 192C453.9 474 443.4 480 432 480L32 480c-11.5 0-22-6.1-27.7-16.1s-5.7-22.2 .1-32.1l112-192z"/>
      `;

      emptyIcon.appendChild(svgElement);

      const emptySubtitle = document.createElement("h2");
      emptySubtitle.className = "empty-subtitle";
      if (storeName === "budgets") {
        emptySubtitle.textContent = "Aucun budget disponible";
      } else if (storeName === "categories") {
        emptySubtitle.textContent = "Aucune catégorie disponible";
      } else {
        emptySubtitle.textContent = "Aucune transaction disponible";
      }

      const emptyLowercase = document.createElement("h3");
      emptyLowercase.className = "empty-lowercase";
      if (storeName === "budgets") {
        emptyLowercase.textContent = `Vous n'avez pas encore enregistré de budget.
        Pour commencer, ajoutez un budget et suivez vos finances en toute simplicité !`;
      } else if (storeName === "categories") {
        emptyLowercase.textContent = `Vous n'avez pas encore enregistré de catégorie.
        Pour commencer, ajoutez votre première catégorie et organisez vos transactions !`;
      } else {
        emptyLowercase.textContent = `Vous n'avez pas encore enregistré de transaction.
        Pour commencer, ajoutez votre première transaction et suivez vos finances en toute simplicité !`;
      }

      emptySection.appendChild(emptyIcon);
      emptySection.appendChild(emptySubtitle);
      emptySection.appendChild(emptyLowercase);

      listing.appendChild(emptySection);

      return; // Arrêter l'exécution si aucun élément à afficher
    }

    // Initialisation des variables pour le drag and drop
    let draggedItem: HTMLElement | null = null;

    for (const item of userItems) {
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
          let categoryIcon = "";

          const categoryId = item.category ? Number(item.category) : null;

          if (categoryId !== null) {
            const category = await getItemById(
              "CategoryDatabase",
              "categories",
              categoryId,
            );
            if (isCategory(category)) {
              categoryName = category.name;
              categoryIcon = category.icon || "";
            }
          }

          // En-tête de la transaction
          const headerDiv = document.createElement("div");
          headerDiv.classList.add("transaction_header");

          // Icône de la catégorie
          const iconDiv = document.createElement("div");
          iconDiv.classList.add("icon");
          if (categoryIcon) {
            const iconImg = document.createElement("img");
            iconImg.src = categoryIcon;
            iconImg.alt = categoryName;
            iconDiv.appendChild(iconImg);
          }
          headerDiv.appendChild(iconDiv);

          // Nom de la transaction
          const nameDiv = document.createElement("p");
          nameDiv.classList.add("name");
          nameDiv.textContent = item.name || "Transaction sans nom";
          headerDiv.appendChild(nameDiv);

          listItem.appendChild(headerDiv);

          // Date de la transaction (formatée)
          const dateDiv = document.createElement("p");
          dateDiv.classList.add("date");

          if (item.date) {
            const date = new Date(item.date);
            const options: Intl.DateTimeFormatOptions = {
              day: "numeric",
              month: "long",
              year: "numeric",
            };
            dateDiv.textContent = date.toLocaleDateString("fr-FR", options); // Format français
          } else {
            dateDiv.textContent = "Date inconnue";
          }
          listItem.appendChild(dateDiv);

          // Tags (type et catégorie)
          const tagDiv = document.createElement("div");
          tagDiv.classList.add("tags");

          // Tag catégorie
          const categoryDiv = document.createElement("p");
          categoryDiv.classList.add("category");
          categoryDiv.textContent = categoryName;
          tagDiv.appendChild(categoryDiv);

          listItem.appendChild(tagDiv);

          // Montant de la transaction
          const amountDiv = document.createElement("h3");
          amountDiv.classList.add("amount");

          // Vérifier le type de transaction (débit ou crédit)
          const amount = item.amount || 0;
          const isCredit = item.type === "credit"; // Ex.: "credit" pour revenu, "debit" pour dépense
          amountDiv.textContent = `${isCredit ? "+" : "-"}${Math.abs(amount)} €`;
          amountDiv.classList.add(isCredit ? "credit" : "debit"); // Ajoute une classe spécifique

          listItem.appendChild(amountDiv);
        } catch (error) {
          console.error("Error fetching category for transaction:", error);
        }
      } else if (isBudget(item)) {
        try {
          let categoryName = "";
          let categoryIcon = "";
          let categoryId = null;

          // Vérifier si une catégorie est liée au budget
          if (item.category) {
            categoryId = Number(item.category);
            const category = await getItemById(
              "CategoryDatabase",
              "categories",
              categoryId,
            );
            if (isCategory(category)) {
              categoryName = category.name;
              categoryIcon = category.icon || "";
            }
          }

          // Récupérer le mois actuel
          const currentMonth = new Date().getMonth(); // Mois actuel (0-11)
          const currentYear = new Date().getFullYear(); // Année actuelle

          // Récupérer toutes les transactions de la base de données
          const transactions = await getAllItems(
            "TransactionDatabase",
            "transactions",
          );

          // Filtrer les transactions pour la catégorie et le mois/année en cours
          const filteredTransactions = transactions.filter((transaction) => {
            if (!isTransaction(transaction)) return false;
            if (!transaction.category || !transaction.date) return false;
            const transactionDate = new Date(transaction.date);
            return (
              categoryId !== null &&
              Number(transaction.category) === categoryId &&
              transactionDate.getMonth() === currentMonth &&
              transactionDate.getFullYear() === currentYear
            );
          });

          // Calculer le total des transactions pour la catégorie et le mois
          const totalTransactionAmount = filteredTransactions.reduce(
            (sum, transaction) => {
              if (isTransaction(transaction)) {
                return sum + (Number(transaction.amount) || 0);
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
          const remainingBudget = item.budget - totalTransactionAmount;

          // Créer l'élément DOM pour afficher le budget
          const categoryInfoDiv = document.createElement("div");
          categoryInfoDiv.classList.add("category-info");

          const iconDiv = document.createElement("div");
          iconDiv.classList.add("icon");
          if (categoryIcon) {
            const iconImg = document.createElement("img");
            iconImg.src = categoryIcon;
            iconImg.alt = categoryName;
            iconDiv.appendChild(iconImg);
          }
          categoryInfoDiv.appendChild(iconDiv);

          const budgetTitleDiv = document.createElement("p");
          budgetTitleDiv.classList.add("budget-title");
          budgetTitleDiv.textContent = item.name || "Budget sans nom";
          categoryInfoDiv.appendChild(budgetTitleDiv);

          listItem.appendChild(categoryInfoDiv);

          const progressSectionDiv = document.createElement("div");
          progressSectionDiv.classList.add("progress-section");

          const progressContainer = document.createElement("div");
          progressContainer.classList.add("progress-container");

          const progressBar = document.createElement("div");
          progressBar.classList.add("progress-bar");
          progressBar.style.width = `${progressPercentage}%`;
          if (isOverBudget) {
            progressBar.style.backgroundColor = "#E62E2E";
          }
          progressContainer.appendChild(progressBar);

          const progressDetails = document.createElement("div");
          progressDetails.classList.add("progress-details");
          progressDetails.innerHTML = `<span>${totalTransactionAmount}€ sur ${item.budget}€</span> <span>${progressPercentage.toFixed(1)}%</span>`;

          progressSectionDiv.appendChild(progressContainer);
          progressSectionDiv.appendChild(progressDetails);

          listItem.appendChild(progressSectionDiv);

          const remainingBudgetDiv = document.createElement("h3");
          remainingBudgetDiv.classList.add("remaining-budget");
          remainingBudgetDiv.textContent = `${remainingBudget} €`;
          listItem.appendChild(remainingBudgetDiv);

          const categoryDiv = document.createElement("div");
          categoryDiv.classList.add("category");
          categoryDiv.textContent = `${categoryName}`;
          listItem.appendChild(categoryDiv);
        } catch (error) {
          console.error("Error fetching category for budget:", error);
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
      }

      // Ajout des boutons d'édition et de suppression
      const buttonContainer = document.createElement("div");
      buttonContainer.classList.add("action");
      const editButton = createEditButton(item, storeName);
      const copyButton = createCopyButton(item, storeName);
      const deleteButton = createDeleteButton(item, dbName, storeName, fields);

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
  fields: string[],
) {
  try {
    console.log(`Updating listing for ${storeName}`);
    const items = await getAllItems(dbName, storeName);
    console.log("Items retrieved:", items); // Ajouter un log pour voir ce qui est récupéré

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Mois actuel (0-11)
    const currentYear = currentDate.getFullYear(); // Année actuelle

    // Filtrer les éléments pour ne garder que ceux du mois et de l'année actuels et de type "budget"
    let filteredItems = items;
    if (storeName === "budgets") {
      filteredItems = items.filter((item) => {
        if (isBudget(item)) {
          return (
            Number(item.month) === currentMonth &&
            Number(item.year) === currentYear
          );
        }
        return false;
      });
    } else if (storeName === "transactions") {
      const transactionType = document.getElementById(
        "transactionType",
      ) as HTMLSelectElement;
      const transactionDate = document.getElementById(
        "transactionDate",
      ) as HTMLInputElement;
      const transactionCategory = document.getElementById(
        "transactionCategory",
      ) as HTMLSelectElement;

      const selectedType = transactionType.value;
      const selectedDate = transactionDate.value;
      const selectedCategory = transactionCategory.value;

      filteredItems = items.filter((item) => {
        if (isTransaction(item)) {
          let isValid = true;

          // Filtrer par type
          if (selectedType && item.type !== selectedType) {
            isValid = false;
          }

          // Filtrer par date
          if (selectedDate && item.date !== selectedDate) {
            isValid = false;
          }

          // Filtrer par catégorie
          console.log("Item cat:", item.category);
          console.log("Selected cat:", Number(selectedCategory));
          console.log(
            "is not equal",
            item.category !== Number(selectedCategory),
          );
          if (selectedCategory && item.category !== Number(selectedCategory)) {
            isValid = false;
          }

          return isValid;
        }
        return true;
      });
    }

    console.log("Filtered Items:", filteredItems); // Affiche les éléments filtrés

    if (filteredItems.length === 0) {
      console.log("No items to display for the current month/year.");
    }

    await displayItems(filteredItems, storeName, dbName, fields);
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

  const editIcon = document.createElement("img");
  editIcon.classList.add("action-icon", "edit-icon");
  editIcon.src = "./assets/edit.svg";

  editButton.appendChild(editIcon);

  editButton.addEventListener("click", () => {
    const modalContent = document.getElementById("modal");
    if (modalContent) {
      modalContent.style.display = "flex";
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
  fields: string[],
): HTMLButtonElement {
  const deleteButton = document.createElement("button");
  deleteButton.classList.add("action-button", "delete-button");
  deleteButton.title = "Supprimer"; // Ajout d'un titre pour l'accessibilité

  const deleteIcon = document.createElement("img");
  deleteIcon.classList.add("action-icon", "delete-icon");
  deleteIcon.src = "./assets/trash.svg";

  deleteButton.appendChild(deleteIcon);

  deleteButton.addEventListener("click", () => {
    deleteItem(dbName, storeName, item.id, fields);
    updateListing(dbName, storeName, fields);
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

  const copyIcon = document.createElement("img");
  copyIcon.classList.add("action-icon", "copy-icon");
  copyIcon.src = "./assets/clipboard.svg";

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
