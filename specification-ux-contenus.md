# Spécification UX + Contenus – Site de conversion d’unités

Version: 1.0
Langue: FR


---

## Lignes directrices globales

* **Tonalité**: didactique, neutre, concise. Pas de superlatifs.
* **Accessibilité**: H1 unique, contrastes AA, focus visible, labels explicites, tailles cibles 44×44 px.
* **Chiffres**: utiliser chiffres tabulaires, séparateur décimal local.
* **Composants réutilisables**:

  * `FormConvert`: champs **De**, **Vers**, **Valeur**, **Précision** + bouton **Convertir**.
  * `CarteFormule`: titre, équation, explication, source.
  * `BlocExemples`: 3 exemples (petit, moyen, grand) avec arrondi.
  * `AlerteErreur`: message d’erreur contextualisé.
  * `BadgePrecision`: libellé “Précision: n décimales”.
  * `ExportResultats`: boutons **Copier**, **CSV**, **Partager**.
  * `FAQLocale`: 5 Q/R.
  * `FilAriane`: Accueil › Catégorie › Conversion.

---

## Métadonnées globales

* Open Graph: `og:type=website`, `og:site_name=MesureConvert`.
* Données structurées: `BreadcrumbList` partout, `FAQPage` sur convertisseurs, `Article` sur guides.
* Footer: À propos | Contact | Confidentialité | CGU | Cookies | Accessibilité | Sécurité des données.

---

# Pages

> **Notation de positionnement**: (Header), (Main/Hero), (Main/Section X), (Sidebar), (Footer). Ads: préciser l’emplacement exact.

---

## 1) Accueil – `/`

**Objectif**: aiguiller rapidement vers un convertisseur.

**SEO**

* `<title>`: Convertisseurs d’unités précis et rapides | MesureConvert
* `meta description`: Convertissez longueur, masse, température, volume, vitesse, données et plus. Résultats fiables, formules et exemples.
* `H1` (Main/Hero): Convertisseurs d’unités fiables, instantanés.

**Contenus**

* (Hero) **Paragraphe d’intro**: "Entrez une valeur, choisissez vos unités, obtenez le résultat et la formule. Sans inscription."
* (Hero) **FormConvert** \[mise en avant plein largeur].
* (Main/Section catégories) **Titre H2**: Convertisseurs par catégorie
  **Cartes**: Longueur · Masse · Température · Volume · Aire · Vitesse · Temps · Énergie · Pression · Données.
  **Texte carte** (ex Longueur): "Conversions entre m, ft, km, mi, cm, in…"
* (Main/Section Top) **H2**: Conversions les plus demandées
  **Liens**: m→ft, cm→in, kg→lb, °C→°F, L→gal, km/h→mph, s→min, J→kWh, Pa→bar, Mo→Go.
* (Main/Section preuve) **H2**: Méthode et fiabilité
  **Texte**: "Formules sourcées (SI, BIPM, NIST). Arrondis expliqués. Accessibilité et respect des données."
* (Main/Section FAQ courte) **H2**: Questions fréquentes

  1. **Les conversions sont-elles exactes ?** Oui, basées sur définitions officielles; l’arrondi est configurable.
  2. **Puis-je changer la virgule/point ?** Oui dans les préférences.
  3. **Puis-je exporter ?** Oui en copie, CSV, lien partageable.

**CTA**

* (Hero) Bouton primaire: **Ouvrir le convertisseur** → `/convertisseurs/`

**Ads**

* (Main/entre Top et Preuve) **Bannière 728×90**.
* Interdit: aucune ad dans le Hero ou à côté du formulaire.

---

## 2) Hub convertisseurs – `/convertisseurs/`

**SEO**

* `<title>`: Tous les convertisseurs d’unités | MesureConvert
* `meta description`: Accédez aux convertisseurs par catégorie. Longueur, masse, température, etc.
* `H1`: Tous les convertisseurs par catégorie

**Contenus**

* (Hero court) **Intro**: "Choisissez une catégorie pour afficher ses conversions."
* (Main/grille) **Cartes catégories** avec description 120–160 caractères chacune.

**Ads**

* (Sidebar) **Rectangle 300×250** fixe. Aucun dans la grille.

---

## 3) Catégorie – modèle commun `/convertisseurs/{categorie}/`

Remplacer `{categorie}`: longueur, masse, temperature, volume, aire, vitesse, temps, energie, pression, numerique.

**SEO**

* `<title>`: Convertisseur {Categorie} | MesureConvert
* `meta description`: Conversions {categorie} courantes avec formules et exemples.
* `H1`: Convertisseur {Categorie}

**Contenus**

* (Hero) **Intro**: "Sélectionnez une conversion ou utilisez le mini-formulaire."
* (Hero) **Mini-FormConvert** compact.
* (Main/liste) **H2**: Conversions courantes
  **Liste liens**: exemples pour Longueur → m↔ft, cm↔in, km↔mi, m↔yd, mm↔in.
* (Main/table) **H2**: Facteurs de conversion
  **Texte**: "Facteurs indicatifs. Utilisez le convertisseur pour la précision et l’arrondi."

**Ads**

* (Entre liste et table) **Bannière 728×90**.

---

## 4) Page convertisseur – modèle détaillé `/convertisseurs/{categorie}/{u1}-vers-{u2}/`

Exemple instancié: **m → ft**.

**SEO**

* `<title>`: Convertir {U1} en {U2} | MesureConvert
* `meta description`: Conversion {U1}→{U2} avec formule, exemples, arrondi réglable.
* `H1`: Convertir {U1} en {U2}

**Contenus**

* (Hero) **Paragraphe**: "Saisissez une valeur en {U1}, obtenez l’équivalent en {U2} avec la formule officielle."
* (Hero) **FormConvert** plein largeur + **BadgePrecision**.
* (Main/Section résultat) **H2**: Résultat
  **Texte**: "{val_U1} {U1} = {val_U2} {U2}"
  **Boutons**: **Copier**, **CSV**, **Partager**.
* (Main/CarteFormule) **H2**: Formule et constante
  **Équation**: `val_{U2} = val_{U1} × k`
  **Constante**: `k = {constante}`
  **Source**: "Définitions officielles SI/NIST."
* (Main/BlocExemples) **H2**: Exemples

  1. **Petit**: `{ex1_U1} {U1} → {ex1_U2} {U2}`
  2. **Moyen**: `{ex2_U1} {U1} → {ex2_U2} {U2}`
  3. **Grand**: `{ex3_U1} {U1} → {ex3_U2} {U2}`
* (Main/Section précision) **H2**: Précision et arrondis
  **Texte**: "Choisissez de 0 à 6 décimales selon le contexte."
* (Main/FAQLocale) **H2**: Questions fréquentes
  Q1. **Puis-je inverser la conversion ?** Oui, utilisez l’inverse `1/k`.
  Q2. **Pourquoi le résultat diffère d’un autre site ?** Vérifiez l’arrondi et les unités.
  Q3. **Puis-je coller des nombres avec espace ?** Oui, ils sont normalisés.
  Q4. **Limites de saisie ?** Valeurs ±1e12, 6 décimales.
  Q5. **Comment citer la source ?** Mentionnez MesureConvert et la page.

**Erreurs** (AlerteErreur)

* Champ vide: "Entrez une valeur."
* Non numérique: "Valeur non reconnue."
* Hors plage: "Valeur trop grande. Réduisez l’échelle."
* Unité invalide: "Unité non supportée."

**Liens internes**

* Vers la page inverse `{u2}-vers-{u1}` et vers la fiche unité `{u1}`, `{u2}`.

**Ads**

* (Après BlocExemples) **Rectangle 300×250** dans le flux.
* Interdit: aucune ad dans le Hero ni à côté des champs.

### 4.a) Instance complète: m → ft

* Constante: `k = 3.280839895`
* Exemples:
  Petit: `0,5 m → 1,64042 ft`
  Moyen: `5 m → 16,4042 ft`
  Grand: `120 m → 393,701 ft`
* Texte complémentaire (Main/Section précision): "Les mesures en pieds s’expriment souvent avec décimales ou en pieds+ pouces."

---

## 5) Pages convertisseur répétées

Répliquer le **modèle #4** avec ces constantes et textes courts:

* **cm → in**: `k = 0.3937007874`
  Aide: "1 in = 2,54 cm exact."
* **km → mi**: `k = 0.6213711922`
  Aide: "1 mi = 1,609344 km exact."
* **kg → lb**: `k = 2.2046226218`
  Aide: "lb = livre avoirdupois."
* **g → oz**: `k = 0.03527396195`
* **°C → °F**: `val_F = val_C × 9/5 + 32`
  Exemples: `0 °C → 32 °F`, `−40 ↔ −40`.
* **°C → K**: `K = °C + 273,15`
  Aide: "Zéro absolu: 0 K."
* **L → gal (US)**: `k = 0.2641720524`
* **Pa → bar**: `k = 1e-5`
* **km/h → mph**: `k = 0.6213711922`
* **s → min**: `k = 1/60`
* **J → kWh**: `k = 2,7777778e-7`
* **Mo → Go**: `k = 0,001` (décimal)
  Avertissement: "Binaire: 1 Gio = 1024 Mio."

> Ajouter d’autres paires en suivant ce format.

---

## 6) Fiches unité – `/unites/{unite}/`

**SEO**

* `<title>`: Unité {Unite} – symbole, conversions | MesureConvert
* `meta description`: Définition, symbole, équivalences et exemples pour {Unite}.
* `H1`: {Unite} (symbole {symbole})

**Contenus**

* (Hero) **Définition** courte.
* (Main/Section conversions) **H2**: Conversions courantes
  Liste 5 équivalences avec facteur.
* (Main/Section usages) **H2**: Usages et notes
* (Main/liens) **H2**: Convertir {Unite} maintenant
  Liens vers deux convertisseurs pertinents.

**Ads**

* (Bas de page) **728×90**.

### Exemple: mètre

* Définition: "Unité SI de longueur, définie via la vitesse de la lumière."
* Conversions: `1 m = 3,28084 ft = 39,3701 in = 1,09361 yd = 0,001 km = 100 cm`
* Usages: "Construction, science, sport."

---

## 7) Tables imprimables – `/tables/{famille}/`

**SEO**

* `<title>`: Tables {Famille} à imprimer | MesureConvert
* `meta description`: Tableaux d’équivalences {famille} avec export PDF/CSV.
* `H1`: Table {Famille}

**Contenus**

* (Hero) **Intro**: "Référence rapide."
* (Main/table) Choix précision, pagination, export PDF/CSV.

**Ads**

* (Après le premier écran) **Leaderboard 728×90**.

---

## 8) Guides – `/guides/` et `/guides/{slug}/`

**Liste**

* `<title>`: Guides de conversion | MesureConvert
* `H1`: Guides pas à pas
* (Main) Teasers 160–200 caractères.

**Article type**

* `<title>`: Comment convertir {U1} en {U2}
* `meta description`: Méthode, erreurs fréquentes, exemples.
* `H1`: Convertir {U1} en {U2}: le guide
* Intertitres: "Formule", "Exemples", "Erreurs à éviter".
* Conclusion: appel vers la page convertisseur.

**Ads**

* Native sous le 1er intertitre.

---

## 9) Outils – `/outils/` et sous-pages

**Liste**

* `H1`: Outils pratiques
* Teasers: Calculatrice scientifique, Recherche multi-unités, API.

**Calculatrice**

* `H1`: Calculatrice scientifique
* Texte: "Calculs courants, parenthèses, fonctions."
* Ads: Sidebar uniquement.

**API**

* `H1`: API MesureConvert
* Texte: "Endpoints, limites, exemples."
* Bouton: "Obtenir une clé".

---

## 10) Recherche – `/recherche/` et résultats

* `H1`: Recherche
* Placeholder: "Tapez une unité ou une conversion".
* Aucune publicité.

---

## 11) À propos – `/a-propos/`

* `<title>`: À propos de MesureConvert
* `H1`: Notre méthode
* Texte: "Formules vérifiées. Sources officielles. Engagement accessibilité."

---

## 12) Contact – `/contact/`

* `H1`: Contact
* Texte: "Posez une question. Réponse sous 72 h ouvrées."
* Champs: Nom, Email, Message. Consentement RGPD.

---

## 13) Légal – Confidentialité, CGU, Cookies, Accessibilité, Sécurité

**Confidentialité**

* `H1`: Politique de confidentialité
* Sections: Données, Cookies, Tiers, Droits, Contact DPO.

**CGU**

* `H1`: Conditions générales d’utilisation
* Sections: Objet, Limites, Propriété intellectuelle, Loi applicable.

**Cookies**

* `H1`: Préférences cookies
* Catégories: Essentiels, Mesure d’audience, Publicité.
* Boutons: Accepter tout, Refuser tout, Personnaliser.

**Accessibilité**

* `H1`: Déclaration d’accessibilité
* Engagement WCAG 2.2 AA. Mécanisme de retour.

**Sécurité des données**

* `H1`: Sécurité des données
* HTTPS, chiffrement en transit, journaux, conservation.

---

## 14) Blog – `/blog/` et article

**Liste**

* `H1`: Blog
* Teasers courts liés aux cas réels.

**Article**

* `H1`: {Titre informatif sans clickbait}
* Intro 2–3 lignes. Intertitres. Conclusion avec lien vers convertisseur.

**Ads**

* Entre paragraphes 2 et 3.

---

## 15) Plans et erreurs – `/plan-du-site/`, `/404`, `/500`

**Plan du site**

* `H1`: Plan du site
* Liste hiérarchique des URLs.

**404**

* `H1`: Page non trouvée
* Texte: "La page demandée n’existe pas."
* Liens: catégories, recherche.

**500**

* `H1`: Problème temporaire
* Texte: "Réessayez plus tard."

---

## 16) Landing i18n – `/intl/{lang}/…`

* `H1`: Convertisseur d’unités ({lang})
* Texte localisé court. Hreflang croisés.

---

## 17) Landing Ads – `/lp/{u1}-vers-{u2}/`

* Version épurée du modèle #4.
* En-tête minimal, pas d’ads, un seul CTA: **Convertir maintenant**.

---

## Annexes

### A) Textes UI communs

* Bouton primaire: **Convertir**
* Bouton secondaire: **Copier** / **Exporter CSV** / **Partager**
* Labels: **De**, **Vers**, **Valeur**, **Précision**
* Placeholder valeur: "Ex: 12,5"

### B) Messages d’erreur

* Valeur vide: "Entrez une valeur."
* Nombre invalide: "Format non reconnu."
* Portée: "Valeur hors plage autorisée."
* Unité: "Unité non supportée."

### C) Snippets pour SEO technique

* Breadcrumb JSON-LD (schéma à adapter par page).
* FAQ JSON-LD pour 5 Q/R sur convertisseurs.

### D) Checklist par page

* H1 unique ✓
* Title/Meta ✓
* Fil d’Ariane ✓
* FormConvert ou contenu pertinent ✓
* FAQ si conversion ✓
* Ads positionnées hors CTA ✓
* Accessibilité ✓
* Liens internes ✓

