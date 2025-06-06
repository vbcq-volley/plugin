class Modal {
  constructor(content) {
    this.content = content;
    this.element = null;
  }

  createBackdrop() {
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop in';
    return backdrop;
  }

  createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal in';
    modal.tabIndex = '-1';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-hidden', 'false');
    modal.style.display = 'block';

    const dialog = document.createElement('div');
    dialog.className = 'modal-dialog';

    const content = document.createElement('div');
    content.className = 'modal-content';

    if (this.content instanceof HTMLElement) {
      content.appendChild(this.content);
    } else if (typeof this.content === 'string') {
      content.textContent = this.content;
    }

    dialog.appendChild(content);
    modal.appendChild(dialog);
    return modal;
  }

  render() {
    if (this.element) {
      return this.element;
    }

    const container = document.createElement('div');
    container.appendChild(this.createBackdrop());
    container.appendChild(this.createModal());
    
    this.element = container;
    return this.element;
  }
}

module.exports = Modal;
