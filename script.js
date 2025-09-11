const categories = {
    length: {
        units: {
            m: { factor: 1 },
            cm: { factor: 0.01 },
            mm: { factor: 0.001 },
            km: { factor: 1000 },
            in: { factor: 0.0254 },
            ft: { factor: 0.3048 },
            mi: { factor: 1609.34 }
        }
    },
    weight: {
        units: {
            kg: { factor: 1 },
            g: { factor: 0.001 },
            t: { factor: 1000 },
            lb: { factor: 0.45359237 },
            oz: { factor: 0.028349523125 }
        }
    },
    area: {
        units: {
            m2: { factor: 1 },
            cm2: { factor: 0.0001 },
            ha: { factor: 10000 },
            acre: { factor: 4046.8564224 }
        }
    },
    volume: {
        units: {
            L: { factor: 1 },
            m3: { factor: 1000 },
            gal: { factor: 3.785411784 }
        }
    },
    time: {
        units: {
            s: { factor: 1 },
            min: { factor: 60 },
            h: { factor: 3600 }
        }
    },
    frequency: {
        units: {
            Hz: { factor: 1 },
            rpm: { factor: 1 / 60 },
            rad_s: { factor: 1 / (2 * Math.PI) }
        }
    },
    speed: {
        units: {
            m_s: { factor: 1 },
            km_h: { factor: 1000 / 3600 },
            mph: { factor: 1609.344 / 3600 }
        }
    },
    acceleration: {
        units: {
            m_s2: { factor: 1 },
            g: { factor: 9.80665 }
        }
    },
    force: {
        units: {
            N: { factor: 1 },
            lbf: { factor: 4.4482216152605 },
            kgf: { factor: 9.80665 }
        }
    },
    pressure: {
        units: {
            Pa: { factor: 1 },
            bar: { factor: 100000 },
            atm: { factor: 101325 },
            psi: { factor: 6894.757293168 }
        }
    },
    energy: {
        units: {
            J: { factor: 1 },
            kJ: { factor: 1000 },
            MJ: { factor: 1000000 },
            Wh: { factor: 3600 },
            kWh: { factor: 3600000 },
            cal: { factor: 4.184 },
            BTU: { factor: 1055.056 }
        }
    },
    power: {
        units: {
            W: { factor: 1 },
            kW: { factor: 1000 },
            hp: { factor: 745.699872 }
        }
    },
    density: {
        units: {
            kg_m3: { factor: 1 },
            g_cm3: { factor: 1000 }
        }
    },
    flow: {
        units: {
            m3_s: { factor: 1 },
            L_min: { factor: 1 / 60000 },
            L_s: { factor: 0.001 },
            m3_h: { factor: 1 / 3600 }
        }
    },
    torque: {
        units: {
            Nm: { factor: 1 },
            lbf_ft: { factor: 1.3558179483314004 }
        }
    },
    angle: {
        units: {
            rad: { factor: 1 },
            deg: { factor: Math.PI / 180 }
        }
    },
    data: {
        units: {
            byte: { factor: 1 },
            bit: { factor: 1 / 8 },
            kB: { factor: 1000 },
            MB: { factor: 1000000 },
            GB: { factor: 1000000000 },
            KiB: { factor: 1024 },
            MiB: { factor: Math.pow(1024, 2) },
            GiB: { factor: Math.pow(1024, 3) }
        }
    },
    temperature: {
        units: {
            c: {},
            f: {},
            k: {}
        }
    }
};

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
    precisionBadge.textContent = t('messages.precisionBadge', { decimals: p });
}

function populateUnits(cat) {
    const units = categories[cat].units;
    fromUnit.innerHTML = '';
    toUnit.innerHTML = '';
    for (const key in units) {
        const optionFrom = document.createElement('option');
        optionFrom.value = key;
        optionFrom.textContent = t(`units.${cat}.${key}`);
        fromUnit.appendChild(optionFrom);

        const optionTo = document.createElement('option');
        optionTo.value = key;
        optionTo.textContent = t(`units.${cat}.${key}`);
        toUnit.appendChild(optionTo);
    }
    // reset selections to avoid keeping units from previous categories
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
        resultSpan.textContent = t('messages.conversionImpossible');
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

initI18n().then(() => {
    populateUnits(categorySelect.value);
    updatePrecisionBadge();
    convert();
});
