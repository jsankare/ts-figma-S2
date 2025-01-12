import { getCurrentUser } from "../core/auth/getCurrentUser.js";
import { openDatabase, getAllItems } from "../core/database/openDatabase.js";
import { logoutLogic } from "../core/auth/logout.js";
import { uploadImage } from "../core/database/uploadImage.js";
// import { displayLoading } from "./utils/displayLoading.js";
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
        await handleUploadPicture(db, userEmail, profilePicture);
      });
    }
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
) {
  const fileInput = document.getElementById("myfile") as HTMLInputElement;
  const modal = document.querySelector(
    ".fromProfilePicture.modal",
  ) as HTMLDivElement;

  if (fileInput.files?.length) {
    const file = fileInput.files[0];
    try {
      const pictureDataUrl = await uploadImage(file);
      await updateUserProfilePicture(db, email, pictureDataUrl);

      if (profilePicture) {
        profilePicture.src = pictureDataUrl;
        profilePicture.style.display = "block";
      }

      const addProfileButton = document.querySelector(
        ".button--addProfilePicture",
      ) as HTMLButtonElement;
      if (addProfileButton) {
        addProfileButton.style.display = "none";
      }

      if (modal) {
        modal.style.display = "none";
      }

      showNotification("Votre site vous informe", {
        body: "Votre image de profil a bien été mise à jour",
        icon: "/assets/logo_no_bg.svg",
        requireInteraction: false,
      });

      toastAlert("success", "Photo de profil mise à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la photo :", error);
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
    console.log("test");
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

document
  .getElementById("start-camera-button")
  ?.addEventListener("click", startCamera);

document.getElementById("take-photo-button")?.addEventListener("click", () => {
  const video = document.getElementById("video") as HTMLVideoElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;
  if (video && canvas) {
    takePicture(video, canvas, stream);
  } else {
    toastAlert("error", "Éléments vidéo ou canvas introuvables.");
  }
});

let stream: MediaStream | null = null;

async function startCamera() {
  const video = document.getElementById("video") as HTMLVideoElement;
  const canvas = document.getElementById("canvas") as HTMLCanvasElement;

  try {
    // Request access to the camera
    stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;

    // Show the button to take a photo
    document
      .getElementById("take-photo-button")
      ?.style.setProperty("display", "block");

    // Hide the button to start the camera
    document
      .getElementById("start-camera-button")
      ?.style.setProperty("display", "none");
  } catch (error) {
    toastAlert("error", "Erreur lors de l'accès à la caméra.");
    console.error("Erreur caméra:", error);
  }
}

function takePicture(
  video: HTMLVideoElement,
  canvas: HTMLCanvasElement,
  stream: MediaStream | null,
) {
  if (!stream) {
    toastAlert("error", "Flux de caméra non initialisé.");
    return;
  }

  const context = canvas.getContext("2d");
  if (!context) {
    toastAlert("error", "Impossible de récupérer le contexte du canvas.");
    return;
  }

  // Verify the video has a size
  if (video.videoWidth === 0 || video.videoHeight === 0) {
    toastAlert(
      "error",
      "Erreur : la vidéo n'a pas encore été chargée ou l'image est vide.",
    );
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  // Draw the video stream image onto the canvas
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  // Convert the canvas image to a base64 string for upload
  const pictureDataUrl = canvas.toDataURL("image/jpeg");
  const userEmail = localStorage.getItem("userMail");
  console.log("Email de l'utilisateur récupéré : ", userEmail);

  // Stop the camera stream
  const tracks = stream.getTracks();
  tracks.forEach((track) => track.stop());

  if (userEmail) {
    // Update the profile picture with the taken photo
    openDatabase("UserDatabase", "users").then((db) => {
      updateUserProfilePicture(db, userEmail, pictureDataUrl)
        .then(() => {
          const profilePicture = document.getElementById(
            "profile--picture",
          ) as HTMLImageElement;
          profilePicture.src = pictureDataUrl;
          profilePicture.style.display = "block";
          toastAlert(
            "success",
            "Votre photo de profil a bien été mise à jour.",
          );
        })
        .catch((error) => {
          toastAlert(
            "error",
            "Erreur lors de la mise à jour de la photo de profil.",
          );
          console.error("Erreur lors de la mise à jour:", error);
        });
    });
  } else {
    toastAlert("error", "Utilisateur non connecté.");
  }
}
