// Hash password
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Create Indexdb database
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("UserDatabase", 1);

    request.onerror = (event) => {
      console.error("Erreur lors de l'ouverture de la base de données", event);
      reject("Impossible d'ouvrir la base de données");
    };

    request.onsuccess = (event) => {
      const db = request.result;
      console.log("Base de données ouverte avec succès");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "email" });
        console.log("Object store 'users' créé");
      }
    };
  });
}

// Add user in database
function addUser(
  db: IDBDatabase,
  userData: { email: string; password: string, firstname: string, lastname: string },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const request = store.add(userData);

    request.onsuccess = () => {
      console.log("Utilisateur ajouté avec succès");
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
  const firstname = (document.getElementById("firstname") as HTMLInputElement).value;
  const lastname = (document.getElementById("lastname") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;
  const confirmPassword = (
    document.getElementById("confirm-password") as HTMLInputElement
  ).value;

  if (password !== confirmPassword) {
    alert("Les mots de passe ne correspondent pas !");
    return;
  }

  const db = await openDatabase();
  const userExists = await checkUserExists(db, email);
  if (userExists) {
    alert("Un utilisateur avec cet e-mail existe déjà !");
    return;
  }

  // Hash password
  const hashedPassword = await hashPassword(password);
  const userData = { email, password: hashedPassword, lastname, firstname };

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
