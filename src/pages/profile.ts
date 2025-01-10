import { getCurrentUser } from "../core/auth/getCurrentUser.js";
import { openDatabase, getAllItems } from "../core/database/openDatabase.js";
import { logoutLogic } from "../core/auth/logout.js";
import { uploadImage } from "../core/database/uploadImage.js";
import { toastAlert } from "../shared/components/alert.js";
import { showNotification } from "../utils/notification.js";
import { displayPasswordResetForm } from "../shared/components/passwordReset.js";
import { displayAccountSettingsForm } from "../shared/components/userSetting.js";
import isVisible from "../utils/visibility.js";

displayUserProfile();

async function displayUserProfile() {
  console.time("profile");
  isVisible();
  try {
    const db = await openDatabase("UserDatabase", "users");
    const userEmail = localStorage.getItem("userMail");

    if (!userEmail) {
      console.error("Aucun utilisateur connecté.");
      logoutLogic();
      return;
    }

    const user = await getCurrentUser(db, userEmail);

    if (!user) {
      console.error("Utilisateur introuvable.");
      logoutLogic();
      return;
    }

    updateUserProfileUI(user, db, userEmail);
    displayAccountSettingsForm(user);
    initializeButtons(user);
  } catch (error) {
    console.error(
      "Erreur lors de l'affichage des informations de l'utilisateur:",
      error,
    );
  }
  console.timeEnd("profile");
}

async function updateUserProfileUI(
  user: any,
  db: IDBDatabase,
  userEmail: string,
) {
  const usernameElement = document.getElementById(
    "profile--username",
  ) as HTMLHeadingElement;
  const totalTransactions = document.getElementById(
    "profile_transactions",
  ) as HTMLParagraphElement;
  const activeBudget = document.getElementById(
    "profile_active_budget",
  ) as HTMLParagraphElement;
  const totalCategories = document.getElementById(
    "profile_categories",
  ) as HTMLParagraphElement;
  const creationDateElement = document.getElementById(
    "profile_date",
  ) as HTMLParagraphElement;
  const profilePicture = document.getElementById(
    "profile--picture",
  ) as HTMLImageElement;
  const addProfileButton = document.querySelector(
    ".button--addProfilePicture",
  ) as HTMLButtonElement;
  const modal = document.querySelector(
    ".fromProfilePicture.modal",
  ) as HTMLDivElement;
  const form = document.getElementById(
    "button--addProfilePicture",
  ) as HTMLFormElement;

  if (usernameElement) {
    usernameElement.textContent = `${user.firstname} ${user.lastname}`;
  }

  if (creationDateElement) {
    const options = { year: "numeric", month: "long", day: "numeric" };
    const formattedDate = new Intl.DateTimeFormat("fr-FR", options).format(
      new Date(user.createdAt),
    );
    creationDateElement.textContent = `Membre depuis le ${formattedDate}`;
  }

  // Profile picture handling
  if (profilePicture) {
    if (user.picture) {
      profilePicture.src = user.picture;
      profilePicture.style.display = "block";
      addProfileButton.style.display = "none";
    } else {
      profilePicture.src = "./assets/default-user.svg";
      profilePicture.style.display = "block";
      addProfileButton.style.display = "block";
    }
  }

  // Modal and form handling
  if (addProfileButton && modal) {
    addProfileButton.addEventListener("click", () => {
      modal.style.display = "flex";
      form.style.display = "flex";
    });

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.style.display = "none";
        form.style.display = "none";
      }
    });
  }

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      await handleUploadPicture(
        db,
        userEmail,
        profilePicture,
        addProfileButton,
      );
      modal.style.display = "none";
      form.style.display = "none";
    });
  }

  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const transactions = await getAllItems(
      "TransactionDatabase",
      "transactions",
    );
    const filteredTransactions = transactions.filter(
      (transaction) => transaction.userId === user.id,
    );

    if (totalTransactions) {
      totalTransactions.textContent = `${filteredTransactions.length}`;
    }

    const budgets = await getAllItems("BudgetDatabase", "budgets");
    const filteredBudgets = budgets.filter((budget) => {
      return (
        budget.userId === user.id &&
        budget.month === currentMonth &&
        budget.year === currentYear
      );
    });

    if (activeBudget) {
      activeBudget.textContent = `${filteredBudgets.length}`;
    }

    const categories = await getAllItems("CategoryDatabase", "categories");
    const filteredCategories = categories.filter(
      (category) => category.userId === user.id,
    );

    if (totalCategories) {
      totalCategories.textContent = `${filteredCategories.length}`;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil :", error);
  }
}

async function handleUploadPicture(
  db: IDBDatabase,
  email: string,
  profilePicture: HTMLImageElement,
  addProfileButton: HTMLElement,
) {
  const fileInput = document.getElementById("myfile") as HTMLInputElement;
  if (fileInput.files?.length) {
    const file = fileInput.files[0];

    try {
      const pictureDataUrl = await uploadImage(file);
      await updateUserProfilePicture(db, email, pictureDataUrl);
      profilePicture.src = pictureDataUrl;
      profilePicture.style.display = "block";
      addProfileButton.style.display = "none";
      showNotification("Votre site vous informe", {
        body: "Votre image de profil a bien été mise à jour",
        icon: "/assets/logo_no_bg.svg",
        requireInteraction: false,
      });
      toastAlert("success", "Photo de profil mise à jour avec succès");
    } catch (error) {
      toastAlert(
        "error",
        "Erreur lors de la mise à jour de la photo de profil",
      );
    }
  } else {
    toastAlert("error", "Aucune image n'a été sélectionnée");
  }
}

async function updateUserProfilePicture(
  db: IDBDatabase,
  email: string,
  pictureDataUrl: string,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const index = store.index("email");
    const userRequest = index.get(email);

    userRequest.onsuccess = () => {
      const user = userRequest.result;
      if (user) {
        user.picture = pictureDataUrl;
        user.updatedAt = new Date();
        const updateRequest = store.put(user);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () =>
          reject("Erreur lors de la mise à jour de l'image de profil");
      } else {
        reject("Utilisateur introuvable");
      }
    };

    userRequest.onerror = () =>
      reject("Erreur lors de la récupération de l'utilisateur");
  });
}

function initializeButtons(user: any) {
  const buttonLabels = ["settings", "passwordReset", "logout", "deleteAccount"];
  const buttons: { [key: string]: HTMLElement | null } = {};

  buttonLabels.forEach((label) => {
    buttons[`${label}Button`] = document.getElementById(`button--${label}`);
  });

  buttons.settingsButton?.addEventListener("click", () => {
    displayAccountSettingsForm(user);
  });

  buttons.passwordResetButton?.addEventListener("click", () => {
    displayPasswordResetForm();
  });

  buttons.logoutButton?.addEventListener("click", () => {
    logoutLogic();
  });

  buttons.deleteAccountButton?.addEventListener("click", () => {
    showDeleteAccountModal(user.id);
  });
}

function showDeleteAccountModal(userId: string) {
  const confirmation = window.confirm(
    "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
  );
  if (confirmation) {
    deleteUserAccount(userId);
  }
}

async function deleteUserAccount(id: string) {
  try {
    const db = await openDatabase("UserDatabase", "users");
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const deleteRequest = store.delete(id);

    deleteRequest.onsuccess = () => {
      toastAlert("success", "Votre compte a bien été supprimé");
      logoutLogic();
    };

    deleteRequest.onerror = () => {
      toastAlert("error", "Erreur lors de la suppression du compte");
    };
  } catch (error) {
    console.error("Erreur lors de la suppression du compte:", error);
    toastAlert("error", "Une erreur est survenue");
  }
}
