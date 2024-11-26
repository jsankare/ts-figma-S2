import { openDatabase } from './openDatabase.js';

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

  const today = new Date();
  const formattedDate = today.toISOString().split("T")[0];
  const dateInput = document.getElementById("date") as HTMLInputElement;
  if (dateInput) {
    dateInput.value = formattedDate;
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
        <h1 class="form-title">Ajouter ${getModalTitle(type)}</h1>
        <hr class="form-separator"/>
        ${formContent}
        <div class="form-buttons">
          <button id="close" class="button button-secondary">Annuler</button>
          <input class="button button-primary" type="submit" value="Ajouter">
        </div>
      </div>
    `;

    // Fetch categories and update the category select elements
    const categories = await fetchCategories();
    const categoryOptions = categories.map(category =>
      category.id && category.name ? `<option value="${category.id}">${category.name}</option>` : ''
    ).join('');
    console.log('Generated category options:', categoryOptions);

    // Populate the category selects in the modal
    const categorySelects = modalContent.querySelectorAll('.categorySelect') as NodeListOf<HTMLSelectElement>;
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

  function getModalTitle(type: string): string {
    switch (type) {
      case 'category':
        return 'une catégorie';
      case 'budget':
        return 'un budget';
      case 'transaction':
        return 'une transaction';
      default:
        return '';
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
          <form class="modal-form" id="categoryForm" action="">
            <input class="input input-hidden" type="hidden" name="originalCategoryName">
            <label class="label label-text" for="category">Nom de la catégorie</label>
            <input class="input input-text" type="text" name="category" id="category" required>
            <label class="label label-icons" for="icon">Choisir une icône</label>
            <section class="category-icon-container">
              <!-- Icon selection content -->
            </section>
          </form>`;

      case 'budget':
        return `
          <form class="modal-form" id="budgetForm" action="">
            <label class="label label-text" for="name">Nom du budget</label>
            <input class="input input-text" placeholder="Le nom du budget" type="text" name="name" id="name" required>
            <label class="label label-select" for="category">Catégorie</label>
            <select class="input input-select categorySelect" name="category" id="category" required>
              <option value=""></option>
            </select>
            <label class="label label-number" for="budget">Budget</label>
            <input class="input input-number" type="number" name="budget" id="budget" required>
            <div class="checkbox-input-container">
              <label class="label label-checkbox" for="alert">Être alerté lors du dépassement</label>
              <div class="custom-checkbox-container">
                <input type="checkbox" id="alert" class="input-checkbox">
                <label for="alert" class="custom-checkbox"></label>
              </div>
            </div>
          </form>`;

      case 'transaction':
        return `
          <form class="modal-form" id="transactionForm" action="">
            <label class="label label-text" for="name">Libellé</label>
            <input class="input input-text" placeholder="Achat compulsif sur amazon .." type="text" name="name" id="name" required>
            <label class="label label-select" for="type">Type de transaction</label>
            <select class="input input-select" name="type" id="type" required>
              <option class="select-option" value="credit">Crédit</option>
              <option class="select-option" value="debit">Débit</option>
            </select>
            <label class="label label-number" for="amount">Montant</label>
            <input class="input input-number" type="number" name="amount" id="amount" required>
            <label class="label label-select" for="category">Catégorie</label>
            <select class="input input-select categorySelect" name="category" id="category" required>
              <option value=""></option>
            </select>
            <label class="label label-date" for="date">Date</label>
            <input class="input input-date" type="date" name="date" id="date" required>
          </form>`;

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
        const submitButton = modalContent.querySelector('input[type="submit"]') as HTMLInputElement;
        if(submitButton) {
          submitButton.value = "Ajouter";
        }
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