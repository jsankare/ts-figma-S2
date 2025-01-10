import { openDatabase } from "../database/openDatabase.js";
import { User } from "../database/types.js";

async function getUser(): Promise<number | null> {
  const db = await openDatabase("UserDatabase", "users");
  const userEmail = localStorage.getItem("userMail");

  if (!userEmail) {
    console.error("Aucun email trouvé dans localStorage.");
    return null;
  }

  try {
    const token = await getCurrentUser(db, userEmail);

    if (token && token.id) {
      return token.id;
    } else {
      console.error("Le token ou l'ID utilisateur est introuvable.");
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    return null;
  }
}

export async function getCurrentUser(
  db?: IDBDatabase,
  email?: string,
): Promise<User | undefined> {
  try {
    // Initialiser db si non fourni
    if (!db) {
      db = await openDatabase("UserDatabase", "users");
    }

    // Récupérer l'email depuis localStorage si non fourni
    if (!email) {
      email = localStorage.getItem("userMail") || undefined;
    }

    if (!email) {
      console.error("L'email n'est pas défini.");
      return undefined;
    }

    // Effectuer une transaction pour récupérer l'utilisateur
    const transaction = db.transaction("users", "readonly");
    const store = transaction.objectStore("users");
    const index = store.index("email");
    const request = index.get(email);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = (event) => {
        console.error("Erreur lors de la récupération de l'utilisateur", event);
        reject("Erreur lors de la récupération de l'utilisateur");
      };
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur", error);
    return undefined;
  }
}
