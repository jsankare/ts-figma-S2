// Function to handle form submission
async function handleFormSubmit(event: Event) {
    event.preventDefault();

    // Capture form data
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const categoryName = formData.get('category') as string;
    const categoryIcon = formData.get('icon') as string;
    
    // Validate form data
    if (!categoryName) {
        alert('Category name is required');
        return;
    }

    // Open or create IndexedDB database
    const db = await openDatabase();

    // Add category to the database
    try {
        await addCategory(db, { name: categoryName, icon: categoryIcon });
        alert('Category added successfully');
    } catch (error) {
        console.error('Error adding category:', error);
        alert('Error adding category');
    }
}

// Function to open or create IndexedDB database
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CategoryDatabase', 1);

        request.onerror = (event) => {
            console.error('Error opening database:', event);
            reject('Failed to open database');
        };

        request.onsuccess = (event) => {
            const db = request.result;
            console.log('Database opened successfully');
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = request.result;
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'name' });
                console.log('Object store "categories" created');
            }
        };
    });
}

// Function to add category to the database
function addCategory(db: IDBDatabase, categoryData: { name: string; icon: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('categories', 'readwrite');
        const store = transaction.objectStore('categories');
        const request = store.add(categoryData);

        request.onsuccess = () => {
            console.log('Category added successfully');
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error adding category:', event);
            reject('Failed to add category');
        };
    });
}

// Attach event listener to the form
document.getElementById('categoryForm')?.addEventListener('submit', handleFormSubmit);