const DEFAULT_LOCATION = { lat: 48.8566, lng: 2.3522 };
const MAP_DELTA = 0.02;

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatLatitude(value) {
  return clamp(value, -90, 90).toFixed(6);
}

function formatLongitude(value) {
  return clamp(value, -180, 180).toFixed(6);
}

function buildMapUrl({ lat, lng }) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new TypeError(
      "Les coordonnées fournies à la carte doivent être des nombres finis.",
    );
  }
  const latClamped = clamp(lat, -90, 90);
  const lngClamped = clamp(lng, -180, 180);
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

function updateMap(frame, container, coords) {
  if (!coords || !Number.isFinite(coords.lat) || !Number.isFinite(coords.lng)) {
    console.error("Coordonnées invalides reçues pour la carte.", coords);
    return;
  }
  frame.src = buildMapUrl(coords);
  const latText = clamp(coords.lat, -90, 90).toFixed(4);
  const lngText = clamp(coords.lng, -180, 180).toFixed(4);
  container.setAttribute(
    "aria-label",
    `Carte centrée sur les coordonnées ${latText}°, ${lngText}°`,
  );
}

export function initializeMapPage() {
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

    if (
      "permissions" in navigator &&
      typeof navigator.permissions.query === "function"
    ) {
      try {
        const permissionStatus = await navigator.permissions.query({
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
      const { latitude, longitude } = position.coords;
      if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        handleFailure(
          new Error(
            "Le navigateur a fourni des coordonnées invalides. Impossible de mettre à jour la carte.",
          ),
        );
        return;
      }
      updateMap(frame, container, { lat: latitude, lng: longitude });
      setStatus(
        `Carte centrée sur votre position (${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°).`,
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
