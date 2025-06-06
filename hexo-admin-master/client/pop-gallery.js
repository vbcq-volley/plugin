// 2018/02/04
var Dropzone = require('./Dropzone');
var api = require('./api');

class PopGallery {
  constructor(options) {
    this.options = options;
    this.state = {
      files: []
    };
    this.element = null;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  async componentDidMount() {
    console.log('get gallery....');
    try {
      const result = await api.gallery();
      this.setState({ files: result });
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  }

  onDrop(files) {
    const origFiles = [...this.state.files];
    
    // Afficher d'abord les aperçus locaux
    files.forEach(file => {
      origFiles.splice(0, 0, { preview: file.preview });
    });
    this.setState({ files: origFiles });

    // Envoi des fichiers
    api.uploadMultiFiles(files)
      .then(() => {
        // Attendre que les fichiers soient écrits sur le disque
        setTimeout(() => {
          api.gallery().then(result => {
            this.setState({ files: result });
          });
        }, 800);
      })
      .catch(error => {
        console.error(error);
      });
  }

  _onChange(name, evt) {
    if (evt) {
      evt.preventDefault();
    }
    this.options.onChange(name);
  }

  createImageGrid() {
    if (this.state.files.length === 0) return null;

    const imgGrid = document.createElement('div');
    imgGrid.className = 'img-grid';

    this.state.files.forEach(file => {
      const imgContainer = document.createElement('div');
      imgContainer.className = 'img-ctnr';
      imgContainer.addEventListener('click', this._onChange.bind(this, file.name));

      if (file.preview) {
        const sendingDiv = document.createElement('div');
        sendingDiv.className = 'sending';
        const sendingSpan = document.createElement('span');
        sendingSpan.textContent = 'sending...';
        sendingDiv.appendChild(sendingSpan);
        imgContainer.appendChild(sendingDiv);
      }

      const img = document.createElement('img');
      img.className = 'img-cell';
      img.src = file.preview || '/images/' + file.name;
      imgContainer.appendChild(img);

      imgGrid.appendChild(imgContainer);
    });

    return imgGrid;
  }

  render() {
    if (this.element) {
      // Mise à jour des éléments existants
      const grid = this.element.querySelector('.grid');
      if (grid) {
        grid.innerHTML = '';
        
        const dropzone = new Dropzone({
          onDrop: this.onDrop.bind(this),
          className: 'dropzone',
          accept: 'image/jpeg, image/png'
        });
        grid.appendChild(dropzone.render());

        const dropzoneText = document.createElement('div');
        dropzoneText.className = 'drop-zone-txt';
        dropzoneText.textContent = 'Try dropping some files here, or click to select files to upload.';
        dropzone.element.appendChild(dropzoneText);

        const imgGrid = this.createImageGrid();
        if (imgGrid) {
          grid.appendChild(imgGrid);
        }
      }
      return this.element;
    }

    const container = document.createElement('div');
    container.className = 'gallery';

    const arrowUp = document.createElement('div');
    arrowUp.className = 'arrow-up';
    container.appendChild(arrowUp);

    const header = document.createElement('div');
    header.className = 'header';
    header.textContent = 'Image Selector';
    container.appendChild(header);

    const grid = document.createElement('div');
    grid.className = 'grid';

    const dropzone = new Dropzone({
      onDrop: this.onDrop.bind(this),
      className: 'dropzone',
      accept: 'image/jpeg, image/png'
    });
    grid.appendChild(dropzone.render());

    const dropzoneText = document.createElement('div');
    dropzoneText.className = 'drop-zone-txt';
    dropzoneText.textContent = 'Try dropping some files here, or click to select files to upload.';
    dropzone.element.appendChild(dropzoneText);

    const imgGrid = this.createImageGrid();
    if (imgGrid) {
      grid.appendChild(imgGrid);
    }

    container.appendChild(grid);
    this.element = container;

    // Charger la galerie au montage
    this.componentDidMount();

    return this.element;
  }
}

module.exports = PopGallery;
