const { convertTemperature, convertValue } = require('../script');

test('convertit les températures de Celsius vers Fahrenheit', () => {
    expect(convertTemperature(0, 'c', 'f')).toBe(32);
});

test('convertit des longueurs de mètres vers centimètres', () => {
    expect(convertValue('length', 2, 'm', 'cm')).toBe(200);
});
