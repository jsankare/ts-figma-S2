import { getCurrentUser } from "./utils/getCurrentUser.js";
import { openDatabase } from "./utils/openDatabase.js";
import { logoutLogic } from "./utils/logout.js";
import { uploadImage } from "./utils/uploadImage.js";
import { displayLoading } from "./utils/displayLoading.js";
import { alert } from "./utils/alert.js";

displayLoading(true);
async function displayUserProfile() {
  try {
    const db = await openDatabase();
    const userEmail = localStorage.getItem("userMail");
    if (!userEmail) {
      console.error("Aucun utilisateur connecté.");
      window.location.href = "login.html";
      return;
    }
    const user = await getCurrentUser(db, userEmail);

    if (!user) {
      console.error("Utilisateur introuvable.");
      window.location.href = "login.html";
      return;
    }
    displayLoading(false);

    const usernameElement = document.getElementById(
      "profile--username",
    ) as HTMLHeadingElement;
    usernameElement.textContent = `Coucou ${user.firstname} !`;

    const profilePicture = document.getElementById(
      "profile--picture",
    ) as HTMLImageElement;
    const addProfileButton = document.getElementById(
      "button--addProfilePicture",
    ) as HTMLFormElement;

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

    if (user.picture) {
      profilePicture.src = user.picture;
      profilePicture.style.display = "block";
      addProfileButton.style.display = "none";
      if (deletePicture) {
        deletePicture.style.display = "block";
        deletePicture.addEventListener("click", async () => {
          try {
            await updateUserProfilePicture(db, userEmail, "");
            profilePicture.src = "";
            profilePicture.style.display = "none";
            addProfileButton.style.display = "flex";
            deletePicture.style.display = "none";
          } catch (error) {
            alert(
              "error",
              "Erreur lors de la suppression de la photo de profil",
            );
          }
        });
      }
    } else {
      profilePicture.style.display = "none";
      addProfileButton.style.display = "flex";
      if (deletePicture) deletePicture.style.display = "none";

      addProfileButton.addEventListener("submit", async (event) => {
        event.preventDefault();
        const fileInput = document.getElementById("myfile") as HTMLInputElement;

        if (fileInput.files?.length) {
          const file = fileInput.files[0];

          const fileName = file.name.split(".")[0];
          const fileType = file.type.split("/")[1];
          const fileSize = file.size / 1024;

          fileNameElement.textContent = `Nom du fichier : ${fileName}`;
          fileTypeElement.textContent = `Type de fichier : ${fileType}`;
          fileSizeElement.textContent = `Taille du fichier : ${fileSize.toFixed(2)} ko (Ancienne norme)`;
          try {
            const pictureDataUrl = await uploadImage(file);
            await updateUserProfilePicture(db, userEmail, pictureDataUrl);
            profilePicture.src = pictureDataUrl;
            profilePicture.style.display = "block";
            addProfileButton.style.display = "none";
          } catch (error) {
            alert(
              "error",
              "Erreur lors de la mise à jour de la photo de profil",
            );
          }
        }
      });
    }
  } catch (error) {
    console.error(
      "Erreur lors de l'affichage des informations de l'utilisateur",
      error,
    );
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

    const userRequest = store.get(email);

    userRequest.onsuccess = () => {
      const user = userRequest.result;
      if (user) {
        user.picture = pictureDataUrl;
        const updateRequest = store.put(user);
        updateRequest.onsuccess = () => {
          console.log("Image de profil mise à jour avec succès");
          resolve();
        };
        updateRequest.onerror = () => {
          reject("Erreur lors de la mise à jour de l'image de profil");
        };
      } else {
        reject("Utilisateur introuvable");
      }
    };

    userRequest.onerror = () => {
      reject("Erreur lors de la récupération de l'utilisateur");
    };
  });
}

const buttonLabels = ["settings", "passwordReset", "logout", "deleteAccount"];
const buttons: { [key: string]: HTMLElement | null } = {};

buttonLabels.forEach((label) => {
  buttons[`${label}Button`] = document.getElementById(`button--${label}`);
});

buttons.settingsButton?.addEventListener("click", () => {
  console.log("hello settings");
});

buttons.passwordResetButton?.addEventListener("click", () => {
  console.log("hello password reset");
});

buttons.logoutButton?.addEventListener("click", () => {
  logoutLogic();
});

buttons.deleteAccountButton?.addEventListener("click", () => {
  alert("success", "Ceci est le contenu de mon alerte");
});

document.addEventListener("DOMContentLoaded", () => {
  displayUserProfile();
});
