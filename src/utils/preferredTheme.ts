const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
if (prefersDarkScheme.matches) {
  localStorage.setItem("Theme", "Dark");
} else {
  localStorage.setItem("Theme", "Light");
}
