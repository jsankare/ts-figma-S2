import { Budget } from "../../pages/budgets.js";
import { Category } from "../../pages/categories.js";
import { Transaction } from "../../pages/transactions.js";

export function openDatabase(
  dbName: string,
  dataName: string,
  indexField?: string,
): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(dbName, 1);

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

      if (!db.objectStoreNames.contains(dataName)) {
        const dataStore = db.createObjectStore(dataName, {
          keyPath: "id",
          autoIncrement: true,
        });
        if (dataName === "users") {
          dataStore.createIndex("token", "token", { unique: false });
          dataStore.createIndex("email", "email", { unique: true });
        }
      } else {
        if (dataName === "users") {
          const transaction = db.transaction(dataName, "versionchange");
          const dataStore = transaction.objectStore(dataName);
          dataStore.createIndex("email", "email", { unique: true });

          if (!dataStore.indexNames.contains("token")) {
            dataStore.createIndex("token", "token", { unique: false });
            console.log(
              `Index 'token' created in existing '${dataName}' object store.`,
            );
          }
        }
      }
    };
  });
}

// Ajouter un élément à la base de données
export async function addItemToDatabase(
  dbName: string,
  storeName: string,
  item: { [key: string]: any },
  formData: FormData,
): Promise<void> {
  const db = await openDatabase(dbName, storeName);
  console.log("Database opened:", db);
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);

  // Gérer l'ID de l'élément
  if (formData.get("id")) {
    item.id = parseInt(formData.get("id") as string, 10);
    console.log("Updating item with ID:", item.id);
  } else {
    const newId = await generateUniqueId(store);
    item.id = newId;
    console.log("Generated new ID:", newId);
  }

  // Enregistrer l'élément dans la base de données
  const request = store.put(item);
  return new Promise<void>((resolve, reject) => {
    request.onsuccess = () => {
      console.log("Item saved successfully:", item);
      resolve();
    };

    request.onerror = (event) => {
      console.error(`Error saving item:`, (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };

    transaction.oncomplete = () => {
      console.log("Transaction completed successfully");
    };

    transaction.onerror = (event) => {
      console.error("Transaction error:", (event.target as IDBRequest).error);
      reject((event.target as IDBRequest).error);
    };
  });
}

// Générer un ID unique pour les nouveaux éléments
async function generateUniqueId(store: IDBObjectStore): Promise<number> {
  console.log("Generating unique ID...");
  const cursorRequest = store.openCursor(null, "prev");
  return new Promise<number>((resolve, reject) => {
    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        console.log("Found cursor:", cursor);
        resolve(cursor.value.id + 1);
      } else {
        console.log("No previous cursor found, starting from ID 1");
        resolve(1);
      }
    };

    cursorRequest.onerror = (event) => {
      console.error(
        "Error generating unique ID:",
        (event.target as IDBRequest).error,
      );
      reject((event.target as IDBRequest).error);
    };
  });
}

// Récupérer tous les éléments de la base de données
export async function getAllItems(
  dbName: string,
  storeName: string,
): Promise<(Category | Transaction | Budget)[]> {
  const db = await openDatabase(dbName, storeName);
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.getAll();

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const items = (
        event.target as IDBRequest<(Category | Transaction | Budget)[]>
      ).result;
      resolve(items);
    };

    request.onerror = (event) => {
      console.error(
        `Error fetching items:`,
        (event.target as IDBRequest).error,
      );
      reject((event.target as IDBRequest).error);
    };
  });
}

// Supprimer un élément de la base de données
export async function deleteItem(
  dbName: string,
  storeName: string,
  id: number,
  fields: string[],
): Promise<void> {
  try {
    const db = await openDatabase(dbName, storeName, "id");
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const request = store.delete(id);

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = async () => {
        console.log(`Item with ID ${id} deleted`);

        // Vérifiez si la suppression concerne une catégorie
        if (storeName === "categories") {
          console.log(
            `Updating transactions and budgets for deleted category ID ${id}`,
          );

          try {
            // Mettre à jour les transactions
            await updateRelatedStore(
              "TransactionDatabase",
              "transactions",
              "category",
              id,
            );

            // Mettre à jour les budgets
            await updateRelatedStore(
              "BudgetDatabase",
              "budgets",
              "category",
              id,
            );
          } catch (updateError) {
            console.error(`Error updating related stores:`, updateError);
          }
        }

        resolve();
      };

      request.onerror = (event) => {
        console.error(
          `Error deleting item:`,
          (event.target as IDBRequest).error,
        );
        reject((event.target as IDBRequest).error);
      };
    });
  } catch (error) {
    console.error(`Error deleting item:`, error);
    throw error;
  }
}

async function updateRelatedStore(
  dbName: string,
  storeName: string,
  fieldName: string,
  id: number,
): Promise<void> {
  try {
    // Ouvrir la base de données correspondante
    const db = await openDatabase(dbName, storeName, "id");
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const cursorRequest = store.openCursor();

    return new Promise((resolve, reject) => {
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;

        if (cursor) {
          const record = cursor.value;

          // Vérifiez si le champ correspond à l'ID supprimé
          if (record[fieldName] === id) {
            record[fieldName] = undefined;
            cursor.update(record);
          }

          cursor.continue();
        } else {
          // Aucun autre enregistrement
          resolve();
        }
      };

      cursorRequest.onerror = (event) => {
        console.error(
          `Error updating ${storeName}:`,
          (event.target as IDBRequest).error,
        );
        reject((event.target as IDBRequest).error);
      };
    });
  } catch (error) {
    console.error(`Error updating related store (${storeName}):`, error);
    throw error;
  }
}

// Récupérer un élément par ID
export async function getItemById(
  dbName: string,
  storeName: string,
  id: number,
): Promise<Category | Transaction | Budget> {
  const db = await openDatabase(dbName, storeName);
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  const request = store.get(id);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const item = (event.target as IDBRequest<Category | Transaction | Budget>)
        .result;
      if (item) {
        resolve(item);
      } else {
        reject("Item not found");
      }
    };
    request.onerror = (event) => {
      console.error("Error fetching item:", (event.target as IDBRequest).error);
      reject("Error fetching item");
    };
  });
}

export async function updateUserInfo(
  email: string,
  firstname: string,
  lastname: string,
  address: string,
  currency: string,
  notifications: boolean,
) {
  const db = await openDatabase("UserDatabase", "users");
  const transaction = db.transaction("users", "readwrite");
  const store = transaction.objectStore("users");
  const index = store.index("email");

  const userRequest = index.get(email);
  userRequest.onsuccess = () => {
    const user = userRequest.result;
    if (user) {
      user.firstname = firstname;
      user.lastname = lastname;
      user.address = address;
      user.currency = currency;
      user.notifications = notifications;
      store.put(user);
    }
  };

  return new Promise((resolve, reject) => {
    transaction.oncomplete = resolve;
    transaction.onerror = reject;
  });
}

// Add user in database
export function addUser(
  db: IDBDatabase,
  userData: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    picture: string;
    createdAt: Date;
    updatedAt: Date;
  },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const request = store.add(userData);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error("Erreur lors de l'ajout de l'utilisateur", event);
      reject("Échec de l'ajout de l'utilisateur");
    };
  });
}
