# Charte graphique "[Nom du site]"

## 1) Identité verbale
- Ton : neutre, sobre, didactique. Précision et pédagogie.
- Claims :
  1. "Convertir vite, convertir juste."  
  2. "Chaque unité sous contrôle."  
  3. "La rigueur scientifique accessible à tous."  

## 2) Logo
- Variante principale : logotype horizontal bleu primaire sur fond blanc, pictogramme carré avant le nom.
- Variante monochrome : entièrement en gris 900 sur fond clair ou en blanc sur fond primaire.
- Favicon : pictogramme carré seul, fond bleu primaire, symbole "=" blanc.
- Interdits : dégradés durs, perspectives, ombres portées lourdes, distorsion.

## 3) Couleurs
### Palette
| Nom | Hex | RGB | CMYK | Usage |
|-----|-----|-----|------|-------|
| Primaire | `#1456E2` | `20,86,226` | `91,62,0,11` | Actions, liens, focus |
| Gris 900 | `#0E1116` | `14,17,22` | `36,23,0,91` | Texte principal |
| Gris 700 | `#2B3240` | `43,50,64` | `33,22,0,75` | Sous-titres, icônes |
| Gris 400 | `#98A2B3` | `152,162,179` | `15,9,0,30` | Bordures, textes secondaires |
| Gris 100 | `#EDF1F7` | `237,241,247` | `4,2,0,3` | Fonds alternés |
| Succès | `#10B981` | `16,185,129` | `91,0,30,27` | Badges de validation, fonds success |
| Attention | `#F97316` | `249,115,22` | `0,54,91,2` | Avertissements, erreurs |

### Paires AA/AAA vérifiées
| Texte | Fond | Ratio | Niveau |
|-------|------|-------|--------|
| Gris 900 (`#0E1116`) | Blanc (`#FFFFFF`) | 18.91:1 | AAA |
| Blanc (`#FFFFFF`) | Primaire (`#1456E2`) | 6.07:1 | AA |
| Gris 900 (`#0E1116`) | Primaire (`#1456E2`) | 7.46:1 | AAA |
| Gris 900 (`#0E1116`) | Succès (`#10B981`) | 7.46:1 | AAA |
| Gris 900 (`#0E1116`) | Attention (`#F97316`) | 6.75:1 | AAA |
| Gris 900 (`#0E1116`) | Gris 100 (`#EDF1F7`) | 16.68:1 | AAA |

### Règles
- Ne pas utiliser Succès ou Attention comme couleur de texte sur fond blanc : contraste insuffisant.
- Focus ring : 2px extérieur en primaire.
- Réserver les couleurs saturées aux éléments ponctuels pour confort visuel.

## 4) Typographies
| Usage | Police | Caractéristiques | Alternative système |
|-------|--------|------------------|---------------------|
| UI / corps | Inter 3.19+ | chiffres tabulaires (`tnum`), lining (`lnum`) | `system-ui`, `Helvetica`, `Arial` |
| Guides | Source Serif | titres d'articles et explications | `Georgia`, `Times New Roman` |
| Mono / formules | JetBrains Mono | `tnum`, `zero`, symboles mathématiques | `Menlo`, `Consolas` |

### Échelle typographique
| Niveau | Taille | Graisse |
|--------|--------|---------|
| H1 | 32px | 700 |
| H2 | 24px | 600 |
| H3 | 20px | 600 |
| H4 | 18px | 600 |
| H5 | 16px | 600 |
| H6 | 14px | 600 |
| Corps | 16px | 400 |
| Petit corps | 14px | 400 |
| Code / mono | 15px | 400 |

## 5) Grille et espacements
- Grille : 12 colonnes, gutter 24px, conteneur max 1200px.
- Échelle d'espacement : multiples de 4px (4,8,12,16,24,32,48,64).
- Rayons : 8/12/16px. 
- Ombre légère : `0 1px 3px rgba(0,0,0,.1)`.

## 6) Iconographie & pictos d’unités
- Style linéaire 2px, coins arrondis 2px.
- Pictos disponibles : m, kg, °C, Pa, bit/byte, horloge, vitesse, énergie.
- Do : rester minimal, aligner sur cap height.
- Don't : remplissages lourds, angles vifs, surdimensionner dans les champs.

## 7) Imagerie
- Illustrations vectorielles simples, schémas des unités SI.
- Bannir photos marketing, privilégier diagrammes neutres.

## 8) Composants UI critiques
### InputUnite
États :
- default : bordure gris 400, fond blanc.
- hover : bordure gris 700.
- focus : bordure transparente + anneau primaire 2px.
- error : bordure Attention, icône attention à gauche.
- disabled : fond gris 100, texte gris 400.

### SelectUnite
- mêmes états que InputUnite avec flèche interne.

### BoutonConvertir
- default : fond primaire, texte blanc, rayon 12px.
- hover : primaire foncé (`#0F46B8`).
- focus : anneau primaire 2px.
- disabled : fond gris 400, texte blanc 50%.

### CarteResultat
- fond gris 100, bordure gris 400, rayon 12px, ombre légère.

### BadgePrecision
- fond Succès, texte gris 900.

### AlerteErreur
- fond Attention 10% (`#FEE8D0`), bordure Attention, icône + texte gris 900.

### Autres
- Table de résultats : chiffres tabulaires, lignes zébrées gris 100.
- Tags d’avertissement : fond Attention, texte gris 900.
- Toaster erreurs : position bas-centre, fermeture manuelle, animation 150ms.

### États communs
| État | Style |
|------|-------|
| default | couleurs de base |
| hover | foncer de 10% le fond, curseur pointeur |
| focus | anneau externe 2px primaire |
| disabled | opacité 50%, curseur `not-allowed` |
| error | bordure et icône Attention |

### Mode sombre
- Inverser neutres : gris 900 ⇄ gris 100 (+90 en luminosité). 
- Primaire, succès, attention inchangés mais vérifier contrastes (min AA).

## 9) Motion
- Durée 120–200ms.
- Courbes : `cubic-bezier(0.4,0,0.2,1)`.
- Aucune animation bloquante; préférer fondu/translation légère.

##10) Accessibilité
- Respect WCAG 2.2 niveau AA.
- Focus visible partout.
- Cibles tactiles ≥44×44px.
- Labels explicites, attribut `lang` pour contenu.
- Chiffres tabulaires et séparateur décimal configurable (virgule/point).

## 11) Impression
- Feuilles CSS `@media print` simplifiées : texte noir, fond blanc, liens soulignés.
- Tables et cartes : bordures visibles, repères de coupe 3mm si export PDF.

## 12) Publicité & conformité Google Ads
- Zones pub distinctes, jamais adjacentes aux champs ou CTA.
- Densité ≤25% du viewport.
- Pas d'interstitiels ni de bannières collantes au-dessus des convertisseurs.

## 13) Design tokens
```css
:root {
  --color-primary:#1456E2;
  --color-text:#0E1116;
  --color-bg:#FFFFFF;
  --color-muted:#EDF1F7;
  --color-success:#10B981;
  --color-warn:#F97316;
  --radius-8:8px;
  --radius-12:12px;
  --radius-16:16px;
  --shadow-sm:0 1px 3px rgba(0,0,0,.1);
  --focus-ring:0 0 0 2px var(--color-primary);
}
```

```json
{
  "colors": [
    {"token": "primary", "hex": "#1456E2"},
    {"token": "text", "hex": "#0E1116"},
    {"token": "bg", "hex": "#FFFFFF"},
    {"token": "muted", "hex": "#EDF1F7"},
    {"token": "success", "hex": "#10B981"},
    {"token": "warn", "hex": "#F97316"}
  ],
  "typography": [
    {"token": "ui", "font": "Inter", "features": ["tnum", "lnum"]},
    {"token": "mono", "font": "JetBrains Mono"}
  ],
  "spacing": [4,8,12,16,24,32],
  "components": [
    {"name": "InputUnite", "states": ["default","hover","focus","error","disabled"]},
    {"name": "BoutonConvertir", "states": ["default","hover","focus","disabled"]},
    {"name": "CarteResultat", "states": ["default"]}
  ]
}
```

### Exemple d'utilisation
```html
<input class="input-unite" type="number" aria-label="Valeur" />
```

## 14) Exemples correct/incorrect
| Correct | Incorrect |
|---------|-----------|
| Texte gris 900 sur fond blanc, chiffres alignés | Texte orange sur fond blanc (contraste insuffisant) |
| Publicité à droite, à distance du bouton Convertir | Bannière collante couvrant le convertisseur |
| Focus ring visible autour du bouton | Absence d'indication de focus |
| Badge précision vert avec texte gris 900 | Texte blanc sur vert (contraste insuffisant) |

---

### Résumé exécutable
```css
--color-primary:#1456E2; --color-text:#0E1116; --color-bg:#FFFFFF;
--color-muted:#EDF1F7; --color-success:#10B981; --color-warn:#F97316;
--radius:12px; --shadow:0 1px 3px rgba(0,0,0,.1);
--focus-ring:0 0 0 2px var(--color-primary);
```
```json
{
  "colors":[
    {"token":"primary","hex":"#1456E2"},
    {"token":"text","hex":"#0E1116"},
    {"token":"bg","hex":"#FFFFFF"},
    {"token":"muted","hex":"#EDF1F7"},
    {"token":"success","hex":"#10B981"},
    {"token":"warn","hex":"#F97316"}
  ],
  "typography":[
    {"token":"ui","font":"Inter","features":["tnum","lnum"]},
    {"token":"mono","font":"JetBrains Mono"}
  ],
  "spacing":[4,8,12,16,24,32],
  "components":[
    {"name":"InputUnite","states":["default","hover","focus","error","disabled"]},
    {"name":"BoutonConvertir","states":["default","hover","focus","disabled"]},
    {"name":"CarteResultat","states":["default"]}
  ]
}
```
