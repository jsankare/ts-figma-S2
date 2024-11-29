import { getAllItems, addItemToDatabase, deleteItem, getItemById } from "./openDatabase.js";
import { displayMessage } from "./alert.js";
import { uploadImage } from "./uploadImage.js";
import { Budget, isBudget } from "../budgets.js";
import { Category, isCategory } from "../categories.js";
import { Transaction, isTransaction } from "../transactions.js";

// Gérer la soumission du formulaire
export async function handleFormSubmit(
  formId: string,
  listingId: string,
  dbName: string,
  storeName: string,
  keyPath: string,
  requiredFields: string[],
  optionalFields: string[] = []
) {
  const form = document.getElementById(formId) as HTMLFormElement;

  if (form) {
    console.log(`Form found: ${formId}`);
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);

      console.log("Form Data:", formData);
      let item: { [key: string]: any } = {};

      // Collecter les données du formulaire
      requiredFields.concat(optionalFields).forEach(field => {
        const value = formData.get(field);
        if (value) {
          item[field] = value;
        }
      });

      // Gérer la case à cocher d'alerte
      const alertCheckbox = form.querySelector('input[name="alert"]') as HTMLInputElement;
      item.alert = alertCheckbox?.checked || false;

      // Valider les champs obligatoires
      for (const field of requiredFields) {
        if (!item[field]) {
          displayMessage('All required fields must be filled');
          console.error('Missing required field:', field);
          return;
        }
      }

      // Convertir item.category en nombre
      if (item.category) {
        item.category = Number(item.category);
      }

      // Gérer le téléchargement de fichiers
      const fileInput = form.querySelector('#categoryIcon') as HTMLInputElement;
      if (fileInput && fileInput.files?.length) {
        const file = fileInput.files[0];
        console.log('File selected for upload:', file);
        try {
          const pictureDataUrl = await uploadImage(file);
          item['icon'] = pictureDataUrl;
        } catch (error) {
          displayMessage('Error uploading image');
          return;
        }
      }

      console.log('Prepared item for DB:', item);

      try {
        await addItemToDatabase(dbName, storeName, keyPath, item, formData);
        form.reset();
        const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
        hiddenInputs.forEach(input => {
          input.value = '';
        });
        const modalContent = document.getElementById('modal');
        if (modalContent) {
          modalContent.style.display = 'none'; // Fermer la modal
        }
        displayMessage('Ajouté', false);
        updateListing(dbName, storeName, keyPath, requiredFields.concat(optionalFields));
      } catch (error) {
        console.error(`Error saving item:`, error);
        alert('Error occurred while saving the item');
      }
    });
  } else {
    console.warn(`Form with ID: ${formId} not found`);
  }
}

// Afficher les éléments dans le listage
async function displayItems(items: (Category | Transaction | Budget)[], storeName: string, dbName: string, keyPath: string, fields: string[]) {
  const listing = document.getElementById(`${storeName}Listing`);
  if (listing) {
    listing.innerHTML = '';
    for (const item of items) {
      const listItem = document.createElement('li');
      console.log('Processing item:', item);

      if (isTransaction(item)) {
        try {
          const categoryId = Number(item.category);
          const category = await getItemById('CategoryDatabase', 'categories', 'id', categoryId);
          let categoryName = '';
          if (isCategory(category)) {
            categoryName = category.name;
          }
          listItem.textContent = `type: ${item.type}, name: ${item.name}, amount: ${item.amount}, category: ${categoryName}, date: ${item.date}`;
        } catch (error) {
          console.error('Error fetching category for transaction:', error);
        }
      } else if (isCategory(item)) {
        listItem.innerHTML = `name: ${item.name}`;
        if (item.icon) {
          const iconImg = document.createElement('img');
          iconImg.src = item.icon;
          iconImg.alt = `${item.name} icon`;
          iconImg.style.width = '20px';
          iconImg.style.height = '20px';
          listItem.appendChild(iconImg);
        }
      } else if (isBudget(item)) {
        try {
          const categoryId = Number(item.category);
          const category = await getItemById('CategoryDatabase', 'categories', 'id', categoryId);
          let categoryName = '';
          if (isCategory(category)) {
            categoryName = category.name;
          }
          let alertText = '';
          if (item.alert) {
            alertText = 'Alerte activée';
          }
          listItem.textContent = `category: ${categoryName}, budget: ${item.budget}, ${alertText}`;
        } catch (error) {
          console.error('Error fetching category for budget:', error);
        }
      }

      const editButton = createEditButton(item, storeName);
      const deleteButton = createDeleteButton(item, dbName, storeName, keyPath, fields);

      listItem.appendChild(editButton);
      listItem.appendChild(deleteButton);
      listing.appendChild(listItem);
    }
  } else {
    console.warn(`Listing element with ID ${storeName}Listing not found`);
  }
}

// Mettre à jour le listage avec les éléments de la base de données
export async function updateListing(dbName: string, storeName: string, keyPath: string, fields: string[]) {
  try {
    console.log(`Updating listing for ${storeName}`);
    const items = await getAllItems(dbName, storeName, keyPath);
    console.log(`Items fetched for ${storeName}:`, items);
    await displayItems(items, storeName, dbName, keyPath, fields);
  } catch (error) {
    console.error(`Error updating listing:`, error);
  }
}

// Créer un bouton d'édition pour un élément
function createEditButton(item: Category | Transaction | Budget, storeName: string): HTMLButtonElement {
  const editButton = document.createElement('button');
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', () => {
    const modalContent = document.getElementById('modal');
    if (modalContent) {
      modalContent.style.display = 'block';
    }
    console.log('Editing item:', item);
    fillFormWithItem(item, storeName);
  });
  return editButton;
}

// Créer un bouton de suppression pour un élément
function createDeleteButton(item: Category | Transaction | Budget, dbName: string, storeName: string, keyPath: string, fields: string[]): HTMLButtonElement {
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', () => {
    deleteItem(dbName, storeName, item.id, fields);
    updateListing(dbName, storeName, keyPath, fields);
  });
  return deleteButton;
}

// Remplir le formulaire avec les données de l'élément pour l'édition
function fillFormWithItem(item: Category | Transaction | Budget, storeName: string) {
    const form = document.getElementById(`${storeName}Form`) as HTMLFormElement;
    const inputElements = form.querySelectorAll('input, select');
  
    inputElements.forEach(input => {
        const fieldName = (input as HTMLInputElement | HTMLSelectElement).name;
        if (input instanceof HTMLInputElement && input.type === 'file') {
          const fileInput = input as HTMLInputElement;
          if (item[fieldName] !== undefined && item[fieldName]) {
            fileInput.value = ''; // Vider le champ de fichier
            const fileName = item[fieldName] as string;
            const fileNameField = form.querySelector(`input[name="${fieldName}Name"]`) as HTMLInputElement;
            if (fileNameField) {
              fileNameField.value = fileName; // Remplir le champ texte avec le nom du fichier
            }
          }
        } else {
          if (item[fieldName] !== undefined) {
            (input as HTMLInputElement).value = item[fieldName] as string;
          }
        }
  });

  const submitButton = form.querySelector('input[type="submit"]') as HTMLButtonElement;
  submitButton.value = `Mettre à jour`;
}