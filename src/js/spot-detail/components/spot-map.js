const MAP_DELTA = 0.02;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatCoordinate(value) {
  return clamp(value, -180, 180).toFixed(6);
}

function buildMapUrl({ lat, lng }) {
  const latClamped = clamp(lat, -90, 90);
  const lngClamped = clamp(lng, -180, 180);
  const delta = MAP_DELTA;

  const left = formatCoordinate(lngClamped - delta);
  const right = formatCoordinate(lngClamped + delta);
  const bottom = formatCoordinate(latClamped - delta);
  const top = formatCoordinate(latClamped + delta);

  const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`;
  const markerLat = formatCoordinate(latClamped);
  const markerLng = formatCoordinate(lngClamped);
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${markerLat}%2C${markerLng}`;
}

const PRECISION_LABELS = {
  exact: "coordonnées exactes",
  approx_100m: "≈100 m",
  approx_500m: "≈500 m",
  approx_1km: "≈1 km",
};

function getPrecisionText(precision, city) {
  const label = PRECISION_LABELS[precision] || "zone indiquée";
  return `${city} (${label})`;
}

export function createSpotMapSection(spot) {
  const section = document.createElement("section");
  section.className = "spot-section spot-section--map";
  section.setAttribute("aria-labelledby", "spot-map");

  const heading = document.createElement("h2");
  heading.id = "spot-map";
  heading.textContent = "Carte";

  const description = document.createElement("p");
  description.textContent = `Carte centrée sur ${getPrecisionText(spot.precision, spot.city)}.`;

  const frameWrapper = document.createElement("div");
  frameWrapper.className = "spot-map__frame";

  const iframe = document.createElement("iframe");
  iframe.loading = "lazy";
  iframe.title = `Carte de ${spot.name}`;
  iframe.src = buildMapUrl(spot.coordinates);
  frameWrapper.appendChild(iframe);

  const actions = document.createElement("div");
  actions.className = "spot-map__actions";

  const enlargeButton = document.createElement("button");
  enlargeButton.type = "button";
  enlargeButton.className = "spot-button spot-button--primary";
  enlargeButton.textContent = "Agrandir";
  enlargeButton.addEventListener("click", () => {
    openModal();
  });

  actions.appendChild(enlargeButton);

  section.append(heading, description, frameWrapper, actions);

  const modal = document.createElement("dialog");
  modal.className = "spot-modal";
  const modalContent = document.createElement("div");
  modalContent.className = "spot-modal__content";
  modalContent.innerHTML = `
    <div class="spot-modal__header">
      <h2>Carte agrandie</h2>
      <button type="button" class="spot-button spot-button--secondary" aria-label="Fermer la carte">Fermer</button>
    </div>
    <iframe title="Carte agrandie" style="width:100%;height:480px;border:0" loading="lazy"></iframe>
  `;

  const closeButton = modalContent.querySelector("button");
  const modalIframe = modalContent.querySelector("iframe");
  modalIframe.src = iframe.src;

  const closeModal = () => {
    modal.close();
  };

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeModal();
  });
  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  modal.addEventListener("close", () => {
    enlargeButton.focus();
  });

  modal.appendChild(modalContent);
  document.body.appendChild(modal);

  const openModal = () => {
    modalIframe.src = iframe.src;
    modal.showModal();
    closeButton.focus();
  };

  return section;
}

export function buildMapPageUrl({ lat, lng, zoom = 14 }) {
  const params = new URLSearchParams({
    lat: clamp(lat, -90, 90).toFixed(4),
    lng: clamp(lng, -180, 180).toFixed(4),
    zoom: String(zoom),
  });
  return `map.html?${params.toString()}`;
}
