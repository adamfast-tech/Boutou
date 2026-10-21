# Boutou

Compagnon TDAH en web app (HTML/CSS/JS vanilla, sans dépendance, hors ligne).

Boutou est une petite graine duveteuse : chaque victoire la fait pousser (graine, pousse, jeune plant, bouton, fleur).

- **Accueil** : météo du jour, tâche du moment avec « Je m'y mets », « Trop gros » et « Déjà fait », leçon du jour, outils rapides.
- **Découper** : découpage hors ligne en miettes chronométrées (16 familles de tâches), étapes modifiables, frigo, tâche du moment.
- **Sprint** : minuteur en anneau 2/5/10/25 min, écran maintenu allumé, reprise après fermeture.
- **Respirer** : cohérence 5-5, carré, 4-7-8.
- **Ça déborde** : respiration, ancrage 5-4-3-2-1, vider sa tête, une seule miette.
- **Voyage** : 3 chapitres, 15 leçons avec quiz et défi.
- **Mémoire** : notes rapides, transformables en tâches.
- **Jardin** : niveau, semaine, victoires, réglages, export/import.

Données stockées uniquement dans le navigateur (localStorage, préfixe `bt_`).

En ligne : https://adamfast-tech.github.io/boutou/

## Installer sur iPhone
Safari › ouvrir le lien › Partager › Sur l'écran d'accueil.

## Fichiers
`index.html`, `css/` (interface, mascotte, kit d'animations), `js/` (app, contenu, mascotte, kit d'animations), `lib/` (Noctis : boutons ; Brio : micro-interactions, version allégée sans pointeur ni lots 5-6), `fonts/` (Fredoka, Atkinson Hyperlegible, licence OFL dans `fonts/OFL.txt`), `sw.js` (hors ligne).

## Micro-interactions
- Brio : texte qui s'écrit dans la bulle, titres animés, coches tracées, champs qui grandissent, pilules, curseur à ressort, interrupteur, enveloppe « mot du jour », post-it, vibrations (iPhone compris).
- Noctis : bouton à relief, maintenir pour supprimer, micro de dictée, étoile « tâche du moment », confettis, export et import animés, câlin.
- Kit d'animations : compteurs, apparitions, ondulation au toucher, aurore de la respiration.
