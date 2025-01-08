import {
  handleFormSubmit,
  updateListing,
  displayItems,
} from "../shared/components/form.js";
import { getAllItems } from "../core/database/openDatabase.js";

export interface Budget {
  id: number;
  category: string;
  budget: number;
  alert?: boolean;
  month: number;
  year: number;
  userId: number;
}

export function isBudget(item: any): item is Budget {
  return (item as Budget).budget !== undefined;
}

document.addEventListener("DOMContentLoaded", () => {
  const prevMonthButton = document.getElementById("prevMonth");
  const nextMonthButton = document.getElementById("nextMonth");
  const currentMonthLabel = document.getElementById("currentMonthLabel");
  const monthInput = document.getElementById("month") as HTMLInputElement;
  const yearInput = document.getElementById("year") as HTMLInputElement;

  let currentDate = new Date();

  async function updateMonthLabel() {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const monthNames = [
      "Janvier",
      "Février",
      "Mars",
      "Avril",
      "Mai",
      "Juin",
      "Juillet",
      "Août",
      "Septembre",
      "Octobre",
      "Novembre",
      "Décembre",
    ];
    if (currentMonthLabel && monthInput && yearInput) {
      currentMonthLabel.textContent = `${monthNames[month]} ${year}`;
      monthInput.value = month.toString();
      yearInput.value = year.toString();
    }

    await updateListingForMonth(month, year);
  }

  if (prevMonthButton) {
    prevMonthButton.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1);
      updateMonthLabel();
    });
  }

  if (nextMonthButton) {
    nextMonthButton.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1);
      updateMonthLabel();
    });
  }

  updateMonthLabel();

  handleFormSubmit(
    "budgetsForm",
    "budgetsListing",
    "BudgetDatabase",
    "budgets",
    ["category", "budget", "year", "month"],
    ["alert"],
  );
});

async function updateListingForMonth(
  selectedMonth: number,
  selectedYear: number,
) {
  try {
    console.log(`Updating listing for ${selectedMonth}/${selectedYear}`);
    const items = await getAllItems("BudgetDatabase", "budgets");

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
    await displayItems(filteredItems, "budgets", "BudgetDatabase", []);
  } catch (error) {
    console.error("Error updating listing:", error);
  }
}
