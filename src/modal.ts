document.addEventListener('DOMContentLoaded', () => {
  const modalContent = document.getElementById("modal") as HTMLElement;
  const dataType = modalContent.getAttribute('data-type');

  if (dataType) {
      createModal(dataType, modalContent);
  }

  function createModal(type: string, modalContent: HTMLElement) {
      let formContent = '';

      switch (type) {
          case 'category':
              formContent = `
                <form id="categoryForm" action="">
                  <label for="category">Nom de la catégorie</label>
                  <input type="text" name="category" id="category" required>
                  <label for="icon">Icône</label>
                  <input type="file" name="icon" id="icon">`;
              break;
          case 'budget':
              formContent = `
                <form action="" id="budgetForm">
                  <label for="category">Catégorie</label>
                  <select name="category" id="category" required>
                      <option value=""></option>
                  </select>
                  <label for="budget">Budget</label>
                  <input type="number" name="budget" id="budget" required>
                  <input type="checkbox" name="alert" id="alert">
                  <label for="alert">Recevoir une alerte</label>`;
              break;
          case 'transaction':
              formContent = `
                <form action="" id="transactionForm">
                  <label for="type">Type de transaction</label>
                  <select name="type" id="type" required>
                      <option value="credit">Crédit</option>
                      <option value="debit">Débit</option>
                  </select>
                  <label for="name">Libellé</label>
                  <input type="text" name="name" id="name" required>
                  <label for="amount">Montant</label>
                  <input type="number" name="amount" id="amount" required>
                  <label for="category">Catégorie</label>
                  <select name="category" id="category" required>
                      <option value=""></option>
                  </select>
                  <label for="date">Date</label>
                  <input type="date" name="date" id="date" required>`;
              break;
          default:
              console.log('Unknown modal type');
              return; 
      }

      modalContent.innerHTML = `
          <div class="modal-content">
              <button id="close">&times;</button>
                  ${formContent}
                  <input type="submit" value="Ajouter">
              </form>
          </div>`;
  }

  const btn = document.getElementById("openModal");
  const span = document.getElementById("close");

  if (btn) {
      btn.onclick = function () {
          if (modalContent) {
              modalContent.style.display = "block";
          }
      };
  }

  if (span) {
      span.onclick = function () {
          if (modalContent) {
              modalContent.style.display = "none";
          }
      };
  }
});
