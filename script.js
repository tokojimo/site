const categories = {
    length: {
        units: {
            m: { name: 'Mètre', factor: 1 },
            cm: { name: 'Centimètre', factor: 0.01 },
            mm: { name: 'Millimètre', factor: 0.001 },
            km: { name: 'Kilomètre', factor: 1000 },
            in: { name: 'Pouce', factor: 0.0254 },
            ft: { name: 'Pied', factor: 0.3048 },
            mi: { name: 'Mile', factor: 1609.34 }
        }
    },
    weight: {
        units: {
            kg: { name: 'Kilogramme', factor: 1 },
            g: { name: 'Gramme', factor: 0.001 },
            t: { name: 'Tonne', factor: 1000 },
            lb: { name: 'Livre', factor: 0.45359237 },
            oz: { name: 'Once', factor: 0.028349523125 }
        }
    },
    area: {
        units: {
            m2: { name: 'Mètre carré', factor: 1 },
            cm2: { name: 'Centimètre carré', factor: 0.0001 },
            ha: { name: 'Hectare', factor: 10000 },
            acre: { name: 'Acre', factor: 4046.8564224 }
        }
    },
    volume: {
        units: {
            L: { name: 'Litre', factor: 1 },
            m3: { name: 'Mètre cube', factor: 1000 },
            gal: { name: 'Gallon (US)', factor: 3.785411784 }
        }
    },
    time: {
        units: {
            s: { name: 'Seconde', factor: 1 },
            min: { name: 'Minute', factor: 60 },
            h: { name: 'Heure', factor: 3600 }
        }
    },
    frequency: {
        units: {
            Hz: { name: 'Hertz', factor: 1 },
            rpm: { name: 'Tours/minute', factor: 1 / 60 },
            rad_s: { name: 'Rad/s', factor: 1 / (2 * Math.PI) }
        }
    },
    speed: {
        units: {
            m_s: { name: 'm/s', factor: 1 },
            km_h: { name: 'km/h', factor: 1000 / 3600 },
            mph: { name: 'mph', factor: 1609.344 / 3600 }
        }
    },
    acceleration: {
        units: {
            m_s2: { name: 'm/s²', factor: 1 },
            g: { name: 'g', factor: 9.80665 }
        }
    },
    force: {
        units: {
            N: { name: 'Newton', factor: 1 },
            lbf: { name: 'Livre-force', factor: 4.4482216152605 },
            kgf: { name: 'Kilogramme-force', factor: 9.80665 }
        }
    },
    pressure: {
        units: {
            Pa: { name: 'Pascal', factor: 1 },
            bar: { name: 'Bar', factor: 100000 },
            atm: { name: 'Atmosphère', factor: 101325 },
            psi: { name: 'Psi', factor: 6894.757293168 }
        }
    },
    energy: {
        units: {
            J: { name: 'Joule', factor: 1 },
            kJ: { name: 'Kilojoule', factor: 1000 },
            MJ: { name: 'Mégajoule', factor: 1000000 },
            Wh: { name: 'Watt-heure', factor: 3600 },
            kWh: { name: 'Kilowatt-heure', factor: 3600000 },
            cal: { name: 'Calorie (th)', factor: 4.184 },
            BTU: { name: 'BTU (IT)', factor: 1055.056 }
        }
    },
    power: {
        units: {
            W: { name: 'Watt', factor: 1 },
            kW: { name: 'Kilowatt', factor: 1000 },
            hp: { name: 'Cheval vapeur', factor: 745.699872 }
        }
    },
    density: {
        units: {
            kg_m3: { name: 'kg/m³', factor: 1 },
            g_cm3: { name: 'g/cm³', factor: 1000 }
        }
    },
    flow: {
        units: {
            m3_s: { name: 'm³/s', factor: 1 },
            L_min: { name: 'L/min', factor: 1 / 60000 },
            L_s: { name: 'L/s', factor: 0.001 },
            m3_h: { name: 'm³/h', factor: 1 / 3600 }
        }
    },
    torque: {
        units: {
            Nm: { name: 'N·m', factor: 1 },
            lbf_ft: { name: 'lbf·ft', factor: 1.3558179483314004 }
        }
    },
    angle: {
        units: {
            rad: { name: 'Radian', factor: 1 },
            deg: { name: 'Degré', factor: Math.PI / 180 }
        }
    },
    data: {
        units: {
            byte: { name: 'Octet', factor: 1 },
            bit: { name: 'Bit', factor: 1 / 8 },
            kB: { name: 'Kilooctet', factor: 1000 },
            MB: { name: 'Mégaoctet', factor: 1000000 },
            GB: { name: 'Gigaoctet', factor: 1000000000 },
            KiB: { name: 'Kibioctet', factor: 1024 },
            MiB: { name: 'Mibioctet', factor: Math.pow(1024, 2) },
            GiB: { name: 'Gibioctet', factor: Math.pow(1024, 3) }
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

function convertValue(cat, value, from, to) {
    if (cat === 'temperature') {
        return convertTemperature(value, from, to);
    }
    const base = value * categories[cat].units[from].factor;
    return base / categories[cat].units[to].factor;
}

if (typeof document !== 'undefined') {
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

        const result = convertValue(cat, value, from, to);

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
    convertBtn.addEventListener('click', convert);

    populateUnits(categorySelect.value);
    updatePrecisionBadge();
    convert();
}

if (typeof module !== 'undefined') {
    module.exports = { categories, convertTemperature, convertValue };
}
