const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
]);
const ACCEPTED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "heic"]);
const MAX_PHOTOS = 8;
const MAX_SIZE = 10 * 1024 * 1024;

function isValidType(file) {
  if (ACCEPTED_TYPES.has(file.type)) {
    return true;
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return ACCEPTED_EXTENSIONS.has(extension);
}

function createPhotoCard(photo, index, { onOpen, onReplace, onDelete }) {
  const card = document.createElement("article");
  card.className = "spot-photo-card";

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "spot-photo-card__open";
  openButton.setAttribute("aria-label", `${photo.alt} – ouvrir`);

  const img = document.createElement("img");
  img.src = photo.src;
  img.alt = photo.alt;
  img.width = photo.width || 400;
  img.height = photo.height || 400;

  openButton.appendChild(img);
  openButton.addEventListener("click", () => onOpen(index, openButton));

  const controls = document.createElement("div");
  controls.className = "spot-photo-card__controls";

  const replaceButton = document.createElement("button");
  replaceButton.type = "button";
  replaceButton.className = "spot-button spot-button--ghost";
  replaceButton.textContent = "Remplacer";
  replaceButton.addEventListener("click", () => onReplace(photo.id));
  replaceButton.setAttribute("aria-label", `Remplacer ${photo.alt}`);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.className = "spot-button spot-button--ghost";
  deleteButton.textContent = "Supprimer";
  deleteButton.setAttribute("aria-label", `Supprimer ${photo.alt}`);
  deleteButton.addEventListener("click", () => onDelete(photo.id));

  controls.append(replaceButton, deleteButton);
  card.append(openButton, controls);
  return card;
}

function createViewer() {
  const dialog = document.createElement("dialog");
  dialog.className = "spot-photo-viewer";
  dialog.innerHTML = `
    <div class="spot-photo-viewer__content">
      <div class="spot-photo-viewer__header">
        <h2 class="spot-photo-viewer__title">Visionneuse</h2>
        <button type="button" class="spot-button spot-button--secondary" aria-label="Fermer la visionneuse">Fermer</button>
      </div>
      <div class="spot-photo-viewer__nav">
        <button type="button" class="spot-button spot-button--secondary" data-viewer-prev aria-label="Photo précédente">‹</button>
        <img class="spot-photo-viewer__image" alt="" />
        <button type="button" class="spot-button spot-button--secondary" data-viewer-next aria-label="Photo suivante">›</button>
      </div>
      <div class="spot-photo-viewer__controls">
        <p class="spot-photo-viewer__caption"></p>
      </div>
    </div>
  `;

  const closeButton = dialog.querySelector(
    'button[aria-label="Fermer la visionneuse"]',
  );
  const prevButton = dialog.querySelector("[data-viewer-prev]");
  const nextButton = dialog.querySelector("[data-viewer-next]");
  const image = dialog.querySelector(".spot-photo-viewer__image");
  const caption = dialog.querySelector(".spot-photo-viewer__caption");
  const title = dialog.querySelector(".spot-photo-viewer__title");

  let items = [];
  let currentIndex = 0;
  let returnFocusTo = null;

  const update = () => {
    const current = items[currentIndex];
    if (!current) {
      return;
    }
    image.src = current.src;
    image.alt = current.alt;
    caption.textContent = current.alt;
    title.textContent = `Photo ${currentIndex + 1} sur ${items.length}`;
    prevButton.disabled = currentIndex === 0;
    nextButton.disabled = currentIndex === items.length - 1;
  };

  const close = () => {
    dialog.close();
  };

  closeButton.addEventListener("click", close);
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });
  dialog.addEventListener("close", () => {
    if (returnFocusTo) {
      returnFocusTo.focus();
    }
  });
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      close();
    }
  });

  const showPrev = () => {
    if (currentIndex > 0) {
      currentIndex -= 1;
      update();
    }
  };

  const showNext = () => {
    if (currentIndex < items.length - 1) {
      currentIndex += 1;
      update();
    }
  };

  prevButton.addEventListener("click", showPrev);
  nextButton.addEventListener("click", showNext);

  dialog.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showPrev();
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      showNext();
    }
  });

  document.body.appendChild(dialog);

  return {
    element: dialog,
    open(newItems, index, trigger) {
      items = newItems;
      currentIndex = index;
      returnFocusTo = trigger;
      update();
      dialog.showModal();
      closeButton.focus();
    },
    refresh(newItems) {
      items = newItems;
      if (currentIndex >= items.length) {
        currentIndex = Math.max(0, items.length - 1);
      }
      if (dialog.open) {
        update();
      }
    },
  };
}

export function createPhotosGallery({ photos, showToast }) {
  let photoState = photos.map((photo, index) => ({
    id: photo.id ?? `photo-${index}`,
    ...photo,
  }));

  const section = document.createElement("section");
  section.className = "spot-section spot-section--photos";
  section.setAttribute("aria-labelledby", "spot-photos");

  const heading = document.createElement("h2");
  heading.id = "spot-photos";
  heading.textContent = "Photos";

  const header = document.createElement("div");
  header.className = "spot-photos__header";

  const uploadWrapper = document.createElement("div");
  uploadWrapper.className = "spot-photos__upload";

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "spot-button spot-button--secondary";
  addButton.textContent = "Ajouter des photos";

  const uploadInput = document.createElement("input");
  uploadInput.type = "file";
  uploadInput.multiple = true;
  uploadInput.accept = ".jpg,.jpeg,.png,.heic";
  uploadInput.style.display = "none";

  const replaceInput = document.createElement("input");
  replaceInput.type = "file";
  replaceInput.accept = ".jpg,.jpeg,.png,.heic";
  replaceInput.style.display = "none";

  const constraints = document.createElement("p");
  constraints.className = "spot-photos__constraints";
  constraints.textContent = "JPG/PNG/HEIC, ≤10 Mo, jusqu’à 8 photos.";

  const errorMessage = document.createElement("p");
  errorMessage.className = "spot-photos__error";
  errorMessage.hidden = true;
  errorMessage.setAttribute("role", "alert");

  const grid = document.createElement("div");
  grid.className = "spot-photos__grid";

  uploadWrapper.append(
    addButton,
    constraints,
    errorMessage,
    uploadInput,
    replaceInput,
  );
  header.append(uploadWrapper);

  section.append(heading, header, grid);

  const viewer = createViewer();

  let pendingReplaceId = null;

  const setError = (message) => {
    if (message) {
      errorMessage.hidden = false;
      errorMessage.textContent = message;
    } else {
      errorMessage.hidden = true;
      errorMessage.textContent = "";
    }
  };

  const refreshViewer = () => {
    viewer.refresh(photoState);
  };

  const render = () => {
    grid.innerHTML = "";
    if (photoState.length === 0) {
      const empty = document.createElement("div");
      empty.className = "spot-empty-state";
      const message = document.createElement("p");
      message.textContent = "Aucune photo pour le moment.";
      empty.appendChild(message);
      grid.appendChild(empty);
      return;
    }

    photoState.forEach((photo, index) => {
      const card = createPhotoCard(photo, index, {
        onOpen: (idx, trigger) => {
          viewer.open(photoState, idx, trigger);
        },
        onReplace: (photoId) => {
          pendingReplaceId = photoId;
          replaceInput.click();
        },
        onDelete: (photoId) => {
          photoState = photoState.filter((item) => item.id !== photoId);
          render();
          refreshViewer();
          if (typeof showToast === "function") {
            showToast("Photo supprimée.");
          }
        },
      });
      grid.appendChild(card);
    });
  };

  const addPhotos = (files) => {
    if (!files.length) {
      return;
    }
    const availableSlots = MAX_PHOTOS - photoState.length;
    if (availableSlots <= 0) {
      setError("Vous avez atteint la limite de 8 photos.");
      return;
    }

    const filesArray = Array.from(files).slice(0, availableSlots);
    const newPhotos = [];
    let error = "";

    filesArray.forEach((file, index) => {
      if (file.size > MAX_SIZE) {
        error = `${file.name} dépasse la taille maximale de 10 Mo.`;
        return;
      }
      if (!isValidType(file)) {
        error = `${file.name} n’est pas dans un format supporté.`;
        return;
      }
      const objectUrl = URL.createObjectURL(file);
      newPhotos.push({
        id: `added-${Date.now()}-${index}`,
        src: objectUrl,
        alt: file.name,
      });
    });

    if (error) {
      setError(error);
    } else {
      setError("");
    }

    if (newPhotos.length) {
      photoState = [...photoState, ...newPhotos];
      render();
      refreshViewer();
      if (typeof showToast === "function") {
        showToast("Photo ajoutée.");
      }
    }
  };

  const replacePhoto = (file) => {
    if (!file || !pendingReplaceId) {
      return;
    }
    if (file.size > MAX_SIZE) {
      setError(`${file.name} dépasse la taille maximale de 10 Mo.`);
      return;
    }
    if (!isValidType(file)) {
      setError(`${file.name} n’est pas dans un format supporté.`);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    photoState = photoState.map((photo) =>
      photo.id === pendingReplaceId
        ? { ...photo, src: objectUrl, alt: file.name }
        : photo,
    );
    pendingReplaceId = null;
    setError("");
    render();
    refreshViewer();
    if (typeof showToast === "function") {
      showToast("Photo remplacée.");
    }
  };

  addButton.addEventListener("click", () => {
    uploadInput.click();
  });

  uploadInput.addEventListener("change", () => {
    addPhotos(uploadInput.files);
    uploadInput.value = "";
  });

  replaceInput.addEventListener("change", () => {
    if (!replaceInput.files.length) {
      pendingReplaceId = null;
      return;
    }
    replacePhoto(replaceInput.files[0]);
    replaceInput.value = "";
  });

  render();

  return {
    element: section,
    triggerAdd() {
      addButton.click();
    },
    focusAdd() {
      addButton.focus();
    },
  };
}
