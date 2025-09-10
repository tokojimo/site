const categories = {
    length: {
        units: {
            m: { name: 'Mètre', factor: 1 },
            km: { name: 'Kilomètre', factor: 1000 },
            mi: { name: 'Mile', factor: 1609.34 },
            ft: { name: 'Pied', factor: 0.3048 }
        }
    },
    weight: {
        units: {
            kg: { name: 'Kilogramme', factor: 1 },
            g: { name: 'Gramme', factor: 0.001 },
            lb: { name: 'Livre', factor: 0.453592 }
        }
    },
    temperature: {
        units: {
            c: { name: 'Celsius' },
            f: { name: 'Fahrenheit' },
            k: { name: 'Kelvin' }
        }
    }
};

const categorySelect = document.getElementById('category');
const fromValue = document.getElementById('from-value');
const fromUnit = document.getElementById('from-unit');
const toUnit = document.getElementById('to-unit');
const resultSpan = document.getElementById('result');

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
    toUnit.selectedIndex = 1;
}

function convert() {
    const cat = categorySelect.value;
    const value = parseFloat(fromValue.value);
    const from = fromUnit.value;
    const to = toUnit.value;

    if (isNaN(value)) {
        resultSpan.textContent = '—';
        return;
    }

    let result = 0;

    if (cat === 'temperature') {
        result = convertTemperature(value, from, to);
    } else {
        const base = value * categories[cat].units[from].factor;
        result = base / categories[cat].units[to].factor;
    }

    resultSpan.textContent = result.toFixed(4);
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
    }

    switch (to) {
        case 'c':
            return celsius;
        case 'f':
            return celsius * 9 / 5 + 32;
        case 'k':
            return celsius + 273.15;
    }
}

categorySelect.addEventListener('change', () => {
    populateUnits(categorySelect.value);
    convert();
});

fromValue.addEventListener('input', convert);
fromUnit.addEventListener('change', convert);
toUnit.addEventListener('change', convert);

// Initialize
populateUnits(categorySelect.value);
convert();
