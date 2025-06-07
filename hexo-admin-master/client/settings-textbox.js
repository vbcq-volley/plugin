var api = require('./api')

class SettingsTextbox {
  constructor(options) {
    this.options = options;
    this.value = options.defaultValue;
    this.element = null;
    this.init();
  }

  init() {
    this.element = document.createElement('p');
    this.render();
    this.loadSettings();
  }

  loadSettings() {
    api.settings().then(settings => {
      let value;
      if (!settings.options) {
        value = this.options.defaultValue;
      } else {
        if (!settings.options[this.options.name]) {
          value = this.options.defaultValue;
        } else {
          value = settings.options[this.options.name];
        }
      }
      this.value = value;
      this.render();
    });
  }

  handleChange(e) {
    const value = e.target.value;
    api.setSetting(this.options.name, value).then(result => {
      console.log(result.updated);
      this.value = result.settings.options[this.options.name];
      this.render();
    });
  }

  render() {
    // Nettoyer le contenu existant
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }

    // Créer le label
    const b = document.createElement('b');
    b.textContent = this.options.label + ':  ';
    this.element.appendChild(b);

    // Créer l'input
    const input = document.createElement('input');
    input.type = 'text';
    input.value = this.value;
    input.addEventListener('change', this.handleChange.bind(this));
    this.element.appendChild(input);
  }
}

module.exports = SettingsTextbox;
