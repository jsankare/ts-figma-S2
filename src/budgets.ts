import { handleFormSubmit, updateListing } from "./utils/form.js";

export interface Budget {
  id: number;
  category: string;
  budget: number;
  alert?: boolean;
}

export function isBudget(item: any): item is Budget {
  return (item as Budget).budget !== undefined;
}

document.addEventListener("DOMContentLoaded", () => {
  handleFormSubmit(
    "budgetsForm",
    "budgetsListing",
    "BudgetDatabase",
    "budgets",
    "id",
    ["category", "budget"],
    ["alert"],
  );
  updateListing("BudgetDatabase", "budgets", "id", [
    "category",
    "budget",
    "alert",
  ]);
});
