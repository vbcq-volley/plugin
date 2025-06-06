class AutoList {
  constructor(options) {
    this.options = options;
    this.state = {
      selected: null,
      text: ''
    };
    this.element = null;
    this.inputRef = null;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  _onChange(e) {
    this.setState({ text: e.target.value });
  }

  _onEdit(i, e) {
    if (e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      selected: i,
      text: this.options.values[i] || ''
    });
  }

  _onBlur() {
    const values = this.options.values.slice();
    if (this.options.values.indexOf(this.state.text) === -1) {
      if (this.state.selected >= values.length) {
        if (this.state.text) {
          values.push(this.state.text);
        }
      } else {
        values[this.state.selected] = this.state.text;
      }
    }
    this.setState({
      selected: null,
      text: ''
    });
    this.options.onChange(values);
  }

  _onRemove(i) {
    const values = this.options.values.slice();
    if (i >= values.length) return;
    values.splice(i, 1);
    if (this.state.selected !== null && i < this.state.selected) {
      this.setState({ selected: i - 1 });
    }
    this.options.onChange(values);
  }

  _onKeyDown(e) {
    if (e.key === 'Enter') {
      if (!this.state.text) return;
      this.addAfter();
    }
  }

  addAfter() {
    if (this.options.values.indexOf(this.state.text) !== -1) {
      return;
    }
    const values = this.options.values.slice();
    if (this.state.selected === values.length) {
      values.push(this.state.text);
      this.options.onChange(values);
      return this.setState({
        text: '',
        selected: values.length
      });
    }
    values[this.state.selected] = this.state.text;
    values.splice(this.state.selected + 1, 0, '');
    this.options.onChange(values);
    this.setState({
      selected: this.state.selected + 1,
      text: ''
    });
  }

  render() {
    if (this.element) {
      // Mise à jour des éléments existants
      this.element.innerHTML = '';
      const values = this.options.values.concat(['Add new']);
      
      values.forEach((item, i) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'autolist_item';

        if (i === this.state.selected) {
          const input = document.createElement('input');
          input.className = 'autolist_input';
          input.value = this.state.text;
          input.addEventListener('blur', this._onBlur.bind(this));
          input.addEventListener('change', this._onChange.bind(this));
          input.addEventListener('keydown', this._onKeyDown.bind(this));
          this.inputRef = input;
          itemDiv.appendChild(input);
        } else {
          const showDiv = document.createElement('div');
          showDiv.className = `autolist_show ${i === values.length - 1 ? 'autolist_show--new' : ''}`;
          showDiv.textContent = item;
          showDiv.addEventListener('mousedown', this._onEdit.bind(this, i));
          itemDiv.appendChild(showDiv);
        }

        if (i < values.length - 1) {
          const deleteIcon = document.createElement('i');
          deleteIcon.className = 'autolist_del fa fa-times';
          deleteIcon.addEventListener('click', this._onRemove.bind(this, i));
          itemDiv.appendChild(deleteIcon);
        }

        this.element.appendChild(itemDiv);
      });

      // Focus sur l'input si nécessaire
      if (this.state.selected !== null && this.inputRef) {
        setTimeout(() => this.inputRef.focus(), 100);
      }

      return this.element;
    }

    const container = document.createElement('div');
    container.className = 'autolist';
    this.element = container;

    const values = this.options.values.concat(['Add new']);
    values.forEach((item, i) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'autolist_item';

      if (i === this.state.selected) {
        const input = document.createElement('input');
        input.className = 'autolist_input';
        input.value = this.state.text;
        input.addEventListener('blur', this._onBlur.bind(this));
        input.addEventListener('change', this._onChange.bind(this));
        input.addEventListener('keydown', this._onKeyDown.bind(this));
        this.inputRef = input;
        itemDiv.appendChild(input);
      } else {
        const showDiv = document.createElement('div');
        showDiv.className = `autolist_show ${i === values.length - 1 ? 'autolist_show--new' : ''}`;
        showDiv.textContent = item;
        showDiv.addEventListener('mousedown', this._onEdit.bind(this, i));
        itemDiv.appendChild(showDiv);
      }

      if (i < values.length - 1) {
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'autolist_del fa fa-times';
        deleteIcon.addEventListener('click', this._onRemove.bind(this, i));
        itemDiv.appendChild(deleteIcon);
      }

      container.appendChild(itemDiv);
    });

    return container;
  }
}

module.exports = AutoList;
