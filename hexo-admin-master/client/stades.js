const _ = require('lodash');
const moment = require('moment');
const SinceWhen = require('./since-when');
const Rendered = require('./rendered');
const DataFetcher = require('./data-fetcher');
const NewStade = require('./new-stade');
const api = require('./api');
const Router = require('./router');

class Stades {
  constructor() {
    this.state = {
      selected: 0,
      showNewForm: false,
      stades: [],
      updated: moment()
    };
    this.init();
  }

  async init() {
    try {
      const stades = await api.getEntries("stade");
      this.state.stades = stades;
      this.render();
    } catch (error) {
      console.error('Error loading stades:', error);
    }
  }

  toggleNewForm() {
    this.state.showNewForm = !this.state.showNewForm;
    this.render();
  }

  onNew(stade) {
    this.state.stades.unshift(stade);
    this.render();
    window.location.hash = `#/stade/${stade._id}`;
  }

  onDelete(id, e) {
    if (e) {
      e.preventDefault();
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce stade ?')) {
      api.deleteEntry("stade", id).then(() => {
        this.state.stades = this.state.stades.filter(stade => stade._id !== id);
        this.render();
      });
    }
  }

  goTo(id, e) {
    if (e) {
      e.preventDefault();
    }
    window.location.hash = `#/stade/${id}`;
  }

  render() {
    if (!this.state.stades) {
      const loading = document.createElement('div');
      loading.className = 'stades';
      loading.textContent = 'Loading...';
      return loading;
    }

    const container = document.createElement('div');
    container.className = 'posts';

    // Header
    const header = document.createElement('div');
    header.className = 'posts_header';
    
    const title = document.createElement('h2');
    title.textContent = 'Stades';
    
    const newButton = document.createElement('button');
    newButton.className = 'new-stade-button';
    newButton.innerHTML = `<i class="fa fa-plus" /> ${this.state.showNewForm ? 'Annuler' : 'Nouveau stade'}`;
    newButton.addEventListener('click', this.toggleNewForm.bind(this));
    
    header.appendChild(title);
    header.appendChild(newButton);
    container.appendChild(header);

    // New stade form
    if (this.state.showNewForm) {
      const formContainer = document.createElement('div');
      formContainer.className = 'new-stade-form-container';
      
      const newStade = new NewStade();
      newStade.onNew = this.onNew.bind(this);
      formContainer.appendChild(newStade.render());
      
      container.appendChild(formContainer);
    }

    // Stades list
    const list = document.createElement('ul');
    list.className = 'posts_list';

    this.state.stades.forEach((stade, i) => {
      const li = document.createElement('li');
      li.className = `posts_post ${i === this.state.selected ? 'posts_post--selected' : ''}`;
      
      const title = document.createElement('span');
      title.className = 'posts_post-title';
      title.textContent = stade.stadeName;
      
      const editLink = document.createElement('a');
      editLink.href = `#/stade/${stade._id}`;
      editLink.innerHTML = '<i class="fa fa-pencil-square-o"></i>';
      
      const deleteLink = document.createElement('a');
      deleteLink.className = 'posts_delete-link';
      deleteLink.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>
      `;
      deleteLink.addEventListener('click', this.onDelete.bind(this, stade._id));
      
      li.appendChild(title);
      li.appendChild(editLink);
      li.appendChild(deleteLink);
      
      li.addEventListener('dblclick', this.goTo.bind(this, stade._id));
      li.addEventListener('click', () => {
        this.state.selected = i;
        this.render();
      });
      
      list.appendChild(li);
    });

    container.appendChild(list);

    // Display selected stade
    const current = this.state.stades[this.state.selected] || {};
    const display = document.createElement('div');
    display.className = 'posts_display';

    const rendered = new Rendered();
    rendered.className = 'posts_content';
    rendered.text = JSON.stringify(current, null, 2);
    rendered.type = 'stade';
    display.appendChild(rendered.render());

    container.appendChild(display);
    return container;
  }
}

module.exports = Stades;