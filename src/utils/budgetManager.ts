import { Budget } from "../budgets.js";
import { Category } from "../categories.js";
import { Transaction } from "../transactions.js";
import { getAllItems, getItemById } from "./openDatabase.js";
import { createBudgetCard } from "./budgetCard.js";

export async function initializeBudgetTracking() {
  const budgetsContainer = document.querySelector(".budgets-container");
  const emptyState = document.querySelector(".empty-data");

  if (!budgetsContainer) return;

  // Clear existing content
  budgetsContainer.innerHTML = "";

  try {
    const budgets = (await getAllItems(
      "BudgetDatabase",
      "budgets",
      "id",
    )) as Budget[];
    const transactions = (await getAllItems(
      "TransactionDatabase",
      "transactions",
      "id",
    )) as Transaction[];

    if (budgets.length === 0) {
      if (emptyState) emptyState.style.display = "flex";
      return;
    }

    if (emptyState) emptyState.style.display = "none";

    // Update budget info section
    await updateBudgetInfo(budgets, transactions);

    // Create and append budget cards
    for (const budget of budgets) {
      try {
        const category = (await getItemById(
          "CategoryDatabase",
          "categories",
          "id",
          budget.category,
        )) as Category;
        const spent = calculateSpentAmount(transactions, budget.category);

        const budgetCard = createBudgetCard({
          budget,
          category,
          spent,
        });

        // Add event listeners
        const editBtn = budgetCard.querySelector(".edit-budget");
        const deleteBtn = budgetCard.querySelector(".delete-budget");

        editBtn?.addEventListener("click", () => handleEditBudget(budget));
        deleteBtn?.addEventListener("click", () => handleDeleteBudget(budget));

        budgetsContainer.appendChild(budgetCard);
      } catch (error) {
        console.error(`Error creating budget card:`, error);
      }
    }
  } catch (error) {
    console.error("Error initializing budget tracking:", error);
  }
}

function calculateSpentAmount(
  transactions: Transaction[],
  categoryId: number,
): number {
  return transactions
    .filter((t) => t.category === categoryId)
    .reduce(
      (total, t) => total + (t.type === "debit" ? Number(t.amount) : 0),
      0,
    );
}

async function updateBudgetInfo(
  budgets: Budget[],
  transactions: Transaction[],
) {
  const totalBudget = budgets.reduce(
    (sum, budget) => sum + Number(budget.budget),
    0,
  );
  const totalSpent = transactions
    .filter((t) => t.type === "debit")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const remaining = totalBudget - totalSpent;

  const budgetInfos = document.querySelectorAll(".budget-info-title");
  if (budgetInfos.length >= 3) {
    budgetInfos[0].innerHTML = `${totalBudget}<span class="budget-info-devise">€</span>`;
    budgetInfos[1].innerHTML = `${totalSpent}<span class="budget-info-devise">€</span>`;
    budgetInfos[2].innerHTML = `${remaining}<span class="budget-info-devise">€</span>`;
  }
}

function handleEditBudget(budget: Budget) {
  const modal = document.getElementById("modal");
  if (modal) {
    modal.style.display = "block";
    fillBudgetForm(budget);
  }
}

function fillBudgetForm(budget: Budget) {
  const form = document.getElementById("budgetsForm") as HTMLFormElement;
  if (!form) return;

  const inputs = form.querySelectorAll("input, select");
  inputs.forEach((input) => {
    const field = input.getAttribute("name");
    if (field && budget[field] !== undefined) {
      if (input instanceof HTMLInputElement && input.type === "checkbox") {
        input.checked = budget[field];
      } else {
        (input as HTMLInputElement | HTMLSelectElement).value = budget[field];
      }
    }
  });
}

async function handleDeleteBudget(budget: Budget) {
  if (!confirm("Are you sure you want to delete this budget?")) return;

  try {
    const transaction = (
      await openDatabase("BudgetDatabase", "budgets", "id")
    ).transaction("budgets", "readwrite");
    const store = transaction.objectStore("budgets");
    await store.delete(budget.id);

    initializeBudgetTracking();
  } catch (error) {
    console.error("Error deleting budget:", error);
  }
}

function openDatabase(
  dbName: string,
  storeName: string,
  keyPath: string,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath });
      }
    };
  });
}
