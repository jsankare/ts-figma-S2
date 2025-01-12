import { openDatabase } from "../database/dbUtils.js";
import { logoutLogic } from "./logoutLogic.js";
import { User } from "../database/types.js";

// Function to get a cookie by its name
function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

// Check auth & token validity
export async function checkAuthentication(): Promise<void> {
  const userEmail = localStorage.getItem("userMail");
  const authToken = getCookie("token");

  if (!userEmail || !authToken) {
    logoutLogic();
    return;
  }

  // Fetch token
  const db = await openDatabase();
  const transaction = db.transaction("users", "readonly");
  const store = transaction.objectStore("users");
  const index = store.index("token");
  const request = index.get(authToken);

  request.onsuccess = () => {
    const user: User = request.result;

    // Check token validity
    if (!user || !user.tokenExpiry || new Date(user.tokenExpiry) < new Date()) {
      logoutLogic();
    }
  };

  request.onerror = () => {
    console.error("Erreur lors de la vérification du token");
    logoutLogic();
  };
}

// Call auth function at page load
checkAuthentication().then(() => console.log("success auth verification"));
