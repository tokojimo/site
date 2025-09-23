function createActionButton(label, variant = "secondary") {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `spot-button spot-button--${variant}`;
  button.textContent = label;
  return button;
}

export function createActivityHeader({
  spot,
  onBack,
  onEdit,
  onDelete,
  onAddPicking,
  onAddPhoto,
  mapUrl,
  showToast,
}) {
  const header = document.createElement("header");
  header.className = "spot-detail__header";

  const main = document.createElement("div");
  main.className = "spot-detail__header-main";

  const backButton = document.createElement("button");
  backButton.type = "button";
  backButton.className = "spot-detail__back-button";
  backButton.setAttribute("aria-label", "Retour vers la carte");
  backButton.innerHTML = `
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
      <path d="M15 5l-7 7 7 7" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" />
    </svg>
    <span>Retour</span>
  `;

  backButton.addEventListener("click", () => {
    if (typeof onBack === "function") {
      onBack();
      return;
    }
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = "map.html";
    }
  });

  const titles = document.createElement("div");
  titles.className = "spot-detail__header-titles";

  const title = document.createElement("h1");
  title.textContent = spot.name;
  titles.appendChild(title);

  if (spot.subtitle || spot.city) {
    const subtitle = document.createElement("p");
    subtitle.className = "spot-detail__subtitle";
    if (spot.subtitle && spot.city) {
      subtitle.textContent = `${spot.city} · ${spot.subtitle}`;
    } else {
      subtitle.textContent = spot.subtitle || spot.city;
    }
    titles.appendChild(subtitle);
  }

  main.append(backButton, titles);

  const actionsWrapper = document.createElement("div");
  actionsWrapper.className = "spot-detail__actions";

  const desktopActions = document.createElement("div");
  desktopActions.className = "spot-detail__actions-desktop";

  const editButton = createActionButton("Éditer");
  editButton.addEventListener("click", () => {
    if (typeof onEdit === "function") {
      onEdit();
    } else if (showToast) {
      showToast(
        "La modification du coin n'est pas disponible dans cette démo.",
      );
    }
  });

  const deleteButton = createActionButton("Supprimer");
  deleteButton.addEventListener("click", () => {
    if (typeof onDelete === "function") {
      onDelete();
    } else if (showToast) {
      showToast("Suppression désactivée sur cet aperçu.");
    }
  });

  const addPickingButton = createActionButton(
    "Ajouter une cueillette",
    "primary",
  );
  addPickingButton.addEventListener("click", (event) => {
    if (typeof onAddPicking === "function") {
      onAddPicking(event.currentTarget);
    }
  });

  const addPhotoButton = createActionButton("Ajouter une photo");
  addPhotoButton.addEventListener("click", (event) => {
    if (typeof onAddPhoto === "function") {
      onAddPhoto(event.currentTarget);
    }
  });

  const mapLink = document.createElement("a");
  mapLink.className = "spot-button spot-button--secondary";
  mapLink.href = mapUrl;
  mapLink.textContent = "Ouvrir sur la carte";
  mapLink.setAttribute("aria-label", "Ouvrir ce coin sur la carte");

  desktopActions.append(
    editButton,
    deleteButton,
    addPickingButton,
    addPhotoButton,
    mapLink,
  );

  const mobileActions = document.createElement("div");
  mobileActions.className = "spot-detail__actions-mobile";

  const actionsToggle = document.createElement("button");
  actionsToggle.type = "button";
  actionsToggle.className = "spot-button spot-button--secondary";
  actionsToggle.textContent = "Actions";
  actionsToggle.setAttribute("aria-haspopup", "true");
  actionsToggle.setAttribute("aria-expanded", "false");

  const menu = document.createElement("div");
  menu.className = "spot-actions-menu";
  menu.setAttribute("role", "menu");
  menu.hidden = true;

  const menuItems = [
    { label: "Éditer", handler: () => editButton.click() },
    { label: "Supprimer", handler: () => deleteButton.click() },
    {
      label: "Ajouter une cueillette",
      handler: () => addPickingButton.click(),
    },
    { label: "Ajouter une photo", handler: () => addPhotoButton.click() },
  ];

  menuItems.forEach(({ label, handler }) => {
    const item = document.createElement("button");
    item.type = "button";
    item.textContent = label;
    item.setAttribute("role", "menuitem");
    item.addEventListener("click", () => {
      handler();
      closeMenu();
    });
    menu.appendChild(item);
  });

  const menuLink = document.createElement("a");
  menuLink.href = mapUrl;
  menuLink.textContent = "Ouvrir sur la carte";
  menuLink.setAttribute("role", "menuitem");
  menuLink.addEventListener("click", () => {
    closeMenu();
  });
  menu.appendChild(menuLink);

  const closeMenu = () => {
    menu.hidden = true;
    actionsToggle.setAttribute("aria-expanded", "false");
  };

  const openMenu = () => {
    menu.hidden = false;
    actionsToggle.setAttribute("aria-expanded", "true");
    const firstItem = menu.querySelector('[role="menuitem"]');
    if (firstItem) {
      firstItem.focus();
    }
  };

  actionsToggle.addEventListener("click", () => {
    if (menu.hidden) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  actionsToggle.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" && menu.hidden) {
      event.preventDefault();
      openMenu();
    }
  });

  document.addEventListener("click", (event) => {
    if (
      !menu.hidden &&
      !menu.contains(event.target) &&
      event.target !== actionsToggle
    ) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !menu.hidden) {
      closeMenu();
      actionsToggle.focus();
    }
  });

  mobileActions.append(actionsToggle, menu);

  actionsWrapper.append(desktopActions, mobileActions);
  header.append(main, actionsWrapper);
  return {
    element: header,
    focusAddPhoto: () => addPhotoButton.focus(),
    triggerAddPhoto: () => addPhotoButton.click(),
    triggerAddPicking: () => addPickingButton.click(),
  };
}
