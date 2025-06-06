var api = require('./api');
var path = require('path');

class RenameFile {
  constructor(options) {
    this.options = options;
    this.state = {
      filename: options.defaultValue || '',
      editing: false,
      editingName: '',
      error: null
    };
    this.element = null;
  }

  setState(newState, callback) {
    this.state = { ...this.state, ...newState };
    this.render();
    if (callback) callback();
  }

  toggleEditing() {
    this.setState({
      editing: !this.state.editing,
      editingName: this.state.filename
    });
  }

  handleEditChange(e) {
    this.setState({ editingName: e.target.value });
  }

  async handleRenameFile() {
    try {
      const result = await api.renameFile(this.options.name, this.state.editingName);
      const rootPath = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/');
      const previewLink = path.join(rootPath, result.path);
      
      this.setState(
        { filename: this.state.editingName, editing: false },
        () => this.options.handlePreviewLink(previewLink)
      );
    } catch (error) {
      console.error('Error renaming file:', error);
      this.setState({ error: error.message });
    }
  }

  handleKeyPress(e) {
    if (e.key === 'Enter') {
      return this.handleRenameFile();
    }
    // escape key
    if (e.keyCode === 27) {
      return this.toggleEditing();
    }
  }

  render() {
    if (this.element) {
      // Mise à jour des éléments existants
      const display = this.element.querySelector('.fileRename_display');
      const editingContainer = this.element.querySelector('.fileRename_editing');
      
      if (display) {
        display.textContent = this.state.filename;
        display.style.display = this.state.editing ? 'none' : 'block';
      }
      
      if (editingContainer) {
        editingContainer.style.display = this.state.editing ? 'inline' : 'none';
        const input = editingContainer.querySelector('input');
        if (input) {
          input.value = this.state.editingName;
        }
      }
      
      return this.element;
    }

    const div = document.createElement('div');
    div.className = 'fileRename';

    // Display mode
    const display = document.createElement('div');
    display.className = 'fileRename_display';
    display.title = 'Click to rename';
    display.textContent = this.state.filename;
    display.style.display = this.state.editing ? 'none' : 'block';
    display.addEventListener('click', this.toggleEditing.bind(this));
    div.appendChild(display);

    // Editing mode
    const editingContainer = document.createElement('span');
    editingContainer.className = 'fileRename_editing';
    editingContainer.style.display = this.state.editing ? 'inline' : 'none';

    const input = document.createElement('input');
    input.type = 'text';
    input.value = this.state.editingName;
    input.addEventListener('change', this.handleEditChange.bind(this));
    input.addEventListener('keydown', this.handleKeyPress.bind(this));
    editingContainer.appendChild(input);

    const buttons = document.createElement('span');
    buttons.className = 'fileRename_buttons';

    const cancelButton = document.createElement('i');
    cancelButton.title = 'Cancel';
    cancelButton.className = 'fa fa-times';
    cancelButton.addEventListener('click', this.toggleEditing.bind(this));
    buttons.appendChild(cancelButton);

    const confirmButton = document.createElement('i');
    confirmButton.title = 'Rename File';
    confirmButton.className = 'fa fa-check';
    confirmButton.addEventListener('click', this.handleRenameFile.bind(this));
    buttons.appendChild(confirmButton);

    editingContainer.appendChild(buttons);
    div.appendChild(editingContainer);

    this.element = div;
    return this.element;
  }
}

module.exports = RenameFile;
