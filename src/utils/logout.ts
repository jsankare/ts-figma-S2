export function logoutLogic() {
  const reset = new Date(0);
  document.cookie = `token=; expires=${reset.toUTCString()}; path=/`;
  localStorage.removeItem("userMail");
  window.location.href = "login.html";
}
