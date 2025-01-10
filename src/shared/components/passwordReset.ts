import { toastAlert } from "./alert.js";
import { openDatabase } from "../../core/database/openDatabase.js";
import { hashPassword } from "../../core/auth/hashPassword.js";
import { displayPassword } from "../../pages/register.js";

export function displayPasswordResetForm() {
  const formContainer = document.getElementById(
    "profile_modification",
  ) as HTMLElement;

  formContainer.innerHTML = `
    <form class="form" id="password-reset-form">
    
      <div class="form-group">
        <label class="label" for="current-password">Mot de passe actuel</label>
         <div class="input-wrapper">
            <input class="input" type="password" id="current-password" name="current-password" required>
            <span class="toggle-password" id="togglePassword">
              <svg id="passwordIcon" width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fill-rule="evenodd" clip-rule="evenodd" d="M10 10.501C9.17305 10.501 8.50005 9.828 8.50005 9.001C8.50005 8.174 9.17305 7.501 10 7.501C10.827 7.501 11.5 8.174 11.5 9.001C11.5 9.828 10.827 10.501 10 10.501M10.0001 5.501C8.07005 5.501 6.50005 7.071 6.50005 9.001C6.50005 10.931 8.07005 12.501 10.0001 12.501C11.9301 12.501 13.5001 10.931 13.5001 9.001C13.5001 7.071 11.9301 5.501 10.0001 5.501M10.2197 13.9986C5.91375 14.0986 3.10475 10.4156 2.17275 8.9966C3.19875 7.3916 5.78275 4.1056 9.78075 4.0036C14.0697 3.8946 16.8948 7.5866 17.8268 9.0056C16.8018 10.6106 14.2167 13.8966 10.2197 13.9986M19.8678 8.5036C19.2298 7.3916 15.7057 1.8176 9.72975 2.0046C4.20175 2.1446 0.98675 7.0146 0.13275 8.5036C-0.04425 8.8116 -0.04425 9.1906 0.13275 9.4986C0.76175 10.5956 4.16175 16.0006 10.0247 16.0006C10.1067 16.0006 10.1888 15.9996 10.2708 15.9976C15.7977 15.8566 19.0138 10.9876 19.8678 9.4986C20.0438 9.1906 20.0438 8.8116 19.8678 8.5036" fill="#BDBDBD"/>
              </svg>
            </span>
          </div>
      </div>
        
      <div class="form-group">
        <label class="label" for="new-password">Nouveau mot de passe</label>
        <div class="input-wrapper">
                <input class="input" type="password" id="new-password" name="new-password" required>
                <span class="toggle-password" id="togglePassword2">
                  <svg id="passwordIcon2" width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path fill-rule="evenodd" clip-rule="evenodd" d="M10 10.501C9.17305 10.501 8.50005 9.828 8.50005 9.001C8.50005 8.174 9.17305 7.501 10 7.501C10.827 7.501 11.5 8.174 11.5 9.001C11.5 9.828 10.827 10.501 10 10.501M10.0001 5.501C8.07005 5.501 6.50005 7.071 6.50005 9.001C6.50005 10.931 8.07005 12.501 10.0001 12.501C11.9301 12.501 13.5001 10.931 13.5001 9.001C13.5001 7.071 11.9301 5.501 10.0001 5.501M10.2197 13.9986C5.91375 14.0986 3.10475 10.4156 2.17275 8.9966C3.19875 7.3916 5.78275 4.1056 9.78075 4.0036C14.0697 3.8946 16.8948 7.5866 17.8268 9.0056C16.8018 10.6106 14.2167 13.8966 10.2197 13.9986M19.8678 8.5036C19.2298 7.3916 15.7057 1.8176 9.72975 2.0046C4.20175 2.1446 0.98675 7.0146 0.13275 8.5036C-0.04425 8.8116 -0.04425 9.1906 0.13275 9.4986C0.76175 10.5956 4.16175 16.0006 10.0247 16.0006C10.1067 16.0006 10.1888 15.9996 10.2708 15.9976C15.7977 15.8566 19.0138 10.9876 19.8678 9.4986C20.0438 9.1906 20.0438 8.8116 19.8678 8.5036" fill="#BDBDBD"/>
                  </svg>
              </span>
              </div>
      </div>

      <button class="submit-button" type="submit">Réinitialiser le mot de passe</button>
    </form>
  `;

  const form = document.getElementById(
    "password-reset-form",
  ) as HTMLFormElement;
  form.addEventListener("submit", handlePasswordFormSubmit);

  displayPassword("togglePassword", "current-password");
  displayPassword("togglePassword2", "new-password", "passwordIcon2");
}

async function handlePasswordFormSubmit(event: Event) {
  event.preventDefault();

  const currentPassword = (
    document.getElementById("current-password") as HTMLInputElement
  ).value.trim();
  const newPassword = (
    document.getElementById("new-password") as HTMLInputElement
  ).value.trim();
  const confirmPassword = (
    document.getElementById("confirm-password") as HTMLInputElement
  ).value.trim();

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
    toastAlert(
      "error",
      error instanceof Error ? error.message : "Erreur inconnue.",
    );
  }
}

// Fonction pour mettre à jour le mot de passe de l'utilisateur
async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<void> {
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

  console.log(
    "Recherche de l'utilisateur dans la base de données pour l'email :",
    userEmail,
  );

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

    console.log(
      "Mot de passe actuel vérifié, mise à jour du nouveau mot de passe",
    );

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
