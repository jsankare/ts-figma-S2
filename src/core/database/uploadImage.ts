import { User } from "../database/types.js";
import { toastAlert } from "../../shared/components/alert.js";
import { showNotification } from "../../utils/notification.js";
import { updateItem } from "./dbUtils.js";


export async function uploadImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject("Erreur lors de la lecture du fichier");
    };

    reader.readAsDataURL(file);
  });
}

export async function uploadValidatedImage(file: File): Promise<string> {
  const validTypes: string[] = ["image/jpeg", "image/png", "image/gif"];  // Assurez-vous que c'est un tableau de chaînes
  const maxSize = 5 * 1024 * 1024; // 5 Mo

  if (!validTypes.includes(file.type)) {  // "includes" fonctionne sur un tableau de chaînes
    throw new Error("Type de fichier non valide. Seules les images JPEG, PNG, et GIF sont acceptées.");
  }

  if (file.size > maxSize) {
    throw new Error("Le fichier est trop volumineux. La taille maximale est de 5 Mo.");
  }

  return uploadImage(file);
}

export async function handleUploadPicture(
  user: User,
  profilePicture: HTMLImageElement,
  addProfileButton: HTMLElement,
) {
  const fileInput = document.getElementById("myfile") as HTMLInputElement;

  if (!fileInput || !fileInput.files?.length) {
    toastAlert("error", "Aucune image n'a été détectée.");
    return;
  }

  const file = fileInput.files[0];

  const modal = document.querySelector(
    ".fromProfilePicture.modal",
  ) as HTMLDivElement;

  try {
    const pictureDataUrl = await uploadImage(file);
    await updateItem('users', user.id, {picture: pictureDataUrl});

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
}