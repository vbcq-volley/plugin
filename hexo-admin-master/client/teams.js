const _ = require('lodash');
const moment = require('moment');
const SinceWhen = require('./since-when');
const Rendered = require('./rendered');
const DataFetcher = require('./data-fetcher');
const Newteam = require('./new-team');
const api = require('./api');
const Router = require('./router');

class Teams {
  constructor() {
    this.state = {
      selected: 0,
      showNewForm: false,
      teams: [],
      updated: moment()
    };
    this.init();
  }

  async init() {
    try {
      const teams = await api.getEntries("team");
      this.state.teams = teams;
      this.render();
    } catch (error) {
      console.error('Error loading teams:', error);
    }
  }

  toggleNewForm() {
    this.state.showNewForm = !this.state.showNewForm;
    this.render();
  }

  onNew(team) {
    this.state.teams.unshift(team);
    this.render();
    window.location.hash = `#/team/${team._id}`;
  }

  onDelete(id, e) {
    if (e) {
      e.preventDefault();
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
      api.deleteEntry("team", id).then(() => {
        this.state.teams = this.state.teams.filter(team => team._id !== id);
        this.render();
      });
    }
  }

  goTo(id, e) {
    if (e) {
      e.preventDefault();
    }
    window.location.hash = `#/team/${id}`;
  }

  render() {
    if (!this.state.teams) {
      const loading = document.createElement('div');
      loading.className = 'teams';
      loading.textContent = 'Loading...';
      return loading;
    }

    const container = document.createElement('div');
    container.className = 'posts';

    // Header
    const header = document.createElement('div');
    header.className = 'posts_header';
    
    const title = document.createElement('h2');
    title.textContent = 'Équipes';
    
    const newButton = document.createElement('button');
    newButton.className = 'new-team-button';
    newButton.innerHTML = `<i class="fa fa-plus" /> ${this.state.showNewForm ? 'Annuler' : 'Nouvelle équipe'}`;
    newButton.addEventListener('click', this.toggleNewForm.bind(this));
    
    header.appendChild(title);
    header.appendChild(newButton);
    container.appendChild(header);

    // New team form
    if (this.state.showNewForm) {
      const formContainer = document.createElement('div');
      formContainer.className = 'new-team-form-container';
      
      const newTeam = new Newteam();
      newTeam.onNew = this.onNew.bind(this);
      formContainer.appendChild(newTeam.render());
      
      container.appendChild(formContainer);
    }

    // Teams list
    const list = document.createElement('ul');
    list.className = 'posts_list';

    this.state.teams.forEach((team, i) => {
      const li = document.createElement('li');
      li.className = `posts_post ${team.isDraft ? 'posts_post--draft' : ''} ${i === this.state.selected ? 'posts_post--selected' : ''}`;
      
      const title = document.createElement('span');
      title.className = 'posts_post-title';
      title.textContent = team.teamName;
      
      const date = document.createElement('span');
      date.className = 'posts_post-date';
      date.textContent = team.date;
      
      const permaLink = document.createElement('a');
      permaLink.className = 'posts_perma-link';
      permaLink.target = '_blank';
      const url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/');
      const rootPath = url.slice(0, url.indexOf('admin')).join('/');
      permaLink.href = rootPath + '/' + team.path;
      permaLink.innerHTML = '<i class="fa fa-link"></i>';
      
      const editLink = document.createElement('a');
      editLink.className = 'posts_edit-link';
      editLink.href = `#/team/${team._id}`;
      editLink.innerHTML = '<i class="fa fa-pencil"></i>';
      
      const deleteLink = document.createElement('a');
      deleteLink.className = 'posts_delete-link';
      deleteLink.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
        </svg>
      `;
      deleteLink.addEventListener('click', this.onDelete.bind(this, team._id));
      
      li.appendChild(title);
      li.appendChild(date);
      li.appendChild(permaLink);
      li.appendChild(editLink);
      li.appendChild(deleteLink);
      
      li.addEventListener('dblclick', this.goTo.bind(this, team._id));
      li.addEventListener('click', () => {
        this.state.selected = i;
        this.render();
      });
      
      list.appendChild(li);
    });

    container.appendChild(list);

    // Display selected team
    const current = this.state.teams[this.state.selected] || {};
    const display = document.createElement('div');
    display.className = `posts_display ${current.isDraft ? 'posts_display--draft' : ''}`;

    if (current.isDraft) {
      const draftMessage = document.createElement('div');
      draftMessage.className = 'posts_draft-message';
      draftMessage.textContent = 'Draft';
      display.appendChild(draftMessage);
    }

    const rendered = new Rendered();
    rendered.className = 'posts_content';
    rendered.text = JSON.stringify(current, null, 2);
    rendered.type = 'team';
    display.appendChild(rendered.render());

    container.appendChild(display);
    return container;
  }
}

module.exports = Teams;
