// Récupération du canvas et du contexte de dessin 2D
const canvas = document.getElementById('jeuCanvas');
const ctx = canvas.getContext("2d");
let animationId;    // ID pour l'animation, utilisé pour l'arrêter

// Variables globales
let joueurNom = "";         // Nom du joueur saisi dans le champ du texte
let jeuEnCours = false;     // État de la partie

// Définition du joueur
const joueur = {
    x: 0,
    y: 0,
    width: 40,
    height: 40,
    color: 'blue',
    vy: 0,                  // Vitesse verticale
    gravity: 0.5,           // Gravité appliquée chaque frame
    jumpStrength: -10,      // Force du saut
    isJumping: false        // Indique si le joueur est en train de sauter
};

// Définition du voleur (objectif à poursuivre)
const voleur = {
    x: canvas.width / 2 - 20,
    y: canvas.height / 2,
    width: 30,
    height: 30,
    color: 'red'
};

// Tableau pour stocker les obstacles (bancs)
const bancs = [];
let bancTimer = 0;                                  // Compteur pour l'apparition des bancs
const bancInterval = 100;   // chaque 100 frames    // Intervalle en frames entre chaque banc

// Durée de la poursuite (en secondes)
let poursuiteTime = 10;     // secondes
let poursuiteTimer = poursuiteTime * 60; // Converti en frames (60 fps)

// Écoute de l'événement clavier pour faire sauter le joueur
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !joueur.isJumping) {
        joueur.vy = joueur.jumpStrength;
        joueur.isJumping = true;
    }
});

// Fonction appelée au début de la partie
function commencerJeu() {
    joueurNom = document.getElementById("nomJoueur").value.trim();
    if (joueurNom === "") {
        alert("Veuillez entrer votre nom !");
        return;
    }

    // Masquer les éléments du menu
    document.getElementById("nomJoueur").style.display = "none";
    document.querySelector("button").style.display = "none";
    document.getElementById("boutonRejouer").style.display = "none";
    canvas.style.display = "block";
    
    // Initialiser le jeu et démarrer la boucle
    reinitialiserJeu();
    jeuEnCours = true;
    gameLoop();
}

// Fonction pour réinitialiser l'état du jeu
function reinitialiserJeu() {
    // Position initiale du joueur
    joueur.x = canvas.width / 2 - 20;
    joueur.y = canvas.height - 60;
    joueur.vy = 0;
    joueur.isJumping = false;
    joueur.width = 40;
    joueur.height = 40;

    // Réinitialisation des obstacles et du temps
    bancs.length = 0;
    bancTimer = 0;
    poursuiteTimer = poursuiteTime * 60;

    // Cacher l'écran de fin
    document.getElementById("ecranFin").style.display = "none";

    // Redémarrer la partie
    jeuEnCours = true;
    gameLoop();
}

// Fonction appelée à la fin du jeu
function finDuJeu(message) {
    jeuEnCours = false;
    cancelAnimationFrame(animationId);  // Stopper l'animation

    const ecranFin = document.getElementById("ecranFin");
    const messageFin = document.getElementById("messageFin");

    // Affichage du message de fin et de l'écran de fin
    messageFin.textContent = message;
    ecranFin.style.display = "flex";
    
    // Masquer le bouton rejouer du canvas (le bouton de l'écran de fin reste visible)
    document.getElementById("boutonRejouer").style.display = "none";
}

// Mise à jour de la logique du jeu à chaque frame
function update() {
    // Le mouvement du jouer vers le haut
    //joueur.y -= 2;

    // Appliquer la gravité au joueur
    joueur.vy += joueur.gravity;
    joueur.y += joueur.vy;

    // La collision avec le sol
    if (joueur.y + joueur.height > canvas.height) {
        joueur.y = canvas.height - joueur.height;
        joueur.vy = 0;
        joueur.isJumping = false;
    }

    // Animation du saut (agrandissement du joueur)
    if (joueur.isJumping) {
        joueur.width = 50;
        joueur.height = 50;
    } else {
        joueur.width = 40;
        joueur.height = 40;
    }

    // Création d'un nouveau banc à intervalles réguliers
    bancTimer++;
    if (bancTimer > bancInterval) {
        bancs.push({
            x: Math.random() * (canvas.width - 60),
            y: -20, // commence hors de l'écran
            width: 60,
            height: 20,
            color: 'brown'
        });
        bancTimer = 0;
    }

    // Déplacement des bancs vers le bas
    bancs.forEach(banc => {
        banc.y += 2;
    });

    // La suppression des bancs sortis de l'écran
    for (let i = bancs.length - 1; i >= 0; i--) {
        if (bancs[i].y > canvas.height) {
            bancs.splice(i, 1);
        }
    }

    // La vérification de collision (uniquement si joueur tombe)
    if (joueur.vy >= 0) {
        bancs.forEach(banc => {
            if (joueur.x < banc.x + banc.width &&
                joueur.x + joueur.width > banc.x &&
                joueur.y < banc.y + banc.height &&
                joueur.y + joueur.height > banc.y) {
                    finDuJeu('Vous avez heurté un banc !');
                }
        });
    }

    // Décompte du temps restant
    if (poursuiteTimer > 0) {
        poursuiteTimer--;
    } else {
        finDuJeu('Vous avez poursuivi le voleur avec succès ! Victoire !');
    }
}

// Fonction de dessin des éléments du jeu
function draw() {
    // Effacer le canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dessiner le joueur
    ctx.fillStyle = joueur.color;
    ctx.fillRect(joueur.x, joueur.y, joueur.width, joueur.height);

    // Dessiner le voleur (statique dans ce jeu)
    ctx.fillStyle = voleur.color;
    ctx.fillRect(voleur.x, voleur.y, voleur.width, voleur.height);

    // Dessiner les obstacles (bancs)
    bancs.forEach(banc => {
        ctx.fillStyle = banc.color;
        ctx.fillRect(banc.x, banc.y, banc.width, banc.height);
    });

    // Affichage du temps restant
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Temps de poursuite: ' + Math.ceil(poursuiteTimer/60), 10, 30);
}

// Boucle principale du jeu
function gameLoop() {
    if (!jeuEnCours) return;
    update();                                       // Mettre à jour l'état du jeu
    draw();                                         // Dessiner les éléments
    animationId = requestAnimationFrame(gameLoop);  // Recommencer la boucle
}