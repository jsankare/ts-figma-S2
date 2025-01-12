import { displayPassword, hashPassword } from "../core/auth/passwordUtils.js";
import { openDatabase, updateItem, addItem } from "../core/database/dbUtils.js";
import { toastAlert } from "../shared/components/alert.js";
import { getCurrentUser } from "../core/auth/handleUser.js";
import { generateToken } from "../core/auth/generateToken.js";

// Connection
export async function handleLogin(event: Event): Promise<void> {
  event.preventDefault();

  const email = (document.getElementById("mail") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement).value;

  const db = await openDatabase();
  const user = await getCurrentUser(email);
  if (!user) {
    toastAlert("error", "Aucun utilisateur trouvé avec cet e-mail !");
    return;
  }

  const hashedPassword = await hashPassword(password);
  if (user.password !== hashedPassword) {
    toastAlert("error", "Mot de passe incorrect !");
    return;
  }

  const token = generateToken();
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 24);

  const updateData = {
    token: token,
    tokenExpiry: tokenExpiry
  };

  try {
    await updateItem('users', user.id, updateData); // Ensure user is valid and update is successful

    localStorage.setItem("userMail", email);
    document.cookie = `token=${token}; expires=${tokenExpiry.toUTCString()}`;
    window.location.href = "index.html";
  } catch (error) {
    console.error("Échec de la mise à jour du token", error);
    toastAlert("error", "Échec de la connexion, veuillez réessayer !");
  }
}

displayPassword('togglePassword', 'password');

// Add submit to login form only
const loginForm = document.querySelector("form");
loginForm?.addEventListener("submit", handleLogin);
