(function() {
  function convert(value, factor, offset = 0) {
    return value * factor + offset;
  }

  function setup() {
    var script = document.currentScript;
    if (!script) {
      return;
    }
    var fromUnit = script.dataset.fromUnit || '';
    var toUnit = script.dataset.toUnit || '';
    var factor = parseFloat(script.dataset.factor || '1');

    var form = document.getElementById('form-convert');
    var input = document.getElementById('valeur');
    if (!form || !input) {
      return;
    }

    var result = document.getElementById('resultat-conversion');
    if (!result) {
      result = document.createElement('div');
      result.id = 'resultat-conversion';
      form.insertAdjacentElement('afterend', result);
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var value = parseFloat(input.value);
      if (isNaN(value)) {
        result.textContent = 'Valeur invalide';
        return;
      }
      var res = convert(value, factor);
      result.textContent = value + ' ' + fromUnit + ' = ' + res + ' ' + toUnit;
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setup);
    } else {
      setup();
    }
  }

  if (typeof module !== 'undefined') {
    module.exports = { convert: convert };
  } else {
    window.converterPage = { convert: convert };
  }
})();
