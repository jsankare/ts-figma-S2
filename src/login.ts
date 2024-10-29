import { hashPassword } from "./utils/hashPassword.js";
import { getCurrentUser } from "./utils/getCurrentUser.js";
import { openDatabase } from "./utils/openDatabase.js";

// Generate a random token
function generateToken(length: number = 32): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// Update token with expiration date
function updateUserToken(
  db: IDBDatabase,
  email: string,
  token: string,
  expiry: Date,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const request = store.get(email);

    request.onsuccess = () => {
      const userData = request.result;
      if (userData) {
        userData.token = token;
        userData.tokenExpiry = expiry;
        const updateRequest = store.put(userData);

        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = (event) => {
          console.error("Erreur lors de la mise à jour du token", event);
          reject("Échec de la mise à jour du token");
        };
      } else {
        reject("Utilisateur non trouvé pour la mise à jour");
      }
    };

    request.onerror = (event) => {
      console.error(
        "Erreur lors de la récupération de l'utilisateur pour mise à jour",
        event,
      );
      reject("Impossible de récupérer l'utilisateur pour mise à jour");
    };
  });
}

// Connection
async function handleLogin(event: Event) {
  event.preventDefault();

  const email = (document.getElementById("mail") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;

  const db = await openDatabase();
  const user = await getCurrentUser(db, email);
  if (!user) {
    alert("L'utilisateur n'existe pas !");
    return;
  }

  const hashedPassword = await hashPassword(password);
  if (user.password !== hashedPassword) {
    alert("Mot de passe incorrect !");
    return;
  }

  const token = generateToken();
  const tokenExpiry = new Date();
  tokenExpiry.setHours(tokenExpiry.getHours() + 24);

  try {
    await updateUserToken(db, email, token, tokenExpiry);

    localStorage.setItem("authToken", token);
    localStorage.setItem("userMail", email);

    alert("Connexion réussie !");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Échec de la mise à jour du token", error);
    alert("Échec de la connexion.");
  }
}

// Add submit to login form only
const loginForm = document.querySelector("form");
loginForm?.addEventListener("submit", handleLogin);
