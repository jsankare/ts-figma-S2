import { getAllItems, getItemById } from "../core/database/openDatabase.js";
import { isBudget, isCategory, isTransaction } from "../core/database/types.js";

export function showNotification(
  title: string,
  options?: NotificationOptions,
  vibrationPattern?: number[],
): void {
  if (!("Notification" in window)) {
    console.warn("Les notifications ne sont pas supportées par ce navigateur.");
    return;
  }

  const createNotification = () => {
    const notification = new Notification(title, options);
    notification.onclick = () => {
      console.log("Notification cliquée !");
    };
    notification.onclose = () => {
      console.log("Notification fermée.");
    };
    if (vibrationPattern && "vibrate" in navigator) {
      navigator.vibrate(vibrationPattern);
    }
  };

  if (Notification.permission === "granted") {
    createNotification();
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        createNotification();
      } else {
        console.warn("Permission de notification refusée.");
      }
    });
  } else {
    console.warn("Les notifications sont désactivées pour ce site.");
  }
}

(window as any).notifyMe = showNotification;

export async function checkBudgetsAndNotify() {
  try {
    // Récupérer tous les budgets
    const budgets = await getAllItems("BudgetDatabase", "budgets");

    // Parcourir chaque budget pour effectuer les vérifications
    for (const budget of budgets) {
      if (!isBudget(budget)) continue;

      let categoryName = "Non défini";
      let categoryId = null;

      // Vérifier si une catégorie est associée au budget
      if (budget.category) {
        categoryId = Number(budget.category);

        const category = await getItemById(
          "CategoryDatabase",
          "categories",
          categoryId,
        );

        if (isCategory(category)) {
          categoryName = category.name;
        }
      }

      // Récupérer le mois et l'année actuels
      const currentMonth = new Date().getMonth(); // Mois (0-11)
      const currentYear = new Date().getFullYear(); // Année

      // Récupérer toutes les transactions
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

      // Calculer le montant total des transactions pour cette catégorie
      const totalTransactionAmount = filteredTransactions.reduce(
        (sum, transaction) => sum + (Number(transaction.amount) || 0),
        0,
      );

      // Calculer le pourcentage d'utilisation du budget
      const progressPercentage = Math.min(
        (totalTransactionAmount / budget.budget) * 100,
        100,
      );

      // Afficher une notification si le budget atteint ou dépasse 80 %
      if (progressPercentage >= 80) {
        const message =
          progressPercentage >= 100
            ? `Le budget pour ${categoryName} a été dépassé ! (${progressPercentage.toFixed(1)}%)`
            : `Attention : le budget pour ${categoryName} est à ${progressPercentage.toFixed(1)}% !`;

        // Afficher la notification
        showNotification("Alerte Budget", {
          body: message,
          icon: "/path/to/icon.png", // Remplacez par le chemin de votre icône
        });
      }
    }
  } catch (error) {
    console.error("Erreur lors de la vérification des budgets :", error);
  }
}
