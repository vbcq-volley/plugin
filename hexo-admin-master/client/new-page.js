const api = require('./api');

class NewPage {
  constructor() {
    this.state = {
      showing: false,
      loading: true,
      text: 'Untitled'
    };
    this.onNew = null;
  }

  _onKeydown(e) {
    if (e.key === 'Enter') {
      this._onSubmit(e);
    }
  }

  _onShow() {
    this.state.showing = true;
    this.render();
  }

  _onBlur() {
    if (this.state.showing) {
      this._onCancel();
    }
  }

  _onSubmit(e) {
    e.preventDefault();
    this.state.loading = true;
    this.state.showing = false;
    this.render();
    
    api.newPage(this.state.text).then((page) => {
      this.state.showing = false;
      this.state.text = 'Untitled';
      if (this.onNew) {
        this.onNew(page);
      }
    }, (err) => {
      console.error('Failed! to make page', err);
    });
  }

  _onCancel() {
    this.state.showing = false;
    this.render();
  }

  _onChange(e) {
    this.state.text = e.target.value;
    this.render();
  }

  render() {
    const container = document.createElement('div');
    container.className = 'new-post';

    if (!this.state.showing) {
      const button = document.createElement('div');
      button.className = 'new-post_button';
      button.innerHTML = '<i class="fa fa-plus"></i> New page';
      button.addEventListener('click', this._onShow.bind(this));
      container.appendChild(button);
      return container;
    }

    const input = document.createElement('input');
    input.className = 'new-post_input';
    input.value = this.state.text;
    input.addEventListener('blur', this._onBlur.bind(this));
    input.addEventListener('keypress', this._onKeydown.bind(this));
    input.addEventListener('change', this._onChange.bind(this));
    container.appendChild(input);

    const okButton = document.createElement('i');
    okButton.className = 'fa fa-check-circle new-post_ok';
    okButton.addEventListener('mousedown', this._onSubmit.bind(this));
    container.appendChild(okButton);

    const cancelButton = document.createElement('i');
    cancelButton.className = 'fa fa-times-circle new-post_cancel';
    cancelButton.addEventListener('mousedown', this._onCancel.bind(this));
    container.appendChild(cancelButton);

    return container;
  }
}

module.exports = NewPage;
