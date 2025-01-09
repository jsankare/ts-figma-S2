import { logoutLogic } from "../../core/auth/logout.js";
import { enableFullscreenFeature } from "../../utils/fullscreen.js";
import { displayBatteryStatus } from "../../utils/battery-status.js";
import { getCurrentUser } from "../../core/auth/getCurrentUser.js";


const body = document.getElementById("body");

if (body) {
  const links = [
    {
      id: "index",
      label: "Dashboard",
      icon: `<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M23.6717 10.2838L21.6663 8.45885L13.9755 1.47999C13.424 0.986703 12.71 0.713989 11.9701 0.713989C11.2302 0.713989 10.5162 0.986703 9.96468 1.47999L2.29396 8.49895L0.288542 10.3239C0.153503 10.4609 0.0607313 10.6339 0.0212945 10.8222C-0.0181423 11.0105 -0.00257915 11.2061 0.0661272 11.3858C0.134834 11.5655 0.253783 11.7217 0.408784 11.8356C0.563785 11.9496 0.748296 12.0165 0.940303 12.0285C1.19428 12.017 1.43441 11.9095 1.61212 11.7277L1.94301 11.4269V21.7548C1.94301 22.5526 2.25994 23.3177 2.82407 23.8818C3.38821 24.446 4.15333 24.7629 4.95114 24.7629H18.9891C19.7869 24.7629 20.552 24.446 21.1161 23.8818C21.6803 23.3177 21.9972 22.5526 21.9972 21.7548V11.467L22.3281 11.7678C22.512 11.9349 22.7514 12.0278 22.9999 12.0285C23.2021 12.028 23.3994 11.9663 23.5659 11.8517C23.7324 11.7371 23.8604 11.5748 23.933 11.3861C24.0057 11.1974 24.0196 10.9912 23.973 10.7945C23.9263 10.5978 23.8213 10.4198 23.6717 10.2838Z" fill="#6D6D6D"/>
          </svg>`,
    },
    {
      id: "transactions",
      label: "Transactions",
      icon: `<svg width="24" height="20" viewBox="0 0 24 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.5734 11.8323V12.6974C15.5734 13.2655 15.4615 13.828 15.2441 14.3528C15.0267 14.8777 14.7081 15.3545 14.3064 15.7562C13.9047 16.1579 13.4278 16.4765 12.903 16.6939C12.3782 16.9113 11.8157 17.0232 11.2476 17.0232H8.4272C8.41386 17.4963 8.27139 17.9568 8.0152 18.3548C7.75902 18.7528 7.39888 19.0732 6.97374 19.2813C6.61917 19.4584 6.2281 19.5503 5.83174 19.5495C5.24539 19.5529 4.67515 19.3578 4.21389 18.9958L1.00417 16.4782C0.69156 16.2355 0.438564 15.9247 0.264522 15.5693C0.0904796 15.2139 0 14.8234 0 14.4277C0 14.032 0.0904796 13.6416 0.264522 13.2862C0.438564 12.9308 0.69156 12.6199 1.00417 12.3773L4.21389 9.85971C4.60062 9.55107 5.0675 9.3594 5.55954 9.30729C6.05157 9.25517 6.54825 9.34478 6.99104 9.56556C7.58067 9.84758 8.03477 10.3514 8.25417 10.9671H14.6823C14.7981 10.9636 14.9134 10.9834 15.0213 11.0254C15.1293 11.0673 15.2278 11.1305 15.3109 11.2111C15.394 11.2918 15.46 11.3884 15.5051 11.4951C15.5502 11.6018 15.5734 11.7164 15.5734 11.8323Z" fill="#6D6D6D"/>
        <path d="M24 5.89738C24.0001 6.29304 23.9097 6.68347 23.7358 7.03885C23.5618 7.39422 23.309 7.70512 22.9965 7.94779L19.7867 10.4654C19.319 10.8288 18.7439 11.0266 18.1516 11.0277C17.7552 11.0286 17.3642 10.9367 17.0096 10.7596C16.42 10.4775 15.9659 9.97367 15.7465 9.358H9.2924C9.06295 9.358 8.84289 9.26685 8.68064 9.1046C8.5184 8.94235 8.42725 8.7223 8.42725 8.49284V7.62769C8.42725 6.48042 8.883 5.38014 9.69424 4.5689C10.5055 3.75766 11.6058 3.30191 12.753 3.30191H15.5734C15.584 2.81825 15.7295 2.34715 15.9935 1.94179C16.2576 1.53642 16.6297 1.21292 17.0678 1.0078C17.5059 0.802673 17.9927 0.724085 18.4731 0.780904C18.9535 0.837723 19.4085 1.02769 19.7867 1.32936L22.9965 3.84696C23.309 4.08963 23.5618 4.40053 23.7358 4.75591C23.9097 5.11128 24.0001 5.50172 24 5.89738Z" fill="#6D6D6D"/>
        </svg>`,
    },
    {
      id: "categories",
      label: "Catégories",
      icon: `<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.0056 0.549561C11.9602 0.549764 12.8756 0.929154 13.5506 1.60428L22.8019 10.8556C23.569 11.6229 24 12.6635 24 13.7486C24 14.8336 23.569 15.8742 22.8019 16.6415L16.092 23.3514C15.3247 24.1186 14.284 24.5496 13.199 24.5496C12.1139 24.5496 11.0733 24.1186 10.306 23.3514L1.05472 14.1001C0.379593 13.4252 0.000203879 12.5097 0 11.5551V5.34919C0 4.07625 0.505674 2.85545 1.40578 1.95534C2.30589 1.05523 3.52669 0.549561 4.79963 0.549561H11.0056ZM6.59949 4.74924C5.99405 4.74905 5.41091 4.97771 4.96696 5.38939C4.52302 5.80106 4.25109 6.36533 4.20568 6.96907L4.19968 7.14906C4.19968 7.62369 4.34043 8.08767 4.60412 8.48232C4.86782 8.87697 5.24262 9.18456 5.68112 9.3662C6.11963 9.54783 6.60216 9.59536 7.06768 9.50276C7.53319 9.41016 7.9608 9.1816 8.29642 8.84598C8.63204 8.51036 8.8606 8.08276 8.9532 7.61724C9.0458 7.15172 8.99827 6.66919 8.81664 6.23069C8.635 5.79218 8.32741 5.41738 7.93276 5.15368C7.53811 4.88999 7.07413 4.74924 6.59949 4.74924Z" fill="#6D6D6D"/>
          </svg>`,
    },
    {
      id: "budgets",
      label: "Budgets",
      icon: `<svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M24 11.5705H12.979V0.549561C15.8256 0.778363 18.4978 2.01297 20.5172 4.03233C22.5365 6.05168 23.7712 8.7239 24 11.5705Z" fill="#6D6D6D"/>
          <path d="M24 13.5743C23.8006 15.8543 22.9546 18.0299 21.5613 19.8456C20.1681 21.6613 18.2856 23.0417 16.135 23.8245C13.9844 24.6072 11.6551 24.7599 9.4207 24.2646C7.18631 23.7692 5.13972 22.6465 3.52142 21.0281C1.90311 19.4098 0.78032 17.3632 0.28498 15.1289C-0.21036 12.8945 -0.05767 10.5651 0.725108 8.41453C1.50789 6.26392 2.88823 4.38142 4.70395 2.98821C6.51966 1.59501 8.6953 0.748985 10.9752 0.549561V12.5724C10.9752 12.8381 11.0808 13.093 11.2687 13.2809C11.4566 13.4688 11.7114 13.5743 11.9771 13.5743H24Z" fill="#6D6D6D"/>
          </svg>`,
    },
  ];

  const navbar = document.createElement("header");
  navbar.className = "header";

  const logo = document.createElement("div");
    logo.classList.add("logo");
    logo.innerHTML = `<svg width="24" height="37" viewBox="0 0 24 37" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="0.260986" y="4.55579" width="6.44285" height="27.1293" transform="rotate(-45 0.260986 4.55579)" fill="#4299E1"/>
                      <rect x="0.182129" y="17.3998" width="6.44285" height="18.1707" transform="rotate(-45 0.182129 17.3998)" fill="#4299E1"/>
                      <rect y="30.3468" width="6.44285" height="9.00451" transform="rotate(-45 0 30.3468)" fill="#4299E1"/>
                      </svg>
                      <span>CashFlow</span>`;

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
    <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.72727 24.5495C1.97727 24.5495 1.33545 24.2886 0.801818 23.7668C0.268182 23.245 0.000909091 22.617 0 21.8828V3.21616C0 2.48283 0.267273 1.85528 0.801818 1.3335C1.33636 0.811722 1.97818 0.550388 2.72727 0.5495H10.9091C11.2955 0.5495 11.6195 0.6775 11.8814 0.933499C12.1432 1.1895 12.2736 1.50594 12.2727 1.88283C12.2718 2.25972 12.1409 2.57661 11.88 2.8335C11.6191 3.09039 11.2955 3.21794 10.9091 3.21616H2.72727V21.8828H10.9091C11.2955 21.8828 11.6195 22.0108 11.8814 22.2668C12.1432 22.5228 12.2736 22.8393 12.2727 23.2161C12.2718 23.593 12.1409 23.9099 11.88 24.1668C11.6191 24.4237 11.2955 24.5513 10.9091 24.5495H2.72727ZM19.3295 13.8828H9.54545C9.15909 13.8828 8.83545 13.7548 8.57455 13.4988C8.31364 13.2428 8.18273 12.9264 8.18182 12.5495C8.18091 12.1726 8.31182 11.8562 8.57455 11.6002C8.83727 11.3442 9.16091 11.2162 9.54545 11.2162H19.3295L16.7727 8.71616C16.5227 8.47172 16.3977 8.17172 16.3977 7.81616C16.3977 7.46061 16.5227 7.14949 16.7727 6.88283C17.0227 6.61616 17.3409 6.47705 17.7273 6.46549C18.1136 6.45394 18.4432 6.58194 18.7159 6.84949L23.5909 11.6162C23.8636 11.8828 24 12.1939 24 12.5495C24 12.905 23.8636 13.2162 23.5909 13.4828L18.7159 18.2495C18.4432 18.5162 18.1195 18.6442 17.745 18.6335C17.3705 18.6228 17.0464 18.4837 16.7727 18.2162C16.5227 17.9495 16.4036 17.633 16.4155 17.2668C16.4273 16.9006 16.5577 16.5948 16.8068 16.3495L19.3295 13.8828Z" fill="#E62E2E"/>
      </svg>
      <span>Déconnexion</span>
  `;

  logout.addEventListener("click", logoutLogic);

  navbar.appendChild(logo);
  navbar.appendChild(navItems);
  navbar.appendChild(logout);

  // Insert navbar at the beginning of body
  body.insertBefore(navbar, body.firstChild);

  createTopBar();

}


async function createTopBar() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      console.error("Utilisateur non trouvé.");
      return;
    }

    const topBar = document.createElement("div");
    topBar.className = "top-bar";

    // Conteneur pour la date et la batterie
    const dateBatteryContainer = document.createElement("div");
    dateBatteryContainer.className = "top-bar--date-battery";

    // Création du conteneur principal pour la date et l'icône
    const dateElement = document.createElement("span");
    dateElement.className = "top-bar--date";

    // Ajout de la date
    const currentDate = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    dateElement.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.66667 0C8.82996 2.15404e-05 8.98756 0.0599708 9.10958 0.168477C9.2316 0.276983 9.30956 0.426499 9.32867 0.588667L9.33333 0.666667V1.33333H10.6667C11.0031 1.33323 11.327 1.46027 11.5737 1.689C11.8204 1.91772 11.9714 2.23123 11.9967 2.56667L12 2.66667V10.6667C12.0001 11.0031 11.8731 11.327 11.6443 11.5737C11.4156 11.8204 11.1021 11.9714 10.7667 11.9967L10.6667 12H1.33333C0.996949 12.0001 0.672956 11.8731 0.426301 11.6443C0.179647 11.4156 0.0285623 11.1021 0.00333348 10.7667L6.68453e-08 10.6667V2.66667C-0.000106386 2.33028 0.126938 2.00629 0.355665 1.75963C0.584392 1.51298 0.897896 1.3619 1.23333 1.33667L1.33333 1.33333H2.66667V0.666667C2.66686 0.496747 2.73192 0.333312 2.84857 0.209754C2.96521 0.0861971 3.12464 0.0118433 3.29426 0.00188526C3.46389 -0.00807283 3.63092 0.0471164 3.76122 0.156177C3.89152 0.265237 3.97526 0.419936 3.99533 0.588667L4 0.666667V1.33333H8V0.666667C8 0.489856 8.07024 0.320286 8.19526 0.195262C8.32029 0.0702379 8.48986 0 8.66667 0ZM10.6667 6H1.33333V10.6667H10.6667V6Z" fill="#6D6D6D"/>
      </svg>` + currentDate;

    // Ajout de l'icône et de la date dans le conteneur principal
    dateBatteryContainer.appendChild(dateElement);


    // Ajout du statut de la batterie
    await displayBatteryStatus(dateBatteryContainer);

    // Ajout du conteneur date/batterie à la topBar
    topBar.appendChild(dateBatteryContainer);

    // Conteneur pour le profil utilisateur et le mode plein écran
    const userFullscreenContainer = document.createElement("div");
    userFullscreenContainer.className = "top-bar--user-fullscreen";

    // Informations utilisateur
    const userInfo = document.createElement("a");
    userInfo.href = "./profile.html";
    userInfo.className = "top-bar--user";

    const userImage = document.createElement("img");
    userImage.src = user.picture || "./assets/user.svg";
    userImage.alt = "User Image";
    userImage.className = "user-image";

    const userName = document.createElement("span");
    userName.className = "user-name";
    userName.textContent = `${user.firstname} ${user.lastname}`;

    userInfo.appendChild(userImage);
    userInfo.appendChild(userName);

    // Ajout des informations utilisateur au conteneur
    userFullscreenContainer.appendChild(userInfo);

    // Bouton plein écran
    const fullscreenButton = document.createElement("button");
    fullscreenButton.id = "fullscreenButton";
    fullscreenButton.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1.77778 14.2222H3.55555C3.8074 14.2222 4.01866 14.3075 4.18933 14.4782C4.36 14.6489 4.44503 14.8598 4.44444 15.1111C4.44385 15.3624 4.35852 15.5736 4.18844 15.7449C4.01837 15.9161 3.8074 16.0012 3.55555 16H0.888888C0.637037 16 0.426074 15.9147 0.256 15.744C0.085926 15.5733 0.000592592 15.3624 0 15.1111V12.4444C0 12.1926 0.0853334 11.9816 0.256 11.8115C0.426666 11.6415 0.637629 11.5561 0.888888 11.5555C1.14015 11.555 1.35141 11.6403 1.52267 11.8115C1.69392 11.9828 1.77896 12.1938 1.77778 12.4444V14.2222ZM14.2222 14.2222V12.4444C14.2222 12.1926 14.3075 11.9816 14.4782 11.8115C14.6489 11.6415 14.8598 11.5561 15.1111 11.5555C15.3624 11.555 15.5736 11.6403 15.7449 11.8115C15.9161 11.9828 16.0012 12.1938 16 12.4444V15.1111C16 15.363 15.9147 15.5742 15.744 15.7449C15.5733 15.9155 15.3624 16.0006 15.1111 16H12.4444C12.1926 16 11.9816 15.9147 11.8115 15.744C11.6415 15.5733 11.5561 15.3624 11.5555 15.1111C11.555 14.8598 11.6403 14.6489 11.8115 14.4782C11.9828 14.3075 12.1938 14.2222 12.4444 14.2222H14.2222ZM1.77778 1.77778V3.55555C1.77778 3.8074 1.69244 4.01866 1.52178 4.18933C1.35111 4.36 1.14015 4.44503 0.888888 4.44444C0.637629 4.44385 0.426666 4.35852 0.256 4.18844C0.0853334 4.01837 0 3.8074 0 3.55555V0.888888C0 0.637037 0.0853334 0.426074 0.256 0.256C0.426666 0.085926 0.637629 0.000592592 0.888888 0H3.55555C3.8074 0 4.01866 0.0853334 4.18933 0.256C4.36 0.426666 4.44503 0.637629 4.44444 0.888888C4.44385 1.14015 4.35852 1.35141 4.18844 1.52267C4.01837 1.69392 3.8074 1.77896 3.55555 1.77778H1.77778ZM14.2222 1.77778H12.4444C12.1926 1.77778 11.9816 1.69244 11.8115 1.52178C11.6415 1.35111 11.5561 1.14015 11.5555 0.888888C11.555 0.637629 11.6403 0.426666 11.8115 0.256C11.9828 0.0853334 12.1938 0 12.4444 0H15.1111C15.363 0 15.5742 0.0853334 15.7449 0.256C15.9155 0.426666 16.0006 0.637629 16 0.888888V3.55555C16 3.8074 15.9147 4.01866 15.744 4.18933C15.5733 4.36 15.3624 4.44503 15.1111 4.44444C14.8598 4.44385 14.6489 4.35852 14.4782 4.18844C14.3075 4.01837 14.2222 3.8074 14.2222 3.55555V1.77778Z" fill="#6D6D6D"/>
      </svg>
      `;
    userFullscreenContainer.appendChild(fullscreenButton);

    fullscreenButton.addEventListener("click", toggleFullscreen);

    // Ajout du conteneur utilisateur/plein écran à la topBar
    topBar.appendChild(userFullscreenContainer);

    // Ajout de la topBar à la page
    document.body.prepend(topBar);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur", error);
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}
