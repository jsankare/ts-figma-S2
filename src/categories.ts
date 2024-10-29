// Function to handle form submission
async function handleFormSubmit(event: Event) {
    event.preventDefault();

    // Capture form data
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const categoryName = formData.get('category') as string;
    const categoryIcon = formData.get('icon') as string;
    const originalCategoryName = formData.get('originalCategoryName') as string || categoryName;
    
    // Validate form data
    if (!categoryName) {
        alert('Category name is required');
        return;
    }

    // Open or create IndexedDB database
    try {
        const db = await openCategoryDatabase();

        // Check if we are updating an existing category
        if (originalCategoryName !== categoryName) {
            await deleteCategory(db, originalCategoryName);
        }

        // Add or update category in the database
        await addCategory(db, { name: categoryName, icon: categoryIcon });
        alert('Category saved successfully');

        // Update category listing
        await updateCategoryListing();

        // Reset form
        form.reset();
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Error saving category');
    }
}

// Function to open or create IndexedDB database
function openCategoryDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CategoryDatabase', 1);

        request.onerror = (event) => {
            console.error('Error opening database:', event);
            reject('Failed to open database');
        };

        request.onsuccess = (event) => {
            const db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = request.result;
            if (!db.objectStoreNames.contains('categories')) {
                db.createObjectStore('categories', { keyPath: 'name' });
            }
        };
    });
}

// Function to add or update category in the database
function addCategory(db: IDBDatabase, categoryData: { name: string; icon: string }): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('categories', 'readwrite');
        const store = transaction.objectStore('categories');
        const request = store.put(categoryData);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error saving category:', event);
            reject('Failed to save category');
        };
    });
}

// Function to delete category from the database
function deleteCategory(db: IDBDatabase, categoryName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction('categories', 'readwrite');
        const store = transaction.objectStore('categories');
        const request = store.delete(categoryName);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error('Error deleting category:', event);
            reject('Failed to delete category');
        };
    });
}

// Function to fetch and list all categories
async function updateCategoryListing() {
    const db = await openCategoryDatabase();
    const transaction = db.transaction('categories', 'readonly');
    const store = transaction.objectStore('categories');
    const request = store.getAll();

    request.onsuccess = () => {
        const categories = request.result;
        const categoryListing = document.getElementById('categoryListing');
        if (categoryListing) {
            categoryListing.innerHTML = '';
            categories.forEach((category: { name: string; icon: string }) => {
                const listItem = document.createElement('li');
                listItem.textContent = `${category.name} - ${category.icon}`;

                // Create edit button
                const editButton = document.createElement('button');
                const modalContent = document.getElementById("modal") as HTMLElement;
                editButton.onclick = function () {
                    if (modalContent) {
                        modalContent.style.display = "block";
                    }
                };
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => {
                    const form = document.getElementById('categoryForm') as HTMLFormElement;
                    (form.elements.namedItem('category') as HTMLInputElement).value = category.name;
                    (form.elements.namedItem('icon') as HTMLInputElement).value = category.icon;
                    (form.elements.namedItem('originalCategoryName') as HTMLInputElement).value = category.name;
                });

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', async () => {
                    const confirmed = confirm(`Are you sure you want to delete the category "${category.name}"?`);
                    if (confirmed) {
                        try {
                            await deleteCategory(db, category.name);
                            await updateCategoryListing();
                        } catch (error) {
                            console.error('Error deleting category:', error);
                        }
                    }
                });

                listItem.appendChild(editButton);
                listItem.appendChild(deleteButton);
                categoryListing.appendChild(listItem);
            });
        }
    };

    request.onerror = (event) => {
        console.error('Error fetching categories:', event);
    };
}

// Attach event listener to the form using MutationObserver
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            const form = document.getElementById('categoryForm') as HTMLFormElement;
            if (form) {
                form.addEventListener('submit', handleFormSubmit);
                observer.disconnect(); // Stop observing once the form is found
            }
        }
    });
});

// Start observing the document body for added nodes
observer.observe(document.body, { childList: true, subtree: true });

// Update category listing on page load
document.addEventListener('DOMContentLoaded', updateCategoryListing);