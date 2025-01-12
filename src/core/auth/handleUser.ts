import { openDatabase } from "../database/dbUtils.js";
import { User } from "../database/types.js";

// Check if user already exists in db by querying the email index
export async function checkUserExists(email: string): Promise<boolean> {
  const db = await openDatabase();
  const transaction = db.transaction("users", "readonly");
  const store = transaction.objectStore("users");

  // Accessing the "email" index to search the user
  const index = store.index("email"); // Assuming an index exists on 'email'
  const request = index.get(email);

  return new Promise((resolve) => {
    request.onsuccess = () => {
      resolve(Boolean(request.result)); // Resolve true if result is found
    };
    request.onerror = () => {
      resolve(false); // If the request fails, assume the email is not found
    };
  });
}

// Get the current user by email (if provided) or from localStorage
export async function getCurrentUser(
  email?: string
): Promise<User | undefined> {
  try {
    const db = await openDatabase();

    // Retrieve email from localStorage if not provided
    if (!email) {
      email = localStorage.getItem("userMail") || undefined;
    }

    if (!email) {
      console.error("L'email n'est pas défini.");
      return undefined;
    }

    // Perform a transaction to get the user
    const transaction = db.transaction("users", "readonly");
    const store = transaction.objectStore("users");
    const index = store.index("email");
    const request = index.get(email);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result as User | undefined);
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
