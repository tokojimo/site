import { createRatingDisplay } from "./rating.js";

const ITEMS_PER_PAGE = 5;

const WEATHER_ICONS = {
  sunny:
    '<circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.5" fill="none"></circle><path d="M12 3v2.5M12 18.5V21M4.22 4.22l1.77 1.77M18.01 17.99l1.77 1.77M3 12h2.5M18.5 12H21M4.22 19.78l1.77-1.77M18.01 6.01l1.77-1.77" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round"></path>',
  "partly-cloudy":
    '<path d="M7 14a4 4 0 01.62-2.16 3 3 0 015.88.66" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path><path d="M16 10a4 4 0 013.464 6H9a3 3 0 010-6 4.5 4.5 0 017-3.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>',
  cloudy:
    '<path d="M8.5 15H17a3.5 3.5 0 100-7 4.5 4.5 0 10-8.74 2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path><path d="M7 12.5a3 3 0 000 6h8.5" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path>',
  rainy:
    '<path d="M8.5 15H17a3.5 3.5 0 100-7 4.5 4.5 0 10-8.74 2" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"></path><path d="M9 17l-.75 2M12 17l-.75 2M15 17l-.75 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>',
  windy:
    '<path d="M4 12h9a2 2 0 100-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path><path d="M4 16h6a2 2 0 110 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>',
  foggy:
    '<path d="M5 9h14M5 12h10M5 15h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path>',
};

function formatDate(date) {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

function createSpeciesBadge(species, formatNumber) {
  const badge = document.createElement("span");
  badge.className = "spot-badge";
  const quantity = species.weightKg
    ? `${formatNumber(species.weightKg)} kg`
    : `${formatNumber(species.quantity)} ${species.unit}`;
  badge.textContent = `${species.name} · ${quantity}`;
  return badge;
}

function renderWeather(weather) {
  if (!weather) {
    const fallback = document.createElement("p");
    fallback.className = "spot-weather";
    fallback.textContent = "Météo non renseignée";
    return fallback;
  }

  const wrapper = document.createElement("p");
  wrapper.className = "spot-weather";
  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("aria-hidden", "true");
  icon.setAttribute("focusable", "false");
  icon.innerHTML = WEATHER_ICONS[weather.icon] || WEATHER_ICONS.cloudy;
  wrapper.append(icon, document.createTextNode(weather.label));
  return wrapper;
}

function createHistoryItem(picking, formatNumber, showToast) {
  const item = document.createElement("li");
  item.className = "spot-history__item";

  const meta = document.createElement("div");
  meta.className = "spot-history__meta";

  const title = document.createElement("h3");
  title.textContent = formatDate(picking.date);
  meta.appendChild(title);

  const speciesList = document.createElement("div");
  speciesList.className = "spot-badge-list";
  picking.species.forEach((species) => {
    speciesList.appendChild(createSpeciesBadge(species, formatNumber));
  });
  meta.appendChild(speciesList);

  const weight = document.createElement("p");
  weight.textContent = `Poids total : ${formatNumber(picking.totalWeightKg)} kg`;
  meta.appendChild(weight);

  const actions = document.createElement("div");
  actions.className = "spot-history__actions";
  actions.appendChild(createRatingDisplay(picking.rating, { size: "compact" }));

  const button = document.createElement("button");
  button.type = "button";
  button.className = "spot-button spot-button--secondary";
  button.textContent = "Consulter";
  button.addEventListener("click", () => {
    if (showToast) {
      showToast(
        "La fiche détaillée de la cueillette sera disponible prochainement.",
      );
    }
  });
  actions.appendChild(button);

  item.append(meta, actions);
  return item;
}

export function createPickingsSections({
  lastPicking,
  pickings,
  formatNumber,
  onAddPicking,
  showToast,
}) {
  const lastSection = document.createElement("section");
  lastSection.className = "spot-section spot-section--last";
  lastSection.setAttribute("aria-labelledby", "spot-last-picking");

  const lastHeading = document.createElement("h2");
  lastHeading.id = "spot-last-picking";
  lastHeading.textContent = "Dernière cueillette";

  const header = document.createElement("div");
  header.className = "spot-last-picking__header";

  const meta = document.createElement("div");
  meta.className = "spot-last-picking__meta";

  if (lastPicking) {
    const date = document.createElement("p");
    date.className = "spot-last-picking__date";
    date.textContent = formatDate(lastPicking.date);
    header.append(date);
    header.appendChild(createRatingDisplay(lastPicking.rating));

    const speciesList = document.createElement("div");
    speciesList.className = "spot-badge-list";
    lastPicking.species.forEach((species) => {
      speciesList.appendChild(createSpeciesBadge(species, formatNumber));
    });

    const weight = document.createElement("p");
    weight.textContent = `Total récolté : ${formatNumber(lastPicking.totalWeightKg)} kg`;

    const weather = renderWeather(lastPicking.weather);

    const notes = document.createElement("p");
    notes.textContent = lastPicking.notes || "Notes non renseignées.";

    meta.append(speciesList, weight, weather, notes);
  } else {
    const empty = document.createElement("div");
    empty.className = "spot-empty-state";
    const message = document.createElement("p");
    message.textContent = "Aucune cueillette enregistrée pour le moment.";
    empty.appendChild(message);
    meta.appendChild(empty);
    const info = document.createElement("p");
    info.className = "spot-last-picking__date";
    info.textContent = "Aucune cueillette enregistrée.";
    header.appendChild(info);
  }

  const actions = document.createElement("div");
  actions.className = "spot-last-picking__actions";

  const viewAll = document.createElement("button");
  viewAll.type = "button";
  viewAll.className = "spot-button spot-button--secondary";
  viewAll.textContent = "Voir toutes les cueillettes";

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "spot-button spot-button--secondary";
  addButton.textContent = "Ajouter une cueillette";
  addButton.addEventListener("click", (event) => {
    if (typeof onAddPicking === "function") {
      onAddPicking(event.currentTarget);
    }
  });

  actions.append(viewAll, addButton);

  lastSection.append(lastHeading, header, meta, actions);

  const historySection = document.createElement("section");
  historySection.className = "spot-section spot-section--history";
  historySection.tabIndex = -1;
  historySection.setAttribute("aria-labelledby", "spot-history");

  const historyHeading = document.createElement("h2");
  historyHeading.id = "spot-history";
  historyHeading.textContent = "Historique des cueillettes";

  const filtersContainer = document.createElement("div");
  filtersContainer.className = "spot-history__filters spot-filters";

  const details = document.createElement("details");
  details.open = true;

  const summary = document.createElement("summary");
  summary.textContent = "Filtres";

  const content = document.createElement("div");
  content.className = "spot-filters__content";

  const inputsRow = document.createElement("div");
  inputsRow.className = "spot-filters__inputs";

  const today = new Date();
  const todayValue = today.toISOString().split("T")[0];

  const fromGroup = document.createElement("label");
  fromGroup.textContent = "Du";
  const fromInput = document.createElement("input");
  fromInput.type = "date";
  fromInput.className = "spot-input";
  fromInput.max = todayValue;
  fromGroup.appendChild(fromInput);

  const toGroup = document.createElement("label");
  toGroup.textContent = "Au";
  const toInput = document.createElement("input");
  toInput.type = "date";
  toInput.className = "spot-input";
  toInput.max = todayValue;
  toGroup.appendChild(toInput);

  const speciesGroup = document.createElement("label");
  speciesGroup.textContent = "Espèce";
  const speciesSelect = document.createElement("select");
  speciesSelect.className = "spot-select";
  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Toutes les espèces";
  speciesSelect.appendChild(defaultOption);

  const speciesSet = new Set();
  pickings.forEach((picking) => {
    picking.species.forEach((species) => {
      speciesSet.add(species.name);
    });
  });

  Array.from(speciesSet)
    .sort((a, b) => a.localeCompare(b, "fr"))
    .forEach((name) => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      speciesSelect.appendChild(option);
    });

  speciesGroup.appendChild(speciesSelect);

  inputsRow.append(fromGroup, toGroup, speciesGroup);
  content.appendChild(inputsRow);

  const errorMessage = document.createElement("p");
  errorMessage.className = "spot-filters__error";
  errorMessage.hidden = true;
  content.appendChild(errorMessage);

  details.append(summary, content);
  filtersContainer.appendChild(details);

  const list = document.createElement("ul");
  list.className = "spot-history__list";

  const pagination = document.createElement("nav");
  pagination.className = "spot-pagination";
  pagination.setAttribute("aria-label", "Pagination des cueillettes");

  historySection.append(historyHeading, filtersContainer, list, pagination);

  const state = {
    from: "",
    to: "",
    species: "",
    page: 1,
  };

  const applyFilters = () => {
    let filtered = [...pickings];
    if (state.from) {
      filtered = filtered.filter(
        (item) => new Date(item.date) >= new Date(state.from),
      );
    }
    if (state.to) {
      filtered = filtered.filter(
        (item) => new Date(item.date) <= new Date(state.to),
      );
    }
    if (state.species) {
      filtered = filtered.filter((item) =>
        item.species.some((species) => species.name === state.species),
      );
    }
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const renderPagination = (totalPages) => {
    pagination.innerHTML = "";
    if (totalPages <= 1) {
      return;
    }

    const addButton = (label, page, disabled = false, ariaLabel) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "spot-pagination__button";
      btn.textContent = label;
      if (ariaLabel) {
        btn.setAttribute("aria-label", ariaLabel);
      }
      if (disabled) {
        btn.disabled = true;
      } else {
        btn.addEventListener("click", () => {
          state.page = page;
          render();
        });
      }
      if (page === state.page && !disabled && label !== "‹" && label !== "›") {
        btn.setAttribute("aria-current", "page");
      }
      pagination.appendChild(btn);
    };

    addButton(
      "‹",
      Math.max(1, state.page - 1),
      state.page === 1,
      "Page précédente",
    );

    for (let page = 1; page <= totalPages; page += 1) {
      addButton(String(page), page);
    }

    addButton(
      "›",
      Math.min(totalPages, state.page + 1),
      state.page === totalPages,
      "Page suivante",
    );
  };

  const renderList = (items) => {
    list.innerHTML = "";
    if (items.length === 0) {
      const empty = document.createElement("li");
      empty.className = "spot-history__item spot-history__item--empty";
      empty.textContent = "Aucune cueillette ne correspond à ces filtres.";
      list.appendChild(empty);
      pagination.innerHTML = "";
      return;
    }

    const start = (state.page - 1) * ITEMS_PER_PAGE;
    const paginated = items.slice(start, start + ITEMS_PER_PAGE);
    paginated.forEach((item) => {
      list.appendChild(createHistoryItem(item, formatNumber, showToast));
    });

    renderPagination(Math.ceil(items.length / ITEMS_PER_PAGE));
  };

  const render = () => {
    const filtered = applyFilters();
    const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
    if (state.page > totalPages) {
      state.page = totalPages;
    }
    renderList(filtered);
  };

  const validateDates = () => {
    errorMessage.hidden = true;
    errorMessage.textContent = "";
    if (state.from && state.to && new Date(state.from) > new Date(state.to)) {
      errorMessage.hidden = false;
      errorMessage.textContent =
        "La date de début doit être antérieure à la date de fin.";
      return false;
    }
    return true;
  };

  const updateState = (key, value) => {
    state[key] = value;
    state.page = 1;
    if (validateDates()) {
      render();
    }
  };

  fromInput.addEventListener("change", (event) => {
    updateState("from", event.target.value || "");
  });

  toInput.addEventListener("change", (event) => {
    updateState("to", event.target.value || "");
  });

  speciesSelect.addEventListener("change", (event) => {
    updateState("species", event.target.value || "");
  });

  viewAll.addEventListener("click", () => {
    historySection.scrollIntoView({ behavior: "smooth" });
    historySection.focus();
  });

  render();

  return { lastSection, historySection };
}
