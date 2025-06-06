var api = require('./api');

class RenameFile {
  constructor(options) {
    this.options = options;
    this.state = {
      value: options.defaultValue || '',
      error: null
    };
  }

  async updateValue(value) {
    try {
      await api.renameFile(this.options.name, value);
      this.state.value = value;
      this.state.error = null;
      this.render();
    } catch (error) {
      console.error('Error renaming file:', error);
      this.state.error = error.message;
      this.render();
    }
  }

  render() {
    const container = document.createElement('div');
    container.className = 'rename-file';

    const label = document.createElement('label');
    label.textContent = this.options.label;

    const input = document.createElement('input');
    input.type = 'text';
    input.value = this.state.value;
    input.addEventListener('change', (e) => this.updateValue(e.target.value));

    if (this.state.error) {
      const error = document.createElement('div');
      error.className = 'error';
      error.textContent = this.state.error;
      container.appendChild(error);
    }

    container.appendChild(label);
    container.appendChild(input);

    return container;
  }
}

module.exports = RenameFile;

      var previewLink = path.join(rootPath, result.path)

      this.setState({filename: editingName, editing: false},
                    this.props.handlePreviewLink(previewLink))
    })
  },

  handleKeyPress: function(e) {
    if (e.key === 'Enter') {
      return this.handleRenameFile()
    }
    // esccape key
    if (e.keyCode === 27) {
      return this.toggleEditing()
    }
  },

  render: function() {
    return (
      <div className='fileRename'>
        {!this.state.editing &&
          <div className='fileRename_display'
            title='Click to rename'
            onClick={this.toggleEditing}>
            {this.state.filename}
          </div>}
        {this.state.editing && <span>
          <input type='text'
            onChange={this.handleEditChange}
            onKeyDown={this.handleKeyPress}
            defaultValue={this.state.editingName} />
          <span className='fileRename_buttons'>
            <i title='Cancel'
              className='fa fa-times'
              onClick={this.toggleEditing} />
            <i title='Rename File'
              className='fa fa-check'
              onClick={this.handleRenameFile} />
          </span></span>}
      </div>
    )
  }
})

module.exports = RenameFile
