const PRECISION_CONFIG = {
  exact: { decimals: 5, label: "précision exacte" },
  approx_100m: { decimals: 3, label: "≈100 m" },
  approx_500m: { decimals: 2, label: "≈500 m" },
  approx_1km: { decimals: 1, label: "≈1 km" },
};

function formatCoordinate(value, decimals) {
  return Number.parseFloat(value).toFixed(decimals);
}

function getPrecisionLabel(precision) {
  return PRECISION_CONFIG[precision]?.label || "précision estimée";
}

function getPrecisionDecimals(precision) {
  return PRECISION_CONFIG[precision]?.decimals ?? 3;
}

export function createSpotInfoSection(spot, formatNumber) {
  const section = document.createElement("section");
  section.className = "spot-section spot-section--info";
  section.setAttribute("aria-labelledby", "spot-info");

  const heading = document.createElement("h2");
  heading.id = "spot-info";
  heading.textContent = "Infos du coin";
  section.appendChild(heading);

  const summary = document.createElement("div");
  summary.className = "spot-info__summary";

  const location = document.createElement("p");
  location.className = "spot-info__location";
  location.textContent = `${spot.city} – ${spot.address}`;
  summary.appendChild(location);

  const decimals = getPrecisionDecimals(spot.precision);
  const coordsText = `${formatCoordinate(spot.coordinates.lat, decimals)}°, ${formatCoordinate(
    spot.coordinates.lng,
    decimals,
  )}°`;

  const coords = document.createElement("p");
  coords.className = "spot-info__coords";
  coords.textContent = `Coordonnées ${getPrecisionLabel(spot.precision)} : ${coordsText}`;
  summary.appendChild(coords);

  section.appendChild(summary);

  const metaList = document.createElement("dl");
  metaList.className = "spot-info__meta";

  const createdWrapper = document.createElement("div");
  const createdTitle = document.createElement("dt");
  createdTitle.textContent = "Créé le";
  const createdValue = document.createElement("dd");
  createdValue.textContent = new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(spot.createdAt));
  createdWrapper.append(createdTitle, createdValue);

  const pickingsWrapper = document.createElement("div");
  const pickingsTitle = document.createElement("dt");
  pickingsTitle.textContent = "Nombre de cueillettes";
  const pickingsValue = document.createElement("dd");
  pickingsValue.textContent = formatNumber(spot.pickingsCount);
  pickingsWrapper.append(pickingsTitle, pickingsValue);

  metaList.append(createdWrapper, pickingsWrapper);
  section.appendChild(metaList);

  return section;
}
