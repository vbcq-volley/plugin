var _ = require('lodash');
var moment = require('moment');
var SinceWhen = require('./since-when');
var api = require('./api');
var Rendered = require('./rendered');
var DataFetcher = require('./data-fetcher');
var Newpage = require('./new-data');

class Datas {
  constructor() {
    this.state = {
      selected: 0,
      pages: [],
      previousPage: null,
      params: ["match"]
    };
    this.element = null;
    this.dataFetcher = new DataFetcher((params) => {
      return { "pages": api.getEntries("match") };
    });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  _onNew(page) {
    const pages = this.state.pages.slice();
    pages.unshift(page);
    this.setState({ pages: pages });
    window.location.hash = `#/data/${page._id}`;
  }

  goTo(id, e) {
    if (e) {
      e.preventDefault();
    }
    window.location.hash = `#/data/${id}`;
  }

  render() {
    if (!this.state.pages.length) {
      const div = document.createElement('div');
      div.textContent = 'Chargement...';
      return div;
    }

    if (this.element) {
      // Mise à jour des éléments existants
      const list = this.element.querySelector('.posts_list');
      if (list) {
        list.innerHTML = '';
        this._renderList(list);
      }
      return this.element;
    }

    const div = document.createElement('div');
    div.className = 'posts';

    const ul = document.createElement('ul');
    ul.className = 'posts_list';
    this._renderList(ul);
    div.appendChild(ul);

    const current = this.state.pages[this.state.selected] || {};
    const url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/');
    const rootPath = url.slice(0, url.indexOf('admin')).join('/');

    const displayDiv = document.createElement('div');
    displayDiv.className = 'posts_display';
    if (current.isDraft) {
      displayDiv.className += ' posts_display--draft';
    }

    const rendered = new Rendered();
    rendered.className = 'posts_content';
    rendered.text = JSON.stringify(current);
    rendered.type = 'match';
    displayDiv.appendChild(rendered.render());

    div.appendChild(displayDiv);
    this.element = div;
    return this.element;
  }

  _renderList(container) {
    const newPage = new Newpage();
    newPage.onNew = this._onNew.bind(this);
    container.appendChild(newPage.render());

    this.state.pages.forEach((page, i) => {
      const li = document.createElement('li');
      li.className = 'posts_post';
      if (page.isDraft) {
        li.className += ' posts_post--draft';
      }
      if (i === this.state.selected) {
        li.className += ' posts_post--selected';
      }

      li.addEventListener('dblclick', () => this.goTo(page._id));
      li.addEventListener('click', () => this.setState({ selected: i }));

      const titleSpan = document.createElement('span');
      titleSpan.className = 'posts_post-title';
      titleSpan.textContent = page.title;
      li.appendChild(titleSpan);

      const dateSpan = document.createElement('span');
      dateSpan.className = 'posts_post-date';
      dateSpan.textContent = moment(page.date).format('MMM Do YYYY');
      li.appendChild(dateSpan);

      const permaLink = document.createElement('a');
      permaLink.className = 'posts_perma-link';
      permaLink.target = '_blank';
      permaLink.href = rootPath + '/' + page.path;
      const permaIcon = document.createElement('i');
      permaIcon.className = 'fa fa-link';
      permaLink.appendChild(permaIcon);
      li.appendChild(permaLink);

      const editLink = document.createElement('a');
      editLink.className = 'posts_edit-link';
      editLink.href = `#/data/${page._id}`;
      const editIcon = document.createElement('i');
      editIcon.className = 'fa fa-pencil-square-o';
      editLink.appendChild(editIcon);
      li.appendChild(editLink);

      const resultLink = document.createElement('a');
      resultLink.className = 'result add';
      resultLink.href = `#/resultat/${page._id}`;
      const resultIcon = document.createElement('i');
      resultIcon.className = 'fa fa-pencil-square-o';
      resultLink.appendChild(resultIcon);
      li.appendChild(resultLink);

      container.appendChild(li);
    });
  }
}

module.exports = Datas;
