import { getAllItems, getItemById, deleteItem } from "../../core/database/dbUtils.js";
import { Category, isCategory, Budget, isBudget, Transaction, isTransaction } from "../../core/database/types.js";
import { getCurrentUser } from "../../core/auth/handleUser.js";
import { fillFormWithItem } from "./form.js";

export async function updateMonthLabel(currentDate: Date) {
  const currentMonthLabel = document.getElementById("currentMonthLabel") as HTMLSpanElement | null;
  const monthInput = document.getElementById("month") as HTMLInputElement | null;
  const yearInput = document.getElementById("year") as HTMLInputElement | null;

  if (!currentMonthLabel || !monthInput || !yearInput) {
    console.error("Required DOM elements are missing.");
    return;
  }  

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre",
  ];

  const month = currentDate.getMonth();
  const year = currentDate.getFullYear();

  if(!currentMonthLabel || !monthInput || !yearInput) {
    console.error("Required DOM elements are missing.");
    return;
  }

  currentMonthLabel.textContent = `${monthNames[month]} ${year}`;
  monthInput.value = (month + 1).toString(); // Mois en base 1
  yearInput.value = year.toString();

  try {
    await updateListingForMonth(month + 1, year); // Adapter la base 1 pour le mois
  } catch (error) {
    console.error("Error updating the listing for the month:", error);
  }
}

export async function updateListingForMonth(
  selectedMonth: number,
  selectedYear: number,
) {
  try {
    console.log(`Updating listing for ${selectedMonth}/${selectedYear}`);
    const items = await getAllItems("budgets");

    const filteredItems = items.filter((item) => {
      if (isBudget(item)) {
        return (
          Number(item.month) === selectedMonth &&
          Number(item.year) === selectedYear
        );
      }
      return false;
    });

    console.log("Filtered items for selected month:", filteredItems);
    await displayItems(filteredItems, "budgets", []);
  } catch (error) {
    console.error("Error updating listing:", error);
  }
}

  

 // Afficher les éléments dans le listage
export async function displayItems(
  items: (Category | Transaction | Budget)[],
  storeName: string,
  fields: string[],
) {
  const listing = document.getElementById(`${storeName}Listing`);
  console.log("this log", storeName);
  if (listing) {
    listing.innerHTML = ""; // Réinitialise le contenu de la liste

    let user = await getCurrentUser();
    const userItems = items.filter((item) => item.userId === user?.id);
    
    console.log("Filtered user items:", userItems);

    if (storeName === "transactions") {
      userItems.sort((a, b) => {
        if (isTransaction(a) && isTransaction(b) && a.date && b.date) {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        }
        return 0;
      });
    }

    if (userItems.length === 0) {
      // Afficher un message si la liste est vide
      const emptySection = document.createElement("section");
      emptySection.className = "empty-data";

      const emptyContainer = document.createElement("div");
      emptyContainer.className = "empty-info";

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

      const emptyLowercase = document.createElement("p");
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
      emptySection.appendChild(emptyContainer);
      emptyContainer.appendChild(emptySubtitle);
      emptyContainer.appendChild(emptyLowercase);


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
            const category = await getItemById("categories", categoryId);
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
      }
      else if (isBudget(item)) {
        try {
          let categoryName = "";
          let categoryIcon = "";
          let categoryId = null;

          // Vérifier si une catégorie est liée au budget
          if (item.category) {
            categoryId = Number(item.category);
            const category = await getItemById(
              "categories",
              categoryId,
            );
            if (isCategory(category)) {
              categoryName = category.name;
              categoryIcon = category.icon || "";
            }
          }

          // Récupérer toutes les transactions de la base de données
          const transactions = await getAllItems(
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
              transaction.type === "debit" &&
              transaction.userId === user?.id && 
              transactionDate.getMonth() + 1 === item.month &&
              transactionDate.getFullYear() === item.year
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
          let remainingBudget = item.budget - totalTransactionAmount;
          if (remainingBudget < 0) {
            remainingBudget = 0;
          }

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
      }
      else if (isCategory(item)) {
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
      const deleteButton = createDeleteButton(item, storeName, fields);

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
  storeName: string,
  fields: string[],
) {
  try {
    console.log(`Updating listing for ${storeName}`);
    const items = await getAllItems(storeName);
    console.log("Items retrieved:", items); // Ajouter un log pour voir ce qui est récupéré

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // Mois actuel (0-11)
    const currentYear = currentDate.getFullYear(); // Année actuelle

    // Filtrer les éléments pour ne garder que ceux du mois et de l'année actuels et de type "budget"
    let filteredItems = items;
    if (storeName === "transactions") {
      const transactionType = document.getElementById("transactionType") as HTMLSelectElement;
      const transactionDate = document.getElementById("transactionDate") as HTMLInputElement;
      const transactionCategory = document.getElementById("transactionCategory") as HTMLSelectElement;
  
      const selectedType = transactionType.value;
      const selectedDate = transactionDate.value;
      const selectedCategory = transactionCategory.value;
  
      filteredItems = items.filter(item => {
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
              let validatedCategory: number | null = selectedCategory ? Number(selectedCategory) : null;

              if (
                  validatedCategory !== null &&
                  Number(item.category) !== validatedCategory
              ) {
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

    await displayItems(filteredItems, storeName, fields);
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
    deleteItem(storeName, item.id);
    updateListing(storeName, fields);
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