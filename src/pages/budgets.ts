import { handleFormSubmit, updateListing, displayItems } from "../shared/components/form.js"
import { getAllItems } from "../core/database/openDatabase.js";

export interface Budget {
  id: number;
  category: string;
  budget: number;
  alert?: boolean;
  month: number; // Mois entre 1 et 12 (base de données)
  year: number;
}

export function isBudget(item: any): item is Budget {
  return (item as Budget).budget !== undefined;
}

document.addEventListener("DOMContentLoaded", () => {
  const prevMonthButton = document.getElementById("prevMonth");
  const nextMonthButton = document.getElementById("nextMonth");
  const currentMonthLabel = document.getElementById("currentMonthLabel");
  const monthInput = document.getElementById("month");
  const yearInput = document.getElementById("year");

  let currentDate = new Date(); // Mois et année actuels
  
  // Afficher le mois et l'année actuels (en utilisant les mois 0-11 pour les calculs)
  function updateMonthLabel() {
    const month = currentDate.getMonth(); // Mois (0-11)
    const year = currentDate.getFullYear(); // Année
    const monthNames = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];
    if (currentMonthLabel && monthInput && yearInput) {
      currentMonthLabel.textContent = `${monthNames[month]} ${year}`; // Affichage avec 0-11 pour les calculs
      monthInput.value = month; // Mois affiché (1-12 pour l'utilisateur)
      yearInput.value = year; // Année sélectionnée
    }
  }

  // Passer au mois précédent
  if(prevMonthButton){
    prevMonthButton.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() - 1); // Réduction du mois
      updateMonthLabel();
    });
  }

  // Passer au mois suivant
  if (nextMonthButton){
    nextMonthButton.addEventListener("click", () => {
      currentDate.setMonth(currentDate.getMonth() + 1); // Augmenter le mois
      updateMonthLabel();
    });
  }

  // Initialiser le mois et l'année
  updateMonthLabel();

  // Soumettre le formulaire
  handleFormSubmit(
    "budgetsForm",
    "budgetsListing",
    "BudgetDatabase",
    "budgets",
    ["category", "budget", "year", "month"],
    ["alert"]
  );

  // Mettre à jour le listing des budgets
  updateListing("BudgetDatabase", "budgets", ["category", "budget", "alert", "year", "month"]);
});

// Variables pour suivre le mois actuel (0-11)
let currentMonth = new Date().getMonth(); // Mois actuel (0-11)
let currentYear = new Date().getFullYear(); // Année actuelle

// Fonction pour formater et afficher le mois/année dans le label
function updateMonthLabel() {
  const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const monthLabel = document.getElementById("currentMonthLabel");
  if (monthLabel) {
    monthLabel.textContent = `${months[currentMonth]} ${currentYear}`; // Affiche le mois correct
  }
}

// Fonction pour changer de mois et mettre à jour l'affichage
function changeMonth(offset: number) {
  currentMonth += offset; // Décale le mois par rapport à l'offset (précédent ou suivant)

  // Si le mois dépasse décembre (11), on revient à janvier (0) et change d'année
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }

  // Si le mois dépasse décembre (11), on revient à janvier (0) et change d'année
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }

  // Mettre à jour le label du mois affiché
  updateMonthLabel();

  // Mettre à jour le listing des éléments pour ce mois
  updateListingForMonth();
}

// Écoute des clics sur les boutons "Mois Précédent" et "Mois Suivant"
document.getElementById("prevMonth")?.addEventListener("click", () => changeMonth(-1));
document.getElementById("nextMonth")?.addEventListener("click", () => changeMonth(1));

// Fonction pour mettre à jour le listing pour le mois actuel
async function updateListingForMonth() {
  try {
    console.log(`Updating listing for ${currentMonth}/${currentYear}`);
    const items = await getAllItems("BudgetDatabase", "budgets");
    const filteredItems = items.filter(item => {
      // On vérifie ici que le mois en base de données (1-12) correspond au mois interne (0-11)
      return isBudget(item) && item.month == currentMonth && item.year == currentYear; // Mois 1-12 pour la base de données
    });
    console.log(filteredItems);
    await displayItems(filteredItems, "budgets", "BudgetDatabase", []);
  } catch (error) {
    console.error("Error updating listing:", error);
  }
}

// Initialisation du label du mois et du listing au chargement de la page
updateMonthLabel();
