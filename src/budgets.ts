import { Budget } from "./budgets.js";
import { handleFormSubmit } from "./utils/form.js";
import { initializeBudgetTracking } from "./utils/budgetManager.js";

export interface Budget {
  id: number;
  category: number;
  budget: number;
  alert?: boolean;
}

export function isBudget(item: any): item is Budget {
  return (item as Budget).budget !== undefined;
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize form handling
  handleFormSubmit(
    "budgetsForm",
    "budgetsListing",
    "BudgetDatabase",
    "budgets",
    "id",
    ["category", "budget"],
    ["alert"],
  );

  // Initialize budget tracking
  initializeBudgetTracking();

  // Listen for form submission to update budget cards
  const form = document.getElementById("budgetsForm");
  form?.addEventListener("submit", () => {
    setTimeout(initializeBudgetTracking, 100); // Small delay to ensure DB is updated
  });
});
