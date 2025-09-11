import { categories } from './modules/categories.js';
import { convert, populateUnits } from './modules/converter.js';

const categorySelect = document.getElementById('category');
const fromValue = document.getElementById('from-value');
const fromUnit = document.getElementById('from-unit');
const toUnit = document.getElementById('to-unit');
const resultSpan = document.getElementById('result');
const precisionInput = document.getElementById('precision');
const precisionBadge = document.getElementById('precision-badge');
const convertBtn = document.getElementById('convert-btn');

function updatePrecisionBadge() {
    const p = parseInt(precisionInput.value, 10) || 0;
    precisionBadge.textContent = `Précision: ${p} décimales`;
}

function populateSelects(cat) {
    const units = populateUnits(cat, categories);
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';
    for (const key in units) {
        const optionFrom = document.createElement('option');
        optionFrom.value = key;
        optionFrom.textContent = units[key].name;
        fromUnit.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = key;
        optionTo.textContent = units[key].name;
        toUnit.appendChild(optionTo);
    }
    fromUnit.selectedIndex = 0;
    toUnit.selectedIndex = Math.min(1, toUnit.options.length - 1);
}

function handleConvert() {
    const cat = categorySelect.value;
    const value = parseFloat(fromValue.value);
    const from = fromUnit.value;
    const to = toUnit.value;
    const precision = parseInt(precisionInput.value, 10) || 0;

    if (isNaN(value)) {
        resultSpan.textContent = '—';
        return;
    }

    const result = convert(value, from, to, cat, categories);

    if (typeof result === 'undefined' || isNaN(result)) {
        resultSpan.textContent = 'Conversion impossible';
    } else {
        resultSpan.textContent = result.toFixed(precision);
    }
}

categorySelect.addEventListener('change', () => {
    populateSelects(categorySelect.value);
    handleConvert();
});

fromValue.addEventListener('input', handleConvert);
fromUnit.addEventListener('change', handleConvert);
toUnit.addEventListener('change', handleConvert);
precisionInput.addEventListener('input', () => {
    updatePrecisionBadge();
    handleConvert();
});
convertBtn.addEventListener('click', handleConvert);

populateSelects(categorySelect.value);
updatePrecisionBadge();
handleConvert();
