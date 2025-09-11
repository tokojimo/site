let categories = {};

const categorySelect = document.getElementById('category');
const fromValue = document.getElementById('from-value');
const fromUnit = document.getElementById('from-unit');
const toUnit = document.getElementById('to-unit');
const resultSpan = document.getElementById('result');
const precisionInput = document.getElementById('precision');
const precisionBadge = document.getElementById('precision-badge');
const convertBtn = document.getElementById('convert-btn');

if (categorySelect) {
    function updatePrecisionBadge() {
        const p = parseInt(precisionInput.value, 10) || 0;
        precisionBadge.textContent = `Précision: ${p} décimales`;
    }

    function populateCategorySelect() {
        categorySelect.innerHTML = '';
        for (const key in categories) {
            const option = document.createElement('option');
            option.value = key;
            option.textContent = categories[key].name || key;
            categorySelect.appendChild(option);
        }
    }

    function populateUnits(cat) {
        const units = categories[cat].units;
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

    function convert() {
        const cat = categorySelect.value;
        const value = parseFloat(fromValue.value);
        const from = fromUnit.value;
        const to = toUnit.value;
        const precision = parseInt(precisionInput.value, 10) || 0;

        if (isNaN(value)) {
            resultSpan.textContent = '—';
            return;
        }

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

    function convertTemperature(value, from, to) {
        let celsius;
        switch (from) {
            case 'c':
                celsius = value;
                break;
            case 'f':
                celsius = (value - 32) * 5 / 9;
                break;
            case 'k':
                celsius = value - 273.15;
                break;
            default:
                return NaN;
        }

        switch (to) {
            case 'c':
                return celsius;
            case 'f':
                return celsius * 9 / 5 + 32;
            case 'k':
                return celsius + 273.15;
            default:
                return NaN;
        }
    }

    fetch('data/categories.json')
        .then(response => response.json())
        .then(data => {
            categories = data;
            populateCategorySelect();
            populateUnits(categorySelect.value);
            updatePrecisionBadge();
            convert();

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
            convertBtn.addEventListener('click', convert);
        });
}

