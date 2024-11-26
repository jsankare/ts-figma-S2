// function openBudgetCategoryDatabase(): Promise<IDBDatabase> {
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

// // Fetch categories and populate the select element
// async function populateCategories() {
//     try {
//         const db = await openBudgetCategoryDatabase();
//         const transaction = db.transaction('categories', 'readonly');
//         const store = transaction.objectStore('categories');
//         const request = store.getAll();

//         request.onsuccess = () => {
//             const categories = request.result;
//             const selectElement = document.getElementById('category') as HTMLSelectElement;
//             if (selectElement) {
//                 categories.forEach((category: { name: string }) => {
//                     const option = document.createElement('option');
//                     option.value = category.name;
//                     option.textContent = category.name;
//                     selectElement.appendChild(option);
//                 });
//             }
//         };

//         request.onerror = (event) => {
//             console.error('Error fetching categories:', event);
//         };
//     } catch (error) {
//         console.error('Error opening database:', error);
//     }
// }



// // Handle budget form submission
// async function handleBudgetFormSubmit(event: Event) {
//     event.preventDefault();

//     // Capture form data
//     const form = event.target as HTMLFormElement;
//     const formData = new FormData(form);
//     const category = formData.get('category') as string;
//     const budget = parseFloat(formData.get('budget') as string);
//     const budgetId = formData.get('budgetId') ? parseInt(formData.get('budgetId') as string) : null;

//     // Validate form data
//     if (!category || isNaN(budget)) {
//         displayMessage('Category and budget are required');
//         return;
//     }

//     // Open or create IndexedDB database
//     try {
//         const db = await openBudgetDatabase();

//         // Add budget to the database
//         if (budgetId !== null) {
//             // Update existing budget
//             await updateBudget(db, { id: budgetId, category, budget });
//             displayMessage('Budget updated successfully', false);
//         } else {
//             // Add new budget
//             await addBudget(db, { category, budget });
//             displayMessage('Budget saved successfully', false);
//         }

//         await updateBudgetListing();

//         // Reset form
//         const modalContent = document.getElementById("modal") as HTMLElement;
//         if (modalContent) {
//             modalContent.style.display = "none";
//         }
//         clearBudgetErrorMessage();
//         form.reset();
//     } catch (error) {
//         console.error('Error saving budget:', error);
//         displayMessage('Error saving budget');
//     }
// }

// function openBudgetDatabase(): Promise<IDBDatabase> {
//     return new Promise((resolve, reject) => {
//         const request = indexedDB.open('BudgetDatabase', 1);

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
//             if (!db.objectStoreNames.contains('budgets')) {
//                 db.createObjectStore('budgets', { keyPath: 'id', autoIncrement: true });
//             }
//         };
//     });
// }

// function addBudget(db: IDBDatabase, budgetData: { category: string, budget: number }): Promise<void> {
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction('budgets', 'readwrite');
//         const store = transaction.objectStore('budgets');
//         const request = store.add(budgetData);

//         request.onsuccess = () => {
//             resolve();
//         };

//         request.onerror = (event) => {
//             console.error('Error saving budget:', event);
//             reject('Failed to save budget');
//         };
//     });
// }

// function updateBudget(db: IDBDatabase, budgetData: { id: number, category: string, budget: number }): Promise<void> {
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction('budgets', 'readwrite');
//         const store = transaction.objectStore('budgets');
//         const request = store.put(budgetData);

//         request.onsuccess = () => {
//             resolve();
//         };

//         request.onerror = (event) => {
//             console.error('Error updating budget:', event);
//             reject('Failed to update budget');
//         };
//     });
// }

// async function updateBudgetListing() {
//     try {
//         const db = await openBudgetDatabase();
//         const transaction = db.transaction('budgets', 'readonly');
//         const store = transaction.objectStore('budgets');
//         const request = store.getAll();

//         request.onsuccess = () => {
//             const budgets = request.result;
//             const budgetListing = document.getElementById('budgetListing');
//             if (budgetListing) {
//                 budgetListing.innerHTML = '';
//                 budgets.forEach((budget: { id: number, category: string, budget: number }) => {
//                     const listItem = document.createElement('li');
//                     listItem.textContent = `Category: ${budget.category}, Budget: ${budget.budget}`;

//                     // Create edit button
//                     const editButton = document.createElement('button');
//                     const modalContent = document.getElementById("modal") as HTMLElement;
//                     editButton.textContent = 'Edit';
//                     editButton.addEventListener('click', () => {
//                         if (modalContent) {
//                             modalContent.style.display = "block";
//                         }
//                         const form = document.getElementById('budgetForm') as HTMLFormElement;
//                         (form.elements.namedItem('category') as HTMLInputElement).value = budget.category;
//                         (form.elements.namedItem('budget') as HTMLInputElement).value = budget.budget.toString();
//                         (form.elements.namedItem('budgetId') as HTMLInputElement).value = budget.id.toString();
//                         (form.querySelector('input[type="submit"]') as HTMLButtonElement).value = 'Update';
//                     });

//                     // Create delete button
//                     const deleteButton = document.createElement('button');
//                     deleteButton.textContent = 'Delete';
//                     deleteButton.addEventListener('click', async () => {
//                         const confirmed = confirm(`Are you sure you want to delete the budget for category "${budget.category}"?`);
//                         if (confirmed) {
//                             try {
//                                 await deleteBudget(db, budget.id);
//                                 await updateBudgetListing();
//                             } catch (error) {
//                                 console.error('Error deleting budget:', error);
//                             }
//                         }
//                     });

//                     listItem.appendChild(editButton);
//                     listItem.appendChild(deleteButton);
//                     budgetListing.appendChild(listItem);
//                 });
//             }
//         };

//         request.onerror = (event) => {
//             console.error('Error fetching budgets:', event);
//         };
//     } catch (error) {
//         console.error('Error opening database:', error);
//     }
// }

// // Function to delete a budget from the database
// function deleteBudget(db: IDBDatabase, budgetId: number): Promise<void> {
//     return new Promise((resolve, reject) => {
//         const transaction = db.transaction('budgets', 'readwrite');
//         const store = transaction.objectStore('budgets');
//         const request = store.delete(budgetId);

//         request.onsuccess = () => {
//             resolve();
//         };

//         request.onerror = (event) => {
//             console.error('Error deleting budget:', event);
//             reject('Failed to delete budget');
//         };
//     });
// }

// // Attach event listener to the form using MutationObserver
// const budgetObserver = new MutationObserver((mutations) => {
//     mutations.forEach((mutation) => {
//         if (mutation.type === 'childList') {
//             const form = document.getElementById('budgetForm') as HTMLFormElement;
//             if (form) {
//                 form.addEventListener('submit', handleBudgetFormSubmit);
//                 populateCategories();
//                 updateBudgetListing();
//                 budgetObserver.disconnect(); // Stop observing once the form is found
//             }
//         }
//     });
// });

// // Start observing the document body for added nodes
// budgetObserver.observe(document.body, { childList: true, subtree: true });

// function displayMessage(message: string, isError: boolean = true) {
//     const messageElement = document.createElement('p');
//     messageElement.textContent = message;
//     messageElement.style.color = isError ? 'red' : 'green';

//     if (isError) {
//         const form = document.getElementById('budgetForm');
//         if (form) {
//             let errorElement = form.querySelector('.error') as HTMLParagraphElement;
//             if (!errorElement) {
//                 errorElement = document.createElement('p');
//                 errorElement.className = 'error';
//                 form.appendChild(errorElement);
//             }
//             errorElement.textContent = message;
//             errorElement.style.color = 'red';
//         }
//     } else {
//         const listingBudget = document.getElementById('budgetListing');
//         if (listingBudget) {
//             let successElement = listingBudget.querySelector('.success') as HTMLParagraphElement;
//             if (!successElement) {
//                 successElement = document.createElement('p');
//                 successElement.className = 'success';
//                 listingBudget.insertBefore(successElement, listingBudget.firstChild);
//             }
//             successElement.textContent = message;
//             successElement.style.color = 'green';
//         }
//     }
// }

// function clearBudgetErrorMessage() {
//     const errorElement = document.querySelector('.error');
//     if (errorElement) {
//         errorElement.remove();
//     }
// }


document.addEventListener('DOMContentLoaded', () => {
    const forms = [
        { formId: 'budgetsForm', dbName: 'BudgetDatabase', storeName: 'budgets', keyPath: 'id', fields: ['category', 'budget'] },
        { formId: 'categoriesForm', dbName: 'CategoryDatabase', storeName: 'categories', keyPath: 'id', fields: ['name'] },
        { formId: 'transactionsForm', dbName: 'TransactionDatabase', storeName: 'transactions', keyPath: 'id', fields: ['category', 'type', 'name', 'date', 'amount'] }
    ];

    forms.forEach(({ formId, dbName, storeName, keyPath, fields }) => {
        const form = document.getElementById(formId) as HTMLFormElement;
        if (form) {
            form.addEventListener('submit', (event) => handleFormSubmit(event, dbName, storeName, keyPath, fields));
            updateListing(dbName, storeName, keyPath, fields);
        }
    });
});

// Utility Functions
function openElementDatabase(dbName: string, storeName: string, keyPath: string): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, 1);

        request.onerror = (event) => {
            console.error(`Error opening ${dbName}:`, event);
            reject(`Failed to open ${dbName}`);
        };

        request.onsuccess = (event) => {
            const db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = request.result;
            if (!db.objectStoreNames.contains(storeName)) {
                db.createObjectStore(storeName, { keyPath });
            }
        };
    });
}

function addOrUpdateItem(db: IDBDatabase, storeName: string, item: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error(`Error saving item in ${storeName}:`, event);
            reject(`Failed to save item in ${storeName}`);
        };
    });
}

function deleteItem(db: IDBDatabase, storeName: string, key: any): Promise<void> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
            resolve();
        };

        request.onerror = (event) => {
            console.error(`Error deleting item from ${storeName}:`, event);
            reject(`Failed to delete item from ${storeName}`);
        };
    });
}

async function fetchItems(db: IDBDatabase, storeName: string): Promise<any[]> {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = (event) => {
            console.error(`Error fetching items from ${storeName}:`, event);
            reject(`Failed to fetch items from ${storeName}`);
        };
    });
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

// function clearErrorMessage() {
//     const errorElement = document.querySelector('.error');
//     if (errorElement) {
//         errorElement.remove();
//     }
// }

// Specific Functions for Budgets, Categories, and Transactions
async function handleFormSubmit(event: Event, dbName: string, storeName: string, keyPath: string, fields: string[]) {
    event.preventDefault();

    // Capture form data
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);
    const item: any = {};
    fields.forEach(field => {
        item[field] = formData.get(field);
    });
    const itemId = formData.get(`${keyPath}`) ? parseInt(formData.get(`${keyPath}`) as string) : null;

    // Validate form data
    for (const field of fields) {
        if (!item[field]) {
            displayMessage('All fields are required', true);
            return;
        }
    }

    // Open or create IndexedDB database
    try {
        const db = await openElementDatabase(dbName, storeName, keyPath);

        if (itemId !== null) {
            // Update existing item
            item[keyPath] = itemId;
            await addOrUpdateItem(db, storeName, item);
            displayMessage(`${storeName.slice(0, -1)} updated successfully`, false);
        } else {
            // Add new item
            await addOrUpdateItem(db, storeName, item);
            displayMessage(`${storeName.slice(0, -1)} saved successfully`, false);
        }

        await updateListing(dbName, storeName, keyPath, fields);

        // Reset form
        form.reset();
        (form.querySelector('input[type="submit"]') as HTMLButtonElement).value = 'Add';
    } catch (error) {
        console.error(`Error saving ${storeName.slice(0, -1)}:`, error);
        displayMessage(`Error saving ${storeName.slice(0, -1)}`, true);
    }
}

async function updateListing(dbName: string, storeName: string, keyPath: string, fields: string[]) {
    try {
        const db = await openElementDatabase(dbName, storeName, keyPath);
        const items = await fetchItems(db, storeName);
        const listing = document.getElementById(`${storeName}Listing`);
        if (listing) {
            listing.innerHTML = '';
            items.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = fields.map(field => `${field}: ${item[field]}`).join(', ');

                // Create edit button
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => {
                    const form = document.getElementById(`${storeName}Form`) as HTMLFormElement;
                    if (form) {
                        fields.forEach(field => {
                            const formElement = form.elements.namedItem(field) as HTMLInputElement;
                            if (formElement) {
                                formElement.value = item[field];
                            }
                        });

                        const keyElement = form.elements.namedItem(keyPath) as HTMLInputElement;
                        if (keyElement) {
                            keyElement.value = item[keyPath];
                        }

                        (form.querySelector('input[type="submit"]') as HTMLButtonElement).value = 'Update';
                    }
                });

                // Create delete button
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', async () => {
                    const confirmed = confirm(`Are you sure you want to delete this ${storeName.slice(0, -1)}?`);
                    if (confirmed) {
                        try {
                            await deleteItem(db, storeName, item[keyPath]);
                            await updateListing(dbName, storeName, keyPath, fields);
                        } catch (error) {
                            console.error(`Error deleting ${storeName.slice(0, -1)}:`, error);
                        }
                    }
                });

                listItem.appendChild(editButton);
                listItem.appendChild(deleteButton);
                listing.appendChild(listItem);
            });
        }
    } catch (error) {
        console.error(`Error updating ${storeName} listing:`, error);
    }
}