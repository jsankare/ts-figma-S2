import { handleFormSubmit } from "../shared/components/form.js";
import { updateMonthLabel } from "../shared/components/listing.js";

document.addEventListener("DOMContentLoaded", () => {

  const prevMonthButton = document.getElementById("prevMonth") as HTMLButtonElement | null;
  const nextMonthButton = document.getElementById("nextMonth") as HTMLButtonElement | null;
  
  let currentDate = new Date();

  prevMonthButton?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateMonthLabel(currentDate);
  });

  nextMonthButton?.addEventListener("click", () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    updateMonthLabel(currentDate);
  });

  // Initial setup
  updateMonthLabel(currentDate);

  handleFormSubmit(
    "budgetsForm",
    "budgetsListing",
    "budgets",
    ["name", "category", "budget", "year", "month"],
    ["alert"],
  );
});