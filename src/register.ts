// Creation of IndexedDB
function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("UserDatabase", 1);

    request.onerror = (event) => {
      console.error("Error opening IndexedDB", event);
      reject("Failed to open database");
    };

    request.onsuccess = (event) => {
      const db = request.result;
      console.log("Database opened successfully");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains("users")) {
        db.createObjectStore("users", { keyPath: "email" });
        console.log("Object store 'users' created");
      }
    };
  });
}

// Function to add user data to IndexedDB
function addUser(
  db: IDBDatabase,
  userData: { email: string; password: string },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const request = store.add(userData);

    request.onsuccess = () => {
      console.log("User added successfully");
      resolve();
    };

    request.onerror = (event) => {
      console.error("Error adding user", event);
      reject("Failed to add user");
    };
  });
}

// Function to handle form submission
async function handleRegister(event: Event) {
  event.preventDefault();

  const email = (document.getElementById("mail") as HTMLInputElement).value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;
  const confirmPassword = (
    document.getElementById("confirm-password") as HTMLInputElement
  ).value;

  // Validate the passwords match
  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Open the database
  const db = await openDatabase();

  // Check if the email already exists
  const userExists = await checkUserExists(db, email);
  if (userExists) {
    alert("User with this email already exists!");
    return;
  }

  // Add the user data to IndexedDB
  const userData = { email, password };
  try {
    await addUser(db, userData);
    alert("Registration successful!");
  } catch (error) {
    console.error("Registration failed", error);
    alert("Failed to register user.");
  }
}

// Function to check if the email already exists in IndexedDB
function checkUserExists(db: IDBDatabase, email: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readonly");
    const store = transaction.objectStore("users");
    const request = store.get(email);

    request.onsuccess = () => {
      if (request.result) {
        resolve(true); // Email found
      } else {
        resolve(false); // Email not found
      }
    };

    request.onerror = (event) => {
      console.error("Error checking for user", event);
      reject("Failed to check user existence");
    };
  });
}

// Attach the submit event to the form
const form = document.querySelector("form");
form?.addEventListener("submit", handleRegister);
