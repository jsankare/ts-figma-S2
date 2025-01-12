import {
  Transaction,
  isTransaction,
  Category,
  isCategory,
  Budget,
  isBudget,
  ChartDataset,
  ChartOptions,
} from "../core/database/types.js";
import { getAllItems } from "../core/database/dbUtils.js";

type StoreItem = Transaction | Category | Budget;

// Function to create a dashboard card
function createDashboardCard(title: string, value: string): string {
  return `
      <div class="dashboard-card">
        <p>${title}</p>
        <h3>${value}</h3>
      </div>
    `;
}

// Function to update dashboard cards
async function updateDashboardCards(userId: number): Promise<void> {
  const cardsContainer = document.getElementById("dashboard_cards");
  if (!cardsContainer) return;

  try {
    // Get all transactions and budgets
    const transactions = (await getAllItems("transactions"))
      .filter(isTransaction)
      .filter((t) => t.userId === userId) as Transaction[];
    const budgets = (await getAllItems("budgets"))
      .filter(isBudget)
      .filter((b) => b.userId === userId) as Budget[];

    // Calculate total balance
    const totalIncome = transactions
      .filter((t) => t.type === "credit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "debit")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const balance = totalIncome - totalExpenses;

    // Create the cards HTML
    cardsContainer.innerHTML = `
      <h2>Statistiques</h2>
        <div class="card-container">
          ${createDashboardCard("Balance total", `${balance.toFixed(2)} €`)}
          ${createDashboardCard("Dépenses", `${totalExpenses.toFixed(2)} €`)}
          ${createDashboardCard("Revenus", `${totalIncome.toFixed(2)} €`)}
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
export async function generateStatistics(userId: number): Promise<void> {
  try {
    console.log(userId);
    if (!userId) {
      console.error("Aucun utilisateur trouvé.");
      return;
    }

    // Update dashboard cards first
    await updateDashboardCards(userId);

    // Ouvrir les bases de données
    const transactions = (await getAllItems("transactions")) 
    .filter(isTransaction)
    .filter((t) => t.userId === userId) as Transaction[];

    const budgets = (await getAllItems("budgets"))
    .filter(isBudget)
    .filter((b) => b.userId === userId) as Budget[];

    const categories = (await getAllItems("categories")) 
    .filter(isCategory)
    .filter((c) => c.userId === userId) as Category[];

    if (categories.length === 0 && transactions.length === 0 && budgets.length === 0) {
      displayEmptyMessage('.homeContainer');
    }

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
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);

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

    const monthlyCredits = transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear &&
          t.type === "credit"
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const monthlyDebits = transactions
      .filter((t) => {
        const date = new Date(t.date);
        return (
          date.getMonth() === currentMonth &&
          date.getFullYear() === currentYear &&
          t.type === "debit"
        );
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const months = [
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

    const currentMonthString = months[new Date().getMonth()];

    // Afficher les graphiques
    renderMonthlyExpensesChart(daysInMonth, dailyAmounts, currentMonthString);
    renderCategoryExpensesChart(categoryNames, categoryAmounts);
    renderCreditsVsDebitsChart(monthlyCredits, monthlyDebits);

    // Afficher les résultats dans la page
    const activeBudgetsContainer = document.getElementById("activeBudget");
    if (activeBudgetsContainer) {
      activeBudgetsContainer.innerHTML = `
        <h3>Budgets Actifs</h3>
        <ul>
          ${activeBudgets
            .map((b) => {
              // Trouver la catégorie correspondante
              const categoryObj = categories.find(
                (c) => c.id.toString() === b.category,
              );
              const categoryName = categoryObj?.name || "Non défini";
              const categoryIcon = categoryObj?.icon || ""; // Ajouter une propriété 'icon' dans tes données catégories
              const debitSum = debitSumsByCategory[categoryName] || 0;

              // Calculer la progression
              let progress = (debitSum / b.budget) * 100;
              progress = progress > 100 ? 100 : progress;
              const isOverBudget = debitSum > b.budget;
              const overBudgetAmount = debitSum - b.budget;

              // Générer la barre de progression
              const progressBar = `
                <div class="progress-container">
                  <div class="progress-bar" style="width: ${progress}%; background-color: ${
                    isOverBudget ? "#E62E2E" : "#29CC39"
                  };"></div>
                </div>`;

              // Texte d'état de progression
              const progressText = `${progress}%`;

              // Retourner l'élément HTML
              return `
                <li class="budget-item">
                  <div class="category-info">
                    <span class="category-icon">${categoryIcon}</span>
                    <span class="category-name">${categoryName}</span>
                  </div>
                  <div class="budget-info">
                  ${progressBar}
                  ${debitSum.toFixed(2)}€ / ${b.budget.toFixed(2)} € 
                  <div>${progressText}</div>
                  </div>
                </li>`;
            })
            .join("")}
        </ul>`;
    }

    const recentTransactionsContainer =
      document.getElementById("lastTransactions");
    if (recentTransactionsContainer) {
      recentTransactionsContainer.innerHTML = `
        <h3>Transactions Récentes</h3>
        <ul>
          ${recentTransactions
            .map((t) => {
              const categoryIcon =
                categories.find((c) => c.id.toString() === t.category)?.icon ||
                "";
              const color = t.type === "debit" ? "#E62E2E" : "#29CC39";
              const sign = t.type === "debit" ? "-" : "+"; // Ajouter le signe
              return `<li>
                <img src="${categoryIcon}" alt="${t.category}" class="category-icon" />
                <h4>${t.name}</h4> 
                <div class="transactionPrice" style="color: ${color}">${sign} ${t.amount.toFixed(2)} €</div> 
                <div class="transactionInfo">${t.date}</div>
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

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
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
function renderMonthlyExpensesChart(
  labels: string[],
  data: number[],
  month?: string,
): void {
  const container = document.getElementById("monthlyExpensesChart");
  const title = document.createElement("h2");
  title.textContent = "Dépenses Mensuelles";
  container?.appendChild(title);
  const canvas = document.createElement("canvas");
  container?.appendChild(canvas);

  const subtitle = document.createElement("h3");
  console.log(month);
  subtitle.textContent =
    month ||
    new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  subtitle.style.color = "#6D6D6D"; // Optionnel : Couleur pour différencier
  subtitle.style.fontSize = "1rem"; // Optionnel : Ajuster la taille de la police
  if (!container) return;
  container.appendChild(subtitle);

  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: "#4299E1",
          borderColor: "#4299E1",
          borderWidth: 2,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
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
  const container = document.getElementById("categoryExpensesChart");
  const title = document.createElement("h2");
  title.textContent = "Dépenses par Catégorie";
  container?.appendChild(title);
  const canvas = document.createElement("canvas");
  container?.appendChild(canvas);

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
            "rgb(41, 76, 96)",
            "rgb(66, 153, 255)",
            "rgb(110, 196, 227)",
            "rgb(109, 109, 109)",
            "rgb(0, 27, 46)",
            "rgb(79, 79, 188)",
          ],
          borderColor: [
            "rgb(41, 76, 96)",
            "rgb(66, 153, 255)",
            "rgb(110, 196, 227)",
            "rgb(109, 109, 109)",
            "rgb(0, 27, 46)",
            "rgb(79, 79, 188)",
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

function renderCreditsVsDebitsChart(credits: number, debits: number) {
  const container = document.getElementById("debitVSCreditChart");
  const title = document.createElement("h2");
  title.textContent = "Crédits vs Débits";
  container?.appendChild(title);
  const canvas = document.createElement("canvas");
  container?.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Crédits", "Débits"],
      datasets: [
        {
          data: [credits, debits],
          backgroundColor: ["rgba(41, 76, 96, 0.5)", "rgba(66, 153, 225, 0.5)"],
          borderRadius: 8,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          enabled: true,
          titleColor: "#6D6D6D",
          bodyColor: "#6D6D6D",
        },
      },
      scales: {
        y: {
          title: {
            display: true,
            text: "Montants",
            color: "#6D6D6D",
          },
          grid: {
            borderColor: "#6D6D6D",
          },
        },
      },
      x: {
        categoryPercentage: 0.8,
      },
    },
  });
}

function displayEmptyMessage(containerId: string){
  const container = document.querySelector(containerId);
  if (!container) return;
  container.innerHTML = `<div class="no-content">
  <h1> Aucunes données à afficher</h1>
  <p> Bienvenue sur Cash Flow 
  Pour commencer, veuillez suivre les étapes suivantes :</p>
  <div class="steps">
    <div class="step">
      <a href="/categories.html">
        <span>1</span>
        <p>Créez des catégories pour organiser vos transactions et définir vos budgets</p>
      </a>
    </div>
    <div class="step">
      <a href="/transactions.html">
        <span>2</span>
        <p>Ajouter vos transactions pour suivre vos débits et vos crédits en temps réel</p>
      </a>
    </div>
    <div class="step">
      <a href="/budgets.html">
        <span>3</span>
        <p>Etablissez des budgets pour mieux contrôler vos dépenses et gérer vos finances efficacement</p>
      </a>
    </div>
    <div class="step">
      <span>4</span>
      <p>Découvrez vos statistiques et profitez d'une exérience fluide pour piloter vos finances</p> 
    </div>
  </div>
  </div>`;
}
