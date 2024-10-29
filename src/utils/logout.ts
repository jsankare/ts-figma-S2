export function logoutLogic() {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userMail");
  window.location.href = "login.html";
}
