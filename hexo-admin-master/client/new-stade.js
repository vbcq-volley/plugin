const api = require('./api');

class NewStade {
  constructor() {
    this.state = {
      stadeName: '',
      address: ''
    };
  }

  handleSubmit(e) {
    e.preventDefault();
    api.addEntry('stade', {
      stadeName: this.state.stadeName,
      address: this.state.address
    }).then(() => {
      window.location.hash = '#/stades';
    });
  }

  handleChange(field, e) {
    this.state[field] = e.target.value;
    this.render();
  }

  render() {
    const container = document.createElement('div');
    container.className = 'new-stade-page';

    const title = document.createElement('h2');
    title.textContent = 'Créer un nouveau stade';
    container.appendChild(title);

    const form = document.createElement('form');
    form.className = 'new-stade-form';
    form.addEventListener('submit', this.handleSubmit.bind(this));

    const stadeNameGroup = document.createElement('div');
    stadeNameGroup.className = 'form-group';

    const stadeNameLabel = document.createElement('label');
    stadeNameLabel.textContent = 'Nom du stade';
    stadeNameGroup.appendChild(stadeNameLabel);

    const stadeNameInput = document.createElement('input');
    stadeNameInput.type = 'text';
    stadeNameInput.value = this.state.stadeName;
    stadeNameInput.className = 'form-control';
    stadeNameInput.required = true;
    stadeNameInput.addEventListener('change', this.handleChange.bind(this, 'stadeName'));
    stadeNameGroup.appendChild(stadeNameInput);

    form.appendChild(stadeNameGroup);

    const addressGroup = document.createElement('div');
    addressGroup.className = 'form-group';

    const addressLabel = document.createElement('label');
    addressLabel.textContent = 'Adresse';
    addressGroup.appendChild(addressLabel);

    const addressInput = document.createElement('input');
    addressInput.type = 'text';
    addressInput.value = this.state.address;
    addressInput.className = 'form-control';
    addressInput.required = true;
    addressInput.addEventListener('change', this.handleChange.bind(this, 'address'));
    addressGroup.appendChild(addressInput);

    form.appendChild(addressGroup);

    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn btn-primary';
    submitButton.innerHTML = '<i class="fa fa-save"></i> Enregistrer';
    form.appendChild(submitButton);

    container.appendChild(form);
    return container;
  }
}

module.exports = NewStade; 