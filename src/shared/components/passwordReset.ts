import { toastAlert } from "./alert.js"; 
import { openDatabase } from "../../core/database/openDatabase.js"; 
import { hashPassword } from "../../core/auth/hashPassword.js"; 

export function displayPasswordResetForm() {
  const formContainer = document.getElementById("profile--wrapper") as HTMLElement;

  formContainer.innerHTML = `
    <form id="password-reset-form">
      <label for="current-password">Mot de passe actuel</label>
      <input type="password" id="current-password" name="current-password" required>
      
      <label for="new-password">Nouveau mot de passe</label>
      <input type="password" id="new-password" name="new-password" required>
      
      <label for="confirm-password">Confirmer le mot de passe</label>
      <input type="password" id="confirm-password" name="confirm-password" required>
      
      <button type="submit">Réinitialiser le mot de passe</button>
    </form>
  `;

  const form = document.getElementById("password-reset-form") as HTMLFormElement;
  form.addEventListener("submit", handlePasswordFormSubmit);
}

async function handlePasswordFormSubmit(event: Event) {
  event.preventDefault();

  const currentPassword = (document.getElementById("current-password") as HTMLInputElement).value.trim();
  const newPassword = (document.getElementById("new-password") as HTMLInputElement).value.trim();
  const confirmPassword = (document.getElementById("confirm-password") as HTMLInputElement).value.trim();

  if (newPassword !== confirmPassword) {
    toastAlert("error", "Les mots de passe ne correspondent pas.");
    return;
  }

  // Hachage du nouveau mot de passe et du mot de passe actuel avant de commencer la transaction
  const hashedCurrentPassword = await hashPassword(currentPassword);
  const hashedNewPassword = await hashPassword(newPassword);

  try {
    await updatePassword(hashedCurrentPassword, hashedNewPassword);
    toastAlert("success", "Mot de passe réinitialisé avec succès.");
  } catch (error) {
    toastAlert("error", error instanceof Error ? error.message : "Erreur inconnue.");
  }
}

// Fonction pour mettre à jour le mot de passe de l'utilisateur
async function updatePassword(currentPassword: string, newPassword: string): Promise<void> {
  const db = await openDatabase("UserDatabase", "users");

  console.log("Début de la mise à jour du mot de passe");

  // Créez une transaction "readwrite"
  const transaction = db.transaction("users", "readwrite");
  const store = transaction.objectStore("users");
  const index = store.index("email");
  const userEmail = localStorage.getItem("userMail");

  if (!userEmail) {
    console.error("Aucun utilisateur connecté");
    throw new Error("Utilisateur non connecté.");
  }

  console.log("Recherche de l'utilisateur dans la base de données pour l'email :", userEmail);

  // Recherche de l'utilisateur dans la base de données
  const userRequest = index.get(userEmail);

  userRequest.onsuccess = () => {
    const user = userRequest.result;

    if (!user) {
      console.error("Utilisateur introuvable");
      throw new Error("Utilisateur introuvable.");
    }

    console.log("Utilisateur trouvé, vérification du mot de passe actuel");

    // Vérification du mot de passe actuel
    if (user.password !== currentPassword) {
      console.error("Mot de passe actuel incorrect");
      throw new Error("Mot de passe actuel incorrect.");
    }

    console.log("Mot de passe actuel vérifié, mise à jour du nouveau mot de passe");

    // Mise à jour du mot de passe de l'utilisateur
    user.password = newPassword;

    // Mise à jour dans la base de données
    const putRequest = store.put(user);

    putRequest.onsuccess = () => {
      console.log("Mot de passe mis à jour avec succès");
      // Finalisez la transaction
      transaction.oncomplete = () => {
        console.log("Transaction terminée avec succès");
      };
    };

    putRequest.onerror = (event) => {
      console.error("Erreur lors de la mise à jour du mot de passe", event);
      transaction.abort(); // Annulez la transaction en cas d'erreur
    };
  };

  userRequest.onerror = (event) => {
    console.error("Erreur de récupération de l'utilisateur", event);
    transaction.abort(); // Annulez la transaction en cas d'erreur
  };

  // Si une erreur se produit dans la transaction, annulez-la
  transaction.onerror = (event) => {
    console.error("Erreur lors de l'exécution de la transaction", event);
    transaction.abort();
  };
}