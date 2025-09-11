export function populateUnits(cat, categories) {
    return categories[cat].units;
}

export function convert(value, from, to, cat, categories) {
    if (cat === 'temperature') {
        return convertTemperature(value, from, to);
    }
    const base = value * categories[cat].units[from].factor;
    return base / categories[cat].units[to].factor;
}

export function convertTemperature(value, from, to) {
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
