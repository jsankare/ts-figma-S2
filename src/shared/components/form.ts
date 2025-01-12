import { addItem } from "../../core/database/dbUtils.js";
import { toastAlert } from "./alert.js";
import { uploadImage } from "../../core/database/uploadImage.js";
import { Budget, Category, Transaction } from "../../core/database/types.js";
import { getCurrentUser } from "../../core/auth/handleUser.js";
import { updateListing, updateMonthLabel } from "./listing.js";

// Gérer la soumission du formulaire
export async function handleFormSubmit(
  formId: string,
  listingId: string,
  storeName: string,
  requiredFields: string[],
  optionalFields: string[] = [],
) {
  const form = document.getElementById(formId) as HTMLFormElement;

  if (!form) {
    console.warn(`Form with ID: ${formId} not found`);
    return;
  }

  console.log(`Form found: ${formId}`);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    console.log("Form submission started");

    const formData = new FormData(form);
    let item: { [key: string]: any } = {};

    // Collecter les données du formulaire
    requiredFields.concat(optionalFields).forEach((field) => {
      const value = formData.get(field);
      if (value) {
        item[field] = value;
      }
    });

    let user = await getCurrentUser();
    item.userId = user?.id;

    // Gérer la case à cocher d'alerte
    if (storeName === "budgets") {
      const alertCheckbox = form.querySelector(
        'input[name="alert"]',
      ) as HTMLInputElement | null;
      item.alert = alertCheckbox?.checked || false;
    }

    // Convertir les champs spécifiques en nombre
    const numericFields = ["category", "amount", "budget", "month", "year"];
    numericFields.forEach((field) => {
      if (item[field]) {
        item[field] = Number(item[field]);
        if (isNaN(item[field])) {
          console.warn(`Field "${field}" could not be converted to a number`);
          delete item[field];
        }
      }
    });

    // Valider les champs obligatoires
    for (const field of requiredFields) {
      if (!item[field]) {
        console.error(`Required field missing: ${field}`);
        toastAlert("error", `Field "${field}" is required.`);
        return;
      }
    }

    // Convertir `category` en nombre si nécessaire
    if (item.category) {
      item.category = Number(item.category);
    }

    // Récupérer l'icône existante
    const existingIcon = formData.get("existingIcon");
    if (existingIcon) {
      item.icon = existingIcon;
    }

    // Gérer le téléchargement de fichiers
    const fileInput = form.querySelector("#file-input") as HTMLInputElement;
    const svgIconInput = form.querySelector("#iconPreview") as HTMLInputElement;
    if (svgIconInput && svgIconInput.src) {
      console.log(svgIconInput);
      console.log("icon chosen");
      console.log(svgIconInput.src);
      try {
        item.icon = svgIconInput.src;
      } catch (error) {
        console.error("Error uploading image:", error);
        toastAlert("error", "Error uploading the image. Please try again.");
        return;
      }
    } else {
      if (fileInput && fileInput.files?.length) {
        const file = fileInput.files[0];
        const maxSize = 5 * 1024 * 1024; // Taille maximale en octets (ex. 5 Mo)
        const allowedTypes = ["image/jpeg", "image/png", "image/gif"]; // Types MIME autorisés

        // Vérification de la taille et du type de fichier
        if (file.size > maxSize) {
          console.error("File is too large.");
          toastAlert(
            "error",
            "The selected file is too large. Please select a file smaller than 5 MB.",
          );
          return;
        }

        if (!allowedTypes.includes(file.type)) {
          toastAlert(
            "error",
            "Invalid file type. Please upload a JPEG, PNG, or GIF image.",
          );
          return;
        }

        console.log("File selected for upload:", file);

        try {
          item.icon = await uploadImage(file);
        } catch (error) {
          toastAlert("error", "Error uploading the image. Please try again.");
          return;
        }
      }
    }

    console.log("Prepared item for DB:", item);

    try {
      const hiddenIdInput = form.querySelector(
        'input[type="hidden"][name="id"]',
      ) as HTMLInputElement;
      const isUpdate = hiddenIdInput && hiddenIdInput.value.trim() !== "";
      console.log(isUpdate);
      // Ajouter l'élément dans la base de données
      await addItem(storeName, item, formData);
      form.reset();
      
      // Réinitialiser les champs cachés
      const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
      hiddenInputs.forEach((input) => {
        (input as HTMLInputElement).value = "";
      });

      // Fermer la modale
      const modalContent = document.getElementById("modal") as HTMLElement;
      if (modalContent) {
        modalContent.style.display = "none";
        const selectedIcons = modalContent.querySelectorAll(".wrapper-icon.selected");
        if (selectedIcons) {
          selectedIcons.forEach((icon) => icon.classList.remove("selected"));
        }
        const actualIcon = modalContent.querySelector(".actualIcon") as HTMLElement;
        if (actualIcon){
          actualIcon.style.display = "none";
        }
        const fileNameDisplay = document.querySelector(".file-name");
        if(fileNameDisplay){
          fileNameDisplay.textContent = "Aucun fichier sélectionné";
        }
      }

      // Mettre à jour la liste des éléments (sans recharger la page)
      
      if (storeName === "budgets") {
        const date = new Date(item.year, item.month - 1);
        updateMonthLabel(date);
      } else {
        await updateListing(
          storeName,
          requiredFields.concat(optionalFields),
        );
      }

      if (isUpdate) {
        toastAlert("info", `${storeName} updated successfully !`);
      } else {
        toastAlert("success", `${storeName} added successfully!`);
      }
    } catch (error) {
      toastAlert("error", "An error occurred while saving the item.");
    }
  });
}

export function fillFormWithItem(
  item: Category | Transaction | Budget,
  storeName: string,
) {
  const form = document.getElementById(`${storeName}Form`) as HTMLFormElement;
  if (!form) {
    console.error(`Formulaire introuvable pour ${storeName}`);
    return;
  }

  const inputElements = form.querySelectorAll<
    HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
  >("input, select, textarea");
  const iconPreview = form.querySelector<HTMLImageElement>("#iconPreview");
  const fileInput = form.querySelector<HTMLInputElement>("#file-input");
  const actualIcon = form.querySelector(".actualIcon") as HTMLElement;
  const deleteButton =
    form.querySelector<HTMLButtonElement>("#deleteIconButton");
  let existingImageInput = form.querySelector<HTMLInputElement>(
    'input[name="existingIcon"]',
  );

  // Créer un champ caché pour conserver l'URL de l'image actuelle si nécessaire
  if (storeName === "categories" && !existingImageInput) {
    existingImageInput = document.createElement("input");
    existingImageInput.type = "hidden";
    existingImageInput.name = "existingIcon";
    form.appendChild(existingImageInput);
  }

  // Remplir les champs du formulaire
  inputElements.forEach((input) => {
    const fieldName = input.name;
    if (fieldName && fieldName in item) {
      if (input instanceof HTMLInputElement && input.type === "file") {
        input.style.display = "none";
      } else {
        input.value = String((item as any)[fieldName]);
      }
    }
  });

  // Gestion de l'aperçu de l'image
  if (
    existingImageInput &&
    iconPreview &&
    "icon" in item &&
    typeof item.icon === "string"
  ) {
    if (item.icon) {
      iconPreview.src = item.icon;
      iconPreview.style.display = "block";
      existingImageInput.value = item.icon;
    } else {
      iconPreview.style.display = "none";
      existingImageInput.value = "";
    }
  }

  // Gestion du bouton "Supprimer l'image"
  if (
    deleteButton &&
    existingImageInput &&
    "icon" in item &&
    typeof item.icon === "string"
  ) {
    if (item.icon) {
      deleteButton.style.display = "inline-block";
      actualIcon!.style.display = "block";
      deleteButton.onclick = () => {
        if (actualIcon) actualIcon.style.display = "none";
        existingImageInput!.value = "";
      };
    } else {
      deleteButton.style.display = "none";
    }
  } else {
    if (fileInput) fileInput.style.display = "block";
  }

  // Gérer l'événement "changement d'image"
  if (fileInput && existingImageInput && iconPreview) {
    fileInput.removeEventListener("change", handleFileChange);
    fileInput.addEventListener("change", handleFileChange);

    function handleFileChange(this: HTMLInputElement, event: Event): void {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          if (iconPreview) {
            iconPreview.src = reader.result as string;
            iconPreview.style.display = "block";
          }
          if (deleteButton) deleteButton.style.display = "inline-block";
          if (existingImageInput) existingImageInput.value = "";
        };
        reader.readAsDataURL(file);
      }
    }
  }

  // Mettre à jour le texte du bouton de soumission
  const submitButton = form.querySelector<HTMLInputElement>(
    'input[type="submit"]',
  );
  if (submitButton) {
    submitButton.value = "Mettre à jour";
  }
}
