const DataFetcher = require('./data-fetcher');
const api = require('./api');
const Promise = require('es6-promise').Promise;
const marked = require('marked');
const Editor_data = require('./editor-data');
const _ = require('lodash');
const moment = require('moment');
const Router = require('./router');

class Page {
  constructor() {
    this.state = {
      updated: moment(),
      page: null,
      settings: null,
      tagsCategoriesAndMetadata: null,
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
      const [page, settings, tagsCategoriesAndMetadata] = await Promise.all([
        api.page(params[0]),
        api.settings(),
        api.tagsCategoriesAndMetadata()
      ]);
      
      this.state.page = page;
      this.state.settings = settings;
      this.state.tagsCategoriesAndMetadata = tagsCategoriesAndMetadata;
      
      this._page = _.debounce((update) => {
        const now = moment();
        api.page(params[0], update).then(() => {
          this.state.updated = now;
          this.render();
        });
      }, 1000, {trailing: true, loading: true});
      
      this.dataDidLoad('page', page);
      this.render();
    } catch (error) {
      console.error('Error loading page:', error);
    }
  }

  handleChange(update) {
    const now = moment();
    api.page(this.state.page._id, update).then((data) => {
      this.state.page = data.page;
      this.state.updated = now;
      this.render();
    });
  }

  handleChangeContent(text) {
    if (text === this.state.raw) return;
    
    this.state.raw = text;
    this.state.updated = null;
    this.state.rendered = marked(text);
    this._page({_content: text});
    this.render();
  }

  handleChangeTitle(title) {
    if (title === this.state.title) return;
    
    this.state.title = title;
    this._page(this.state);
    this.render();
  }

  handlePublish() {
    if (!this.state.page.isDraft) return;
    
    api.publish(this.state.page._id).then((page) => {
      this.state.page = page;
      this.render();
    });
  }

  handleUnpublish() {
    if (this.state.page.isDraft) return;
    
    api.unpublish(this.state.page._id).then((page) => {
      this.state.page = page;
      this.render();
    });
  }

  dataDidLoad(name, data) {
    if (name !== 'page') return;
    
    const parts = data.raw.split('---');
    const _slice = parts[0] === '' ? 2 : 1;
    const raw = parts.slice(_slice).join('---').trim();
    
    this.state.title = data.title;
    this.state.initialRaw = raw;
    this.state.raw = raw;
    this.state.rendered = data.content;
  }

  render() {
    const { page, settings } = this.state;
    
    if (!page || !settings) {
      return document.createElement('span');
    }

    const editor = new Editor_data({
      isPage: true,
      post: this.state.page,
      raw: this.state.initialRaw,
      wordCount: this.state.raw ? this.state.raw.split(' ').length : 0,
      isDraft: page.isDraft,
      updated: this.state.updated,
      title: this.state.title,
      rendered: this.state.rendered,
      onChange: this.handleChange.bind(this),
      onChangeContent: this.handleChangeContent.bind(this),
      onChangeTitle: this.handleChangeTitle.bind(this),
      onPublish: this.handlePublish.bind(this),
      onUnpublish: this.handleUnpublish.bind(this),
      tagsCategoriesAndMetadata: this.state.tagsCategoriesAndMetadata,
      adminSettings: settings,
      type: 'page'
    });

    return editor.render();
  }
}

module.exports = Page;
