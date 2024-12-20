const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
if (prefersDarkScheme.matches) {
  localStorage.setItem("Theme", "Dark");
} else {
  localStorage.setItem("Theme", "Light");
}
function applyPreferredTheme() {
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
  if (prefersDarkScheme.matches) {
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.add("light-theme");
  }
}

applyPreferredTheme();

window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (e.matches) {
    document.body.classList.remove("light-theme");
    document.body.classList.add("dark-theme");
  } else {
    document.body.classList.remove("dark-theme");
    document.body.classList.add("light-theme");
  }
});