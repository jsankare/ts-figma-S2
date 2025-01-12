import { monitorUserInteraction } from "./utils/userInteraction.js";
import { openDatabase } from "./core/database/openDatabase.js";
import { getCurrentUser } from "./core/auth/getCurrentUser.js";
import { getUser } from "./shared/components/form.js";

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

    if (!categories.length && !transactions.length && !budgets.length) {
      console.error("Aucune donnée disponible.");
      return;
    }

    // Convertir les montants en nombres
    transactions.forEach((t) => {
      t.amount = Number(t.amount);
      t.userId = userId;
    });

    budgets.forEach((b) => {
      b.budget = Number(b.budget);
      b.userId = userId;
    });
    transactions.forEach((t) => (t.userId = userId));

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

    const cta = document.getElementById("cta");
    if (cta) {
      cta.innerHTML = `<h2>Ajout rapide</h2>
    <div class="cta-buttons">
    <a href="/categories.html" class="cta-button category"><svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M11.0056 0.549561C11.9602 0.549764 12.8756 0.929154 13.5506 1.60428L22.8019 10.8556C23.569 11.6229 24 12.6635 24 13.7486C24 14.8336 23.569 15.8742 22.8019 16.6415L16.092 23.3514C15.3247 24.1186 14.284 24.5496 13.199 24.5496C12.1139 24.5496 11.0733 24.1186 10.306 23.3514L1.05472 14.1001C0.379593 13.4252 0.000203879 12.5097 0 11.5551V5.34919C0 4.07625 0.505674 2.85545 1.40578 1.95534C2.30589 1.05523 3.52669 0.549561 4.79963 0.549561H11.0056ZM6.59949 4.74924C5.99405 4.74905 5.41091 4.97771 4.96696 5.38939C4.52302 5.80106 4.25109 6.36533 4.20568 6.96907L4.19968 7.14906C4.19968 7.62369 4.34043 8.08767 4.60412 8.48232C4.86782 8.87697 5.24262 9.18456 5.68112 9.3662C6.11963 9.54783 6.60216 9.59536 7.06768 9.50276C7.53319 9.41016 7.9608 9.1816 8.29642 8.84598C8.63204 8.51036 8.8606 8.08276 8.9532 7.61724C9.0458 7.15172 8.99827 6.66919 8.81664 6.23069C8.635 5.79218 8.32741 5.41738 7.93276 5.15368C7.53811 4.88999 7.07413 4.74924 6.59949 4.74924Z" fill="#6D6D6D"/>
</svg>
</a>
      <a href="/transactions.html" class="cta-button transaction"><svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M15.5734 11.8323V12.6974C15.5734 13.2655 15.4615 13.828 15.2441 14.3528C15.0267 14.8777 14.7081 15.3545 14.3064 15.7562C13.9047 16.1579 13.4278 16.4765 12.903 16.6939C12.3782 16.9113 11.8157 17.0232 11.2476 17.0232H8.4272C8.41386 17.4963 8.27139 17.9568 8.0152 18.3548C7.75902 18.7528 7.39888 19.0732 6.97374 19.2813C6.61917 19.4584 6.2281 19.5503 5.83174 19.5495C5.24539 19.5529 4.67515 19.3578 4.21389 18.9958L1.00417 16.4782C0.69156 16.2355 0.438564 15.9247 0.264522 15.5693C0.0904796 15.2139 0 14.8234 0 14.4277C0 14.032 0.0904796 13.6416 0.264522 13.2862C0.438564 12.9308 0.69156 12.6199 1.00417 12.3773L4.21389 9.85971C4.60062 9.55107 5.0675 9.3594 5.55954 9.30729C6.05157 9.25517 6.54825 9.34478 6.99104 9.56556C7.58067 9.84758 8.03477 10.3514 8.25417 10.9671H14.6823C14.7981 10.9636 14.9134 10.9834 15.0213 11.0254C15.1293 11.0673 15.2278 11.1305 15.3109 11.2111C15.394 11.2918 15.46 11.3884 15.5051 11.4951C15.5502 11.6018 15.5734 11.7164 15.5734 11.8323Z" fill="#6D6D6D"/>
<path d="M24 5.89738C24.0001 6.29304 23.9097 6.68347 23.7358 7.03885C23.5618 7.39422 23.309 7.70512 22.9965 7.94779L19.7867 10.4654C19.319 10.8288 18.7439 11.0266 18.1516 11.0277C17.7552 11.0286 17.3642 10.9367 17.0096 10.7596C16.42 10.4775 15.9659 9.97367 15.7465 9.358H9.2924C9.06295 9.358 8.84289 9.26685 8.68064 9.1046C8.5184 8.94235 8.42725 8.7223 8.42725 8.49284V7.62769C8.42725 6.48042 8.883 5.38014 9.69424 4.5689C10.5055 3.75766 11.6058 3.30191 12.753 3.30191H15.5734C15.584 2.81825 15.7295 2.34715 15.9935 1.94179C16.2576 1.53642 16.6297 1.21292 17.0678 1.0078C17.5059 0.802673 17.9927 0.724085 18.4731 0.780904C18.9535 0.837723 19.4085 1.02769 19.7867 1.32936L22.9965 3.84696C23.309 4.08963 23.5618 4.40053 23.7358 4.75591C23.9097 5.11128 24.0001 5.50172 24 5.89738Z" fill="#6D6D6D"/>
</svg>
</a>
      <a href="/budgets.html" class="cta-button budget"><svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M24 11.5705H12.979V0.549561C15.8256 0.778363 18.4978 2.01297 20.5172 4.03233C22.5365 6.05168 23.7712 8.7239 24 11.5705Z" fill="#6D6D6D"/>
<path d="M24 13.5743C23.8006 15.8543 22.9546 18.0299 21.5613 19.8456C20.1681 21.6613 18.2856 23.0417 16.135 23.8245C13.9844 24.6072 11.6551 24.7599 9.4207 24.2646C7.18631 23.7692 5.13972 22.6465 3.52142 21.0281C1.90311 19.4098 0.78032 17.3632 0.28498 15.1289C-0.21036 12.8945 -0.05767 10.5651 0.725108 8.41453C1.50789 6.26392 2.88823 4.38142 4.70395 2.98821C6.51966 1.59501 8.6953 0.748985 10.9752 0.549561V12.5724C10.9752 12.8381 11.0808 13.093 11.2687 13.2809C11.4566 13.4688 11.7114 13.5743 11.9771 13.5743H24Z" fill="#6D6D6D"/>
</svg>
</a>
    </div>
    `;
    }
    // Afficher les résultats dans la page
    const activeBudgetsContainer = document.getElementById("activeBudget");
    if (activeBudgetsContainer) {
      activeBudgetsContainer.innerHTML = `
      <h3>Budgets Actifs</h3>
      <ul>
        ${activeBudgets
          .map((b) => {
            // Trouver la catégorie correspondante
            const categoryObj = categories.find((c) => c.id === b.category);
            console.log(categoryObj);
            const categoryName = categoryObj?.name || "Non défini";
            const categoryIcon = categoryObj?.icon || "";
            const debitSum = debitSumsByCategory[categoryName] || 0;

            const budgetName = b.name || "Non défini";
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
                  <span class="category-icon"><img src="${categoryIcon}"></span>
                  <div class="budget-content">
                  <span class="category-name">${budgetName}</span>
                  <div class="budget-info">
                  ${progressBar}
                  <div class="progress-details">
                  <span>${debitSum.toFixed(2)}€ / ${b.budget.toFixed(2)} € </span>
                  <span>${progressText}</span>
                  </div>
                  </div>
                  </div>
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
              categories.find((c) => c.id === t.category)?.icon || "";
            const color = t.type === "debit" ? "#E62E2E" : "#29CC39";
            const sign = t.type === "debit" ? "-" : "+"; // Ajouter le signe
            const formattedDate = new Date(t.date).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
            return `<li>
              <span class="categoryIcon">
                <img src="${categoryIcon}" alt="" class="category-icon" />

              </span>
              <div class="transactionContent">
                <div class="transactionTitle">
                <p>${t.name}</p> 
                <p class="transactionPrice" style="color: ${color}">${sign} ${t.amount.toFixed(2)} €</p> 
                </div>
                <p class="transactionInfo">${formattedDate}</p>
              </div>
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
function renderMonthlyExpensesChart(
  labels: string[],
  data: number[],
  month?: string,
): void {
  const container = document.getElementById("monthlyExpensesChart");
  const titleContainer = document.createElement("div");
  const title = document.createElement("h2");
  title.textContent = "Dépenses Mensuelles";
  titleContainer.appendChild(title);
  const subtitle = document.createElement("p");
  console.log(month);
  subtitle.textContent =
    month ||
    new Date().toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
  subtitle.style.color = "#6D6D6D"; // Optionnel : Couleur pour différencier
  subtitle.style.fontSize = "1rem"; // Optionnel : Ajuster la taille de la police
  titleContainer.appendChild(subtitle);
  container?.appendChild(titleContainer);
  const canvas = document.createElement("canvas");
  container.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Création du graphique
  new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: "rgba(66, 153, 225, 0.2)", // Couleur du remplissage sous la courbe
          borderColor: "#4299E1", // Couleur de la ligne
          borderWidth: 2,
          tension: 0.4, // Courbure de la ligne
          fill: true, // Activer le remplissage sous la ligne
          pointBackgroundColor: "#FFFFFF", // Couleur des points
          pointBorderColor: "#4299E1", // Couleur des bordures des points
          pointBorderWidth: 2, // Épaisseur des bordures des points
          pointRadius: 5, // Taille des points
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }, // Pas de légende
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: "Jours",
            font: { size: 12 },
          },
          ticks: {
            font: { size: 10 },
          },
        },
        y: {
          title: {
            display: true,
            text: "Montants (€)",
            font: { size: 12 },
          },
          ticks: {
            font: { size: 10 },
          },
          beginAtZero: true, // Débuter l'axe Y à 0
        },
      },
      layout: {
        padding: {
          top: 20, // Espacement en haut
        },
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

function renderCreditsVsDebitsChart(credits, debits) {
  const container = document.getElementById("debitVSCreditChart");
  const title = document.createElement("h2");
  title.textContent = "Crédits vs Débits";
  container?.appendChild(title);
  const canvas = document.createElement("canvas");
  container?.appendChild(canvas);
  const ctx = canvas.getContext("2d");
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
        tooltip: { enabled: true, titleColor: "#6D6D6D", bodyColor: "#6D6D6D" },
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
