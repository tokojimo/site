import { createActivityHeader } from "./components/activity-header.js";
import { createSpotInfoSection } from "./components/spot-info.js";
import {
  createSpotMapSection,
  buildMapPageUrl,
} from "./components/spot-map.js";
import { createPickingsSections } from "./components/pickings-list.js";
import { createPhotosGallery } from "./components/photos-gallery.js";
import { createRatingInput } from "./components/rating.js";
import { createActivityChartSection } from "./components/activity-chart.js";

const root = document.querySelector("[data-spot-detail-root]");
const toastContainer = document.querySelector("[data-spot-toast-container]");

if (!root || !toastContainer) {
  throw new Error("Conteneur de page de détail introuvable.");
}

const skeletonTemplate = root.innerHTML;

const numberFormatter = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 1,
});

const longDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatNumber(value) {
  return numberFormatter.format(value ?? 0);
}

function formatFullDate(date) {
  return longDateFormatter.format(new Date(date));
}

function removeToast(toast) {
  if (toast && toast.parentElement) {
    toast.parentElement.removeChild(toast);
  }
}

function showToast(message, { actionLabel, onAction, duration } = {}) {
  const toast = document.createElement("div");
  toast.className = "spot-toast";
  toast.setAttribute("role", "alert");

  const content = document.createElement("p");
  content.textContent = message;
  toast.appendChild(content);

  const actions = document.createElement("div");
  actions.className = "spot-toast__actions";

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "spot-button spot-button--secondary";
  closeButton.textContent = "Fermer";
  closeButton.addEventListener("click", () => removeToast(toast));

  if (actionLabel && typeof onAction === "function") {
    const actionButton = document.createElement("button");
    actionButton.type = "button";
    actionButton.className = "spot-button spot-button--primary";
    actionButton.textContent = actionLabel;
    actionButton.addEventListener("click", () => {
      onAction();
      removeToast(toast);
    });
    actions.appendChild(actionButton);
  }

  actions.appendChild(closeButton);
  toast.appendChild(actions);
  toastContainer.appendChild(toast);

  if (!actionLabel) {
    const timeout = duration ?? 5000;
    window.setTimeout(() => removeToast(toast), timeout);
  }

  return toast;
}

function showSkeleton() {
  root.innerHTML = skeletonTemplate;
  root.setAttribute("aria-busy", "true");
}

function createBreadcrumb(spotName) {
  const nav = document.createElement("nav");
  nav.className = "spot-detail__breadcrumb";
  nav.setAttribute("aria-label", "Fil d’Ariane");

  const list = document.createElement("ol");

  const addItem = (content, options = {}) => {
    const item = document.createElement("li");
    if (options.current) {
      item.setAttribute("aria-current", "page");
    }
    if (options.href) {
      const link = document.createElement("a");
      link.href = options.href;
      link.textContent = content;
      item.appendChild(link);
    } else {
      item.textContent = content;
    }
    list.appendChild(item);
  };

  addItem("Accueil", { href: "index.html" });
  addItem("›", { ariaHidden: true });
  list.lastElementChild.setAttribute("aria-hidden", "true");
  addItem("Carte", { href: "map.html" });
  addItem("›", { ariaHidden: true });
  list.lastElementChild.setAttribute("aria-hidden", "true");
  addItem(spotName, { current: true });

  nav.appendChild(list);
  return nav;
}

function createDrawer() {
  const dialog = document.createElement("dialog");
  dialog.className = "spot-drawer";
  dialog.setAttribute("aria-labelledby", "spot-drawer-title");
  dialog.innerHTML = `
    <div class="spot-drawer__content">
      <div class="spot-drawer__header">
        <h2 id="spot-drawer-title">Ajouter une cueillette</h2>
        <button type="button" class="spot-button spot-button--secondary" aria-label="Fermer le panneau">Fermer</button>
      </div>
      <div class="spot-drawer__body">
        <div class="spot-drawer__placeholder">
          <p>Un formulaire simplifié apparaîtra ici pour saisir une nouvelle cueillette.</p>
          <p>Cette démonstration n’enregistre pas encore les données.</p>
        </div>
      </div>
    </div>
  `;

  let returnFocusTo = null;
  const closeButton = dialog.querySelector(
    'button[aria-label="Fermer le panneau"]',
  );

  const close = () => {
    dialog.close();
  };

  closeButton.addEventListener("click", close);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      close();
    }
  });
  dialog.addEventListener("close", () => {
    if (returnFocusTo) {
      returnFocusTo.focus();
    }
  });

  document.body.appendChild(dialog);

  return {
    open(trigger) {
      returnFocusTo = trigger || null;
      dialog.showModal();
      closeButton.focus();
    },
  };
}

function createActivitySummary(pickings, onAddPicking) {
  const section = document.createElement("section");
  section.className = "spot-section spot-section--activity";
  section.setAttribute("aria-labelledby", "spot-activity");

  const heading = document.createElement("h2");
  heading.id = "spot-activity";
  heading.textContent = "Activité";

  section.appendChild(heading);

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "spot-button spot-button--primary";
  addButton.textContent = "Ajouter une cueillette";
  addButton.addEventListener("click", (event) => {
    if (typeof onAddPicking === "function") {
      onAddPicking(event.currentTarget);
    }
  });

  if (!pickings.length) {
    const empty = document.createElement("div");
    empty.className = "spot-empty-state";
    const text = document.createElement("p");
    text.textContent = "Aucune cueillette enregistrée.";
    empty.append(text, addButton);
    section.appendChild(empty);
    return section;
  }

  const summary = document.createElement("div");
  summary.className = "spot-activity-summary";

  const uniqueSpecies = new Set();
  let totalWeight = 0;
  pickings.forEach((picking) => {
    totalWeight += picking.totalWeightKg ?? 0;
    picking.species.forEach((species) => uniqueSpecies.add(species.name));
  });

  const createStat = (label, value) => {
    const item = document.createElement("div");
    item.className = "spot-activity-summary__stat";
    const dt = document.createElement("dt");
    dt.textContent = label;
    const dd = document.createElement("dd");
    dd.textContent = value;
    item.append(dt, dd);
    return item;
  };

  const statsList = document.createElement("dl");
  statsList.className = "spot-activity-summary__stats";
  statsList.append(
    createStat("Espèces observées", formatNumber(uniqueSpecies.size)),
    createStat("Poids cumulé", `${formatNumber(totalWeight)} kg`),
    createStat("Cueillettes", formatNumber(pickings.length)),
  );

  const latest = pickings.reduce(
    (recent, current) =>
      new Date(current.date) > new Date(recent.date) ? current : recent,
    pickings[0],
  );

  const update = document.createElement("p");
  update.textContent = `Dernière cueillette le ${formatFullDate(latest.date)} (${formatNumber(
    latest.totalWeightKg,
  )} kg).`;

  const actions = document.createElement("div");
  actions.className = "spot-activity-summary__actions";
  actions.appendChild(addButton);

  summary.append(statsList, update, actions);
  section.appendChild(summary);
  return section;
}

const drawer = createDrawer();

function renderSpotDetail(data) {
  root.innerHTML = "";
  root.setAttribute("aria-busy", "false");

  const breadcrumb = createBreadcrumb(data.spot.name);
  root.appendChild(breadcrumb);

  const photosGallery = createPhotosGallery({
    photos: data.photos,
    showToast,
  });

  const mapUrl = buildMapPageUrl({
    lat: data.spot.coordinates.lat,
    lng: data.spot.coordinates.lng,
    zoom: 14,
  });

  const header = createActivityHeader({
    spot: data.spot,
    mapUrl,
    onAddPicking: (trigger) => drawer.open(trigger),
    onAddPhoto: () => photosGallery.triggerAdd(),
    showToast,
  });

  root.appendChild(header.element);

  const sections = document.createElement("div");
  sections.className = "spot-detail__sections";

  sections.appendChild(createSpotInfoSection(data.spot, formatNumber));
  sections.appendChild(createSpotMapSection(data.spot));

  const lastPicking = data.spot.lastPicking || data.pickings[0];
  const pickingsSections = createPickingsSections({
    lastPicking,
    pickings: data.pickings,
    formatNumber,
    onAddPicking: (trigger) => drawer.open(trigger),
    showToast,
  });

  sections.append(
    pickingsSections.lastSection,
    pickingsSections.historySection,
  );
  sections.appendChild(photosGallery.element);

  const noteSection = document.createElement("section");
  noteSection.className = "spot-section spot-section--note";
  noteSection.setAttribute("aria-labelledby", "spot-note");

  const noteHeading = document.createElement("h2");
  noteHeading.id = "spot-note";
  noteHeading.textContent = "Note du coin";

  const averageRating = data.pickings.length
    ? data.pickings.reduce((sum, item) => sum + (item.rating ?? 0), 0) /
      data.pickings.length
    : 0;

  const ratingComponent = createRatingInput({
    name: "spot-rating",
    value: Math.round(averageRating || 0),
    legend: "Note",
    description: "Attribuez une note de 1 à 5 étoiles pour ce coin.",
    onChange: (value) => {
      showToast(`Votre note ${value}/5 est prise en compte (démonstration).`);
    },
  });

  const noteInfo = document.createElement("p");
  noteInfo.className = "spot-note__info";
  noteInfo.textContent = data.pickings.length
    ? `Note moyenne actuelle : ${formatNumber(averageRating)} / 5 (basée sur ${formatNumber(
        data.pickings.length,
      )} cueillettes).`
    : "Ce coin n’a pas encore reçu de note.";

  noteSection.append(noteHeading, ratingComponent.element, noteInfo);

  sections.appendChild(noteSection);

  sections.appendChild(
    createActivityChartSection(data.spot.activitySeries, formatNumber),
  );
  sections.appendChild(
    createActivitySummary(data.pickings, (trigger) => drawer.open(trigger)),
  );

  root.appendChild(sections);
}

async function loadData() {
  showSkeleton();

  try {
    const response = await fetch("data/spot-detail.json", {
      headers: {
        "Cache-Control": "no-cache",
      },
    });
    if (!response.ok) {
      throw new Error("Réponse invalide du serveur.");
    }
    const data = await response.json();
    renderSpotDetail(data);
  } catch (error) {
    root.innerHTML = "";
    root.setAttribute("aria-busy", "false");
    const fallback = document.createElement("section");
    fallback.className = "spot-section";
    const heading = document.createElement("h2");
    heading.textContent = "Chargement impossible";
    const message = document.createElement("p");
    message.textContent =
      "Impossible de récupérer les informations de ce coin pour le moment.";
    fallback.append(heading, message);
    root.appendChild(fallback);

    showToast("Échec du chargement des données.", {
      actionLabel: "Réessayer",
      onAction: () => {
        loadData();
      },
      duration: 8000,
    });

    console.error("Erreur de chargement du détail du coin", error);
  }
}

loadData();
