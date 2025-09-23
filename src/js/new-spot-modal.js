const DEFAULT_COORDS = { lat: 48.8566, lng: 2.3522 };
const MAP_DELTA = 0.02;
const KEYBOARD_STEP = 0.00009;
const KEYBOARD_STEP_FAST = 0.0009;
const PRECISION_LEVELS = [
  {
    value: "exact",
    label: "Exacte",
    rounding: 4,
    announcement: "Coordonnées exactes",
  },
  {
    value: "100m",
    label: "≈100 m",
    rounding: 3,
    announcement: "Coordonnées approximatives à 100 mètres",
  },
  {
    value: "500m",
    label: "≈500 m",
    rounding: 2,
    announcement: "Coordonnées approximatives à 500 mètres",
  },
  {
    value: "1km",
    label: "≈1 km",
    rounding: 1,
    announcement: "Coordonnées approximatives à un kilomètre",
  },
];
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/jpg",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_PHOTOS = 8;
const MUSHROOMS_ENDPOINT = "/data/mushrooms.json";

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatCoordinate(value, decimals, min = -180, max = 180) {
  return clamp(value, min, max).toFixed(decimals);
}

function buildMapUrl({ lat, lng }) {
  const latClamped = clamp(lat, -90, 90);
  const lngClamped = clamp(lng, -180, 180);
  const delta = MAP_DELTA;
  const left = formatCoordinate(lngClamped - delta, 6, -180, 180);
  const right = formatCoordinate(lngClamped + delta, 6, -180, 180);
  const bottom = formatCoordinate(latClamped - delta, 6, -90, 90);
  const top = formatCoordinate(latClamped + delta, 6, -90, 90);
  const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`;
  const markerLat = formatCoordinate(latClamped, 6, -90, 90);
  const markerLng = formatCoordinate(lngClamped, 6, -180, 180);
  const marker = `${markerLat}%2C${markerLng}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

function formatApproximateCoords(coords, precision) {
  const precisionConfig = PRECISION_LEVELS.find(
    (level) => level.value === precision,
  );
  const decimals = precisionConfig ? precisionConfig.rounding : 4;
  const latText = clamp(coords.lat, -90, 90).toFixed(decimals);
  const lngText = clamp(coords.lng, -180, 180).toFixed(decimals);
  return `${latText}°, ${lngText}°`;
}

function createElement(tag, options = {}) {
  const element = document.createElement(tag);
  if (options.className) {
    element.className = options.className;
  }
  if (options.attrs) {
    Object.entries(options.attrs).forEach(([key, value]) => {
      if (value === null || typeof value === "undefined") {
        return;
      }
      element.setAttribute(key, value);
    });
  }
  if (options.text) {
    element.textContent = options.text;
  }
  if (options.html) {
    element.innerHTML = options.html;
  }
  return element;
}

function buildPrecisionControls(selectedValue) {
  const container = createElement("fieldset", {
    className: "ns-fieldset",
    attrs: { "aria-describedby": "location-help location-precision-help" },
  });
  const legend = createElement("legend", {
    className: "ns-legend",
    text: "Précision",
  });
  container.appendChild(legend);
  const hint = createElement("p", {
    className: "ns-help",
    id: "location-precision-help",
    text: "Choisissez le niveau de précision partagé.",
  });
  container.appendChild(hint);

  PRECISION_LEVELS.forEach((level) => {
    const item = createElement("div", { className: "ns-radio" });
    const inputId = `location-precision-${level.value}`;
    const input = createElement("input", {
      className: "ns-radio-input",
      attrs: {
        type: "radio",
        id: inputId,
        name: "location-precision",
        value: level.value,
        checked: level.value === selectedValue ? "" : null,
      },
    });
    const label = createElement("label", {
      className: "ns-radio-label",
      attrs: { for: inputId },
      text: level.label,
    });
    item.appendChild(input);
    item.appendChild(label);
    container.appendChild(item);
  });

  return container;
}

function formatDate(date) {
  if (!date) {
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getFocusableElements(root) {
  return Array.from(
    root.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input:not([type="hidden"]):not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function isAcceptedFileType(file) {
  const type = file.type ? file.type.toLowerCase() : "";
  if (ACCEPTED_FILE_TYPES.includes(type)) {
    return true;
  }
  if (!type && file.name) {
    const extension = file.name.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "heic", "heif"].includes(extension);
  }
  return false;
}

class NewSpotModal {
  constructor(triggerButton, container) {
    this.triggerButton = triggerButton;
    this.container = container;
    this.overlay = null;
    this.modal = null;
    this.confirmDialog = null;
    this.focusTrapRoot = null;
    this.statusRegion = null;
    this.mushrooms = [];
    this.isOpen = false;
    this.isDirty = false;
    this.isSubmitting = false;
    this.state = {
      coords: { ...DEFAULT_COORDS },
      precision: PRECISION_LEVELS[0].value,
      species: [],
      photos: [],
      showRawCoords: false,
      isPublic: false,
      lastHarvest: "",
      rating: "",
      publicConsent: false,
      hasCustomLocation: false,
    };
    this.elements = {};
    this.activeSuggestionIndex = -1;
    this.pointerMoveData = null;
    this.baseMapDescription =
      "location-help location-keyboard map-coords-display";
    this.boundHandleKeydown = (event) => this.handleKeydown(event);
    this.boundDocumentClick = (event) => this.handleDocumentClick(event);
    this.boundPointerMove = (event) => this.handlePointerMove(event);
    this.boundPointerUp = (event) => this.stopPointerMove(event);

    this.build();
    this.attachTrigger();
  }

  attachTrigger() {
    this.triggerButton.setAttribute("aria-expanded", "false");
    this.triggerButton.addEventListener("click", () => {
      this.open();
    });
  }

  build() {
    this.overlay = createElement("div", {
      className: "new-spot-overlay",
      attrs: { "data-new-spot-overlay": "", hidden: "" },
    });

    const scrim = createElement("div", {
      className: "new-spot-scrim",
      attrs: { "data-new-spot-scrim": "" },
    });

    this.modal = createElement("div", {
      className: "new-spot-modal",
      attrs: {
        id: "new-spot-modal",
        role: "dialog",
        "aria-modal": "true",
        "aria-labelledby": "new-spot-title",
        "data-new-spot-main": "",
      },
    });

    const form = createElement("form", {
      className: "new-spot-form",
      attrs: { novalidate: "" },
    });

    const header = createElement("header", { className: "new-spot-header" });
    const title = createElement("h2", {
      id: "new-spot-title",
      className: "new-spot-title",
      text: "Ajouter un coin de champignons",
    });
    header.appendChild(title);

    const closeButton = createElement("button", {
      className: "new-spot-close",
      attrs: {
        type: "button",
        "data-close-modal": "",
        "aria-label": "Fermer la fenêtre",
      },
    });
    closeButton.innerHTML = '<span aria-hidden="true">×</span>';
    header.appendChild(closeButton);

    const body = createElement("div", { className: "new-spot-body" });

    body.appendChild(this.buildDetailsSection());
    body.appendChild(this.buildLocationSection());
    body.appendChild(this.buildSpeciesSection());
    body.appendChild(this.buildHarvestSection());
    body.appendChild(this.buildPhotosSection());
    body.appendChild(this.buildPrivacySection());

    const footer = createElement("footer", { className: "new-spot-footer" });
    const cancelButton = createElement("button", {
      className: "ns-button ns-button-secondary",
      attrs: { type: "button", "data-cancel-modal": "" },
      text: "Annuler",
    });
    const submitButton = createElement("button", {
      className: "ns-button ns-button-primary",
      attrs: { type: "submit", "data-submit-modal": "" },
    });
    submitButton.innerHTML =
      '<span class="ns-button-spinner" aria-hidden="true"></span><span data-submit-label>Créer</span>';
    footer.appendChild(cancelButton);
    footer.appendChild(submitButton);

    form.appendChild(header);
    form.appendChild(body);
    form.appendChild(footer);

    this.modal.appendChild(form);

    this.confirmDialog = createElement("div", {
      className: "new-spot-confirm",
      attrs: {
        role: "alertdialog",
        "aria-modal": "true",
        "aria-labelledby": "new-spot-confirm-title",
        "aria-describedby": "new-spot-confirm-description",
        hidden: "",
        "data-new-spot-confirm": "",
      },
    });

    const confirmCard = createElement("div", {
      className: "new-spot-confirm-card",
    });
    const confirmTitle = createElement("h3", {
      id: "new-spot-confirm-title",
      className: "new-spot-confirm-title",
      text: "Abandonner la création ?",
    });
    const confirmDescription = createElement("p", {
      id: "new-spot-confirm-description",
      className: "new-spot-confirm-description",
      text: "Vous pourrez enregistrer un brouillon pour reprendre plus tard.",
    });

    const confirmButtons = createElement("div", {
      className: "new-spot-confirm-actions",
    });
    const saveDraftButton = createElement("button", {
      className: "ns-button ns-button-primary",
      attrs: { type: "button", "data-confirm-draft": "" },
      text: "Enregistrer le brouillon",
    });
    const discardButton = createElement("button", {
      className: "ns-button ns-button-danger",
      attrs: { type: "button", "data-confirm-discard": "" },
      text: "Annuler la création",
    });
    const backButton = createElement("button", {
      className: "ns-button ns-button-ghost",
      attrs: { type: "button", "data-confirm-back": "" },
      text: "Revenir au formulaire",
    });

    confirmButtons.appendChild(saveDraftButton);
    confirmButtons.appendChild(discardButton);
    confirmButtons.appendChild(backButton);

    confirmCard.appendChild(confirmTitle);
    confirmCard.appendChild(confirmDescription);
    confirmCard.appendChild(confirmButtons);
    this.confirmDialog.appendChild(confirmCard);

    this.statusRegion = createElement("div", {
      className: "sr-only",
      attrs: { "aria-live": "polite", "data-status-region": "" },
    });

    this.overlay.appendChild(scrim);
    this.overlay.appendChild(this.modal);
    this.overlay.appendChild(this.confirmDialog);
    this.overlay.appendChild(this.statusRegion);

    this.container.appendChild(this.overlay);

    this.cacheElements();
    this.bindEvents();
  }

  cacheElements() {
    const form = this.modal.querySelector("form");
    this.elements.form = form;
    this.elements.closeButton = this.modal.querySelector("[data-close-modal]");
    this.elements.cancelButton = this.modal.querySelector(
      "[data-cancel-modal]",
    );
    this.elements.submitButton = this.modal.querySelector(
      "[data-submit-modal]",
    );
    this.elements.submitLabel = this.modal.querySelector("[data-submit-label]");

    this.elements.nameInput = form.querySelector("#spot-name");
    this.elements.nameError = form.querySelector("#spot-name-error");

    this.elements.mapFrame = form.querySelector("#spot-map-frame");
    this.elements.mapInteractive = form.querySelector("[data-map-interactive]");
    this.elements.mapField = form.querySelector("[data-map-field]");
    this.elements.mapPin = form.querySelector("[data-map-pin]");
    this.elements.mapError = form.querySelector("#spot-location-error");
    this.elements.mapCoords = form.querySelector("[data-map-coords]");
    this.elements.mapToggleButton = form.querySelector("[data-toggle-coords]");
    this.elements.rawCoords = form.querySelector("[data-raw-coords]");
    this.elements.precisionRadios = Array.from(
      form.querySelectorAll('input[name="location-precision"]'),
    );
    this.elements.precisionError = form.querySelector("#spot-precision-error");
    this.elements.precisionHint = form.querySelector(
      "#location-precision-help",
    );
    this.elements.precisionAlert = form.querySelector(
      "#public-precision-alert",
    );

    this.elements.speciesInput = form.querySelector("#spot-species");
    this.elements.speciesList = form.querySelector("[data-species-list]");
    this.elements.speciesContainer = form.querySelector(
      "[data-selected-species]",
    );
    this.elements.speciesHelp = form.querySelector("#spot-species-help");
    this.elements.speciesError = form.querySelector("#spot-species-error");

    this.elements.harvestDate = form.querySelector("#spot-harvest-date");
    this.elements.harvestError = form.querySelector("#spot-harvest-error");
    this.elements.todayShortcut = form.querySelector("[data-shortcut-today]");
    this.elements.yesterdayShortcut = form.querySelector(
      "[data-shortcut-yesterday]",
    );
    this.elements.ratingInputs = Array.from(
      form.querySelectorAll('input[name="spot-rating"]'),
    );

    this.elements.photosInput = form.querySelector("#spot-photos");
    this.elements.photoGrid = form.querySelector("[data-photo-grid]");
    this.elements.photosError = form.querySelector("#spot-photos-error");

    this.elements.privacyToggle = form.querySelector("[data-privacy-toggle]");
    this.elements.privacyStatus = form.querySelector("[data-privacy-status]");
    this.elements.publicConsent = form.querySelector("#spot-public-consent");
    this.elements.publicConsentWrapper = form.querySelector(
      "[data-public-consent]",
    );
    this.elements.publicError = form.querySelector("#spot-public-error");
    this.elements.securityLink = form.querySelector("[data-security-link]");

    this.elements.confirm = {
      wrapper: this.confirmDialog,
      saveDraft: this.confirmDialog.querySelector("[data-confirm-draft]"),
      discard: this.confirmDialog.querySelector("[data-confirm-discard]"),
      back: this.confirmDialog.querySelector("[data-confirm-back]"),
    };
  }

  bindEvents() {
    this.elements.closeButton.addEventListener("click", () =>
      this.requestClose(),
    );
    this.elements.cancelButton.addEventListener("click", () =>
      this.requestClose(),
    );
    const scrim = this.overlay.querySelector("[data-new-spot-scrim]");
    if (scrim) {
      scrim.addEventListener("click", () => {
        if (!this.confirmDialog.hidden) {
          return;
        }
        this.requestClose();
      });
    }

    this.elements.form.addEventListener("submit", (event) =>
      this.handleSubmit(event),
    );

    this.elements.nameInput.addEventListener("input", () => {
      this.setDirty();
      this.validateName();
    });

    this.elements.mapPin.addEventListener("keydown", (event) =>
      this.handleMapKeydown(event),
    );
    this.elements.mapInteractive.addEventListener("pointerdown", (event) =>
      this.startPointerMove(event),
    );
    window.addEventListener("pointerup", this.boundPointerUp);
    window.addEventListener("pointermove", this.boundPointerMove);

    this.elements.mapToggleButton.addEventListener("click", () =>
      this.toggleRawCoords(),
    );
    this.elements.precisionRadios.forEach((radio) =>
      radio.addEventListener("change", () => this.handlePrecisionChange()),
    );

    this.elements.speciesInput.addEventListener("input", (event) =>
      this.handleSpeciesInput(event),
    );
    this.elements.speciesInput.addEventListener("keydown", (event) =>
      this.handleSpeciesKeydown(event),
    );
    this.elements.speciesInput.addEventListener("focus", () =>
      this.showSpeciesSuggestions(),
    );
    document.addEventListener("click", this.boundDocumentClick);

    this.elements.todayShortcut.addEventListener("click", () =>
      this.setHarvestShortcut(0),
    );
    this.elements.yesterdayShortcut.addEventListener("click", () =>
      this.setHarvestShortcut(1),
    );
    this.elements.harvestDate.addEventListener("change", () =>
      this.handleHarvestChange(),
    );
    this.elements.harvestDate.setAttribute("max", formatDate(new Date()));

    this.elements.ratingInputs.forEach((input) =>
      input.addEventListener("change", () => {
        this.setDirty();
        this.state.rating = input.value;
      }),
    );

    this.elements.photosInput.addEventListener("change", (event) =>
      this.handlePhotosChange(event),
    );

    this.elements.privacyToggle.addEventListener("click", () =>
      this.togglePrivacy(),
    );
    this.elements.publicConsent.addEventListener("change", () =>
      this.handlePublicConsentChange(),
    );

    this.elements.confirm.saveDraft.addEventListener("click", () =>
      this.saveDraftAndClose(),
    );
    this.elements.confirm.discard.addEventListener("click", () =>
      this.forceClose(),
    );
    this.elements.confirm.back.addEventListener("click", () =>
      this.closeConfirm(),
    );

    this.overlay.addEventListener("keydown", this.boundHandleKeydown);
  }

  async loadMushrooms() {
    if (this.mushrooms.length) {
      return;
    }
    try {
      const response = await fetch(MUSHROOMS_ENDPOINT);
      if (!response.ok) {
        throw new Error("Impossible de charger la liste des espèces.");
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        this.mushrooms = data;
      } else {
        this.mushrooms = Object.entries(data).map(([id, info]) => ({
          id,
          ...info,
        }));
      }
    } catch (error) {
      this.setStatus(error.message || "Erreur lors du chargement des espèces.");
      this.elements.speciesInput.disabled = true;
      this.elements.speciesInput.setAttribute("aria-disabled", "true");
    }
  }

  restoreDraft() {
    let rawDraft;
    try {
      rawDraft = window.localStorage.getItem("mesureconvert-new-spot-draft");
    } catch (error) {
      console.warn("Impossible de récupérer le brouillon", error);
      return;
    }
    if (!rawDraft) {
      return;
    }

    let draft;
    try {
      draft = JSON.parse(rawDraft);
    } catch (error) {
      console.warn("Brouillon illisible", error);
      return;
    }

    if (!draft || typeof draft !== "object") {
      return;
    }

    if (typeof draft.name === "string") {
      this.elements.nameInput.value = draft.name;
    }

    if (
      draft.precision &&
      PRECISION_LEVELS.some((level) => level.value === draft.precision)
    ) {
      this.state.precision = draft.precision;
    } else {
      this.state.precision = PRECISION_LEVELS[0].value;
    }
    this.elements.precisionRadios.forEach((radio) => {
      radio.checked = radio.value === this.state.precision;
    });

    if (
      draft.coords &&
      typeof draft.coords.lat === "number" &&
      typeof draft.coords.lng === "number"
    ) {
      this.state.coords = draft.coords;
      this.state.hasCustomLocation = Boolean(draft.hasCustomLocation);
    } else {
      this.state.coords = { ...DEFAULT_COORDS };
      this.state.hasCustomLocation = false;
    }

    if (Array.isArray(draft.species)) {
      this.state.species = draft.species;
    } else {
      this.state.species = [];
    }
    this.renderSpeciesChips();

    if (typeof draft.lastHarvest === "string") {
      this.state.lastHarvest = draft.lastHarvest;
      this.elements.harvestDate.value = draft.lastHarvest;
    } else {
      this.state.lastHarvest = "";
      this.elements.harvestDate.value = "";
    }

    if (typeof draft.rating === "string") {
      this.state.rating = draft.rating;
    } else {
      this.state.rating = "";
    }
    this.elements.ratingInputs.forEach((input) => {
      input.checked = input.value === this.state.rating;
    });

    this.state.isPublic = Boolean(draft.isPublic);
    this.state.publicConsent = this.state.isPublic && Boolean(draft.consent);
    this.updatePrivacyUI();
    this.elements.publicConsent.checked = this.state.publicConsent;
    this.updatePrivacyWarning();

    this.updateMap();
    this.updateCoordSummary();
    this.updateRawCoords();
    this.validateName();
    this.validateSpecies();
    this.validateHarvest();
    if (this.state.hasCustomLocation) {
      this.validateLocation();
    } else {
      this.elements.mapError.hidden = true;
      this.elements.mapField.setAttribute(
        "aria-describedby",
        this.baseMapDescription,
      );
      this.elements.mapField.removeAttribute("aria-invalid");
    }
    this.validatePublicConsent();
    this.updateSubmitState();
    this.isDirty = false;

    if (
      draft.name ||
      (Array.isArray(draft.species) && draft.species.length) ||
      this.state.hasCustomLocation
    ) {
      this.setStatus("Brouillon chargé.");
    }
  }

  setStatus(message) {
    this.statusRegion.textContent = message || "";
  }

  open() {
    if (this.isOpen) {
      return;
    }
    this.isOpen = true;
    this.overlay.hidden = false;
    document.body.classList.add("no-scroll");
    this.triggerButton.setAttribute("aria-expanded", "true");
    this.focusTrapRoot = this.modal;
    this.updateMap();
    this.updateCoordSummary();
    this.updateRawCoords();
    this.updatePrivacyUI();
    this.updateSubmitState();
    this.restoreDraft();
    this.elements.nameInput.focus();
    this.loadMushrooms();
  }

  requestClose() {
    if (!this.isDirty) {
      this.close();
      return;
    }
    this.openConfirm();
  }

  close() {
    if (!this.isOpen) {
      return;
    }
    this.isOpen = false;
    this.overlay.hidden = true;
    document.body.classList.remove("no-scroll");
    this.triggerButton.setAttribute("aria-expanded", "false");
    this.resetForm();
    this.triggerButton.focus();
  }

  forceClose() {
    this.closeConfirm();
    this.isDirty = false;
    this.close();
  }

  resetForm() {
    this.elements.form.reset();
    this.state = {
      coords: { ...DEFAULT_COORDS },
      precision: PRECISION_LEVELS[0].value,
      species: [],
      photos: [],
      showRawCoords: false,
      isPublic: false,
      lastHarvest: "",
      rating: "",
      publicConsent: false,
      hasCustomLocation: false,
    };
    this.clearSpeciesChips();
    this.clearPhotoGrid();
    this.updateMap();
    this.updateCoordSummary();
    this.updateRawCoords();
    this.updatePrivacyUI();
    this.updateSubmitState();
    this.isDirty = false;
    this.isSubmitting = false;
    this.elements.speciesInput.disabled = false;
    this.elements.speciesInput.value = "";
    this.elements.speciesInput.removeAttribute("aria-disabled");
    this.elements.speciesInput.setAttribute(
      "aria-describedby",
      "spot-species-help",
    );
    this.elements.speciesInput.removeAttribute("aria-invalid");
    this.elements.mapField.setAttribute(
      "aria-describedby",
      this.baseMapDescription,
    );
    this.elements.mapField.removeAttribute("aria-invalid");
    this.elements.nameInput.setAttribute("aria-describedby", "spot-name-help");
    this.elements.nameInput.removeAttribute("aria-invalid");
    this.activeSuggestionIndex = -1;
    this.elements.speciesList.innerHTML = "";
    this.hideSpeciesSuggestions();
    this.elements.submitButton.removeAttribute("aria-busy");
    this.elements.submitButton.disabled = false;
    this.statusRegion.textContent = "";
    this.pointerMoveData = null;
  }

  buildDetailsSection() {
    const section = createElement("section", {
      className: "ns-section",
      attrs: { "aria-labelledby": "details-title" },
    });
    const title = createElement("h3", {
      id: "details-title",
      className: "ns-section-title",
      text: "Détails du coin",
    });
    const group = createElement("div", { className: "ns-field" });
    const label = createElement("label", {
      attrs: { for: "spot-name" },
      className: "ns-label",
      text: "Nom du coin",
    });
    const help = createElement("p", {
      id: "spot-name-help",
      className: "ns-help",
      text: "Nom visible dans vos coins.",
    });
    const input = createElement("input", {
      className: "ns-input",
      attrs: {
        id: "spot-name",
        name: "spot-name",
        type: "text",
        placeholder: "Ex. Coin de Louise – Bois de Vincennes",
        "aria-describedby": "spot-name-help",
        required: "",
      },
    });
    const error = createElement("p", {
      id: "spot-name-error",
      className: "ns-error",
      attrs: { role: "alert", hidden: "" },
    });
    group.appendChild(label);
    group.appendChild(help);
    group.appendChild(input);
    group.appendChild(error);
    section.appendChild(title);
    section.appendChild(group);
    return section;
  }

  buildLocationSection() {
    const section = createElement("section", {
      className: "ns-section",
      attrs: { "aria-labelledby": "location-title" },
    });
    const title = createElement("h3", {
      id: "location-title",
      className: "ns-section-title",
      text: "Localisation",
    });

    const mapField = createElement("div", {
      className: "ns-field ns-field-block",
      attrs: {
        role: "group",
        "aria-labelledby": "location-title",
        "aria-describedby":
          "location-help location-keyboard map-coords-display",
        "data-map-field": "",
      },
    });

    const help = createElement("p", {
      id: "location-help",
      className: "ns-help",
      text: "Déplacez l’épingle pour choisir l’emplacement.",
    });

    const mapContainer = createElement("div", {
      className: "ns-map",
      attrs: { "data-map-interactive": "" },
    });
    const iframe = createElement("iframe", {
      className: "ns-map-frame",
      attrs: {
        id: "spot-map-frame",
        title: "Carte OpenStreetMap",
        loading: "lazy",
        tabindex: "-1",
        "aria-hidden": "true",
      },
    });
    const mapPin = createElement("button", {
      className: "ns-map-pin",
      attrs: {
        type: "button",
        "aria-describedby": "location-help location-keyboard",
        "aria-label": "Déplacer l’épingle",
        "data-map-pin": "",
      },
      text: "Épingle",
    });
    const keyboardHelp = createElement("p", {
      id: "location-keyboard",
      className: "ns-help",
      text: "Flèches = ±10 m, Maj + flèches = ±100 m.",
    });

    mapContainer.appendChild(iframe);
    mapContainer.appendChild(mapPin);

    const coordSummary = createElement("div", {
      className: "ns-coords",
      attrs: { id: "map-coords-display", "data-map-coords": "" },
    });

    const toggleCoords = createElement("button", {
      className: "ns-link-button",
      attrs: {
        type: "button",
        "data-toggle-coords": "",
        "aria-expanded": "false",
        "aria-controls": "spot-raw-coords",
      },
      text: "Afficher les coordonnées",
    });

    const rawCoords = createElement("div", {
      className: "ns-raw-coords",
      attrs: { hidden: "", id: "spot-raw-coords", "data-raw-coords": "" },
    });

    const precisionControls = buildPrecisionControls(this.state.precision);
    precisionControls.classList.add("ns-field-block");

    const warning = createElement("p", {
      id: "public-precision-alert",
      className: "ns-inline-warning",
      attrs: { role: "status", hidden: "" },
      text: "Partager un coin exact peut attirer du monde.",
    });

    const error = createElement("p", {
      id: "spot-location-error",
      className: "ns-error",
      attrs: { role: "alert", hidden: "" },
    });

    mapField.appendChild(help);
    mapField.appendChild(mapContainer);
    mapField.appendChild(keyboardHelp);
    mapField.appendChild(coordSummary);
    mapField.appendChild(toggleCoords);
    mapField.appendChild(rawCoords);
    mapField.appendChild(precisionControls);
    mapField.appendChild(warning);
    mapField.appendChild(error);

    section.appendChild(title);
    section.appendChild(mapField);

    return section;
  }

  buildSpeciesSection() {
    const section = createElement("section", {
      className: "ns-section",
      attrs: { "aria-labelledby": "species-title" },
    });
    const title = createElement("h3", {
      id: "species-title",
      className: "ns-section-title",
      text: "Champignons",
    });
    const field = createElement("div", { className: "ns-field" });
    const label = createElement("label", {
      className: "ns-label",
      attrs: { for: "spot-species" },
      text: "Espèces trouvées",
    });
    const help = createElement("p", {
      id: "spot-species-help",
      className: "ns-help",
      text: "Tapez pour rechercher. Noms français normalisés.",
    });

    const inputWrapper = createElement("div", { className: "ns-combobox" });
    const input = createElement("input", {
      className: "ns-input",
      attrs: {
        id: "spot-species",
        name: "spot-species",
        type: "text",
        role: "combobox",
        "aria-expanded": "false",
        "aria-autocomplete": "list",
        "aria-controls": "species-listbox",
        "aria-describedby": "spot-species-help",
        autocomplete: "off",
        placeholder: "Rechercher une espèce",
      },
    });
    const list = createElement("ul", {
      className: "ns-combobox-list",
      attrs: {
        id: "species-listbox",
        role: "listbox",
        hidden: "",
        "data-species-list": "",
      },
    });

    inputWrapper.appendChild(input);
    inputWrapper.appendChild(list);

    const selectedContainer = createElement("div", {
      className: "ns-chips",
      attrs: { "data-selected-species": "" },
    });

    const error = createElement("p", {
      id: "spot-species-error",
      className: "ns-error",
      attrs: { role: "alert", hidden: "" },
    });

    field.appendChild(label);
    field.appendChild(help);
    field.appendChild(inputWrapper);
    field.appendChild(selectedContainer);
    field.appendChild(error);

    section.appendChild(title);
    section.appendChild(field);
    return section;
  }

  buildHarvestSection() {
    const section = createElement("section", {
      className: "ns-section",
      attrs: { "aria-labelledby": "harvest-title" },
    });
    const title = createElement("h3", {
      id: "harvest-title",
      className: "ns-section-title",
      text: "Cueillette",
    });

    const dateField = createElement("div", { className: "ns-field" });
    const label = createElement("label", {
      className: "ns-label",
      attrs: { for: "spot-harvest-date" },
      text: "Dernière cueillette",
    });
    const shortcuts = createElement("div", { className: "ns-shortcuts" });
    const today = createElement("button", {
      className: "ns-link-button",
      attrs: { type: "button", "data-shortcut-today": "" },
      text: "Aujourd’hui",
    });
    const yesterday = createElement("button", {
      className: "ns-link-button",
      attrs: { type: "button", "data-shortcut-yesterday": "" },
      text: "Hier",
    });
    shortcuts.appendChild(today);
    shortcuts.appendChild(yesterday);
    const dateInput = createElement("input", {
      className: "ns-input",
      attrs: {
        id: "spot-harvest-date",
        type: "date",
        name: "spot-harvest-date",
      },
    });
    const error = createElement("p", {
      id: "spot-harvest-error",
      className: "ns-error",
      attrs: { role: "alert", hidden: "" },
    });
    dateField.appendChild(label);
    dateField.appendChild(shortcuts);
    dateField.appendChild(dateInput);
    dateField.appendChild(error);

    const ratingFieldset = createElement("fieldset", {
      className: "ns-fieldset",
    });
    const legend = createElement("legend", {
      className: "ns-legend",
      text: "Note du coin",
    });
    const ratingList = createElement("div", { className: "ns-rating" });
    ratingFieldset.appendChild(legend);
    ratingFieldset.appendChild(ratingList);

    for (let i = 1; i <= 5; i += 1) {
      const ratingId = `spot-rating-${i}`;
      const input = createElement("input", {
        className: "ns-rating-input",
        attrs: {
          type: "radio",
          id: ratingId,
          name: "spot-rating",
          value: String(i),
        },
      });
      const label = createElement("label", {
        className: "ns-rating-label",
        attrs: { for: ratingId },
      });
      label.innerHTML = `<span class="ns-rating-star" aria-hidden="true">★</span><span class="ns-rating-tooltip" role="tooltip" aria-live="off">${i}/5</span><span class="sr-only">${i} étoile${i > 1 ? "s" : ""} sur 5</span>`;
      ratingList.appendChild(input);
      ratingList.appendChild(label);
    }

    section.appendChild(title);
    section.appendChild(dateField);
    section.appendChild(ratingFieldset);
    return section;
  }

  buildPhotosSection() {
    const section = createElement("section", {
      className: "ns-section",
      attrs: { "aria-labelledby": "photos-title" },
    });
    const title = createElement("h3", {
      id: "photos-title",
      className: "ns-section-title",
      text: "Photos",
    });
    const field = createElement("div", { className: "ns-field" });
    const input = createElement("input", {
      className: "ns-input-file",
      attrs: {
        id: "spot-photos",
        type: "file",
        name: "spot-photos",
        accept: ".jpg,.jpeg,.png,.heic,.heif",
        multiple: "",
      },
    });
    const label = createElement("label", {
      className: "ns-button ns-button-secondary",
      attrs: { for: "spot-photos" },
      text: "Ajouter des photos",
    });
    const constraints = createElement("p", {
      className: "ns-help",
      text: "JPG/PNG/HEIC, ≤10 Mo, jusqu’à 8 photos.",
    });
    const grid = createElement("div", {
      className: "ns-photo-grid",
      attrs: { "data-photo-grid": "" },
    });
    const error = createElement("p", {
      id: "spot-photos-error",
      className: "ns-error",
      attrs: { role: "alert", hidden: "" },
    });

    field.appendChild(label);
    field.appendChild(input);
    field.appendChild(constraints);
    field.appendChild(grid);
    field.appendChild(error);
    section.appendChild(title);
    section.appendChild(field);
    return section;
  }

  buildPrivacySection() {
    const section = createElement("section", {
      className: "ns-section",
      attrs: { "aria-labelledby": "privacy-title" },
    });
    const title = createElement("h3", {
      id: "privacy-title",
      className: "ns-section-title",
      text: "Confidentialité",
    });
    const toggleWrapper = createElement("div", { className: "ns-toggle" });
    const toggle = createElement("button", {
      className: "ns-toggle-button",
      attrs: {
        type: "button",
        role: "switch",
        "aria-checked": "false",
        "data-privacy-toggle": "",
      },
    });
    toggle.innerHTML =
      '<span class="ns-toggle-handle" aria-hidden="true"></span><span class="ns-toggle-label" data-privacy-status>Privé</span>';

    const consentWrapper = createElement("div", {
      className: "ns-consent",
      attrs: { "data-public-consent": "", hidden: "" },
    });
    const checkbox = createElement("input", {
      className: "ns-checkbox",
      attrs: { type: "checkbox", id: "spot-public-consent", required: "" },
    });
    const checkboxLabel = createElement("label", {
      className: "ns-label-inline",
      attrs: { for: "spot-public-consent" },
      text: "Je comprends que la localisation sera visible publiquement.",
    });
    const error = createElement("p", {
      id: "spot-public-error",
      className: "ns-error",
      attrs: { role: "alert", hidden: "" },
    });
    consentWrapper.appendChild(checkbox);
    consentWrapper.appendChild(checkboxLabel);
    consentWrapper.appendChild(error);

    const link = createElement("a", {
      className: "ns-link",
      attrs: {
        href: "/securite-des-donnees.html",
        target: "_blank",
        rel: "noopener",
        "data-security-link": "",
      },
      text: "Conseils de sécurité et espèces protégées",
    });

    toggleWrapper.appendChild(toggle);
    section.appendChild(title);
    section.appendChild(toggleWrapper);
    section.appendChild(consentWrapper);
    section.appendChild(link);
    return section;
  }

  updateMap() {
    const { coords } = this.state;
    this.elements.mapFrame.src = buildMapUrl(coords);
    this.elements.mapInteractive.setAttribute(
      "aria-label",
      `Carte centrée sur les coordonnées ${coords.lat.toFixed(4)}°, ${coords.lng.toFixed(4)}°`,
    );
  }

  updateCoordSummary() {
    const { coords, precision, hasCustomLocation } = this.state;
    if (!hasCustomLocation) {
      this.elements.mapCoords.textContent =
        "Déplacez l’épingle pour définir les coordonnées à partager.";
      return;
    }
    this.elements.mapCoords.textContent = `Coordonnées partagées : ${formatApproximateCoords(
      coords,
      precision,
    )}`;
  }

  updateRawCoords() {
    const { coords, showRawCoords } = this.state;
    this.elements.rawCoords.textContent = `Latitude : ${coords.lat.toFixed(6)}° / Longitude : ${coords.lng.toFixed(6)}°`;
    this.elements.rawCoords.hidden = !showRawCoords;
    this.elements.mapToggleButton.textContent = showRawCoords
      ? "Masquer les coordonnées"
      : "Afficher les coordonnées";
    this.elements.mapToggleButton.setAttribute(
      "aria-expanded",
      showRawCoords ? "true" : "false",
    );
  }

  handleMapKeydown(event) {
    const { key } = event;
    let deltaLat = 0;
    let deltaLng = 0;
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) {
      event.preventDefault();
      const step = event.shiftKey ? KEYBOARD_STEP_FAST : KEYBOARD_STEP;
      if (key === "ArrowUp") {
        deltaLat = step;
      } else if (key === "ArrowDown") {
        deltaLat = -step;
      } else if (key === "ArrowLeft") {
        deltaLng = -step;
      } else if (key === "ArrowRight") {
        deltaLng = step;
      }
      this.moveCoords(deltaLat, deltaLng);
    }
  }

  startPointerMove(event) {
    if (!this.isOpen) {
      return;
    }
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const rect = this.elements.mapInteractive.getBoundingClientRect();
    this.pointerMoveData = {
      startX: event.clientX,
      startY: event.clientY,
      rect,
      startCoords: { ...this.state.coords },
    };
    this.elements.mapInteractive.setPointerCapture(event.pointerId);
    this.elements.mapInteractive.classList.add("is-dragging");
  }

  handlePointerMove(event) {
    if (!this.isOpen || !this.pointerMoveData) {
      return;
    }
    const { startX, startY, rect, startCoords } = this.pointerMoveData;
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    const degPerPxLng = (2 * MAP_DELTA) / rect.width;
    const degPerPxLat = (2 * MAP_DELTA) / rect.height;
    const newLng = startCoords.lng + deltaX * degPerPxLng;
    const newLat = startCoords.lat - deltaY * degPerPxLat;
    this.updateCoords(newLat, newLng);
  }

  stopPointerMove(event) {
    if (!this.pointerMoveData) {
      return;
    }
    if (
      event.pointerId &&
      this.elements.mapInteractive.hasPointerCapture(event.pointerId)
    ) {
      this.elements.mapInteractive.releasePointerCapture(event.pointerId);
    }
    this.elements.mapInteractive.classList.remove("is-dragging");
    this.pointerMoveData = null;
  }

  moveCoords(deltaLat, deltaLng) {
    const newLat = this.state.coords.lat + deltaLat;
    const newLng = this.state.coords.lng + deltaLng;
    this.updateCoords(newLat, newLng);
  }

  updateCoords(lat, lng) {
    this.state.coords = {
      lat: clamp(lat, -90, 90),
      lng: clamp(lng, -180, 180),
    };
    this.state.hasCustomLocation = true;
    this.updateMap();
    this.updateCoordSummary();
    this.updateRawCoords();
    this.validateLocation();
    this.setDirty();
  }

  toggleRawCoords() {
    this.state.showRawCoords = !this.state.showRawCoords;
    this.updateRawCoords();
  }

  handlePrecisionChange() {
    const selected = this.elements.precisionRadios.find(
      (radio) => radio.checked,
    );
    if (!selected) {
      return;
    }
    this.state.precision = selected.value;
    this.updateCoordSummary();
    this.updatePrivacyWarning();
    this.setDirty();
  }

  handleSpeciesInput(event) {
    this.setDirty();
    const query = event.target.value.trim().toLowerCase();
    this.updateSpeciesSuggestions(query);
  }

  async updateSpeciesSuggestions(query) {
    await this.loadMushrooms();
    if (!query) {
      this.hideSpeciesSuggestions();
      return;
    }
    const matches = this.mushrooms
      .filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.latin.toLowerCase().includes(query),
      )
      .filter(
        (item) =>
          !this.state.species.some((selected) => selected.id === item.id),
      )
      .slice(0, 6);
    this.elements.speciesList.innerHTML = "";
    this.activeSuggestionIndex = -1;
    if (!matches.length) {
      const empty = createElement("li", {
        className: "ns-combobox-empty",
        attrs: { role: "presentation" },
        text: "Aucun résultat",
      });
      this.elements.speciesList.appendChild(empty);
      this.elements.speciesInput.setAttribute("aria-expanded", "true");
      this.elements.speciesList.hidden = false;
      return;
    }

    matches.forEach((item, index) => {
      const option = createElement("li", {
        className: "ns-combobox-option",
        attrs: {
          role: "option",
          id: `species-option-${item.id}`,
          "data-species-id": item.id,
          "data-species-name": item.name,
          "data-species-latin": item.latin,
          "aria-selected": "false",
        },
      });
      option.innerHTML = `<span class="ns-option-name">${item.name}</span><span class="ns-option-latin">${item.latin}</span>`;
      option.addEventListener("mousedown", (event) => {
        event.preventDefault();
        this.selectSpecies(item);
      });
      this.elements.speciesList.appendChild(option);
      if (index === 0) {
        this.elements.speciesInput.setAttribute(
          "aria-activedescendant",
          option.id,
        );
        option.classList.add("is-active");
        option.setAttribute("aria-selected", "true");
        this.activeSuggestionIndex = 0;
      }
    });

    this.elements.speciesInput.setAttribute("aria-expanded", "true");
    this.elements.speciesList.hidden = false;
  }

  showSpeciesSuggestions() {
    if (this.elements.speciesList.children.length > 0) {
      this.elements.speciesInput.setAttribute("aria-expanded", "true");
      this.elements.speciesList.hidden = false;
    }
  }

  hideSpeciesSuggestions() {
    this.elements.speciesInput.setAttribute("aria-expanded", "false");
    this.elements.speciesInput.removeAttribute("aria-activedescendant");
    this.elements.speciesList.hidden = true;
  }

  handleSpeciesKeydown(event) {
    const { key } = event;
    const options = Array.from(
      this.elements.speciesList.querySelectorAll("[role='option']"),
    );
    if (key === "ArrowDown" || key === "ArrowUp") {
      event.preventDefault();
      if (!options.length) {
        return;
      }
      if (this.activeSuggestionIndex === -1) {
        this.activeSuggestionIndex = 0;
      } else {
        const delta = key === "ArrowDown" ? 1 : -1;
        this.activeSuggestionIndex =
          (this.activeSuggestionIndex + delta + options.length) %
          options.length;
      }
      options.forEach((option, index) => {
        if (index === this.activeSuggestionIndex) {
          option.classList.add("is-active");
          option.setAttribute("aria-selected", "true");
          this.elements.speciesInput.setAttribute(
            "aria-activedescendant",
            option.id,
          );
        } else {
          option.classList.remove("is-active");
          option.setAttribute("aria-selected", "false");
        }
      });
    } else if (key === "Enter") {
      if (
        this.activeSuggestionIndex >= 0 &&
        options[this.activeSuggestionIndex]
      ) {
        event.preventDefault();
        const option = options[this.activeSuggestionIndex];
        const item = {
          id: option.getAttribute("data-species-id"),
          name: option.getAttribute("data-species-name"),
          latin: option.getAttribute("data-species-latin"),
        };
        this.selectSpecies(item);
      }
    } else if (key === "Escape") {
      this.hideSpeciesSuggestions();
    }
  }

  handleDocumentClick(event) {
    if (!this.isOpen) {
      return;
    }
    if (
      !this.elements.speciesList.contains(event.target) &&
      event.target !== this.elements.speciesInput
    ) {
      this.hideSpeciesSuggestions();
    }
  }

  selectSpecies(item) {
    if (this.state.species.some((selected) => selected.id === item.id)) {
      return;
    }
    this.state.species.push(item);
    this.renderSpeciesChips();
    this.elements.speciesInput.value = "";
    this.hideSpeciesSuggestions();
    this.validateSpecies();
    this.setDirty();
  }

  renderSpeciesChips() {
    this.elements.speciesContainer.innerHTML = "";
    this.state.species.forEach((item) => {
      const chip = createElement("div", { className: "ns-chip" });
      const label = createElement("span", {
        className: "ns-chip-label",
        text: item.name,
      });
      const removeButton = createElement("button", {
        className: "ns-chip-remove",
        attrs: { type: "button", "aria-label": `Retirer ${item.name}` },
        text: "×",
      });
      removeButton.addEventListener("click", () => {
        this.state.species = this.state.species.filter(
          (species) => species.id !== item.id,
        );
        this.renderSpeciesChips();
        this.validateSpecies();
        this.setDirty();
      });
      chip.appendChild(label);
      chip.appendChild(removeButton);
      this.elements.speciesContainer.appendChild(chip);
    });
  }

  clearSpeciesChips() {
    this.elements.speciesContainer.innerHTML = "";
  }

  setHarvestShortcut(offsetDays) {
    const date = new Date();
    date.setDate(date.getDate() - offsetDays);
    const formatted = formatDate(date);
    this.elements.harvestDate.value = formatted;
    this.state.lastHarvest = formatted;
    this.validateHarvest();
    this.setDirty();
  }

  handleHarvestChange() {
    const value = this.elements.harvestDate.value;
    this.state.lastHarvest = value;
    this.validateHarvest();
    this.setDirty();
  }

  validateHarvest() {
    const value = this.elements.harvestDate.value;
    if (!value) {
      this.elements.harvestError.hidden = true;
      this.elements.harvestDate.removeAttribute("aria-invalid");
      return true;
    }
    const selectedDate = new Date(value);
    const today = new Date(formatDate(new Date()));
    if (selectedDate > today) {
      this.elements.harvestError.textContent =
        "La date ne peut pas être dans le futur.";
      this.elements.harvestError.hidden = false;
      this.elements.harvestDate.setAttribute("aria-invalid", "true");
      return false;
    }
    this.elements.harvestError.hidden = true;
    this.elements.harvestDate.removeAttribute("aria-invalid");
    return true;
  }

  handlePhotosChange(event) {
    this.setDirty();
    const files = Array.from(event.target.files || []);
    const newPhotos = [...this.state.photos];
    files.forEach((file) => {
      if (newPhotos.length >= MAX_PHOTOS) {
        return;
      }
      if (!this.validateSinglePhoto(file)) {
        return;
      }
      newPhotos.push(file);
    });
    this.state.photos = newPhotos.slice(0, MAX_PHOTOS);
    this.renderPhotoGrid();
    this.validatePhotos();
    this.elements.photosInput.value = "";
  }

  renderPhotoGrid() {
    this.clearPhotoGrid();
    this.state.photos.forEach((file, index) => {
      const figure = createElement("figure", { className: "ns-photo" });
      const img = createElement("img", {
        className: "ns-photo-img",
        attrs: {
          src: URL.createObjectURL(file),
          alt: `${file.name} (${Math.round(file.size / 1024)} Ko)`,
        },
      });
      img.dataset.objectUrl = img.src;
      const controls = createElement("div", { className: "ns-photo-actions" });
      const replaceButton = createElement("button", {
        className: "ns-link-button",
        attrs: { type: "button" },
        text: "Remplacer",
      });
      const removeButton = createElement("button", {
        className: "ns-link-button",
        attrs: { type: "button" },
        text: "Supprimer",
      });
      replaceButton.addEventListener("click", () => this.replacePhoto(index));
      removeButton.addEventListener("click", () => this.removePhoto(index));
      controls.appendChild(replaceButton);
      controls.appendChild(removeButton);
      figure.appendChild(img);
      figure.appendChild(controls);
      this.elements.photoGrid.appendChild(figure);
    });
  }

  clearPhotoGrid() {
    Array.from(
      this.elements.photoGrid.querySelectorAll("img[data-object-url]"),
    ).forEach((img) => {
      if (img.dataset.objectUrl) {
        URL.revokeObjectURL(img.dataset.objectUrl);
      }
    });
    this.elements.photoGrid.innerHTML = "";
  }

  replacePhoto(index) {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".jpg,.jpeg,.png,.heic,.heif";
    input.addEventListener("change", () => {
      const file = input.files && input.files[0];
      if (!file) {
        return;
      }
      if (!this.validateSinglePhoto(file)) {
        return;
      }
      this.state.photos[index] = file;
      this.renderPhotoGrid();
      this.validatePhotos();
      this.setDirty();
    });
    input.click();
  }

  removePhoto(index) {
    this.state.photos.splice(index, 1);
    this.renderPhotoGrid();
    this.validatePhotos();
    this.setDirty();
  }

  validateSinglePhoto(file) {
    if (!isAcceptedFileType(file)) {
      this.elements.photosError.textContent =
        "Format de fichier non pris en charge.";
      this.elements.photosError.hidden = false;
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      this.elements.photosError.textContent =
        "Chaque photo doit peser moins de 10 Mo.";
      this.elements.photosError.hidden = false;
      return false;
    }
    return true;
  }

  validatePhotos() {
    if (this.state.photos.length > MAX_PHOTOS) {
      this.elements.photosError.textContent = `Limité à ${MAX_PHOTOS} photos.`;
      this.elements.photosError.hidden = false;
      return false;
    }
    for (const file of this.state.photos) {
      if (!this.validateSinglePhoto(file)) {
        return false;
      }
    }
    this.elements.photosError.hidden = true;
    return true;
  }

  togglePrivacy() {
    this.state.isPublic = !this.state.isPublic;
    this.updatePrivacyUI();
    this.updatePrivacyWarning();
    this.validatePublicConsent();
    this.setDirty();
  }

  updatePrivacyUI() {
    const { isPublic } = this.state;
    this.elements.privacyToggle.setAttribute(
      "aria-checked",
      isPublic ? "true" : "false",
    );
    this.elements.privacyToggle.classList.toggle("is-active", isPublic);
    this.elements.privacyStatus.textContent = isPublic ? "Public" : "Privé";
    this.elements.publicConsentWrapper.hidden = !isPublic;
    this.elements.publicConsent.required = isPublic;
    if (!isPublic) {
      this.elements.publicConsent.checked = false;
      this.state.publicConsent = false;
    }
  }

  updatePrivacyWarning() {
    if (this.state.isPublic && this.state.precision === "exact") {
      this.elements.precisionAlert.hidden = false;
    } else {
      this.elements.precisionAlert.hidden = true;
    }
  }

  handlePublicConsentChange() {
    this.state.publicConsent = this.elements.publicConsent.checked;
    this.validatePublicConsent();
    this.setDirty();
  }

  validatePublicConsent() {
    if (!this.state.isPublic) {
      this.elements.publicError.hidden = true;
      this.elements.publicConsent.removeAttribute("aria-invalid");
      return true;
    }
    if (this.state.publicConsent) {
      this.elements.publicError.hidden = true;
      this.elements.publicConsent.removeAttribute("aria-invalid");
      return true;
    }
    this.elements.publicError.textContent =
      "Veuillez confirmer la mise en public.";
    this.elements.publicError.hidden = false;
    this.elements.publicConsent.setAttribute("aria-invalid", "true");
    return false;
  }

  validateName() {
    const value = this.elements.nameInput.value.trim();
    if (!value) {
      this.elements.nameError.textContent = "Indiquez un nom de coin.";
      this.elements.nameError.hidden = false;
      this.elements.nameInput.setAttribute("aria-invalid", "true");
      this.elements.nameInput.setAttribute(
        "aria-describedby",
        "spot-name-help spot-name-error",
      );
      return false;
    }
    this.elements.nameError.hidden = true;
    this.elements.nameInput.removeAttribute("aria-invalid");
    this.elements.nameInput.setAttribute("aria-describedby", "spot-name-help");
    return true;
  }

  validateLocation() {
    if (!this.state.hasCustomLocation) {
      this.elements.mapError.textContent =
        "Déplacez l’épingle pour valider l’emplacement.";
      this.elements.mapError.hidden = false;
      this.elements.mapField.setAttribute(
        "aria-describedby",
        `${this.baseMapDescription} spot-location-error`,
      );
      this.elements.mapField.setAttribute("aria-invalid", "true");
      return false;
    }
    this.elements.mapError.hidden = true;
    this.elements.mapField.setAttribute(
      "aria-describedby",
      this.baseMapDescription,
    );
    this.elements.mapField.removeAttribute("aria-invalid");
    return true;
  }

  validateSpecies() {
    if (!this.state.species.length) {
      this.elements.speciesError.textContent =
        "Sélectionnez au moins une espèce.";
      this.elements.speciesError.hidden = false;
      this.elements.speciesInput.setAttribute("aria-invalid", "true");
      this.elements.speciesInput.setAttribute(
        "aria-describedby",
        "spot-species-help spot-species-error",
      );
      return false;
    }
    this.elements.speciesError.hidden = true;
    this.elements.speciesInput.removeAttribute("aria-invalid");
    this.elements.speciesInput.setAttribute(
      "aria-describedby",
      "spot-species-help",
    );
    return true;
  }

  handleSubmit(event) {
    event.preventDefault();
    if (this.isSubmitting) {
      return;
    }
    const validName = this.validateName();
    const validLocation = this.validateLocation();
    const validSpecies = this.validateSpecies();
    const validHarvest = this.validateHarvest();
    const validPhotos = this.validatePhotos();
    const validConsent = this.validatePublicConsent();

    const isValid =
      validName &&
      validLocation &&
      validSpecies &&
      validHarvest &&
      validPhotos &&
      validConsent;

    if (!isValid) {
      this.setStatus("Certaines informations doivent être corrigées.");
      this.updateSubmitState();
      return;
    }

    this.isSubmitting = true;
    this.updateSubmitState();

    setTimeout(() => {
      this.setStatus("Coin enregistré (simulation).");
      this.isDirty = false;
      this.isSubmitting = false;
      try {
        window.localStorage.removeItem("mesureconvert-new-spot-draft");
      } catch (error) {
        console.warn("Impossible de nettoyer le brouillon", error);
      }
      this.updateSubmitState();
      this.close();
    }, 800);
  }

  updateSubmitState() {
    const isDisabled =
      this.isSubmitting ||
      !this.state.hasCustomLocation ||
      !this.elements.nameInput.value.trim() ||
      !this.state.species.length ||
      (this.state.isPublic && !this.state.publicConsent);
    this.elements.submitButton.disabled = isDisabled;
    this.elements.submitButton.classList.toggle(
      "is-loading",
      this.isSubmitting,
    );
    if (this.isSubmitting) {
      this.elements.submitButton.setAttribute("aria-busy", "true");
    } else {
      this.elements.submitButton.removeAttribute("aria-busy");
    }
  }

  handleKeydown(event) {
    if (event.key === "Escape") {
      event.stopPropagation();
      if (!this.confirmDialog.hidden) {
        this.closeConfirm();
      } else {
        this.requestClose();
      }
      return;
    }
    if (event.key === "Tab") {
      this.trapFocus(event);
    }
  }

  trapFocus(event) {
    const root = this.confirmDialog.hidden ? this.modal : this.confirmDialog;
    const focusable = getFocusableElements(root).filter(
      (element) => element.offsetParent !== null,
    );
    if (!focusable.length) {
      event.preventDefault();
      return;
    }
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  openConfirm() {
    this.confirmDialog.hidden = false;
    this.modal.setAttribute("aria-hidden", "true");
    this.focusTrapRoot = this.confirmDialog;
    const buttons = getFocusableElements(this.confirmDialog);
    if (buttons.length) {
      buttons[0].focus();
    }
  }

  closeConfirm() {
    this.confirmDialog.hidden = true;
    this.modal.removeAttribute("aria-hidden");
    this.focusTrapRoot = this.modal;
    this.elements.nameInput.focus();
  }

  saveDraftAndClose() {
    const payload = {
      name: this.elements.nameInput.value.trim(),
      coords: this.state.coords,
      precision: this.state.precision,
      species: this.state.species,
      lastHarvest: this.state.lastHarvest,
      rating: this.state.rating,
      isPublic: this.state.isPublic,
      consent: this.state.publicConsent,
      hasCustomLocation: this.state.hasCustomLocation,
    };
    try {
      window.localStorage.setItem(
        "mesureconvert-new-spot-draft",
        JSON.stringify(payload),
      );
      this.setStatus("Brouillon enregistré localement.");
    } catch (error) {
      console.warn("Impossible d'enregistrer le brouillon", error);
      this.setStatus("Impossible d’enregistrer le brouillon.");
    }
    this.forceClose();
  }

  setDirty() {
    if (!this.isDirty) {
      this.isDirty = true;
    }
    this.updateSubmitState();
  }
}

export function initNewSpotModal() {
  const trigger = document.getElementById("open-new-spot");
  const container = document.getElementById("new-spot-modal-root");
  if (!trigger || !container) {
    return;
  }
  new NewSpotModal(trigger, container);
}
