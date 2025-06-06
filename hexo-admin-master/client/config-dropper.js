var AutoList = require('./auto-list');
var moment = require('moment');
var _ = require('lodash');

const dateFormat = 'MMM D YYYY HH:mm';

function toText(lst, map) {
  return lst.map((name) => map[name] || name);
}

function addMetadata(state, metadata, post) {
  for (let i = 0; i < metadata.length; i++) {
    state[metadata[i]] = post[metadata[i]];
  }
}

function isMetadataEqual(state, metadata, post) {
  let isEqual = true;
  for (let i = 0; i < metadata.length && isEqual; i++) {
    isEqual = isEqual && state[metadata[i]] === post[metadata[i]];
  }
  return isEqual;
}

class ConfigDropper {
  constructor(options) {
    this.options = options;
    const tagCatMeta = options.tagsCategoriesAndMetadata;
    this.state = {
      open: false,
      date: moment(options.post.date).format(dateFormat),
      tags: toText(options.post.tags, tagCatMeta.tags),
      categories: toText(options.post.categories, tagCatMeta.categories),
      author: options.post.author
    };
    addMetadata(this.state, tagCatMeta.metadata, options.post);
    this.element = null;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  _globalMouseDown(e) {
    let node = e.target;
    while (node) {
      if (!node.parentNode) return;
      node = node.parentNode;
      if (node === document.body) break;
      if (node === this.element) return;
    }
    this._onClose();
  }

  _toggleShow() {
    if (this.state.open) {
      this.save();
    }
    this.setState({
      open: !this.state.open
    });
  }

  _onClose() {
    this.save();
    this.setState({ open: false });
  }

  _onChangeDate(e) {
    this.setState({
      date: e.target.value
    });
  }

  _onChangeAuthor(e) {
    this.setState({
      author: e.target.value
    });
  }

  _onChangeMetadata(e) {
    const state = {};
    state[e.target.name] = e.target.value;
    this.setState(state);
  }

  _onChange(attr, value) {
    const update = {};
    update[attr] = value;
    this.setState(update);
  }

  save() {
    const date = moment(this.state.date);
    if (!date.isValid()) {
      date = moment(this.options.post.date);
    }
    const tagCatMeta = this.options.tagsCategoriesAndMetadata;
    const tags = toText(this.options.post.tags, tagCatMeta.tags);
    const categories = toText(this.options.post.categories, tagCatMeta.categories);
    const author = this.options.post.author;
    const textDate = date.toISOString();
    const isSameMetadata = isMetadataEqual(this.state, tagCatMeta.metadata, this.options.post);

    if (textDate === this.options.post.date &&
        _.isEqual(this.state.categories, categories) &&
        _.isEqual(this.state.tags, tags) && 
        author === this.state.author &&
        isSameMetadata) {
      return;
    }

    const state = {
      date: date.toISOString(),
      categories: this.state.categories,
      tags: this.state.tags,
      author: this.state.author
    };
    addMetadata(state, tagCatMeta.metadata, this.state);
    this.options.onChange(state);
  }

  createConfigSection() {
    const config = document.createElement('div');
    config.className = 'config';

    // Date section
    const dateSection = document.createElement('div');
    dateSection.className = 'config_section';
    const dateTitle = document.createElement('div');
    dateTitle.className = 'config_section-title';
    dateTitle.textContent = 'Date';
    const dateInput = document.createElement('input');
    dateInput.className = 'config_date';
    dateInput.value = this.state.date;
    dateInput.addEventListener('change', this._onChangeDate.bind(this));
    dateSection.appendChild(dateTitle);
    dateSection.appendChild(dateInput);
    config.appendChild(dateSection);

    // Author section
    const authorSection = document.createElement('div');
    authorSection.className = 'config_section';
    const authorTitle = document.createElement('div');
    authorTitle.className = 'config_section-title';
    authorTitle.textContent = 'Author';
    const authorInput = document.createElement('input');
    authorInput.className = 'config_author';
    authorInput.value = this.state.author;
    authorInput.addEventListener('change', this._onChangeAuthor.bind(this));
    authorSection.appendChild(authorTitle);
    authorSection.appendChild(authorInput);
    config.appendChild(authorSection);

    // Tags section
    const tagsSection = document.createElement('div');
    tagsSection.className = 'config_section';
    const tagsTitle = document.createElement('div');
    tagsTitle.className = 'config_section-title';
    tagsTitle.textContent = 'Tags';
    const tagsList = new AutoList({
      options: this.options.tagsCategoriesAndMetadata.tags,
      values: this.state.tags,
      onChange: this._onChange.bind(this, 'tags')
    });
    tagsSection.appendChild(tagsTitle);
    tagsSection.appendChild(tagsList.render());
    config.appendChild(tagsSection);

    // Categories section
    const categoriesSection = document.createElement('div');
    categoriesSection.className = 'config_section';
    const categoriesTitle = document.createElement('div');
    categoriesTitle.className = 'config_section-title';
    categoriesTitle.textContent = 'Categories';
    const categoriesList = new AutoList({
      options: this.options.tagsCategoriesAndMetadata.categories,
      values: this.state.categories,
      onChange: this._onChange.bind(this, 'categories')
    });
    categoriesSection.appendChild(categoriesTitle);
    categoriesSection.appendChild(categoriesList.render());
    config.appendChild(categoriesSection);

    // Metadata sections
    const metadata = this.options.tagsCategoriesAndMetadata.metadata;
    metadata.forEach((name, index) => {
      const section = document.createElement('div');
      section.className = 'config_section';
      const title = document.createElement('div');
      title.className = 'config_section-title';
      title.textContent = name;

      let component;
      if (_.isArray(this.state[name])) {
        const list = new AutoList({
          options: [],
          values: this.state[name],
          onChange: this._onChange.bind(this, name)
        });
        component = list.render();
      } else {
        const input = document.createElement('input');
        input.className = 'config_metadata';
        input.value = this.state[name];
        input.name = name;
        input.addEventListener('change', this._onChangeMetadata.bind(this));
        component = input;
      }

      section.appendChild(title);
      section.appendChild(component);
      config.appendChild(section);
    });

    return config;
  }

  render() {
    if (this.element) {
      // Mise à jour des éléments existants
      const config = this.element.querySelector('.config');
      if (config) {
        config.remove();
      }
      if (this.state.open) {
        this.element.appendChild(this.createConfigSection());
      }
      this.element.className = `config-dropper ${this.state.open ? 'config-dropper--open' : ''}`;
      return this.element;
    }

    const container = document.createElement('div');
    container.className = `config-dropper ${this.state.open ? 'config-dropper--open' : ''}`;
    container.title = 'Settings';

    const handle = document.createElement('div');
    handle.className = 'config-dropper_handle';
    handle.addEventListener('click', this._toggleShow.bind(this));
    
    const icon = document.createElement('i');
    icon.className = 'fa fa-gear';
    handle.appendChild(icon);
    container.appendChild(handle);

    if (this.state.open) {
      container.appendChild(this.createConfigSection());
    }

    this.element = container;
    return this.element;
  }
}

module.exports = ConfigDropper;
