import '../css/style.css';
import { convertTemperature } from './temperature.js';

let categories = {};

const categorySelect = document.getElementById('category');
const fromValue = document.getElementById('from-value');
const fromUnit = document.getElementById('from-unit');
const toUnit = document.getElementById('to-unit');
const resultSpan = document.getElementById('result');
const precisionInput = document.getElementById('precision');
const precisionBadge = document.getElementById('precision-badge');
const form = document.getElementById('converter');
const errorMsg = document.getElementById('error');

function updatePrecisionBadge() {
  const p = parseInt(precisionInput.value, 10) || 0;
  precisionBadge.textContent = `Précision: ${p} décimales`;
}

function populateCategoryOptions() {
  categorySelect.innerHTML = '';
  Object.entries(categories).forEach(([key, cat]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = cat.name;
    categorySelect.appendChild(opt);
  });
}

function populateUnits(cat) {
  const units = categories[cat].units;
  fromUnit.innerHTML = '';
  toUnit.innerHTML = '';
  Object.entries(units).forEach(([key, u]) => {
    const optionFrom = document.createElement('option');
    optionFrom.value = key;
    optionFrom.textContent = u.name;
    fromUnit.appendChild(optionFrom);
    const optionTo = document.createElement('option');
    optionTo.value = key;
    optionTo.textContent = u.name;
    toUnit.appendChild(optionTo);
  });
  fromUnit.selectedIndex = 0;
  toUnit.selectedIndex = Math.min(1, toUnit.options.length - 1);
}

function convert() {
  const cat = categorySelect.value;
  const value = parseFloat(fromValue.value);
  const from = fromUnit.value;
  const to = toUnit.value;
  const precision = parseInt(precisionInput.value, 10) || 0;

  if (isNaN(value)) {
    resultSpan.textContent = '—';
    errorMsg.hidden = false;
    fromValue.setAttribute('aria-invalid', 'true');
    return;
  }
  errorMsg.hidden = true;
  fromValue.removeAttribute('aria-invalid');

  let result;
  if (cat === 'temperature') {
    result = convertTemperature(value, from, to);
  } else {
    const base = value * categories[cat].units[from].factor;
    result = base / categories[cat].units[to].factor;
  }

  if (typeof result === 'undefined' || isNaN(result)) {
    resultSpan.textContent = 'Conversion impossible';
  } else {
    resultSpan.textContent = result.toFixed(precision);
  }
}

categorySelect.addEventListener('change', () => {
  populateUnits(categorySelect.value);
  convert();
});
fromValue.addEventListener('input', convert);
fromUnit.addEventListener('change', convert);
toUnit.addEventListener('change', convert);
precisionInput.addEventListener('input', () => {
  updatePrecisionBadge();
  convert();
});
form.addEventListener('submit', (e) => {
  e.preventDefault();
  convert();
});

async function init() {
  const res = await fetch('/data/units.json');
  categories = await res.json();
  populateCategoryOptions();
  populateUnits(categorySelect.value);
  updatePrecisionBadge();
  convert();
}

init();
