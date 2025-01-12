import { getCurrentUser } from "../core/auth/handleUser.js";
import { getAllItems } from "../core/database/dbUtils.js";
import { logoutLogic } from "../core/auth/logoutLogic.js";
import { takePicture, startCamera } from "../utils/cameraUtils.js";
import { toastAlert } from "../shared/components/alert.js";
import { displayPasswordResetForm } from "../shared/components/passwordReset.js";
import { displayAccountSettingsForm } from "../shared/components/userSetting.js";
import isVisible from "../utils/visibility.js";
import { Budget, Transaction, Category } from "../core/database/types";
import { deleteItem } from "../core/database/dbUtils.js";
import { handleUploadPicture } from "../core/database/uploadImage.js";

displayUserProfile();

async function displayUserProfile() {
  console.time("profile");
  isVisible();
  try {

    const user = await getCurrentUser();

    if (!user) {
      console.error("Utilisateur introuvable.");
      logoutLogic();
      return;
    }

    updateUserProfileUI(user, user.email);
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

  if (usernameElement) {
    usernameElement.textContent = `${user.firstname} ${user.lastname}`;
  }

  if (creationDateElement) {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formattedDate = new Intl.DateTimeFormat("fr-FR", options).format(
      new Date(user.createdAt),
    );
    creationDateElement.textContent = `Membre depuis le ${formattedDate}`;
  }

  if (profilePicture) {
    if (user.picture) {
      profilePicture.src = user.picture;
      profilePicture.style.display = "block";
      if (addProfileButton) {
        addProfileButton.style.display = "none";
      }
    } else {
      profilePicture.src = "./assets/default-user.svg";
      profilePicture.style.display = "block";
      if (addProfileButton) {
        addProfileButton.style.display = "block";
      }
    }
  }

  if (addProfileButton) {
    addProfileButton.addEventListener("click", () => {
      if (modal) {
        modal.style.display = "flex";
      }
    });

    const form = document.getElementById(
      "button--addProfilePicture",
    ) as HTMLFormElement;
    if (form) {
      form.style.display = "block";
      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        await handleUploadPicture(user.email, profilePicture);
      });
    }
  }

  try {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const transactions = await getAllItems(
      "transactions",
    );
    const filteredTransactions = transactions.filter(
      (transaction) => transaction.userId === user.id,
    );

    if (totalTransactions) {
      totalTransactions.textContent = `${filteredTransactions.length}`;
    }

    const budgets = await getAllItems("budgets");
    const filteredBudgets = budgets.filter(
      (item: Category | Transaction | Budget) => {
        if ("userId" in item && "month" in item && "year" in item) {
          return (
            item.userId === user.id &&
            item.month === currentMonth &&
            item.year === currentYear
          );
        }
        return false;
      },
    );

    if (activeBudget) {
      activeBudget.textContent = `${filteredBudgets.length}`;
    }

    const categories = await getAllItems("categories");
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
    displayPasswordResetForm(user);
  });

  buttons.logoutButton?.addEventListener("click", () => {
    logoutLogic();
  });

  buttons.deleteAccountButton?.addEventListener("click", () => {
    showDeleteAccountModal(user.id);
  });
}

function showDeleteAccountModal(userId: number) {
  const confirmation = window.confirm(
    "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
  );
  if (confirmation) {
    deleteItem('users', userId);
  }
}

document
  .getElementById("start-camera-button")
  ?.addEventListener("click", startCamera);

let stream: MediaStream | null = null;

document.getElementById("take-photo-button")?.addEventListener("click", () => {
  const video = document.getElementById("video") as HTMLVideoElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (video && canvas) {
    takePicture(video, canvas, stream);
  } else {
    toastAlert("error", "Éléments vidéo ou canvas introuvables.");
  }
});
