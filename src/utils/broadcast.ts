// Créer un canal de diffusion pour la communication entre les fenêtres/onglets
const channel = new BroadcastChannel('app_channel');

// Fonction pour envoyer un message (par exemple lors de la connexion réussie)
function sendLoginMessage(email) {
  const message = { action: 'login', email: email };
  channel.postMessage(message); // Envoyer le message
}

// Créer un canal de diffusion pour écouter les messages envoyés
const channel = new BroadcastChannel('app_channel');

// Écouter les messages envoyés par un autre onglet ou fenêtre
channel.onmessage = (event) => {
  const { action, email } = event.data;

  if (action === 'login') {
    console.log(`Un utilisateur s'est connecté : ${email}`);
    // Vous pouvez ici mettre à jour l'interface utilisateur, afficher une notification, etc.
  }
};
