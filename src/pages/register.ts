import { hashPassword } from "../core/auth/hashPassword.js";
import { openDatabase } from "../core/database/openDatabase.js";
import { toastAlert } from "../shared/components/alert.js";

// Add user in database
function addUser(
  db: IDBDatabase,
  userData: {
    email: string;
    password: string;
    firstname: string;
    lastname: string;
    picture: string;
    createdAt: Date;
    updatedAt: Date;
  },
): Promise<void> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("users", "readwrite");
    const store = transaction.objectStore("users");
    const request = store.add(userData);

    request.onsuccess = () => resolve();
    request.onerror = (event) => {
      console.error("Erreur lors de l'ajout de l'utilisateur", event);
      reject("Échec de l'ajout de l'utilisateur");
    };
  });
}

// Register
async function handleRegister(event: Event): Promise<void> {
  event.preventDefault();

  const email = (document.getElementById("mail") as HTMLInputElement).value;
  const firstname = (document.getElementById("firstname") as HTMLInputElement)
    .value;
  const lastname = (document.getElementById("lastname") as HTMLInputElement)
    .value;
  const password = (document.getElementById("password") as HTMLInputElement)
    .value;
  const picture = ""; // Add default picture or handle if needed
  const createdAt = new Date();
  const updatedAt = new Date();

  try {
    const db = await openDatabase("UserDatabase", "users", "email");
    const userExists = await checkUserExists(db, email);

    if (userExists) {
      toastAlert("error", "Un utilisateur avec cet e-mail existe déjà !");
      return; // Stop the registration process if user exists
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const userData = {
      email,
      password: hashedPassword,
      lastname,
      firstname,
      picture,
      createdAt,
      updatedAt,
    };

    await addUser(db, userData);
    toastAlert("success", "Enregistrement réussi !");
    window.location.href = "login.html"; // Redirect after successful registration
  } catch (error) {
    console.error("Échec de l'enregistrement", error);
    toastAlert("error", "Une erreur est survenue, veuillez réessayer");
  }
}

// Check if user already exists in db by querying the email index
function checkUserExists(db: IDBDatabase, email: string): Promise<boolean> {
  return new Promise((resolve) => {
    const transaction = db.transaction("users", "readonly");
    const store = transaction.objectStore("users");

    // Accessing the "email" index to search the user
    const index = store.index("email"); // Assuming an index exists on 'email'
    const request = index.get(email);

    request.onsuccess = () => {
      resolve(Boolean(request.result)); // Resolve true if result is found
    };
    request.onerror = () => {
      resolve(false); // If the request fails, assume the email is not found
    };
  });
}

// Add submit event listener to form, check if form exists
const form = document.querySelector("form");
form?.addEventListener("submit", handleRegister);

export function displayPassword(
  toggleId?: string,
  field?: string,
  icon?: string,
) {
  console.log("displayPassword");
  if (!toggleId) {
    toggleId = "togglePassword";
  }
  const togglePassword = document.getElementById(toggleId);
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      if (!field) {
        field = "password";
      }
      const passwordField = document.getElementById(field) as HTMLInputElement;
      if (!icon) {
        icon = "passwordIcon";
      }
      const passwordIcon = document.getElementById(icon) as HTMLElement;

      if (passwordField.type === "password") {
        passwordField.type = "text";
        passwordIcon.innerHTML = `
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10 10.5007C9.17305 10.5007 8.50005 9.82774 8.50005 9.00074C8.50005 8.98766 8.50306 8.97486 8.50607 8.96204L8.50608 8.96203C8.50882 8.95035 8.51157 8.93866 8.51205 8.92674L10.074 10.4887C10.0621 10.4892 10.0504 10.492 10.0388 10.4947C10.0259 10.4977 10.0131 10.5007 10 10.5007ZM2.70705 0.293738C2.31605 -0.0972617 1.68405 -0.0972617 1.29305 0.293738C0.90205 0.684738 0.90205 1.31674 1.29305 1.70774L6.92305 7.33774C6.64705 7.84674 6.50005 8.41174 6.50005 9.00074C6.50005 10.9307 8.07005 12.5007 10 12.5007C10.5891 12.5007 11.154 12.3537 11.663 12.0777L17.293 17.7077C17.488 17.9027 17.744 18.0007 18 18.0007C18.2561 18.0007 18.5121 17.9027 18.7071 17.7077C19.0981 17.3167 19.0981 16.6847 18.7071 16.2937L2.70705 0.293738ZM10.2198 13.9983C5.91475 14.0983 3.10475 10.4153 2.17275 8.99634C2.62975 8.28234 3.39575 7.23634 4.45575 6.28534L3.04475 4.87334C1.52275 6.26234 0.54675 7.78034 0.13275 8.50334C-0.04425 8.81134 -0.04425 9.19034 0.13275 9.49834C0.76175 10.5953 4.16175 16.0003 10.0247 16.0003C10.1067 16.0003 10.1888 15.9993 10.2708 15.9973C11.4548 15.9673 12.5268 15.7113 13.4978 15.3273L11.9178 13.7473C11.3828 13.8893 10.8198 13.9833 10.2198 13.9983ZM9.72975 2.00414C15.7048 1.81714 19.2297 7.39114 19.8678 8.50314C20.0438 8.81114 20.0438 9.19014 19.8678 9.49814C19.4527 10.2211 18.4767 11.7391 16.9548 13.1281L15.5437 11.7161C16.6038 10.7651 17.3708 9.71914 17.8267 8.99614C16.8017 7.39114 14.2167 4.10514 10.2197 4.00314C6.50075 3.89414 5.91275 5.96814 5.91275 5.96814L8.50075 9.00014C8.17375 9.37314 8.50075 10.00014 10 10.00014" fill="#BDBDBD"/>
                    `;
      } else {
        passwordField.type = "password";
        passwordIcon.innerHTML = `
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M10 10.501C9.17305 10.501 8.50005 9.828 8.50005 9.001C8.50005 8.174 9.17305 7.501 10 7.501C10.827 7.501 11.5 8.174 11.5 9.001C11.5 9.828 10.827 10.501 10 10.501M10.0001 5.501C8.07005 5.501 6.50005 7.071 6.50005 9.001C6.50005 10.931 8.07005 12.501 10.0001 12.501C11.9301 12.501 13.5001 10.931 13.5001 9.001C13.5001 7.071 11.9301 5.501 10.0001 5.501M10.2197 13.9986C5.91375 14.0986 3.10475 10.4156 2.17275 8.9966C3.19875 7.3916 5.78275 4.1056 9.78075 4.0036C14.0697 3.8946 16.8948 7.5866 17.8268 9.0056C16.8018 10.6106 14.2167 13.8966 10.2197 13.9986M19.8678 8.5036C19.2298 7.3916 15.7057 1.8176 9.72975 2.0046C4.20175 2.1446 0.98675 7.0146 0.13275 8.5036C-0.04425 8.8116 -0.04425 9.1906 0.13275 9.4986C0.76175 10.5956 4.16175 16.0006 10.0247 16.0006C10.1067 16.0006 10.1888 15.9996 10.2708 15.9976C15.7977 15.8566 19.0138 10.9876 19.8678 9.4986C20.0438 9.1906 20.0438 8.8116 19.8678 8.5036" fill="#BDBDBD"/>
                    `;
      }
    });
  }
}

displayPassword();
