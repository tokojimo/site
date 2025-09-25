import { initNewSpotModal } from "./new-spot-modal.js";

const DEFAULT_LOCATION = { lat: 48.8566, lng: 2.3522 };
const MAP_DELTA = 0.02;
const WEB_MERCATOR_MAX_LATITUDE = 85.0511;
const WEB_MERCATOR_MAX_LONGITUDE = 180;
const LONGITUDE_EPSILON = 1e-9;

const WEB_MERCATOR_MIN_LATITUDE = -WEB_MERCATOR_MAX_LATITUDE;
const WEB_MERCATOR_MIN_LONGITUDE = -WEB_MERCATOR_MAX_LONGITUDE;

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function validateCoordinates(coords) {
  if (!coords || typeof coords !== "object") {
    return null;
  }

  const { lat, lng } = coords;

  if (!isFiniteNumber(lat) || !isFiniteNumber(lng)) {
    return null;
  }

  if (
    lat < WEB_MERCATOR_MIN_LATITUDE ||
    lat > WEB_MERCATOR_MAX_LATITUDE ||
    lng < WEB_MERCATOR_MIN_LONGITUDE ||
    lng > WEB_MERCATOR_MAX_LONGITUDE
  ) {
    return null;
  }

  return {
    lat: clampLatitude(lat),
    lng: clampLongitude(lng),
  };
}

function clampLatitude(value) {
  return clamp(value, WEB_MERCATOR_MIN_LATITUDE, WEB_MERCATOR_MAX_LATITUDE);
}

function clampLongitude(value) {
  const safeMax = WEB_MERCATOR_MAX_LONGITUDE - LONGITUDE_EPSILON;
  const safeMin = WEB_MERCATOR_MIN_LONGITUDE + LONGITUDE_EPSILON;
  return clamp(value, safeMin, safeMax);
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatLatitude(value) {
  return clampLatitude(value).toFixed(6);
}

function formatLongitude(value) {
  return clampLongitude(value).toFixed(6);
}

function buildMapUrl({ lat, lng }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new TypeError(
      "Les coordonnées fournies à la carte doivent être des nombres finis.",
    );
  }
  const latClamped = clampLatitude(lat);
  const lngClamped = clampLongitude(lng);
  const delta = MAP_DELTA;

  const left = formatLongitude(lngClamped - delta);
  const right = formatLongitude(lngClamped + delta);
  const bottom = formatLatitude(latClamped - delta);
  const top = formatLatitude(latClamped + delta);

  const bbox = `${left}%2C${bottom}%2C${right}%2C${top}`;
  const markerLat = formatLatitude(latClamped);
  const markerLng = formatLongitude(lngClamped);
  const marker = `${markerLat}%2C${markerLng}`;

  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${marker}`;
}

function updateMap(frame, container, coords, options = {}) {
  const { fallback, warnOnFallback = true } = options;

  let validatedCoords = validateCoordinates(coords);

  if (!validatedCoords && fallback) {
    const fallbackCoords = validateCoordinates(fallback);
    if (fallbackCoords) {
      if (warnOnFallback) {
        console.warn(
          "Coordonnées invalides reçues pour la carte. Utilisation du centre par défaut.",
          coords,
        );
      }
      validatedCoords = fallbackCoords;
    }
  }

  if (!validatedCoords) {
    console.error("Coordonnées invalides reçues pour la carte.", coords);
    return null;
  }

  frame.src = buildMapUrl(validatedCoords);
  const latText = validatedCoords.lat.toFixed(4);
  const lngText = validatedCoords.lng.toFixed(4);
  container.setAttribute(
    "aria-label",
    `Carte centrée sur les coordonnées ${latText}°, ${lngText}°`,
  );

  return validatedCoords;
}

export function initializeMapPage() {
  initNewSpotModal();
  const frame = document.getElementById("map-frame");
  const button = document.getElementById("geolocate-button");
  const status = document.getElementById("map-status");
  const errorElement = document.getElementById("map-error");
  const container = document.getElementById("map-container");

  if (!frame || !button || !status || !errorElement || !container) {
    return;
  }

  const clearError = () => {
    errorElement.hidden = true;
    errorElement.textContent = "";
  };

  const setError = (message) => {
    errorElement.textContent = message;
    errorElement.hidden = false;
    status.textContent = "";
  };

  const setStatus = (message) => {
    status.textContent = message;
  };

  const finalize = () => {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  };

  const finishWithError = (message) => {
    setError(message);
    finalize();
  };

  const handleFailure = (error) => {
    let message = "Impossible de récupérer votre position pour le moment.";

    if (error) {
      if (error.name === "NotAllowedError" || error.code === 1) {
        message =
          "La géolocalisation a été refusée. Autorisez-la dans votre navigateur.";
      } else if (error.name === "SecurityError") {
        message =
          "La géolocalisation nécessite une connexion sécurisée (https).";
      } else if (error.code === 2) {
        message =
          "La position n'est pas disponible. Vérifiez votre connexion ou vos services de localisation.";
      } else if (error.code === 3) {
        message =
          "La requête de géolocalisation a expiré. Réessayez dans un instant.";
      } else if (
        typeof error.message === "string" &&
        error.message.length > 0
      ) {
        message = error.message;
      }
    }

    finishWithError(message);
  };

  updateMap(frame, container, DEFAULT_LOCATION);
  setStatus("Carte centrée sur Paris par défaut.");

  const requestLocation = async () => {
    clearError();
    button.disabled = true;
    button.setAttribute("aria-busy", "true");

    if (!window.isSecureContext) {
      finishWithError(
        "La géolocalisation nécessite une connexion sécurisée (https).",
      );
      return;
    }

    if (!("geolocation" in navigator)) {
      finishWithError(
        "Votre navigateur ne prend pas en charge la géolocalisation.",
      );
      return;
    }

    const permissions = navigator.permissions;
    if (permissions && typeof permissions.query === "function") {
      try {
        const permissionStatus = await permissions.query({
          name: "geolocation",
        });
        if (permissionStatus.state === "denied") {
          finishWithError(
            "La géolocalisation est désactivée pour ce site. Modifiez les réglages de votre navigateur pour l'activer.",
          );
          return;
        }
      } catch (permissionError) {
        console.warn(
          "Impossible de vérifier l'état de la permission de géolocalisation",
          permissionError,
        );
      }
    }

    setStatus("Recherche de votre position…");

    const onSuccess = (position) => {
      if (
        !position ||
        typeof position !== "object" ||
        !position.coords ||
        typeof position.coords !== "object"
      ) {
        handleFailure(
          new Error(
            "Le navigateur a fourni une réponse inattendue. Impossible de déterminer vos coordonnées.",
          ),
        );
        return;
      }

      const { latitude, longitude } = position.coords;
      if (!isFiniteNumber(latitude) || !isFiniteNumber(longitude)) {
        console.warn(
          "Le navigateur a fourni des coordonnées non finies pour la carte.",
          position.coords,
        );
        handleFailure(
          new Error(
            "Le navigateur a fourni des coordonnées invalides. Impossible de mettre à jour la carte.",
          ),
        );
        return;
      }

      if (
        latitude < WEB_MERCATOR_MIN_LATITUDE ||
        latitude > WEB_MERCATOR_MAX_LATITUDE ||
        longitude < WEB_MERCATOR_MIN_LONGITUDE ||
        longitude > WEB_MERCATOR_MAX_LONGITUDE
      ) {
        console.warn(
          "Les coordonnées de géolocalisation sont hors limites pour l'affichage de la carte.",
          position.coords,
        );
        handleFailure(
          new Error(
            "Les coordonnées fournies sont hors de portée pour l'affichage de la carte.",
          ),
        );
        return;
      }

      const rawCoords = { lat: latitude, lng: longitude };
      const mapCoordinates = updateMap(frame, container, rawCoords, {
        fallback: DEFAULT_LOCATION,
      });

      if (!mapCoordinates) {
        handleFailure(
          new Error(
            "Impossible de mettre à jour la carte avec les coordonnées fournies par le navigateur.",
          ),
        );
        return;
      }

      setStatus(
        `Carte centrée sur votre position (${mapCoordinates.lat.toFixed(4)}°, ${mapCoordinates.lng.toFixed(4)}°).`,
      );
      finalize();
    };

    const onError = (error) => {
      handleFailure(error);
    };

    try {
      navigator.geolocation.getCurrentPosition(onSuccess, onError, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      });
    } catch (error) {
      handleFailure(error);
    }
  };

  button.addEventListener("click", () => {
    requestLocation().catch((error) => {
      handleFailure(error);
    });
  });
}
