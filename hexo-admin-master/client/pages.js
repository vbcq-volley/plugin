const _ = require('lodash');
const moment = require('moment');
const SinceWhen = require('./since-when');
const Rendered = require('./rendered');
const DataFetcher = require('./data-fetcher');
const Newpage = require('./new-page');
const api = require('./api');
const Router = require('./router');

class Pages {
  constructor() {
    this.state = {
      pages: null,
      selected: 0
    };
    this.init();
  }

  async init() {
    try {
      const pages = await api.pages();
      this.state.pages = _.sortBy(pages, ['isDraft', 'date']).reverse();
      this.render();
    } catch (error) {
      console.error('Error loading pages:', error);
    }
  }

  onNew(page) {
    this.state.pages.unshift(page);
    this.render();
    window.location.hash = `#/page/${page._id}`;
  }

  goTo(id, e) {
    if (e) {
      e.preventDefault();
    }
    window.location.hash = `#/page/${id}`;
  }

  render() {
    if (!this.state.pages) {
      const loading = document.createElement('div');
      loading.className = 'pages';
      loading.textContent = 'Loading...';
      return loading;
    }

    const container = document.createElement('div');
    container.className = 'posts';

    const list = document.createElement('ul');
    list.className = 'posts_list';

    // Ajouter le bouton NewPage
    const newPage = new Newpage();
    newPage.onNew = this.onNew.bind(this);
    list.appendChild(newPage.render());

    // Rendre la liste des pages
    this.state.pages.forEach((page, i) => {
      const li = document.createElement('li');
      li.className = `posts_post ${page.isDraft ? 'posts_post--draft' : ''} ${i === this.state.selected ? 'posts_post--selected' : ''}`;
      
      const title = document.createElement('span');
      title.className = 'posts_post-title';
      title.textContent = page.title;
      
      const date = document.createElement('span');
      date.className = 'posts_post-date';
      date.textContent = moment(page.date).format('MMM Do YYYY');
      
      const permaLink = document.createElement('a');
      permaLink.className = 'posts_perma-link';
      permaLink.target = '_blank';
      const url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/');
      const rootPath = url.slice(0, url.indexOf('admin')).join('/');
      permaLink.href = rootPath + '/' + page.path;
      permaLink.innerHTML = '<i class="fa fa-link"></i>';
      
      const editLink = document.createElement('a');
      editLink.className = 'posts_edit-link';
      editLink.href = `#/page/${page._id}`;
      editLink.innerHTML = '<i class="fa fa-pencil-square-o"></i>';
      
      li.appendChild(title);
      li.appendChild(date);
      li.appendChild(permaLink);
      li.appendChild(editLink);
      
      li.addEventListener('dblclick', this.goTo.bind(this, page._id));
      li.addEventListener('click', () => {
        this.state.selected = i;
        this.render();
      });
      
      list.appendChild(li);
    });

    container.appendChild(list);

    // Afficher le contenu de la page sélectionnée
    const current = this.state.pages[this.state.selected] || {};
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
    rendered.text = current.content;
    display.appendChild(rendered.render());

    container.appendChild(display);
    return container;
  }
}

module.exports = Pages;
