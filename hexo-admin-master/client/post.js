const DataFetcher = require('./data-fetcher');
const api = require('./api');
const Promise = require('es6-promise').Promise;
const marked = require('marked');
const Editor_data = require('./editor-data');
const _ = require('lodash');
const moment = require('moment');
const Router = require('./router');
const Confirm = require('./confirm');

const confirm = function (message, options = {}) {
  const props = Object.assign({
    message: message
  }, options);
  
  const wrapper = document.body.appendChild(document.createElement('div'));
  const component = new Confirm(props);
  wrapper.appendChild(component.render());
  
  const cleanup = function () {
    wrapper.remove();
  };

  return component.promise.then(cleanup).catch(cleanup);
};

class Post {
  constructor() {
    this.state = {
      updated: moment(),
      post: null,
      tagsCategoriesAndMetadata: null,
      settings: null,
      title: '',
      initialRaw: '',
      raw: '',
      rendered: ''
    };
    
    this.init();
  }

  async init() {
    try {
      const params = Router.getParams();
      const [post, tagsCategoriesAndMetadata, settings] = await Promise.all([
        api.post(params[0]),
        api.tagsCategoriesAndMetadata(),
        api.settings()
      ]);
      
      this.state.post = post;
      this.state.tagsCategoriesAndMetadata = tagsCategoriesAndMetadata;
      this.state.settings = settings;
      
      this._post = _.debounce((update) => {
        const now = moment();
        api.post(params[0], update).then(() => {
          this.state.updated = now;
          this.render();
        });
      }, 1000, {trailing: true, loading: true});
      
      this.dataDidLoad('post', post);
      this.render();
    } catch (error) {
      console.error('Error loading post:', error);
    }
  }

  handleChange(update) {
    const now = moment();
    api.post(this.state.post._id, update).then((data) => {
      const state = {
        tagsCategoriesAndMetadata: data.tagsCategoriesAndMetadata,
        post: data.post,
        updated: now,
        author: data.post.author,
      };
      
      for(let i = 0; i < data.tagsCategoriesAndMetadata.metadata.length; i++) {
        const name = data.tagsCategoriesAndMetadata.metadata[i];
        state[name] = data.post[name];
      }
      
      Object.assign(this.state, state);
      this.render();
    });
  }

  handleChangeContent(text) {
    if (text === this.state.raw) return;

    this.state.raw = text;
    this.state.updated = null;
    this.state.rendered = marked(text);
    this._post({_content: text});
    this.render();
  }

  handleChangeTitle(title) {
    if (title === this.state.title) return;
    
    this.state.title = title;
    this._post({title: title});
    this.render();
  }

  handlePublish() {
    if (!this.state.post.isDraft) return;
    
    api.publish(this.state.post._id).then((post) => {
      this.state.post = post;
      this.render();
    });
  }

  handleUnpublish() {
    if (this.state.post.isDraft) return;
    
    api.unpublish(this.state.post._id).then((post) => {
      this.state.post = post;
      this.render();
    });
  }

  handleRemove() {
    return confirm('Delete this post?', {
      description: 'This operation will move current draft into source/_discarded folder.',
      confirmLabel: 'Yes',
      abortLabel: 'No'
    }).then(() => {
      api.remove(this.state.post._id).then(() => {
        window.location.hash = '#/posts';
      });
    });
  }

  dataDidLoad(name, data) {
    if (name !== 'post') return;
    
    const parts = data.raw.split('---');
    const _slice = parts[0] === '' ? 2 : 1;
    const raw = parts.slice(_slice).join('---').trim();
    
    this.state.title = data.title;
    this.state.initialRaw = raw;
    this.state.raw = raw;
    this.state.rendered = data.content;
  }

  render() {
    const { post, tagsCategoriesAndMetadata, settings } = this.state;
    
    if (!post || !tagsCategoriesAndMetadata || !settings) {
      return document.createElement('span');
    }

    const editor = new Editor_data({
      post: this.state.post,
      raw: this.state.initialRaw,
      updatedRaw: this.state.raw,
      wordCount: this.state.raw ? this.state.raw.split(' ').length : 0,
      isDraft: post.isDraft,
      updated: this.state.updated,
      title: this.state.title,
      rendered: this.state.rendered,
      tagsCategoriesAndMetadata: this.state.tagsCategoriesAndMetadata,
      adminSettings: settings,
      onChange: this.handleChange.bind(this),
      onChangeContent: this.handleChangeContent.bind(this),
      onChangeTitle: this.handleChangeTitle.bind(this),
      onPublish: this.handlePublish.bind(this),
      onUnpublish: this.handleUnpublish.bind(this),
      onRemove: this.handleRemove.bind(this),
      type: 'post'
    });

    return editor.render();
  }
}

module.exports = Post;
