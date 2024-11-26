import { hashPassword } from "./utils/hashPassword.js";
import { openDatabase } from "./utils/openDatabase.js";

// Add user in database
function addUser(
  db: IDBDatabase,
  userData: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    picture: string;
  },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const request = store.add(userData);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = (event) => {
      console.error("Erreur lors de l'ajout de l'utilisateur", event);
      reject("Échec de l'ajout de l'utilisateur");
    };
  });
}

// Register
async function handleRegister(event: Event) {
  event.preventDefault();

  const email = (document.getElementById("mail") as HTMLInputElement).value;
  const firstname = (document.getElementById("firstname") as HTMLInputElement)
    .value;
  const lastname = (document.getElementById("lastname") as HTMLInputElement)
    .value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;
  const confirmPassword = (
    document.getElementById("confirm-password") as HTMLInputElement
  ).value;
  const picture = "";

  if (password !== confirmPassword) {
    alert("Les mots de passe ne correspondent pas !");
    return;
  }

  const db = await openDatabase('UserDatabase', 'users', 'email');
  const userExists = await checkUserExists(db, email);
  if (userExists) {
    alert("Un utilisateur avec cet e-mail existe déjà !");
    return;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);
  const userData = {
    email,
    password: hashedPassword,
    lastname,
    firstname,
    picture,
  };

  try {
    await addUser(db, userData);
    alert("Enregistrement réussi !");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Échec de l'enregistrement", error);
    alert("Échec de l'enregistrement de l'utilisateur.");
  }
}

// Check if user already exists in db
function checkUserExists(db: IDBDatabase, email: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readonly");
    const store = transaction.objectStore("users");
    const request = store.get(email);

    request.onsuccess = () => {
      resolve(Boolean(request.result));
    };

    request.onerror = (event) => {
      console.error(
        "Erreur lors de la vérification de l'existence de l'utilisateur",
        event,
      );
      reject("Échec de la vérification de l'existence de l'utilisateur");
    };
  });
}

// add submit to form
const form = document.querySelector("form");
form?.addEventListener("submit", handleRegister);
