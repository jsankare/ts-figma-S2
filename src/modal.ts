const modal = document.getElementById("modal");
const btn = document.getElementById("openModal");
const span = document.getElementById("close");

if (btn) {
  btn.onclick = function () {
    if (modal) {
      modal.style.display = "block";
    }
  };
}

if (span) {
  span.onclick = function () {
    if (modal) {
      modal.style.display = "none";
    }
  };
}
