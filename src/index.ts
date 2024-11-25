import { getCurrentUser } from "./utils/getCurrentUser.js";
import { openDatabase } from "./utils/openDatabase.js";

async function initializeDashboard() {
  try {
    const db = await openDatabase();
    const userEmail = localStorage.getItem("userMail");

    if (!userEmail) {
      window.location.href = "login.html";
      return;
    }

    const user = await getCurrentUser(db, userEmail);
    if (!user) {
      window.location.href = "login.html";
      return;
    }

    const userNameElement = document.getElementById("user-name");
    const profileImage = document.getElementById(
      "profile-image",
    ) as HTMLImageElement;

    if (userNameElement) {
      userNameElement.textContent = user.firstname;
    }

    if (profileImage) {
      profileImage.src = user.picture || "assets/user_default.svg";
    }

    initializeExpenseChart();
    initializeCategoryChart();
    loadRecentTransactions();
  } catch (error) {
    console.error("Error initializing dashboard:", error);
  }
}

function initializeExpenseChart() {
  const ctx = document.getElementById("expense-chart") as HTMLCanvasElement;
  if (!ctx) return;

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";
  ctx.parentNode?.insertBefore(chartContainer, ctx);
  chartContainer.appendChild(ctx);

  new Chart(ctx, {
    type: "line",
    data: {
      labels: [
        "Janvier",
        "Février",
        "Mars",
        "Avril",
        "Mai",
        "Juin",
        "Juillet",
        "Aout",
        "Septembre",
        "Octobre",
        "Novembre",
        "Decembre",
      ],
      datasets: [
        {
          label: "Expenses",
          data: [
            1509, 1200, 1804, 1355, 1250, 1452, 1247, 741, 1214, 1160, 999, 100,
          ],
          borderColor: "#4299e1",
          tension: 0.4,
          fill: true,
          backgroundColor: "rgba(66, 153, 225, 0.1)",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `€${value}`,
          },
        },
      },
    },
  });
}

function initializeCategoryChart() {
  const ctx = document.getElementById("category-chart") as HTMLCanvasElement;
  if (!ctx) return;

  const chartContainer = document.createElement("div");
  chartContainer.className = "chart-container";
  ctx.parentNode?.insertBefore(chartContainer, ctx);
  chartContainer.appendChild(ctx);

  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Nourriture", "Transports", "Loisirs", "Factures", "Autres"],
      datasets: [
        {
          data: [30, 20, 15, 25, 10],
          backgroundColor: [
            "#4299e1",
            "#48bb78",
            "#ecc94b",
            "#ed8936",
            "#a0aec0",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            padding: 20,
            usePointStyle: true,
          },
        },
      },
    },
  });
}

function loadRecentTransactions() {
  const transactionList = document.querySelector(".transaction-list");
  if (!transactionList) return;

  const transactions = [
    {
      name: "Courses de Noëm",
      category: "Shopping",
      amount: -85.5,
      date: "Aujourd'hui",
    },
    { name: "Salaire", category: "Income", amount: 4500.0, date: "Hier" },
    {
      name: "Netflix",
      category: "Entertainment",
      amount: -25.99,
      date: "16/11/24",
    },
  ];

  transactionList.innerHTML = transactions
    .map(
      (transaction) => `
      <div class="transaction-item">
        <div class="transaction-info">
          <div class="transaction-icon">
            ${transaction.category === "Income" ? "+" : "-"}
          </div>
          <div class="transaction-details">
            <h4>${transaction.name}</h4>
            <p>${transaction.date}</p>
          </div>
        </div>
        <div class="transaction-amount ${transaction.amount > 0 ? "amount-positive" : "amount-negative"}">
          €${Math.abs(transaction.amount).toFixed(2)}
        </div>
      </div>
    `,
    )
    .join("");
}

// To init when DOM is loaded
document.addEventListener("DOMContentLoaded", initializeDashboard);
