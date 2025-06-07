var api = require('./api')

class SettingsCheckbox {
  constructor(options) {
    this.options = options;
    this.checked = false;
    this.element = null;
    this.init();
  }

  init() {
    this.element = document.createElement('p');
    if (this.options.style) {
      Object.assign(this.element.style, this.options.style);
    }
    this.render();
    this.loadSettings();
  }

  loadSettings() {
    api.settings().then(settings => {
      let checked;
      if (!settings.options) {
        checked = false;
      } else {
        checked = !!settings.options[this.options.name];
      }
      this.checked = checked;
      this.render();
    });
  }

  handleChange(e) {
    const addedOptions = e.target.checked ? this.options.enableOptions : this.options.disableOptions;
    const value = e.target.checked;
    api.setSetting(this.options.name, value, addedOptions).then(result => {
      console.log(result.updated);
      this.checked = result.settings.options[this.options.name];
      this.render();
    });
  }

  render() {
    // Nettoyer le contenu existant
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }

    // Créer le label
    const label = document.createElement('label');

    // Créer la checkbox
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = this.checked;
    input.addEventListener('change', this.handleChange.bind(this));
    if (this.options.onClick) {
      input.addEventListener('click', this.options.onClick);
    }
    label.appendChild(input);

    // Ajouter l'espace et le texte du label
    label.appendChild(document.createTextNode(' ' + this.options.label));

    this.element.appendChild(label);
  }
}

module.exports = SettingsCheckbox;
