
import { uploadImage } from "./utils/uploadImage.js";

interface Category {
  id: number;
  name: string;
  icon?: string;
}

interface Transaction {
  id: number;
  type: string;
  name: string;
  amount: number;
  category: string;
  date: string;
}

interface Budget {
  id: number;
  category: string;
  budget: number;
  alert?: boolean;
}

document.addEventListener('DOMContentLoaded', () => {
  initializeFormAndListing('categoriesForm', 'categoriesListing', 'CategoryDatabase', 'categories', 'id', ['name', 'icon']);
  initializeFormAndListing('budgetsForm', 'budgetsListing', 'BudgetDatabase', 'budgets', 'id', ['category', 'budget'], ['alert']);
  initializeFormAndListing('transactionsForm', 'transactionsListing', 'TransactionDatabase', 'transactions', 'id', ['type', 'name', 'amount', 'category', 'date']);
});

function initializeFormAndListing(formId: string, listingId: string, dbName: string, storeName: string, keyPath: string, requiredFields: string[], optionalFields: string[] = []) {
  const form = document.getElementById(formId) as HTMLFormElement;
  const listing = document.getElementById(listingId);

  if (form) {
    form.addEventListener('submit', (event) => handleFormSubmit(event, dbName, storeName, keyPath, requiredFields, optionalFields));
  }

  updateListing(dbName, storeName, keyPath, requiredFields.concat(optionalFields));
}

async function handleFormSubmit(event: Event, dbName: string, storeName: string, keyPath: string, requiredFields: string[], optionalFields: string[]) {
  event.preventDefault();

  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  const id = formData.get('id') ? parseInt(formData.get('id') as string, 10) : null;
  let item: { [key: string]: any } = {};

  requiredFields.concat(optionalFields).forEach(field => {
    const value = formData.get(field);
    if (value) {
      item[field] = value;
    }
  });

  for (const field of requiredFields) {
    if (!item[field]) {
      displayMessage('All required fields must be filled', true);
      return;
    }
  }

  const fileInput = form.querySelector('#categoryIcon') as HTMLInputElement;
  if (fileInput && fileInput.files?.length) {
    const file = fileInput.files[0];
    try {
      const pictureDataUrl = await convertFileToBase64(file);
      item['icon'] = pictureDataUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      displayMessage('Error uploading image', true);
      return;
    }
  }

  try {
    const db = await openDatabase(dbName, storeName, keyPath);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    if (id) {
      item[keyPath] = id;
    } else {
      const newId = await generateUniqueId(store, keyPath);
      item[keyPath] = newId;
    }

    const request = store.put(item);

    await new Promise((resolve, reject) => {
      request.onsuccess = () => {
        form.reset();
        (form.querySelector('input[type="submit"]') as HTMLButtonElement).value = `Add ${storeName.slice(0, -1)}`;
        resolve(null);
      };
      request.onerror = (event) => {
        console.error(`Error saving ${storeName.slice(0, -1)}:`, (event.target as IDBRequest).error);
        alert(`Error saving ${storeName.slice(0, -1)}`);
        reject((event.target as IDBRequest).error);
      };
    });

    await new Promise((resolve, reject) => {
      transaction.oncomplete = () => {
        updateListing(dbName, storeName, keyPath, requiredFields.concat(optionalFields));
        resolve(null);
      };
      transaction.onerror = (event) => {
        console.error('Transaction error:', (event.target as IDBRequest).error);
        alert('Transaction error');
        reject((event.target as IDBRequest).error);
      };
    });

  } catch (error) {
    console.error(`Error saving ${storeName.slice(0, -1)}:`, error);
    alert(`Error occurred while saving the ${storeName.slice(0, -1)}`);
  }
}

async function convertFileToBase64(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result && typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject('Failed to convert file to base64');
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function openDatabase(dbName: string, storeName: string, keyPath: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: keyPath });
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

async function generateUniqueId(store: IDBObjectStore, keyPath: string): Promise<number> {
  const cursorRequest = store.openCursor(null, 'prev');
  return new Promise<number>((resolve, reject) => {
    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        resolve(cursor.value[keyPath] + 1);
      } else {
        resolve(1);
      }
    };
    cursorRequest.onerror = (event) => {
      reject((event.target as IDBRequest).error);
    };
  });
}

async function updateListing(dbName: string, storeName: string, keyPath: string, fields: string[]) {
  try {
    const db = await openDatabase(dbName, storeName, keyPath);
    const transaction = db.transaction(storeName, 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = (event) => {
      const items = (event.target as IDBRequest<(Category | Transaction | Budget)[]>).result;
      const listing = document.getElementById(`${storeName}Listing`);
      if (listing) {
        listing.innerHTML = '';
        items.forEach((item: Category | Transaction | Budget) => {
          const listItem = document.createElement('li');
          if ('name' in item) {
            listItem.innerHTML = `id: ${item.id}, name: ${item.name}`;
            if (item.icon) {
              const iconImg = document.createElement('img');
              iconImg.src = item.icon;
              iconImg.alt = `${item.name} icon`;
              iconImg.style.width = '20px';
              iconImg.style.height = '20px';
              listItem.appendChild(iconImg);
            }
          } else if ('amount' in item) {
            listItem.textContent = `id: ${item.id}, type: ${item.type}, name: ${item.name}, amount: ${item.amount}, category: ${item.category}, date: ${item.date}`;
          } else if ('budget' in item) {
            listItem.textContent = `id: ${item.id}, category: ${item.category}, budget: ${item.budget}, alert: ${item.alert}`;
          }

          const editButton = createEditButton(item, storeName);
          const deleteButton = createDeleteButton(item, dbName, storeName, keyPath, fields);

          listItem.appendChild(editButton);
          listItem.appendChild(deleteButton);
          listing.appendChild(listItem);
        });
      }
    };

    request.onerror = (event) => {
      console.error(`Error fetching items for listing:`, (event.target as IDBRequest).error);
    };
  } catch (error) {
    console.error(`Error updating listing:`, error);
  }
}

function createEditButton(item: Category | Transaction | Budget, storeName: string): HTMLButtonElement {
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  const modalContent = document.getElementById("modal") as HTMLElement;
  editButton.addEventListener('click', () => {
    if (modalContent) {
      modalContent.style.display = 'block';
    }
    const form = document.getElementById(`${storeName}Form`) as HTMLFormElement;
    (form.elements.namedItem('id') as HTMLInputElement).value = item.id.toString();
    if ('name' in item) {
      (form.elements.namedItem('name') as HTMLInputElement).value = item.name;
    } else if ('amount' in item) {
      (form.elements.namedItem('type') as HTMLInputElement).value = item.type;
      (form.elements.namedItem('name') as HTMLInputElement).value = item.name;
      (form.elements.namedItem('amount') as HTMLInputElement).value = item.amount.toString();
      (form.elements.namedItem('category') as HTMLInputElement).value = item.category;
      (form.elements.namedItem('date') as HTMLInputElement).value = item.date;
    } else if ('budget' in item) {
      (form.elements.namedItem('category') as HTMLInputElement).value = item.category;
      (form.elements.namedItem('budget') as HTMLInputElement).value = item.budget.toString();
      if (item.alert !== undefined) {
        (form.elements.namedItem('alert') as HTMLInputElement).checked = item.alert;
      }
    }
    (form.querySelector('input[type="submit"]') as HTMLButtonElement).value = `Update ${storeName.slice(0, -1)}`;
  });
  return editButton;
}

function createDeleteButton(item: Category | Transaction | Budget, dbName: string, storeName: string, keyPath: string, fields: string[]): HTMLButtonElement {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', async () => {
    const confirmed = confirm(`Are you sure you want to delete the ${storeName.slice(0, -1)} "${'name' in item ? item.name : item.category}"?`);
    if (confirmed) {
      try {
        await deleteItem(dbName, storeName, item.id);
        updateListing(dbName, storeName, keyPath, fields);
      } catch (error) {
        console.error(`Error deleting ${storeName.slice(0, -1)}:`, error);
      }
    }
  });
  return deleteButton;
}

async function deleteItem(dbName: string, storeName: string, id: number) {
  try {
    const db = await openDatabase(dbName, storeName, 'id');
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      console.log(`${storeName.slice(0, -1)} deleted successfully`);
      updateListing(dbName, storeName, 'id', []);
    };

    request.onerror = (event) => {
      console.error(`Error deleting ${storeName.slice(0, -1)}:`, (event.target as IDBRequest).error);
    };
  } catch (error) {
    console.error(`Error deleting ${storeName.slice(0, -1)}:`, error);
  }
}

function displayMessage(message: string, isError: boolean = true) {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  messageElement.style.color = isError ? 'red' : 'green';

  if (isError) {
    const form = document.querySelector('form');
    if (form) {
      let errorElement = form.querySelector('.error') as HTMLParagraphElement;
      if (!errorElement) {
        errorElement = document.createElement('p');
        errorElement.className = 'error';
        form.appendChild(errorElement);
      }
      errorElement.textContent = message;
      errorElement.style.color = 'red';
    }
  } else {
    const listing = document.querySelector('.listing');
    if (listing) {
      let successElement = listing.querySelector('.success') as HTMLParagraphElement;
      if (!successElement) {
        successElement = document.createElement('p');
        successElement.className = 'success';
        listing.insertBefore(successElement, listing.firstChild);
      }
      successElement.textContent = message;
      successElement.style.color = 'green';
    }
  }
}