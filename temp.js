const fs = require('fs');
const path = require('path');

// Fonction pour lister les dossiers
function listerDossiers(chemin) {
    try {
        // Lire le contenu du répertoire
        const elements = fs.readdirSync(chemin);
        
        // Filtrer pour ne garder que les dossiers
        const dossiers = elements.filter(element => {
            return fs.statSync(path.join(chemin, element)).isDirectory();
        });
        
        console.log('Liste des dossiers :');
        dossiers.forEach(dossier => {
            console.log(`- ${dossier}`);
        });
        return dossiers;
    } catch (erreur) {
        console.error('Erreur lors de la lecture des dossiers :', erreur);
    }
}

// Utilisation de la fonction avec le répertoire courant
const dossiers = listerDossiers('./');

// Créer un fichier JSON pour stocker les dossiers
fs.writeFileSync('.gitignore', dossiers.map(dossier => `${dossier}/node_modules`).join('\n'));

