interface Category {
  id: number;
  name: string;
  icon?: string;
}

document.addEventListener("DOMContentLoaded", () => {
  const modalContent = document.getElementById("modal") as HTMLElement;
  const dataType = modalContent?.getAttribute("data-type");

  if (dataType) {
    createModal(dataType, modalContent);
  }

  async function fetchCategories(): Promise<Category[]> {
    try {
      const db = await openDatabase('CategoryDatabase', 'categories', 'id');
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

  async function createModal(type: string, modalContent: HTMLElement) {
    const categories = await fetchCategories();
    const categoryOptions = categories.map(category => 
      category.id && category.name ? `<option value="${category.id}">${category.name}</option>` : ''
    ).join('');

    const formContent = getFormContent(type, categoryOptions);
    if (!formContent) {
      console.log("Unknown modal type");
      return;
    }

    modalContent.innerHTML = `
      <div class="modal-content">
        <button id="close">&times;</button>
        ${formContent}
        <input type="submit" value="Ajouter">
      </form>
    </div>`;
  }

  function getFormContent(type: string, categoryOptions: string): string | null {
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
          <form action="" id="budgetsForm">
            <input type="hidden" name="id" id="budgetId">
            <label for="budgetCategorySelect">Catégorie</label>
            <select name="category" id="budgetCategorySelect" required>
              <option value=""></option>
              ${categoryOptions}
            </select>
            <label for="budget">Budget</label>
            <input type="number" name="budget" id="budget" required>
            <input type="checkbox" name="alert" id="alert">
            <label for="alert">Recevoir une alerte</label>`;
      case 'transaction':
        return `
          <form action="" id="transactionsForm">
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
              ${categoryOptions}
            </select>
            <label for="date">Date</label>
            <input type="date" name="date" id="date" required>`;
      default:
        return null;
    }
  }

  const btn = document.getElementById("openModal");
  const span = document.getElementById("close");

  if (btn) {
    btn.onclick = () => {
      if (modalContent) {
        modalContent.style.display = "block";
      }
    };
  }

  if (span) {
    span.onclick = () => {
      if (modalContent) {
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
    errorElement.remove();
  }
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