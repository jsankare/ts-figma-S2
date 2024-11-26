import { uploadImage } from "./utils/uploadImage.js";
import { openDatabase } from "./utils/openDatabase.js";

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
  console.log('Initializing forms and listings');
  initializeFormAndListing('categoriesForm', 'categoriesListing', 'CategoryDatabase', 'categories', 'id', ['name', 'icon']);
  initializeFormAndListing('budgetsForm', 'budgetsListing', 'BudgetDatabase', 'budgets', 'id', ['category', 'budget'], ['alert']);
  initializeFormAndListing('transactionsForm', 'transactionsListing', 'TransactionDatabase', 'transactions', 'id', ['type', 'name', 'amount', 'category', 'date']);
});

function initializeFormAndListing(formId: string, listingId: string, dbName: string, storeName: string, keyPath: string, requiredFields: string[], optionalFields: string[] = []) {
  console.log(`Initializing form with ID: ${formId} and listing with ID: ${listingId}`);
  const form = document.getElementById(formId) as HTMLFormElement;
  if (form) {
    console.log(`Form found: ${formId}`);
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('Form submit detected for', formId);
      handleFormSubmit(event, dbName, storeName, keyPath, requiredFields, optionalFields);
    });
  } else {
    console.warn(`Form with ID: ${formId} not found`);
  }

  console.log('Updating listing...');
  updateListing(dbName, storeName, keyPath, requiredFields.concat(optionalFields));
}


async function handleFormSubmit(event: Event, dbName: string, storeName: string, keyPath: string, requiredFields: string[], optionalFields: string[]) {
  event.preventDefault();
  const form = event.target as HTMLFormElement;
  const formData = new FormData(form);

  console.log("Form Data:", formData);
  let item: { [key: string]: any } = {};

  requiredFields.concat(optionalFields).forEach(field => {
    const value = formData.get(field);
    console.log(`Field: ${field}, Value: ${value}`);
    if (value) {
      item[field] = value;
    }
  });

  for (const field of requiredFields) {
    if (!item[field]) {
      displayMessage('All required fields must be filled', true);
      console.error('Missing required field:', field);
      return;
    }
  }

  const fileInput = form.querySelector('#categoryIcon') as HTMLInputElement;
  if (fileInput && fileInput.files?.length) {
    const file = fileInput.files[0];
    console.log('File selected for upload:', file);
    try {
      const pictureDataUrl = await uploadImage(file);
      item['icon'] = pictureDataUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      displayMessage('Error uploading image', true);
      return;
    }
  }

  console.log('Prepared item for DB:', item);

  try {
    const db = await openDatabase(dbName, storeName, keyPath);
    console.log('Database opened:', db);
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    if (formData.get('id')) {
      item[keyPath] = parseInt(formData.get('id') as string, 10);
      console.log('Updating item with ID:', item[keyPath]);
    } else {
      const newId = await generateUniqueId(store, keyPath);
      item[keyPath] = newId;
      console.log('Generated new ID:', newId);
    }

    const request = store.put(item);
    request.onsuccess = () => {
      console.log('Item saved successfully:', item);
      form.reset();
      const modalContent = document.getElementById('modal');
      if (modalContent) {
        modalContent.style.display = 'none'; // Close the modal
      }
    };

    request.onerror = (event) => {
      console.error(`Error saving item:`, event.target.error);
      alert('Error saving item');
    };

    transaction.oncomplete = () => {
      console.log('Transaction completed successfully');
      updateListing(dbName, storeName, keyPath, requiredFields.concat(optionalFields));
    };

    transaction.onerror = (event) => {
      console.error('Transaction error:', event.target.error);
      alert('Transaction error');
    };
  } catch (error) {
    console.error(`Error saving item:`, error);
    alert('Error occurred while saving the item');
  }
}

async function generateUniqueId(store: IDBObjectStore, keyPath: string): Promise<number> {
  console.log('Generating unique ID...');
  const cursorRequest = store.openCursor(null, 'prev');
  return new Promise<number>((resolve, reject) => {
    cursorRequest.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        console.log('Found cursor:', cursor);
        resolve(cursor.value[keyPath] + 1);
      } else {
        console.log('No previous cursor found, starting from ID 1');
        resolve(1);
      }
    };

    cursorRequest.onerror = (event) => {
      console.error('Error generating unique ID:', event.target.error);
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
          if ('amount' in item) {
            listItem.textContent = `type: ${item.type}, name: ${item.name}, amount: ${item.amount}, category: ${item.category}, date: ${item.date}`;
          } else if ('name' in item) {
            listItem.innerHTML = `name: ${item.name}`;
            if (item.icon) {
              const iconImg = document.createElement('img');
              iconImg.src = item.icon;
              iconImg.alt = `${item.name} icon`;
              iconImg.style.width = '20px';
              iconImg.style.height = '20px';
              listItem.appendChild(iconImg);
            }
          } else if ('budget' in item) {
            listItem.textContent = `category: ${item.category}, budget: ${item.budget}, alert: ${item.alert}`;
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
  editButton.addEventListener('click', () => {
    const modalContent = document.getElementById('modal');
    if(modalContent) {
      modalContent.style.display = 'block';
    }
    console.log('Editing item:', item);
    fillFormWithItem(item, storeName);
  });
  return editButton;
}

function createDeleteButton(item: Category | Transaction | Budget, dbName: string, storeName: string, keyPath: string, fields: string[]): HTMLButtonElement {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    deleteItem(dbName, storeName, item[keyPath], fields);
  });
  return deleteButton;
}

function fillFormWithItem(item: Category | Transaction | Budget, storeName: string) {
  const form = document.getElementById(`${storeName}Form`) as HTMLFormElement;
  const inputElements = form.querySelectorAll('input, select');

  inputElements.forEach(input => {
    const fieldName = input.name;
    if (input.type === 'file') {
      const fileInput = input as HTMLInputElement;
      if (item[fieldName] !== undefined && item[fieldName]) {
        // Si un fichier est sélectionné, récupérer le nom du fichier
        fileInput.value = ''; // On ne peut pas définir une valeur pour un input de type 'file', donc on le vide
        const fileName = (item[fieldName] as File);
        const fileNameField = form.querySelector(`input[name="${fieldName}Name"]`) as HTMLInputElement;
        if (fileNameField) {
          fileNameField.value = fileName; // Remplir un champ texte avec le nom du fichier
        }
      }
    } else {
      // Si ce n'est pas un input de type 'file', mettre à jour la valeur normalement
      if (item[fieldName] !== undefined) {
        (input as HTMLInputElement).value = item[fieldName];
      }
    }
  });
  });

  const submitButton = form.querySelector('input[type="submit"]') as HTMLButtonElement;
  submitButton.value = `Mettre à jour`;
}

async function deleteItem(dbName: string, storeName: string, id: number, fields: string[]) {
  try {
    const db = await openDatabase(dbName, storeName, 'id');
    const transaction = db.transaction(storeName, 'readwrite');
    const store = transaction.objectStore(storeName);

    const request = store.delete(id);
    request.onsuccess = () => {
      console.log(`Item with ID ${id} deleted`);
      updateListing(dbName, storeName, 'id', fields);
    };

    request.onerror = (event) => {
      console.error(`Error deleting item:`, (event.target as IDBRequest).error);
    };
  } catch (error) {
    console.error(`Error deleting item:`, error);
  }
}

function displayMessage(message: string, isError: boolean) {
  const messageContainer = document.getElementById('message');
  if (messageContainer) {
    messageContainer.textContent = message;
    messageContainer.className = isError ? 'error' : 'success';
  }
}
