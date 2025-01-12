import { Budget, Category, Transaction } from "./types.js";

const dbName = "expenseDB";

// Ouvrir la base de données
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request: IDBOpenDBRequest = indexedDB.open(dbName, 2);

    request.onerror = (event) => {
      console.error("Erreur lors de l'ouverture de la base de données", event);
      reject(new Error("Impossible d'ouvrir la base de données"));
    };

    request.onsuccess = (event) => {
      const db = request.result;
      console.log("Base de données ouverte avec succès");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      createDatabase(db);
    };
  });
}

// Créer la base de données si elle n'existe pas
function createDatabase(db: IDBDatabase): void {
  const storeNames = ["categories", "transactions", "budgets", "users"];
  storeNames.forEach((storeName) => {
    if (!db.objectStoreNames.contains(storeName)) {
      const store = db.createObjectStore(storeName, {
        keyPath: "id",
        autoIncrement: true,
      });
      console.log(`Store "${storeName}" créé avec succès.`);

      // Ajout d'index spécifiques pour certains stores
      if (storeName === "users") {
        store.createIndex("email", "email", { unique: true });
        store.createIndex("token", "token", { unique: false });
      }
    }
  });
}

// Ajouter un élément à la base de données
export async function addItem(
  storeName: string,
  item: { [key: string]: any },
  formData?: FormData
): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    // Gérer l'ID de l'élément
    if (formData?.get("id")) {
      item.id = parseInt(formData.get("id") as string, 10);
    }

    if (storeName === "users" && item.email && item.password) {
      item.createdAt = item.createdAt || new Date();
      item.updatedAt = item.updatedAt || new Date();
    }

    // Enregistrer l'élément dans la base de données
    const request = store.put(item);
    await new Promise<void>((resolve, reject) => {
      request.onsuccess = () => {
        console.log("Item saved successfully:", item);
        resolve();
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        console.error("Error saving item:", error);
        reject(error);
      };
    });
  } catch (error) {
    console.error("Error adding item:", error);
    throw new Error("Error adding item");
  }
}

// Récupérer tous les éléments de la base de données
export async function getAllItems(
  storeName: string
): Promise<(Category | Transaction | Budget)[]> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const items = (event.target as IDBRequest).result;
        resolve(items);
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        console.error("Error fetching items:", error);
        reject(error);
      };
    });
  } catch (error) {
    console.error("Error getting all items:", error);
    throw new Error("Error getting all items");
  }
}

// Supprimer un élément de la base de données
export async function deleteItem(
  storeName: string,
  id: number
): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);

    const request = store.delete(id);

    return new Promise<void>((resolve, reject) => {
      request.onsuccess = async () => {
        console.log(`Item with ID ${id} deleted`);

        // Vérifiez si la suppression concerne une catégorie
        if (storeName === "categories") {
          try {
            // Mettre à jour les transactions et les budgets
            await updateRelatedStore("transactions", "category", id);
            await updateRelatedStore("budgets", "category", id);
          } catch (updateError) {
            console.error("Error updating related stores:", updateError);
          }
        }

        resolve();
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        console.error("Error deleting item:", error);
        reject(error);
      };
    });
  } catch (error) {
    console.error("Error deleting item:", error);
    throw new Error("Error deleting item");
  }
}

// Mettre à jour un store lié après suppression d'une catégorie
async function updateRelatedStore(
  storeName: string,
  fieldName: string,
  id: number
): Promise<void> {
  try {
    const db = await openDatabase();
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
          resolve();
        }
      };

      cursorRequest.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        console.error(`Error updating ${storeName}:`, error);
        reject(error);
      };
    });
  } catch (error) {
    console.error("Error updating related store:", error);
    throw new Error("Error updating related store");
  }
}

// Récupérer un élément par ID
export async function getItemById(
  storeName: string,
  id: number
): Promise<Category | Transaction | Budget> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    return new Promise((resolve, reject) => {
      request.onsuccess = (event) => {
        const item = (event.target as IDBRequest).result;
        if (item) {
          resolve(item);
        } else {
          reject("Item not found");
        }
      };

      request.onerror = (event) => {
        const error = (event.target as IDBRequest).error;
        console.error("Error fetching item:", error);
        reject("Error fetching item");
      };
    });
  } catch (error) {
    console.error("Error getting item by ID:", error);
    throw new Error("Error getting item by ID");
  }
}

// Mettre à jour un élément
export async function updateItem(
  storeName: string,
  id: number,
  data: { [key: string]: any }
): Promise<void> {
  try {
    const db = await openDatabase();
    const transaction = db.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      const item = request.result;
      if (item) {
        // Ajoute ou met à jour les données
        Object.assign(item, data);

        const updateRequest = store.put(item);
        updateRequest.onsuccess = () => {
          console.log("Item updated successfully:", item);
        };

        updateRequest.onerror = (event) => {
          const error = (event.target as IDBRequest).error;
          console.error("Error updating item:", error);
        };
      } else {
        throw new Error("Item not found");
      }
    };

    request.onerror = (event) => {
      const error = (event.target as IDBRequest).error;
      console.error("Error fetching item:", error);
    };
  } catch (error) {
    console.error("Error updating item:", error);
    throw new Error("Error updating item");
  }
}

