import { logoutLogic } from "../../core/auth/logout.js";

const body = document.getElementById("body");
console.log('test');
if (body) {
  const links = [
    {
      id: "index",
      label: "Dashboard",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>`,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M2 17h12v2H2v-2zm0-6h20v2H2v-2zm0-6h20v2H2V5z"/>
      </svg>`,
    },
    {
      id: "categories",
      label: "Catégories",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zm10 0h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM10 13H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm10 0h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1z"/>
      </svg>`,
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
      </svg>`,
    },
    {
      id: "profile",
      label: "Profil",
      icon: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
      </svg>`,
    },
  ];

  const navbar = document.createElement("header");
  navbar.className = "header";

  const navItems = document.createElement("ul");
  navItems.className = "navigation--items";

  // Create navigation items
  links.forEach(({ id, label, icon }) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `./${id}.html`;
    a.className = "navlink";

    // Check if current page matches the link
    if (window.location.pathname.includes(id)) {
      a.classList.add("active");
    }

    // Set innerHTML with icon and label
    a.innerHTML = `
      ${icon}
      <span>${label}</span>
    `;

    li.appendChild(a);
    navItems.appendChild(li);
  });

  // Create logout button
  const logout = document.createElement("button");
  logout.className = "navlink logout";
  logout.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
    </svg>
    <span>Déconnexion</span>
  `;

  logout.addEventListener("click", logoutLogic);

  navbar.appendChild(navItems);
  navbar.appendChild(logout);

  // Insert navbar at the beginning of body
  body.insertBefore(navbar, body.firstChild);
}
