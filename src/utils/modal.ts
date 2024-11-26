interface Category {
  id: number;
  name: string;
  icon?: string;
}

document.addEventListener("DOMContentLoaded", () => {
  const modalContent = document.getElementById("modal") as HTMLElement;
  const dataType = modalContent?.getAttribute("data-type");

  console.log("Modal content:", modalContent);
  console.log("Data-type attribute:", dataType);

  if (dataType) {
    console.log(`Creating modal for type: ${dataType}`);
    createModal(dataType, modalContent);
  } else {
    console.error("No data-type attribute found on modal element");
  }

  // Fetch categories from IndexedDB
  async function fetchCategories(): Promise<Category[]> {
    console.log('Fetching categories...');
    try {
      const db = await openDatabase('CategoryDatabase', 'categories', 'id');
      console.log('Database opened successfully');
      const transaction = db.transaction('categories', 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.getAll();

      return new Promise<Category[]>((resolve, reject) => {
        request.onsuccess = (event) => {
          const categories = (event.target as IDBRequest<Category[]>).result;
          console.log('Fetched categories:', categories);
          resolve(categories);
        };

        request.onerror = (event) => {
          console.error('Error fetching categories from database:', (event.target as IDBRequest).error);
          reject([]);
        };
      });
    } catch (error) {
      console.error('Error opening database:', error);
      return [];
    }
  }

  // Create the modal based on the type
  async function createModal(type: string, modalContent: HTMLElement) {
    console.log(`Creating modal for type: ${type}`);

    // Start by creating the form structure without category options
    const formContent = getFormContent(type);
    if (!formContent) {
      console.error("Unknown modal type");
      return;
    }

    console.log('Setting modal content...');
    modalContent.innerHTML = `
      <div class="modal-content">
        <button id="close">&times;</button>
        ${formContent}
        <input type="submit" value="Ajouter">
      </div>
    `;

    // Fetch categories and update the category select elements
    const categories = await fetchCategories();
    const categoryOptions = categories.map(category =>
      category.id && category.name ? `<option value="${category.id}">${category.name}</option>` : ''
    ).join('');
    console.log('Generated category options:', categoryOptions);

    // Populate the category selects in the modal
    const categorySelects = modalContent.querySelectorAll('select');
    categorySelects.forEach(select => {
      select.innerHTML = `<option value=""></option>${categoryOptions}`;
    });

    // Initialize close button
    const closeButton = modalContent.querySelector('#close') as HTMLElement;
    if (closeButton) {
      console.log('Close button found');
      closeButton.onclick = () => {
        console.log('Closing modal...');
        modalContent.style.display = "none";
        const form = modalContent.querySelector('form') as HTMLFormElement;
        if (form) {
          form.reset();
          clearErrorMessage();
        }
      };
    }

    // Prevent form submission from reloading the page
    const form = modalContent.querySelector('form') as HTMLFormElement;
    if (form) {
      form.onsubmit = (event) => {
        event.preventDefault();
        handleSubmitForm(event);
      };
    }
  }

  // Handle form submission logic
  function handleSubmitForm(event: Event) {
    const form = event.target as HTMLFormElement;
    console.log("Form submitted:", form);
    // Perform form submission tasks, e.g., saving to IndexedDB or sending to a server
    form.reset();
  }

  // Generate form content based on modal type
  function getFormContent(type: string): string | null {
    console.log(`Getting form content for type: ${type}`);
    switch (type) {
      case 'category':
        return ` 
          <form id="categoriesForm" action="">
            <input type="hidden" name="id">
            <label for="category">Nom de la catégorie</label>
            <input type="text" name="name" id="category" required>
            <label for="categoryIcon">Icône</label>
            <input type="file" name="icon" id="categoryIcon" accept="image/*" required>
        `;
      case 'budget':
        return `
          <form id="budgetsForm" action="">
            <input type="hidden" name="id" id="budgetId">
            <label for="budgetCategorySelect">Catégorie</label>
            <select name="category" id="budgetCategorySelect" required>
              <option value=""></option>
            </select>
            <label for="budget">Budget</label>
            <input type="number" name="budget" id="budget" required>
            <input type="checkbox" name="alert" id="alert">
            <label for="alert">Recevoir une alerte</label>
          `;
      case 'transaction':
        return `
          <form id="transactionsForm" action="">
            <label for="type">Type de transaction</label>
            <select name="type" id="type" required>
              <option value="credit">Crédit</option>
              <option value="debit">Débit</option>
            </select>
            <label for="name">Libellé</label>
            <input type="text" name="name" id="name" required>
            <label for="amount">Montant</label>
            <input type="number" name="amount" id="amount" required>
            <label for="transactionCategorySelect">Catégorie</label>
            <select name="category" id="transactionCategorySelect" required>
              <option value=""></option>
            </select>
            <label for="date">Date</label>
            <input type="date" name="date" id="date" required>
          `;
      default:
        console.error('Unknown form type');
        return null;
    }
  }

  const btn = document.getElementById("openModal");
  const span = document.getElementById("close");

  if (btn) {
    console.log('Open modal button found');
    btn.onclick = () => {
      if (modalContent) {
        console.log('Opening modal...');
        modalContent.style.display = "block";
      }
    };
  }

  if (span) {
    console.log('Close button found');
    span.onclick = () => {
      if (modalContent) {
        console.log('Closing modal...');
        modalContent.style.display = "none";
        const form = modalContent.querySelector('form') as HTMLFormElement;
        if (form) {
          form.reset();
          clearErrorMessage();
        }
      }
    };
  }
});

function clearErrorMessage() {
  const errorElement = document.querySelector('.error');
  if (errorElement) {
    console.log('Clearing error message');
    errorElement.remove();
  }
}

async function openDatabase(dbName: string, storeName: string, keyPath: string): Promise<IDBDatabase> {
  console.log('Opening database:', dbName);
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(storeName)) {
        console.log(`Creating object store: ${storeName}`);
        db.createObjectStore(storeName, { keyPath: keyPath });
      }
    };

    request.onsuccess = (event) => {
      console.log('Database opened successfully');
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      console.error('Error opening database:', (event.target as IDBOpenDBRequest).error);
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}
