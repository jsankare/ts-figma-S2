import { monitorUserInteraction } from "./utils/userInteraction.js";
import { openDatabase } from "./core/database/openDatabase.js";
import { getCurrentUser } from "./core/auth/getCurrentUser.js";
import { Transaction, isTransaction } from "./pages/transactions.js";
import { Category, isCategory } from "./pages/categories.js";
import { Budget, isBudget } from "./pages/budgets.js";

function onUserInteraction(eventType: string) {
  console.log(`User interaction detected: ${eventType}`);
}

function initializeApp() {
  monitorUserInteraction(onUserInteraction);

  console.log("Monitoring user interactions...");
}

initializeApp();

// Configuration des noms de bases de données
const DB_NAMES = {
  categories: "CategoryDatabase",
  transactions: "TransactionDatabase",
  budgets: "BudgetDatabase",
} as const;

type StoreItem = Transaction | Category | Budget;

// Fonction pour récupérer tous les éléments d'un store avec filtrage par userId
function getAllFromStore<T extends StoreItem>(
  db: any,
  storeName: string,
  userId: number,
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = (event: Event) => {
      const target = event.target as IDBRequest<T[]>;
      const filteredData = target.result.filter(
        (item) => item.userId === userId,
      );
      resolve(filteredData);
    };
    request.onerror = () =>
      reject(
        new Error(
          `Erreur lors de la récupération des données dans ${storeName}`,
        ),
      );
  });
}

// Function to create a dashboard card
function createDashboardCard(
  title: string,
  value: string,
  trend: string = "",
  color: string = "blue",
): string {
  return `
    <div class="dashboard-card bg-white p-6 rounded-lg shadow-lg">
      <h3 class="text-lg font-semibold text-gray-600">${title}</h3>
      <div class="flex items-center mt-2">
        <span class="text-2xl font-bold text-${color}-600">${value}</span>
        ${trend ? `<span class="ml-2 text-sm ${trend.startsWith("+") ? "text-green-500" : "text-red-500"}">${trend}</span>` : ""}
      </div>
    </div>
  `;
}

// Function to update dashboard cards
async function updateDashboardCards(userId: number): Promise<void> {
  const cardsContainer = document.getElementById("dashboard_cards");
  if (!cardsContainer) return;

  try {
    // Get all transactions and budgets
    const [transactionsDB, budgetsDB] = await Promise.all([
      openDatabase(DB_NAMES.transactions, "transactions"),
      openDatabase(DB_NAMES.budgets, "budgets"),
    ]);

    const [transactions, budgets] = await Promise.all([
      getAllFromStore<Transaction>(transactionsDB, "transactions", userId),
      getAllFromStore<Budget>(budgetsDB, "budgets", userId),
    ]);

    // Calculate total balance
    const totalIncome = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Calculate total budgets
    const totalBudgets = budgets.reduce((sum, b) => sum + Number(b.budget), 0);

    // Calculate budget usage percentage
    const budgetUsagePercentage =
      totalBudgets > 0 ? Math.round((totalExpenses / totalBudgets) * 100) : 0;

    // Create the cards HTML
    console.log(balance);
    cardsContainer.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        ${createDashboardCard("Balance Totale", `${balance.toFixed(2)} €`, balance >= 0 ? `+${balance.toFixed(2)}` : `${balance.toFixed(2)}`, balance >= 0 ? "green" : "red")}
        ${createDashboardCard("Dépenses Totales", `${totalExpenses.toFixed(2)} €`)}
        ${createDashboardCard("Utilisation Budget", `${budgetUsagePercentage}%`, "", budgetUsagePercentage > 90 ? "red" : "blue")}
      </div>
    `;
  } catch (error) {
    console.error("Error updating dashboard cards:", error);
    cardsContainer.innerHTML =
      '<p class="text-red-500">Error loading dashboard cards</p>';
  }
}

// Fonction pour générer une liste complète de jours pour le mois en cours
function getDaysInMonth(year: number, month: number): string[] {
  const days: string[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(date.toISOString().split("T")[0]); // Format YYYY-MM-DD
    date.setDate(date.getDate() + 1);
  }
  return days;
}

interface CategoryExpenses {
  [key: string]: number;
}

interface DailyExpenses {
  [date: string]: number;
}

// Fonction principale pour générer les statistiques
async function generateStatistics(userId: number): Promise<void> {
  try {
    if (!userId) {
      console.error("Aucun utilisateur trouvé.");
      return;
    }

    // Update dashboard cards first
    await updateDashboardCards(userId);

    // Ouvrir les bases de données
    const [categoriesDB, transactionsDB, budgetsDB] = await Promise.all([
      openDatabase(DB_NAMES.categories, "categories"),
      openDatabase(DB_NAMES.transactions, "transactions"),
      openDatabase(DB_NAMES.budgets, "budgets"),
    ]);

    // Récupérer les données filtrées par userId
    const [categories, transactions, budgets] = await Promise.all([
      getAllFromStore<Category>(categoriesDB, "categories", userId),
      getAllFromStore<Transaction>(transactionsDB, "transactions", userId),
      getAllFromStore<Budget>(budgetsDB, "budgets", userId),
    ]);

    // Convertir les montants en nombres
    transactions.forEach((t) => (t.amount = Number(t.amount)));
    budgets.forEach((b) => (b.budget = Number(b.budget)));

    // Calcul des totaux
    const totalExpenses = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const activeBudgets = budgets.filter(
      (b) =>
        Number(b.month) === currentMonth &&
        Number(b.year) === currentYear &&
        b.budget > 0,
    );

    const recentTransactions = transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          date.getMonth() === currentMonth && date.getFullYear() === currentYear
        );
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    // Filtrer les transactions du mois actuel
    const currentMonthTransactions = transactions.filter((t) => {
      const date = new Date(t.date);
      return (
        date.getMonth() === currentMonth &&
        date.getFullYear() === currentYear &&
        t.type === "debit"
      );
    });

    // Calculer la somme des débits par catégorie
    const debitSumsByCategory = currentMonthTransactions
      .filter((t) => {
        return (
          t.type === "debit" &&
          activeBudgets.some((b) => b.category === t.category)
        );
      })
      .reduce<CategoryExpenses>((acc, t) => {
        const categoryName =
          categories.find((c) => c.id.toString() === t.category)?.name ||
          "Inconnu";

        if (typeof t.amount === "number" && !isNaN(t.amount)) {
          acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        } else {
          console.warn(`Invalid amount for transaction ${JSON.stringify(t)}`);
        }

        return acc;
      }, {});

    // Regrouper les dépenses par jour
    const dailyExpenses = currentMonthTransactions.reduce<DailyExpenses>(
      (acc, t) => {
        const date = new Date(t.date).toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + t.amount;
        return acc;
      },
      {},
    );

    // Générer la liste complète de jours pour le mois en cours
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);

    // Préparer les données pour le graphique des dépenses mensuelles
    const dailyAmounts = daysInMonth.map((day) => dailyExpenses[day] || 0);

    // Regrouper les dépenses par catégorie
    const categoryExpenses = currentMonthTransactions.reduce<CategoryExpenses>(
      (acc, t) => {
        const categoryName =
          categories.find((c) => c.id.toString() === t.category)?.name ||
          "Inconnu";
        acc[categoryName] = (acc[categoryName] || 0) + t.amount;
        return acc;
      },
      {},
    );

    // Préparer les données pour le graphique des dépenses par catégorie
    const categoryNames = Object.keys(categoryExpenses);
    const categoryAmounts = categoryNames.map((name) => categoryExpenses[name]);

    // Afficher les graphiques
    renderMonthlyExpensesChart(daysInMonth, dailyAmounts);
    renderCategoryExpensesChart(categoryNames, categoryAmounts);

    // Afficher les résultats dans la page
    const statsContainer = document.getElementById("stats");
    if (statsContainer) {
      statsContainer.innerHTML = `
        <h2>Statistiques Financières</h2>
        <p><strong>Total des Dépenses :</strong> ${Math.abs(totalExpenses).toFixed(2)} €</p>
        <p><strong>Total des Revenus :</strong> ${totalIncome.toFixed(2)} €</p>
        <p><strong>Balance :</strong> ${balance.toFixed(2)} €</p>
      `;
    }

    // Afficher les résultats dans la page
    const recentTransactionsContainer = document.getElementById("transactions");
    if (recentTransactionsContainer) {
      recentTransactionsContainer.innerHTML = `
        <h3>Budgets Actifs</h3>
        <ul>
          ${activeBudgets
            .map((b) => {
              const category =
                categories.find((c) => c.id.toString() === b.category)?.name ||
                "Inconnu";
              const debitSum = debitSumsByCategory[category] || 0;
              let progress = (debitSum / b.budget) * 100;
              progress = progress > 100 ? 100 : progress;
              const isOverBudget = debitSum > b.budget;
              const overBudgetAmount = debitSum - b.budget;
              const progressBar = `<div class="progress-container">
                <div class="progress-bar" style="width: ${progress}%; background-color: ${
                  isOverBudget ? "#ff4d4d" : "#4caf50"
                };"></div>
              </div>`;
              const progressText = isOverBudget
                ? `Dépassement : ${overBudgetAmount.toFixed(2)} €`
                : `${progress.toFixed(2)}% du budget atteint`;
              return `
                <li>
                  ${category} : ${b.budget.toFixed(2)} € - Dépenses : ${debitSum.toFixed(2)} € 
                  <div>${progressText}</div>
                  ${progressBar}
                </li>`;
            })
            .join("")}
        </ul>
        <h3>Transactions Récentes</h3>
        <ul>
          ${recentTransactions
            .map((t) => {
              const category =
                categories.find((c) => c.id.toString() === t.category)?.name ||
                "Non défini";
              const color = t.type === "debit" ? "red" : "green";
              return `<li style="color: ${color}"><h4>${t.name}</h4> 
                <div class="transactionPrice">${t.amount.toFixed(2)}</div> 
                <div class="transactionInfo">${t.date} - ${category}</div>
              </li>`;
            })
            .join("")}
        </ul>
      `;
    }
  } catch (error) {
    console.error("Erreur lors de la génération des statistiques :", error);
  }
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor: string | string[];
  borderWidth?: number;
  tension?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartOptions {
  responsive: boolean;
  plugins: {
    legend: { display: boolean };
    tooltip: { enabled: boolean };
  };
  scales?: {
    x?: { title: { display: boolean; text: string } };
    y?: { title: { display: boolean; text: string } };
  };
}

interface ChartConfiguration {
  type: string;
  data: ChartData;
  options: ChartOptions;
}

declare class Chart {
  constructor(ctx: CanvasRenderingContext2D, config: ChartConfiguration);
}

// Fonction pour afficher le graphique des dépenses mensuelles
function renderMonthlyExpensesChart(labels: string[], data: number[]): void {
  const canvas = document.getElementById(
    "monthlyExpensesChart",
  ) as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Dépenses mensuelles (€)",
          data,
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          borderColor: "rgba(255, 99, 132, 1)",
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
      scales: {
        x: { title: { display: true, text: "Jour" } },
        y: { title: { display: true, text: "Montant (€)" } },
      },
    },
  });
}

// Fonction pour afficher le graphique des dépenses par catégorie
function renderCategoryExpensesChart(labels: string[], data: number[]): void {
  const canvas = document.getElementById(
    "categoryExpensesChart",
  ) as HTMLCanvasElement | null;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          label: "Dépenses par catégorie (€)",
          data,
          backgroundColor: [
            "rgba(255, 99, 132, 0.2)",
            "rgba(54, 162, 235, 0.2)",
            "rgba(255, 206, 86, 0.2)",
            "rgba(75, 192, 192, 0.2)",
            "rgba(153, 102, 255, 0.2)",
            "rgba(255, 159, 64, 0.2)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(75, 192, 192, 1)",
            "rgba(153, 102, 255, 1)",
            "rgba(255, 159, 64, 1)",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true },
        tooltip: { enabled: true },
      },
    },
  });
}

// Charger les statistiques après le chargement de la page
document.addEventListener("DOMContentLoaded", async () => {
  const userId = await getUser();
  if (userId) {
    generateStatistics(userId);
    const userImgMarkup = document.getElementById(
      "dashboard-pic",
    ) as HTMLImageElement;
    const userNameMarkup = document.getElementById(
      "dashboard-name",
    ) as HTMLImageElement;
    if (userImgMarkup) {
      const db = await openDatabase("UserDatabase", "users");
      const userEmail = localStorage.getItem("userMail");

      if (userEmail) {
        try {
          const user = await getCurrentUser(db, userEmail);
          if (user) {
            if (user.picture) {
              userImgMarkup.src = user.picture; // Set the image path to user's picture
            } else {
              userImgMarkup.src = "https://picsum.photos/200?grayscale";
            }
            if (user.firstname) {
              userNameMarkup.innerHTML =
                user.firstname.charAt(0).toUpperCase() +
                user.firstname.slice(1);
            } else {
              userNameMarkup.innerHTML = "Inconnu";
            }
          }
        } catch (error) {
          console.error("Error retrieving user information:", error);
        }
      } else {
        console.error("No user email found in localStorage.");
      }
    }
  }
});

async function getUser(): Promise<number | null> {
  const db = await openDatabase("UserDatabase", "users");
  const userEmail = localStorage.getItem("userMail");

  if (!userEmail) {
    console.error("Aucun email trouvé dans localStorage.");
    return null;
  }

  try {
    const token = await getCurrentUser(db, userEmail);

    if (token && token.id) {
      return token.id;
    } else {
      console.error("Le token ou l'ID utilisateur est introuvable.");
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    return null;
  }
}
