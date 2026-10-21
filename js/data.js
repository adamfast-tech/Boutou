/* Boutou — contenu (original). */
window.BT_DATA = (function () {
  'use strict';

  /* ---------- Voyage : chapitres et leçons ---------- */
  var CHAPTERS = [
    { id: 'c1', name: 'Comprendre ton cerveau', lessons: [
      { id: 'c1-1', title: 'Maintenant, ou pas maintenant', pose: 'think',
        slides: [
          "Avec un TDAH, le temps se ressent souvent en deux zones : « maintenant » et « pas maintenant ». Une échéance dans trois semaines paraît aussi lointaine qu'une échéance dans trois mois.",
          "Ce n'est pas de la paresse. La perception du temps est simplement plus floue, et le cerveau réagit surtout à ce qui est proche.",
          "La parade : rendre le temps visible. Un minuteur posé devant toi, une horloge à aiguilles, une alarme « dans 15 minutes »."
        ],
        tryIt: { text: "Lance un sprint de 2 minutes et regarde l'anneau se vider.", label: 'Lancer 2 minutes', go: 'sprint2' },
        quiz: { q: "Qu'est-ce qui aide le plus quand le temps est flou ?",
          a: ["Rendre le temps visible", "Se répéter qu'il faut se dépêcher", "Attendre d'avoir le déclic"], ok: 0,
          why: "Un repère extérieur (minuteur, alarme) remplace l'horloge interne qui manque de précision." } },
      { id: 'c1-2', title: 'Le mur du démarrage', pose: 'focus',
        slides: [
          "Souvent, la tâche n'est pas dure en soi. C'est l'entrée qui coûte : passer de « rien » à « en train de faire ».",
          "Plus la tâche est floue ou grosse, plus le mur est haut. Le cerveau repousse ce qu'il ne sait pas par où prendre.",
          "L'astuce : une première étape si petite qu'elle en paraît ridicule. « Ouvrir le document » plutôt que « écrire le rapport »."
        ],
        tryIt: { text: "Découpe une tâche qui traîne et regarde sa toute première miette.", label: 'Découper une tâche', go: 'cut' },
        quiz: { q: "Quelle première étape abaisse le plus le mur ?",
          a: ["Faire le ménage de tout l'appartement", "Prendre un sac et jeter trois choses", "Attendre le week-end"], ok: 1,
          why: "Petite, concrète et visible : le cerveau sait exactement quoi faire." } },
      { id: 'c1-3', title: "Le carburant de l'attention", pose: 'wow',
        slides: [
          "On décrit souvent l'attention TDAH comme pilotée par l'intérêt plutôt que par l'importance.",
          "Quatre ingrédients la réveillent : l'intérêt, la nouveauté, le défi et l'urgence.",
          "Pour une tâche ennuyeuse, ajoute un ingrédient : une course contre la montre, une playlist neuve, un lieu différent."
        ],
        tryIt: { text: "Choisis une tâche barbante et transforme-la en défi chronométré.", label: 'Lancer 5 minutes', go: 'sprint5' },
        quiz: { q: "Laquelle de ces idées ajoute de la nouveauté ?",
          a: ["Travailler au même endroit que d'habitude", "Faire la tâche dans un café", "Se forcer plus fort"], ok: 1,
          why: "Changer de lieu suffit souvent à rallumer l'attention." } },
      { id: 'c1-4', title: 'Une mémoire de travail pleine', pose: 'think',
        slides: [
          "La mémoire de travail, c'est le petit tableau blanc où le cerveau garde ce qu'il fait en ce moment. Avec un TDAH, il est vite plein.",
          "Chaque chose retenue « dans la tête » prend de la place et de l'énergie. Et ce qui déborde s'efface.",
          "La parade : sortir les idées de ta tête dès qu'elles arrivent. Une note, une liste, la Mémoire de Boutou."
        ],
        tryIt: { text: "Vide trois choses qui tournent dans ta tête.", label: 'Ouvrir la Mémoire', go: 'mem' },
        quiz: { q: "Une idée te vient en plein milieu d'une tâche. Tu fais quoi ?",
          a: ["Tu la gardes en tête pour plus tard", "Tu la notes en deux mots et tu reprends", "Tu changes de tâche tout de suite"], ok: 1,
          why: "La noter libère la tête sans casser ton élan." } },
      { id: 'c1-5', title: "L'hyperfocus", pose: 'wow',
        slides: [
          "Quand quelque chose accroche, tu peux plonger des heures sans voir le temps passer. C'est l'hyperfocus.",
          "C'est une force, mais il peut avaler les repas, le sommeil ou un rendez-vous.",
          "Avant de plonger, pose une alarme de sortie. Elle n'interdit rien : elle te rend le choix."
        ],
        tryIt: { text: "Avant ta prochaine session, pose un sprint de 25 minutes.", label: 'Lancer 25 minutes', go: 'sprint25' },
        quiz: { q: "À quoi sert une alarme de sortie ?",
          a: ["À t'interdire de continuer", "À te rendre le choix de continuer ou non", "À rien, il faut juste se discipliner"], ok: 1,
          why: "Elle te ramène à la surface pour décider, sans culpabilité." } }
    ] },
    { id: 'c2', name: "Passer à l'action", lessons: [
      { id: 'c2-1', title: 'La miette de 2 minutes', pose: 'happy',
        slides: [
          "Se promettre de « tout faire » est intimidant. Se promettre deux minutes, beaucoup moins.",
          "Le contrat : tu commences pour deux minutes et tu as le droit d'arrêter après. Souvent, tu continueras.",
          "Même si tu t'arrêtes, tu as commencé. La prochaine fois, le mur sera plus bas."
        ],
        tryIt: { text: "Deux minutes sur n'importe quoi, maintenant.", label: 'Lancer 2 minutes', go: 'sprint2' },
        quiz: { q: "Après tes 2 minutes, tu as envie d'arrêter. C'est…",
          a: ["Un échec", "Permis : tu as commencé, c'est gagné", "Interdit, il faut finir"], ok: 1,
          why: "Le droit d'arrêter rend le démarrage plus facile la fois suivante." } },
      { id: 'c2-2', title: 'Fini, ça veut dire quoi ?', pose: 'think',
        slides: [
          "« Faire le dossier », c'est flou. Et le flou paralyse : on ne sait ni par où commencer ni quand s'arrêter.",
          "Avant de démarrer, écris en une phrase à quoi ressemble « fini ». « Le formulaire est envoyé et j'ai l'accusé de réception. »",
          "Une ligne d'arrivée claire rend la tâche plus petite, et la victoire plus nette."
        ],
        tryIt: { text: "Prends une tâche et écris sa ligne d'arrivée dans la Mémoire.", label: 'Ouvrir la Mémoire', go: 'mem' },
        quiz: { q: "Laquelle est une vraie ligne d'arrivée ?",
          a: ["« Avancer sur le rapport »", "« Le rapport a une intro et trois titres »", "« Bosser à fond »"], ok: 1,
          why: "Elle se vérifie d'un coup d'œil : c'est fait ou pas." } },
      { id: 'c2-3', title: 'Travailler à côté de quelqu’un', pose: 'wave',
        slides: [
          "Beaucoup de personnes TDAH avancent mieux quand quelqu'un est là, même sans les aider. On appelle ça le doublage.",
          "La présence d'un autre sert d'ancre : on reste dans la tâche plus facilement.",
          "Un ami en appel vidéo, un collègue à côté, un café plein de monde : chacun sur sa tâche, ensemble."
        ],
        tryIt: { text: "Propose à quelqu'un une session de 25 minutes côte à côte.", label: 'Découper la tâche', go: 'cut' },
        quiz: { q: "Pendant une session à deux, l'autre personne doit…",
          a: ["T'aider sur ta tâche", "Être là, sur sa propre tâche", "Te surveiller"], ok: 1,
          why: "La simple présence suffit à faire ancre." } },
      { id: 'c2-4', title: 'Préparer le terrain', pose: 'focus',
        slides: [
          "Chaque petit obstacle compte : chercher ses affaires, déverrouiller le téléphone, ouvrir trois logiciels.",
          "Réduis la friction pour ce que tu veux faire, augmente-la pour ce qui te distrait.",
          "Tenue de sport posée la veille, téléphone dans une autre pièce, document déjà ouvert sur l'écran."
        ],
        tryIt: { text: "Prépare maintenant le terrain pour ta tâche de demain (2 minutes).", label: 'Lancer 2 minutes', go: 'sprint2' },
        quiz: { q: "Lequel augmente la friction pour une distraction ?",
          a: ["Mettre le téléphone dans une autre pièce", "Laisser les notifications", "Garder dix onglets ouverts"], ok: 0,
          why: "Plus la distraction demande d'efforts, moins elle t'attrape." } },
      { id: 'c2-5', title: 'La récompense tout de suite', pose: 'cheer',
        slides: [
          "Le cerveau TDAH réagit fort aux récompenses immédiates, et peu à celles qui arrivent dans longtemps.",
          "« Je serai content dans un mois » pèse peu face à « je regarde une vidéo maintenant ».",
          "Accroche une petite récompense à la tâche : un podcast seulement pendant le ménage, un bon café après le mail."
        ],
        tryIt: { text: "Choisis une récompense pour ta prochaine victoire.", label: 'Découper une tâche', go: 'cut' },
        quiz: { q: "Quelle récompense marche le mieux ?",
          a: ["Des vacances dans six mois", "Un épisode de podcast pendant la tâche", "Aucune, il faut être raisonnable"], ok: 1,
          why: "Immédiate et liée à la tâche : le cerveau fait le lien." } }
    ] },
    { id: 'c3', name: 'Émotions et énergie', lessons: [
      { id: 'c3-1', title: 'Quand ça déborde', pose: 'tender',
        slides: [
          "Les émotions peuvent monter vite et fort avec un TDAH. Ce n'est pas un défaut de caractère.",
          "Quand ça déborde, le corps s'emballe : cœur rapide, souffle court. Calmer le corps aide à calmer la tête.",
          "Une expiration plus longue que l'inspiration ralentit le rythme. Une minute suffit pour sentir la différence."
        ],
        tryIt: { text: "Une minute de respiration, maintenant.", label: 'Respirer 1 minute', go: 'breathe' },
        quiz: { q: "Pour se calmer, l'expiration doit être…",
          a: ["Plus courte que l'inspiration", "Plus longue ou égale à l'inspiration", "Bloquée le plus longtemps possible"], ok: 1,
          why: "Une expiration lente envoie au corps un signal de calme." } },
      { id: 'c3-2', title: 'Le retour sans culpabilité', pose: 'tender',
        slides: [
          "Rater un jour, une semaine, ça arrive. Ça ne casse rien.",
          "Ce qui freine, c'est la culpabilité : plus on se sent mal d'avoir lâché, plus c'est dur de revenir.",
          "Quand tu reviens, fais une seule miette. Le simple fait de revenir, c'est la victoire du jour."
        ],
        tryIt: { text: "Une miette, juste une, pour fêter ton retour.", label: 'Découper une tâche', go: 'cut' },
        quiz: { q: "Tu reviens après une semaine sans rien faire. Tu…",
          a: ["Rattrapes tout d'un coup", "Fais une seule miette", "Attends lundi pour repartir de zéro"], ok: 1,
          why: "Une petite action relance la machine sans l'écraser." } },
      { id: 'c3-3', title: "L'énergie n'est pas fixe", pose: 'idle',
        slides: [
          "Ton énergie change dans la journée. Le sommeil, le mouvement et les repas pèsent lourd sur ta concentration.",
          "Repère tes moments forts : pour beaucoup, c'est le matin ou juste après une marche.",
          "Garde les tâches difficiles pour tes pics, et les tâches faciles pour les creux."
        ],
        tryIt: { text: "Note dans la Mémoire ton moment de la journée le plus efficace.", label: 'Ouvrir la Mémoire', go: 'mem' },
        quiz: { q: "Tu as un creux d'énergie. Tu choisis…",
          a: ["La tâche la plus difficile", "Une tâche facile ou une pause qui bouge", "De te forcer encore"], ok: 1,
          why: "Adapter la tâche à l'énergie évite de s'épuiser pour rien." } },
      { id: 'c3-4', title: 'La peur du rejet', pose: 'tender',
        slides: [
          "Beaucoup de personnes TDAH décrivent une sensibilité très forte au rejet ou à la critique, même légère.",
          "Un message sans réponse peut sembler dire « il m'en veut ». La douleur est réelle, l'interprétation ne l'est pas toujours.",
          "Avant de conclure, cherche une autre explication possible. Puis attends un peu avant de réagir."
        ],
        tryIt: { text: "Si quelque chose te pèse, respire une minute avant de répondre.", label: 'Respirer 1 minute', go: 'breathe' },
        quiz: { q: "Un ami ne répond pas depuis hier. Le plus probable ?",
          a: ["Il est fâché contre toi", "Il est occupé ou n'a pas vu", "Il ne t'aime plus"], ok: 1,
          why: "Chercher une autre explication calme l'alarme avant qu'elle ne s'emballe." } },
      { id: 'c3-5', title: 'Parle-toi comme à un ami', pose: 'happy',
        slides: [
          "Beaucoup de personnes TDAH ont entendu « fais un effort » pendant des années. La petite voix intérieure devient dure.",
          "Cette dureté ne fait pas avancer plus vite. Elle épuise et donne envie d'éviter.",
          "Quand tu bloques, demande-toi : qu'est-ce que je dirais à un ami dans la même situation ? Dis-le-toi."
        ],
        tryIt: { text: "Écris une phrase gentille que tu dirais à un ami, pour toi.", label: 'Ouvrir la Mémoire', go: 'mem' },
        quiz: { q: "Face à un blocage, quelle phrase aide le plus ?",
          a: ["« Je suis nul »", "« C'est dur, je commence par une miette »", "« Je le ferai quand j'aurai envie »"], ok: 1,
          why: "Reconnaître la difficulté et proposer un pas : c'est ce qu'on dirait à un ami." } }
    ] }
  ];

  /* ---------- Découpeur hors ligne ---------- */
  var CUTS = [
    { k: /imp[oô]ts?|d[ée]claration (de revenus|fiscale)/i, s: [
      ["Retrouve ton numéro fiscal et ton mot de passe", 2], ["Ouvre impots.gouv.fr et connecte-toi", 3],
      ["Vérifie les revenus déjà remplis", 5], ["Ajoute ce qui manque : frais, dons, garde d'enfants", 6],
      ["Signe et télécharge l'accusé de réception", 2]] },
    { k: /m[ée]nage|ranger|rangement|nettoy|chambre|appart|bordel|salon/i, s: [
      ["Mets une musique que tu aimes", 1], ["Prends un sac et ramasse tout ce qui se jette", 3],
      ["Remets dix objets à leur place, pas plus", 4], ["Dégage une seule surface : table ou bureau", 5],
      ["Passe un coup rapide sur cette surface", 3]] },
    { k: /mail|courriel|r[ée]pondre|message|relancer/i, s: [
      ["Ouvre le message, juste l'ouvrir", 1], ["Écris une première phrase, même maladroite", 2],
      ["Dis l'essentiel en trois phrases maximum", 4], ["Relis une seule fois", 1], ["Envoie", 1]] },
    { k: /appel|t[ée]l[ée]phon|rdv|rendez|m[ée]decin|dentiste|docteur|kin[ée]/i, s: [
      ["Trouve le numéro ou le site de réservation", 2], ["Note sur un papier ce que tu veux demander", 2],
      ["Choisis deux créneaux qui t'arrangent", 1], ["Appelle ou réserve maintenant", 3],
      ["Ajoute le rendez-vous à ton agenda avec une alarme", 1]] },
    { k: /\bcourses\b|supermarch|frigo vide/i, s: [
      ["Regarde le frigo et les placards", 2], ["Écris la liste, rayon par rayon", 3],
      ["Pose sacs, carte et liste près de la porte", 1], ["Fais les courses, seulement la liste", 20],
      ["Range d'abord le frais", 5]] },
    { k: /linge|lessive|machine|repass/i, s: [
      ["Rassemble le linge sale dans un panier", 3], ["Lance une machine", 2],
      ["Pose une alarme pour la fin du cycle", 1], ["Étends ou mets au sèche-linge", 6], ["Plie une seule pile", 5]] },
    { k: /vaisselle|[ée]vier|lave-vaisselle/i, s: [
      ["Vide l'évier de ce qui traîne", 2], ["Remplis le lave-vaisselle ou une bassine d'eau chaude", 3],
      ["Lave seulement les verres et les couverts", 4], ["Lave le reste", 6], ["Essuie le plan de travail", 2]] },
    { k: /cv|candidature|postuler|lettre de motivation|entretien d'embauche/i, s: [
      ["Ouvre l'offre et repère trois mots-clés", 3], ["Ajoute ces mots à ton CV, là où c'est vrai", 6],
      ["Écris trois phrases : pourquoi eux, pourquoi toi, la suite", 6], ["Relis une fois", 2], ["Envoie la candidature", 2]] },
    { k: /[ée]crire|r[ée]diger|rapport|m[ée]moire|devoir|dissert|article|pr[ée]sentation|diapo/i, s: [
      ["Ouvre le document et donne-lui un titre", 1], ["Écris trois idées en vrac, sans faire de phrases", 3],
      ["Range-les dans un ordre", 2], ["Écris le premier paragraphe en mode brouillon", 8],
      ["Note où reprendre la prochaine fois", 1]] },
    { k: /r[ée]vis|[ée]tudier|apprendre|examen|partiel|\bcours\b/i, s: [
      ["Choisis un seul chapitre", 1], ["Lis seulement les titres et sous-titres", 2],
      ["Écris-toi trois questions dessus", 3], ["Réponds sans regarder, puis vérifie", 8], ["Note ce qui reste flou", 1]] },
    { k: /payer|facture|banque|papier|administratif|formulaire|caf|ameli|mutuelle|imp[ôo]t/i, s: [
      ["Retrouve le document : mail, courrier ou appli", 3], ["Pose-le devant toi", 1],
      ["Repère la date limite et le montant", 1], ["Paie ou remplis la première page", 5],
      ["Classe ou supprime le document", 2]] },
    { k: /sport|courir|course à pied|footing|salle|muscu|s[ée]ance|yoga|v[ée]lo/i, s: [
      ["Mets ta tenue, c'est tout", 2], ["Remplis ta gourde", 1], ["Échauffe-toi trois minutes", 3],
      ["Fais juste dix minutes", 10], ["Étire-toi", 3]] },
    { k: /cuisin|repas|d[îi]ner|d[ée]jeuner|manger|recette|batch/i, s: [
      ["Choisis un plat simple que tu connais", 2], ["Sors tous les ingrédients sur le plan de travail", 3],
      ["Lance ce qui cuit le plus longtemps", 5], ["Prépare le reste pendant la cuisson", 10],
      ["Mets la table, même juste pour toi", 2]] },
    { k: /valise|voyage|vacances|partir en|bagage/i, s: [
      ["Fais la liste : vêtements, toilette, papiers, chargeurs", 4], ["Ouvre la valise sur le lit", 1],
      ["Mets d'abord papiers et chargeurs", 3], ["Ajoute les vêtements, jour par jour", 8],
      ["Ferme-la et pose-la près de la porte", 1]] },
    { k: /d[ée]m[ée]nag|carton/i, s: [
      ["Choisis une seule pièce", 1], ["Monte trois cartons", 3],
      ["Remplis-en un avec ce que tu n'utilises pas ce mois-ci", 8], ["Écris la pièce et le contenu dessus", 1],
      ["Empile-le près de l'entrée", 1]] },
    { k: /r[ée]par|bricol|monter|meuble|fixer|changer (la|le|une|un)|ampoule|fuite/i, s: [
      ["Prends une photo de ce qui ne va pas", 1], ["Cherche la notice ou un tutoriel", 4],
      ["Rassemble les outils sur une serviette", 3], ["Fais seulement la première étape du tuto", 5],
      ["Teste, puis range les outils", 3]] }
  ];

  var GENERIC = [
    ["Sors ou ouvre ce qu'il faut pour commencer", 2], ["Écris en une phrase à quoi ressemble « fini »", 1],
    ["Fais le tout premier geste visible, même imparfait", 2], ["Continue cinq minutes sans te juger", 5],
    ["Note où tu t'arrêtes pour reprendre facilement", 1]
  ];

  function cut(task) {
    for (var i = 0; i < CUTS.length; i++) if (CUTS[i].k.test(task)) return CUTS[i].s.map(function (x) { return { t: x[0], m: x[1] }; });
    return GENERIC.map(function (x) { return { t: x[0], m: x[1] }; });
  }

  function split(step) {
    var t = step.t.replace(/[.\s]+$/, ''), m = step.m || 2;
    var low = t.charAt(0).toLowerCase() + t.slice(1);
    return [
      { t: 'Prépare juste : ' + low, m: 1 },
      { t: 'Commence : ' + low, m: Math.max(1, Math.round(m / 2)) },
      { t: 'Termine : ' + low, m: Math.max(1, Math.round(m / 2)) }
    ];
  }

  /* ---------- Paroles de Boutou ---------- */
  var LINES = [
    "On fait une miette ?", "Pas besoin d'être motivé pour commencer.", "Deux minutes, c'est déjà énorme.",
    "Je garde tes idées au chaud.", "Chaque victoire fait pousser ma tige.", "Tu as le droit d'avancer lentement.",
    "Commencer mal, c'est commencer.", "Si ça bloque, on coupe encore plus petit.", "Un verre d'eau, et on y va ?",
    "Ce que tu as fait aujourd'hui compte."
  ];

  var MOODS = [
    { label: 'Lourd', pose: 'tender', msg: "Journée lourde. Une seule miette suffira, et c'est très bien.", act: ['Respirer 1 minute', 'breathe'] },
    { label: 'Bof', pose: 'tender', msg: "On y va doucement : deux minutes, pas plus.", act: ['Lancer 2 minutes', 'sprint2'] },
    { label: 'Ça va', pose: 'idle', msg: "Correct. Choisis une tâche et découpe-la.", act: ['Découper une tâche', 'cut'] },
    { label: 'Bien', pose: 'happy', msg: "Bonne énergie : c'est le moment pour la tâche que tu évites.", act: ['Découper une tâche', 'cut'] },
    { label: 'À fond', pose: 'wow', msg: "Gros élan ! Pose un minuteur pour ne pas oublier de manger.", act: ['Lancer 25 minutes', 'sprint25'] }
  ];

  var LEVELS = [
    { at: 0, name: 'Graine' }, { at: 5, name: 'Pousse' }, { at: 15, name: 'Jeune plant' },
    { at: 35, name: 'Bouton' }, { at: 70, name: 'En fleur' }
  ];

  var BREATHS = [
    { id: 'coh', name: 'Cohérence', hint: '5 s inspire, 5 s expire', seq: [['Inspire', 5, 1], ['Expire', 5, 0]] },
    { id: 'car', name: 'Carré', hint: '4 temps de 4 secondes', seq: [['Inspire', 4, 1], ['Garde', 4, 1], ['Expire', 4, 0], ['Garde', 4, 0]] },
    { id: '478', name: '4-7-8', hint: 'Pour s\'apaiser le soir', seq: [['Inspire', 4, 1], ['Garde', 7, 1], ['Expire', 8, 0]] }
  ];

  var GROUND = [
    [5, 'choses que tu vois', 'Regarde autour de toi. Nomme-les doucement, dans ta tête.'],
    [4, 'choses que tu peux toucher', 'Le tissu de tes vêtements, la table, ton téléphone…'],
    [3, 'sons que tu entends', 'Proches ou lointains. Même le silence a des sons.'],
    [2, 'odeurs que tu sens', "Si tu n'en sens pas, pense à tes deux odeurs préférées."],
    [1, 'goût dans ta bouche', 'Ou bois une gorgée d\'eau et remarque son goût.']
  ];

  return { CHAPTERS: CHAPTERS, cut: cut, split: split, LINES: LINES, MOODS: MOODS, LEVELS: LEVELS, BREATHS: BREATHS, GROUND: GROUND };
})();
