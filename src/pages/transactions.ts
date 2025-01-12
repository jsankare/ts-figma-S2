import { handleFormSubmit, updateListing } from "../shared/components/form.js";
import { getAllItems } from "../core/database/openDatabase.js";

export interface Transaction {
  id: number;
  type: string;
  name: string;
  transaction: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  userId: number;
}

export function isTransaction(item: any): item is Transaction {
  return (item as Transaction).amount !== undefined;
}

document.addEventListener("DOMContentLoaded", () => {
  handleFormSubmit(
    "transactionsForm",
    "transactionsListing",
    "TransactionDatabase",
    "transactions",
    ["type", "name", "amount", "date"],
    ["category"],
  );
  updateListing("TransactionDatabase", "transactions", [
    "type",
    "name",
    "amount",
    "category",
    "date",
  ]);
});

document
  .getElementById("filterTransactions")
  ?.addEventListener("click", (event) => {
    event.preventDefault();

    console.log("Filtering transactions");
    updateListing("TransactionDatabase", "transactions", [
      "type",
      "name",
      "amount",
      "category",
      "date",
    ]);
  });

async function populateTransactionCategorySelect() {
  try {
    const categories = await getAllItems("CategoryDatabase", "categories");
    const transactionCategorySelect = document.getElementById(
      "transactionCategory",
    ) as HTMLSelectElement;

    if (!transactionCategorySelect) {
      console.error("#transactionCategorySelect not found");
      return;
    }

    const optionsHTML = categories
      .map((category: Category) =>
        category.id && category.name
          ? `<option value="${category.id}">${category.name}</option>`
          : "",
      )
      .join("");

    transactionCategorySelect.innerHTML = `
      <option value="" selected disabled>Sélectionnez une catégorie</option>
                        <option value="">Toutes</option>
      ${optionsHTML}
    `;
    console.log("Transaction category select populated successfully.");
  } catch (error) {
    console.error("Failed to populate transaction categories:", error);
  }
}

populateTransactionCategorySelect();
