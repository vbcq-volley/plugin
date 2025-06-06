const path = require('path');
const _ = require('lodash');
const moment = require('moment');
const SinceWhen = require('./since-when');
const Rendered = require('./rendered');
const DataFetcher = require('./data-fetcher');
const NewPost = require('./new-post');
const api = require('./api');
const Router = require('./router');

class Posts {
  constructor() {
    this.state = {
      posts: null,
      selected: 0
    };
    this.init();
  }

  async init() {
    try {
      const posts = await api.posts();
      this.state.posts = _.sortBy(
        _.filter(posts, post => !post.isDiscarded),
        ['isDraft', 'date']
      ).reverse();
      this.render();
    } catch (error) {
      console.error('Error loading posts:', error);
    }
  }

  onNew(post) {
    this.state.posts.unshift(post);
    this.render();
    window.location.hash = `#/post/${post._id}`;
  }

  goTo(id, e) {
    if (e) {
      e.preventDefault();
    }
    window.location.hash = `#/post/${id}`;
  }

  render() {
    if (!this.state.posts) {
      return document.createElement('div');
    }

    const container = document.createElement('div');
    container.className = 'posts';

    const list = document.createElement('ul');
    list.className = 'posts_list';

    // Ajouter le bouton NewPost
    const newPost = new NewPost();
    newPost.onNew = this.onNew.bind(this);
    list.appendChild(newPost.render());

    // Rendre la liste des posts
    this.state.posts.forEach((post, i) => {
      const li = document.createElement('li');
      li.className = `posts_post ${post.isDraft ? 'posts_post--draft' : ''} ${i === this.state.selected ? 'posts_post--selected' : ''}`;
      
      const title = document.createElement('span');
      title.className = 'posts_post-title';
      title.textContent = post.title;
      
      const date = document.createElement('span');
      date.className = 'posts_post-date';
      date.textContent = moment(post.date).format('MMM Do YYYY');
      
      const permaLink = document.createElement('a');
      permaLink.className = 'posts_perma-link';
      permaLink.target = '_blank';
      const url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/');
      const rootPath = url.slice(0, url.indexOf('admin')).join('/');
      permaLink.href = path.join(rootPath, '/', post.path);
      permaLink.innerHTML = '<i class="fa fa-link"></i>';
      
      const editLink = document.createElement('a');
      editLink.className = 'posts_edit-link';
      editLink.href = `#/post/${post._id}`;
      editLink.innerHTML = '<i class="fa fa-pencil-square-o"></i>';
      
      li.appendChild(title);
      li.appendChild(date);
      li.appendChild(permaLink);
      li.appendChild(editLink);
      
      li.addEventListener('dblclick', this.goTo.bind(this, post._id));
      li.addEventListener('click', () => {
        this.state.selected = i;
        this.render();
      });
      
      list.appendChild(li);
    });

    container.appendChild(list);

    // Afficher le contenu du post sélectionné
    const current = this.state.posts[this.state.selected] || {};
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

module.exports = Posts;
