// async function handleFormSubmit(event: Event) {
//     event.preventDefault();

//     // Capture form data
//     const form = event.target as HTMLFormElement;
//     const formData = new FormData(form);
//     const categoryName = formData.get('category') as string;
//     const originalCategoryName = formData.get('originalCategoryName') as string || categoryName;

//     // Validate form data
//     if (!categoryName) {
//         displayErrorMessage('Category name is required');
//         return;
//     }

//     // Open or create IndexedDB database
//     try {
//         const db = await openCategoryDatabase();

//         // Check if category name already exists
//         const categoryExists = await checkCategoryExists(db, categoryName);
//         console.log(`Category exists: ${categoryExists}`); // Debugging log
//         if (categoryExists || categoryName !== originalCategoryName) {
//             displayErrorMessage('Category name already exists');
//             return;
//         }

//         // Add or update category in the database
//         await addCategory(db, { name: categoryName });
//         displayErrorMessage('Category saved successfully', false);

//         // Update category listing
//         await updateCategoryListing();

//         // Reset form
//         form.reset();
//         const modalContent = document.getElementById("modal") as HTMLElement;
//         if (modalContent) {
//             modalContent.style.display = "none";
//         }
//     } catch (error) {
//         console.error('Error saving category:', error);
//         displayErrorMessage('Error saving category');
//     }
// }

// function openCategoryDatabase(): Promise<IDBDatabase> {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open('CategoryDatabase', 1);

//         request.onerror = (event) => {
//             console.error('Error opening database:', event);
//             reject('Failed to open database');
//         };

//         request.onsuccess = (event) => {
//             const db = request.result;
//             resolve(db);
//         };

//         request.onupgradeneeded = (event) => {
//             const db = request.result;
//             if (!db.objectStoreNames.contains('categories')) {
//                 db.createObjectStore('categories', { keyPath: 'name' });
//             }
//         };
//     });
// }

// function addCategory(db: IDBDatabase, categoryData: { name: string }): Promise<void> {
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction('categories', 'readwrite');
//         const store = transaction.objectStore('categories');
//         const request = store.put(categoryData);

//         request.onsuccess = () => {
//             resolve();
//         };

//         request.onerror = (event) => {
//             console.error('Error saving category:', event);
//             reject('Failed to save category');
//         };
//     });
// }

// // Function to delete category from the database
// function deleteCategory(db: IDBDatabase, categoryName: string): Promise<void> {
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction('categories', 'readwrite');
//         const store = transaction.objectStore('categories');
//         const request = store.delete(categoryName);

//         request.onsuccess = () => {
//             resolve();
//         };

//         request.onerror = (event) => {
//             console.error('Error deleting category:', event);
//             reject('Failed to delete category');
//         };
//     });
// }

// function checkCategoryExists(db: IDBDatabase, categoryName: string): Promise<boolean> {
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction('categories', 'readonly');
//         const store = transaction.objectStore('categories');
//         const request = store.get(categoryName);

//         request.onsuccess = () => {
//             resolve(Boolean(request.result));
//         };

//         request.onerror = (event) => {
//             console.error('Error checking category existence:', event);
//             reject('Failed to check category existence');
//         };
//     });
// }

// async function updateCategoryListing() {
//     const db = await openCategoryDatabase();
//     const transaction = db.transaction('categories', 'readonly');
//     const store = transaction.objectStore('categories');
//     const request = store.getAll();

//     request.onsuccess = () => {
//         const categories = request.result;
//         const categoryListing = document.getElementById('categoryListing');
//         if (categoryListing) {
//             categoryListing.innerHTML = '';
//             categories.forEach((category: { name: string; icon: string }) => {
//                 const listItem = document.createElement('li');
//                 listItem.textContent = `${category.name}`;

//                 // Create edit button
//                 const editButton = document.createElement('button');
//                 const modalContent = document.getElementById("modal") as HTMLElement;
//                 editButton.onclick = function () {
//                     if (modalContent) {
//                         modalContent.style.display = "block";
//                     }
//                 };

//                 editButton.textContent = ' - Edit';
//                 editButton.addEventListener('click', () => {
//                     const form = document.getElementById('categoryForm') as HTMLFormElement;
//                     (form.elements.namedItem('category') as HTMLInputElement).value = category.name;
//                     (form.elements.namedItem('originalCategoryName') as HTMLInputElement).value = category.name;
//                     (form.querySelector('input[type="submit"]') as HTMLButtonElement).value = 'Mettre à jour';
//                 });

//                 // Create delete button
//                 const deleteButton = document.createElement('button');
//                 deleteButton.textContent = ' - Delete';
//                 deleteButton.addEventListener('click', async () => {
//                     const confirmed = confirm(`Are you sure you want to delete the category "${category.name}"?`);
//                     if (confirmed) {
//                         try {
//                             await deleteCategory(db, category.name);
//                             await updateCategoryListing();
//                         } catch (error) {
//                             console.error('Error deleting category:', error);
//                         }
//                     }
//                 });

//                 listItem.appendChild(editButton);
//                 listItem.appendChild(deleteButton);
//                 categoryListing.appendChild(listItem);
//             });
//         }
//     };

//     request.onerror = (event) => {
//         console.error('Error fetching categories:', event);
//     };
// }

// // Attach event listener to the form using MutationObserver
// const observer = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//         if (mutation.type === 'childList') {
//             const form = document.getElementById('categoryForm') as HTMLFormElement;
//             if (form) {
//                 form.addEventListener('submit', handleFormSubmit);
//                 observer.disconnect(); // Stop observing once the form is found
//             }
//         }
//     });
// });

// // Start observing the document body for added nodes
// observer.observe(document.body, { childList: true, subtree: true });

// // Update category listing on page load
// document.addEventListener('DOMContentLoaded', updateCategoryListing);

// function displayErrorMessage(message: string, isError: boolean = true) {
//     if (isError) {
//         const modalContent = document.getElementById("categoryForm") as HTMLElement;
//         if (modalContent) {
//             let errorElement = modalContent.querySelector('.error') as HTMLParagraphElement;
//             if (!errorElement) {
//                 errorElement = document.createElement('p');
//                 errorElement.className = 'error';
//                 errorElement.id = 'error-message';
//                 modalContent.appendChild(errorElement);
//             }
//             errorElement.textContent = message;
//             errorElement.style.color = 'red';
//         }
//     } else {
//         const categoryListing = document.getElementById('categoryListing');
//         if (categoryListing) {
//             let successElement = categoryListing.querySelector('.success') as HTMLParagraphElement;
//             if (!successElement) {
//                 successElement = document.createElement('p');
//                 successElement.className = 'success';
//                 categoryListing.insertBefore(successElement, categoryListing.firstChild);
//             }
//             successElement.textContent = message;
//             successElement.style.color = 'green';
//         }
//     }
// }
