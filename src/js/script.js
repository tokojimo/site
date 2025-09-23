import "../css/style.css";
import { convertTemperature } from "./temperature.js";

function initializeConverter() {
  const categorySelect = document.getElementById("category");
  const fromValue = document.getElementById("from-value");
  const fromUnit = document.getElementById("from-unit");
  const toUnit = document.getElementById("to-unit");
  const resultSpan = document.getElementById("result");
  const precisionInput = document.getElementById("precision");
  const precisionBadge = document.getElementById("precision-badge");
  const form = document.getElementById("converter");
  const errorMsg = document.getElementById("error");

  const elements = [
    categorySelect,
    fromValue,
    fromUnit,
    toUnit,
    resultSpan,
    precisionInput,
    precisionBadge,
    form,
    errorMsg,
  ];

  if (elements.some((element) => element === null)) {
    return;
  }

  let categories = {};

  function updatePrecisionBadge() {
    const precision = parseInt(precisionInput.value, 10) || 0;
    precisionBadge.textContent = `Précision: ${precision} décimales`;
  }

  function populateCategoryOptions() {
    categorySelect.innerHTML = "";
    Object.entries(categories).forEach(([key, category]) => {
      const option = document.createElement("option");
      option.value = key;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  function populateUnits(category) {
    const units = categories[category].units;
    fromUnit.innerHTML = "";
    toUnit.innerHTML = "";

    Object.entries(units).forEach(([key, unit]) => {
      const optionFrom = document.createElement("option");
      optionFrom.value = key;
      optionFrom.textContent = unit.name;
      fromUnit.appendChild(optionFrom);

      const optionTo = document.createElement("option");
      optionTo.value = key;
      optionTo.textContent = unit.name;
      toUnit.appendChild(optionTo);
    });

    fromUnit.selectedIndex = 0;
    toUnit.selectedIndex = Math.min(1, toUnit.options.length - 1);
  }

  function convert() {
    const category = categorySelect.value;
    const value = parseFloat(fromValue.value);
    const from = fromUnit.value;
    const to = toUnit.value;
    const precision = parseInt(precisionInput.value, 10) || 0;

    if (isNaN(value)) {
      resultSpan.textContent = "—";
      errorMsg.hidden = false;
      fromValue.setAttribute("aria-invalid", "true");
      return;
    }

    errorMsg.hidden = true;
    fromValue.removeAttribute("aria-invalid");

    let result;

    if (category === "temperature") {
      result = convertTemperature(value, from, to);
    } else {
      const base = value * categories[category].units[from].factor;
      result = base / categories[category].units[to].factor;
    }

    if (typeof result === "undefined" || isNaN(result)) {
      resultSpan.textContent = "Conversion impossible";
    } else {
      resultSpan.textContent = result.toFixed(precision);
    }
  }

  categorySelect.addEventListener("change", () => {
    populateUnits(categorySelect.value);
    convert();
  });

  fromValue.addEventListener("input", convert);
  fromUnit.addEventListener("change", convert);
  toUnit.addEventListener("change", convert);

  precisionInput.addEventListener("input", () => {
    updatePrecisionBadge();
    convert();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    convert();
  });

  async function init() {
    const response = await fetch("/data/units.json");
    categories = await response.json();
    populateCategoryOptions();
    populateUnits(categorySelect.value);
    updatePrecisionBadge();
    convert();
  }

  init();
}

initializeConverter();
