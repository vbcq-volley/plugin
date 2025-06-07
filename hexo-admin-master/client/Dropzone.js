/**
 * v 2.2.4
 * @2018/02/06
 */

var accept = require('attr-accept');

class Dropzone {
  constructor(options) {
    this.options = {
      disableClick: false,
      multiple: true,
      ...options
    };
    this.state = {
      isDragActive: false,
      isDragReject: false
    };
    this.element = null;
    this.fileInput = null;
    this.enterCounter = 0;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  allFilesAccepted(files) {
    return files.every(file => accept(file, this.options.accept));
  }

  onDragEnter(e) {
    e.preventDefault();

    // Compter la dropzone et tous les enfants qui sont entrés
    ++this.enterCounter;

    // Pendant l'événement de glissement, dataTransfer.files est null
    // Mais Chrome implémente un stockage de glissement accessible via dataTransfer.items
    const dataTransferItems = e.dataTransfer && e.dataTransfer.items ? e.dataTransfer.items : [];

    // Convertir la DataTransferList en Array
    const itemsArray = Array.prototype.slice.call(dataTransferItems);
    const allFilesAccepted = this.allFilesAccepted(itemsArray);

    this.setState({
      isDragActive: allFilesAccepted,
      isDragReject: !allFilesAccepted
    });

    if (this.options.onDragEnter) {
      this.options.onDragEnter(e);
    }
  }

  onDragOver(e) {
    e.preventDefault();
  }

  onDragLeave(e) {
    e.preventDefault();

    // Ne désactiver que lorsque la dropzone et tous les enfants ont été quittés
    if (--this.enterCounter > 0) {
      return;
    }

    this.setState({
      isDragActive: false,
      isDragReject: false
    });

    if (this.options.onDragLeave) {
      this.options.onDragLeave(e);
    }
  }

  onDrop(e) {
    e.preventDefault();

    // Réinitialiser le compteur avec le glissement lors d'un dépôt
    this.enterCounter = 0;

    this.setState({
      isDragActive: false,
      isDragReject: false
    });

    const droppedFiles = e.dataTransfer ? e.dataTransfer.files : e.target.files;
    const max = this.options.multiple ? droppedFiles.length : 1;
    const files = [];

    for (let i = 0; i < max; i++) {
      const file = droppedFiles[i];
      file.preview = URL.createObjectURL(file);
      files.push(file);
    }

    if (this.options.onDrop) {
      this.options.onDrop(files, e);
    }

    if (this.allFilesAccepted(files)) {
      if (this.options.onDropAccepted) {
        this.options.onDropAccepted(files, e);
      }
    } else {
      if (this.options.onDropRejected) {
        this.options.onDropRejected(files, e);
      }
    }
  }

  onClick() {
    if (!this.options.disableClick) {
      this.open();
    }
  }

  open() {
    if (this.fileInput) {
      this.fileInput.click();
    }
  }

  render() {
    if (this.element) {
      // Mise à jour des styles et classes
      const className = this.getClassName();
      const style = this.getStyle();
      
      this.element.className = className;
      Object.assign(this.element.style, style);
      
      return this.element;
    }

    const container = document.createElement('div');
    container.className = this.getClassName();
    Object.assign(container.style, this.getStyle());
    
    container.addEventListener('click', this.onClick.bind(this));
    container.addEventListener('dragenter', this.onDragEnter.bind(this));
    container.addEventListener('dragover', this.onDragOver.bind(this));
    container.addEventListener('dragleave', this.onDragLeave.bind(this));
    container.addEventListener('drop', this.onDrop.bind(this));

    // Ajouter le contenu enfant
    if (this.options.children) {
      if (typeof this.options.children === 'string') {
        container.textContent = this.options.children;
      } else if (this.options.children instanceof HTMLElement) {
        container.appendChild(this.options.children);
      }
    }

    // Créer l'input file caché
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.multiple = this.options.multiple;
    fileInput.accept = this.options.accept;
    fileInput.addEventListener('change', this.onDrop.bind(this));
    container.appendChild(fileInput);
    this.fileInput = fileInput;

    this.element = container;
    return container;
  }

  getClassName() {
    let className = this.options.className || '';
    
    if (this.state.isDragActive && this.options.activeClassName) {
      className += ' ' + this.options.activeClassName;
    }
    
    if (this.state.isDragReject && this.options.rejectClassName) {
      className += ' ' + this.options.rejectClassName;
    }
    
    return className;
  }

  getStyle() {
    let style = {};
    
    if (this.options.style) {
      Object.assign(style, this.options.style);
    }
    
    if (this.state.isDragActive && this.options.activeStyle) {
      Object.assign(style, this.options.activeStyle);
    }
    
    if (!this.options.style && !this.options.className) {
      // Style par défaut
      Object.assign(style, {
        width: 390,
        height: 100,
        borderWidth: 2,
        borderColor: '#666',
        borderStyle: 'dashed',
        borderRadius: 5
      });
      
      if (this.state.isDragActive) {
        Object.assign(style, {
          borderStyle: 'solid',
          backgroundColor: '#eee'
        });
      }
    }
    
    return style;
  }
}

module.exports = Dropzone;
