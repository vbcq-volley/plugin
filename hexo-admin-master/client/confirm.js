var Modal = require('./modal');

class Confirm {
  constructor(options = {}) {
    this.confirmLabel = options.confirmLabel || 'OK';
    this.abortLabel = options.abortLabel || 'Cancel';
    this.message = options.message || '';
    this.description = options.description || '';
    this.element = null;
    this.promise = null;
  }

  abort() {
    return this.promise.reject();
  }

  confirm() {
    return this.promise.resolve();
  }

  render() {
    if (this.element) {
      return this.element;
    }

    this.promise = new $.Deferred();

    const modal = new Modal();
    const modalElement = modal.render();

    const header = document.createElement('div');
    header.className = 'modal-header';

    const title = document.createElement('h4');
    title.className = 'modal-title';
    title.textContent = this.message;
    header.appendChild(title);

    modalElement.appendChild(header);

    if (this.description) {
      const body = document.createElement('div');
      body.className = 'modal-body';
      body.textContent = this.description;
      modalElement.appendChild(body);
    }

    const footer = document.createElement('div');
    footer.className = 'modal-footer';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'text-right';

    const abortButton = document.createElement('button');
    abortButton.setAttribute('role', 'abort');
    abortButton.type = 'button';
    abortButton.className = 'btn btn-default';
    abortButton.textContent = this.abortLabel;
    abortButton.addEventListener('click', this.abort.bind(this));
    buttonContainer.appendChild(abortButton);

    const space = document.createTextNode(' ');
    buttonContainer.appendChild(space);

    const confirmButton = document.createElement('button');
    confirmButton.setAttribute('role', 'confirm');
    confirmButton.type = 'button';
    confirmButton.className = 'btn btn-primary';
    confirmButton.textContent = this.confirmLabel;
    confirmButton.addEventListener('click', this.confirm.bind(this));
    buttonContainer.appendChild(confirmButton);

    footer.appendChild(buttonContainer);
    modalElement.appendChild(footer);

    this.element = modalElement;
    setTimeout(() => confirmButton.focus(), 0);
    return this.element;
  }
}

module.exports = Confirm;
