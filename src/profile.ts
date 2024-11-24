import { getCurrentUser } from "./utils/getCurrentUser.js";
import { openDatabase } from "./utils/openDatabase.js";
import { logoutLogic } from "./utils/logout.js";
import { uploadImage } from "./utils/uploadImage.js";
import { toastAlert } from "./utils/alert.js";
import { showNotification } from "./utils/notification.js";

async function displayUserProfile() {
  try {
    const db = await openDatabase();
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

    const usernameElement = document.getElementById(
      "profile--username",
    ) as HTMLHeadingElement;
    usernameElement.textContent = `${user.firstname} ${user.lastname}`;

    const profilePicture = document.getElementById(
      "profile--picture",
    ) as HTMLImageElement;
    const addProfileButton = document.getElementById(
      "button--addProfilePicture",
    ) as HTMLFormElement;
    const uploadOverlay = document.getElementById("upload-overlay");
    const changePhotoButton = document.getElementById("change-photo");
    const deletePicture = document.getElementById("delete-picture");
    const fileNameElement = document.getElementById(
      "file-name",
    ) as HTMLParagraphElement;
    const fileTypeElement = document.getElementById(
      "file-type",
    ) as HTMLParagraphElement;
    const fileSizeElement = document.getElementById(
      "file-size",
    ) as HTMLParagraphElement;

    // Profile picture handling
    if (user.picture) {
      profilePicture.src = user.picture;
      if (deletePicture) {
        deletePicture.style.display = "block";
        deletePicture.addEventListener("click", async () => {
          try {
            await updateUserProfilePicture(db, userEmail, "");
            profilePicture.src = "/assets/user_default.svg";
            deletePicture.style.display = "none";
            showNotification("Photo supprimée", {
              body: "Votre photo de profil a été supprimée avec succès",
              icon: "/assets/logo_no_bg.svg",
            });
          } catch (error) {
            toastAlert("error", "Erreur lors de la suppression de la photo");
          }
        });
      }
    } else {
      profilePicture.src = "/assets/user_default.svg";
      if (deletePicture) deletePicture.style.display = "none";
    }

    // Change photo button handling
    if (changePhotoButton && uploadOverlay) {
      changePhotoButton.addEventListener("click", () => {
        addProfileButton.classList.add("visible");
        uploadOverlay.classList.add("visible");
      });

      uploadOverlay.addEventListener("click", (e) => {
        if (e.target === uploadOverlay) {
          addProfileButton.classList.remove("visible");
          uploadOverlay.classList.remove("visible");
        }
      });
    }

    // File upload handling
    addProfileButton.addEventListener("submit", async (event) => {
      event.preventDefault();
      const fileInput = document.getElementById("myfile") as HTMLInputElement;

      if (fileInput.files?.length) {
        const file = fileInput.files[0];
        const fileName = file.name.split(".")[0];
        const fileType = file.type.split("/")[1];
        const fileSize = (file.size / 1024).toFixed(2);

        fileNameElement.textContent = `Nom: ${fileName}`;
        fileTypeElement.textContent = `Type: ${fileType}`;
        fileSizeElement.textContent = `Taille: ${fileSize} KB`;

        try {
          const pictureDataUrl = await uploadImage(file);
          await updateUserProfilePicture(db, userEmail, pictureDataUrl);
          profilePicture.src = pictureDataUrl;
          if (deletePicture) deletePicture.style.display = "block";
          addProfileButton.classList.remove("visible");
          uploadOverlay?.classList.remove("visible");

          showNotification("Photo mise à jour", {
            body: "Votre photo de profil a été mise à jour avec succès",
            icon: "/assets/logo_no_bg.svg",
          });
        } catch (error) {
          toastAlert("error", "Erreur lors de la mise à jour de la photo");
        }
      } else {
        toastAlert("error", "Veuillez sélectionner une image");
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'affichage du profil:", error);
    toastAlert("error", "Erreur lors du chargement du profil");
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
    const request = store.get(email);

    request.onsuccess = () => {
      const user = request.result;
      if (user) {
        user.picture = pictureDataUrl;
        const updateRequest = store.put(user);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () =>
          reject("Erreur lors de la mise à jour de l'image");
      } else {
        reject("Utilisateur introuvable");
      }
    };

    request.onerror = () =>
      reject("Erreur lors de la récupération de l'utilisateur");
  });
}

// Settings modal handling
const settingsButton = document.getElementById("button--settings");
const settingsModal = document.getElementById("settings-modal");
const closeSettings = document.getElementById("close-settings");

if (settingsButton && settingsModal && closeSettings) {
  settingsButton.addEventListener("click", () => {
    settingsModal.classList.add("visible");
  });

  closeSettings.addEventListener("click", () => {
    settingsModal.classList.remove("visible");
  });

  window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove("visible");
    }
  });
}

// Other button handlers
const buttonLabels = ["passwordReset", "logout", "deleteAccount"];
const buttons: { [key: string]: HTMLElement | null } = {};

buttonLabels.forEach((label) => {
  buttons[`${label}Button`] = document.getElementById(`button--${label}`);
});

buttons.passwordResetButton?.addEventListener("click", () => {
  toastAlert(
    "error",
    "Fonctionnalité de réinitialisation du mot de passe à venir",
  );
});

buttons.logoutButton?.addEventListener("click", () => {
  logoutLogic();
});

buttons.deleteAccountButton?.addEventListener("click", () => {
  const confirmed = confirm(
    "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.",
  );
  if (confirmed) {
    toastAlert("error", "Fonctionnalité de suppression de compte à venir");
  }
});

document.addEventListener("DOMContentLoaded", () => {
  displayUserProfile();
});
