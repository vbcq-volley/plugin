// index.js
class API {
  constructor() {
    this.baseUrl = '';
  }

  init(type, baseUrl) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.statusText}`);
    }

    return response.json();
  }

  async getEntries(type) {
    return this.request(`/db/${type}`);
  }

  async getEntry(type, id) {
    return this.request(`/db/${type}/${id}`);
  }

  async createEntry(type, data) {
    return this.request(`/db/${type}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  async updateEntry(type, id, data) {
    return this.request(`/db/${type}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteEntry(type, id) {
    return this.request(`/db/${type}/${id}`, {
      method: 'DELETE'
    });
  }

  async getPosts() {
    return this.request('/posts/list');
  }

  async getPost(id, data) {
    if (data) {
      return this.request(`/posts/${id}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
    return this.request(`/posts/${id}`);
  }

  async createPost(title) {
    return this.request('/posts/new', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  }

  async getPages() {
    return this.request('/pages/list');
  }

  async getPage(id, data) {
    if (data) {
      return this.request(`/pages/${id}`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
    }
    return this.request(`/pages/${id}`);
  }

  async createPage(title) {
    return this.request('/pages/new', {
      method: 'POST',
      body: JSON.stringify({ title })
    });
  }

  async deploy(message) {
    return this.request('/deploy', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }

  async uploadImage(data, filename) {
    return this.request('/images/upload', {
      method: 'POST',
      body: JSON.stringify({ data, filename })
    });
  }

  async removePost(id) {
    return this.request(`/posts/${id}/remove`, {
      method: 'POST'
    });
  }

  async publishPost(id) {
    return this.request(`/posts/${id}/publish`, {
      method: 'POST'
    });
  }

  async unpublishPost(id) {
    return this.request(`/posts/${id}/unpublish`, {
      method: 'POST'
    });
  }

  async renamePost(id, filename) {
    return this.request(`/posts/${id}/rename`, {
      method: 'POST',
      body: JSON.stringify({ filename })
    });
  }

  async getTagsCategoriesAndMetadata() {
    return this.request('/tags-categories-and-metadata');
  }

  async getSettings() {
    return this.request('/settings/list');
  }

  async setSetting(name, value, addedOptions) {
    return this.request('/settings/set', {
      method: 'POST',
      body: JSON.stringify({ name, value, addedOptions })
    });
  }

  async getGallery() {
    return this.request('/gallery/list');
  }

  async setGallery(name, createAt) {
    return this.request('/gallery/set', {
      method: 'POST',
      body: JSON.stringify({ name, createAt })
    });
  }

  async uploadMultiFiles(files) {
    const formData = new FormData();
    files.forEach(file => {
      formData.append(file.name, file);
    });
    return this.request('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }

  async getMatch() {
    return this.getEntries("match");
  }
}

const api = new API();

class DataFetcher {
  constructor(fetchMethod) {
    this.fetchMethod = fetchMethod;
    this.data = null;
    this.loading = false;
    this.error = null;
  }

  async getData() {
    this.loading = true;
    this.error = null;
    try {
      this.data = await this.fetchMethod();
    } catch (error) {
      this.error = error.message;
    } finally {
      this.loading = false;
    }
    return this.data;
  }
}

class Posts {
  constructor(node) {
    this.node = node;
    this.dataFetcher = new DataFetcher(this.fetchPosts.bind(this));
  }

  async fetchPosts() {
    return api.getPosts();
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const posts = this.dataFetcher.data;
    const html = `
      <div class="posts">
        <h2>Posts</h2>
        <ul>
          ${posts.map(post => `
            <li>
              <a href="#/post/${post._id}">${post.title}</a>
              <span class="date">${new Date(post.date).toLocaleDateString()}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Pages {
  constructor(node) {
    this.node = node;
    this.dataFetcher = new DataFetcher(this.fetchPages.bind(this));
  }

  async fetchPages() {
    return api.getPages();
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const pages = this.dataFetcher.data;
    const html = `
      <div class="pages">
        <h2>Pages</h2>
        <ul>
          ${pages.map(page => `
            <li>
              <a href="#/page/${page._id}">${page.title}</a>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Teams {
  constructor(node) {
    this.node = node;
    this.dataFetcher = new DataFetcher(this.fetchTeams.bind(this));
  }

  async fetchTeams() {
    return api.getEntries('team');
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const teams = this.dataFetcher.data;
    const html = `
      <div class="teams">
        <h2>Équipes</h2>
        <ul>
          ${teams.map(team => `
            <li>
              <a href="#/team/${team._id}">${team.teamName}</a>
              <span class="coach">${team.coach}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Stades {
  constructor(node) {
    this.node = node;
    this.dataFetcher = new DataFetcher(this.fetchStades.bind(this));
  }

  async fetchStades() {
    return api.getEntries('stade');
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const stades = this.dataFetcher.data;
    const html = `
      <div class="stades">
        <h2>Stades</h2>
        <ul>
          ${stades.map(stade => `
            <li>
              <a href="#/stade/${stade._id}">${stade.name}</a>
              <span class="capacity">${stade.capacity} places</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Results {
  constructor(node) {
    this.node = node;
    this.dataFetcher = new DataFetcher(this.fetchResults.bind(this));
  }

  async fetchResults() {
    return api.getEntries('result');
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const results = this.dataFetcher.data;
    const html = `
      <div class="results">
        <h2>Résultats</h2>
        <ul>
          ${results.map(result => `
            <li>
              <a href="#/result/${result._id}">
                ${result.homeTeam} ${result.homeScore} - ${result.awayScore} ${result.awayTeam}
              </a>
              <span class="date">${new Date(result.date).toLocaleDateString()}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Datas {
  constructor(node) {
    this.node = node;
    this.dataFetcher = new DataFetcher(this.fetchDatas.bind(this));
  }

  async fetchDatas() {
    return api.getMatch();
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const datas = this.dataFetcher.data;
    const html = `
      <div class="datas">
        <h2>Matchs</h2>
        <ul>
          ${datas.map(data => `
            <li>
              <a href="#/data/${data._id}">${data.title}</a>
              <span class="date">${new Date(data.date).toLocaleDateString()}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Settings {
  constructor(node) {
    this.node = node;
    this.dataFetcher = new DataFetcher(this.fetchSettings.bind(this));
  }

  async fetchSettings() {
    return api.getSettings();
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const settings = this.dataFetcher.data;
    const html = `
      <div class="settings">
        <h2>Paramètres</h2>
        <form id="settings-form">
          ${Object.entries(settings).map(([key, value]) => `
            <div class="form-group">
              <label for="${key}">${key}</label>
              <input type="${typeof value === 'boolean' ? 'checkbox' : 'text'}" 
                     id="${key}" 
                     name="${key}" 
                     value="${value}"
                     ${typeof value === 'boolean' && value ? 'checked' : ''}>
            </div>
          `).join('')}
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    `;
    this.node.innerHTML = html;

    const form = document.getElementById('settings-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      for (const [key, value] of formData.entries()) {
        await api.setSetting(key, value === 'on' ? true : value);
      }
      this.render();
    });
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class About {
  constructor(node) {
    this.node = node;
  }

  render() {
    const html = `
      <div class="about">
        <h2>À propos</h2>
        <p>Version: 1.0.0</p>
        <p>Un panneau d'administration pour Hexo</p>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Post {
  constructor(node, id) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchPost.bind(this));
  }

  async fetchPost() {
    return api.getPost(this.id);
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const post = this.dataFetcher.data;
    const html = `
      <div class="post">
        <h2>${post.title}</h2>
        <div class="content">${post.content}</div>
        <div class="meta">
          <span class="date">${new Date(post.date).toLocaleDateString()}</span>
          <span class="author">${post.author || 'Anonyme'}</span>
        </div>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Page {
  constructor(node, id) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchPage.bind(this));
  }

  async fetchPage() {
    return api.getPage(this.id);
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const page = this.dataFetcher.data;
    const html = `
      <div class="page">
        <h2>${page.title}</h2>
        <div class="content">${page.content}</div>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Team {
  constructor(node, id) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchTeam.bind(this));
  }

  async fetchTeam() {
    return api.getEntry('team', this.id);
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const team = this.dataFetcher.data;
    const html = `
      <div class="team">
        <h2>${team.teamName}</h2>
        <div class="details">
          <p><strong>Entraîneur:</strong> ${team.coach}</p>
          <p><strong>Stade:</strong> ${team.stadium}</p>
          <p><strong>Année de création:</strong> ${team.founded}</p>
          <p><strong>Pays:</strong> ${team.country}</p>
        </div>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Stade {
  constructor(node, id) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchStade.bind(this));
  }

  async fetchStade() {
    return api.getEntry('stade', this.id);
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const stade = this.dataFetcher.data;
    const html = `
      <div class="stade">
        <h2>${stade.name}</h2>
        <div class="details">
          <p><strong>Capacité:</strong> ${stade.capacity} places</p>
          <p><strong>Ville:</strong> ${stade.city}</p>
          <p><strong>Pays:</strong> ${stade.country}</p>
        </div>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Result {
  constructor(node, id) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchResult.bind(this));
  }

  async fetchResult() {
    return api.getEntry('result', this.id);
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const result = this.dataFetcher.data;
    const html = `
      <div class="result">
        <h2>${result.homeTeam} ${result.homeScore} - ${result.awayScore} ${result.awayTeam}</h2>
        <div class="details">
          <p><strong>Date:</strong> ${new Date(result.date).toLocaleDateString()}</p>
          <p><strong>Stade:</strong> ${result.stadium}</p>
          <p><strong>Compétition:</strong> ${result.competition}</p>
        </div>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class Data {
  constructor(node, id) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchData.bind(this));
  }

  async fetchData() {
    return api.getEntry('data', this.id);
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const data = this.dataFetcher.data;
    const html = `
      <div class="data">
        <h2>${data.title}</h2>
        <div class="content">${data.content}</div>
        <div class="meta">
          <span class="date">${new Date(data.date).toLocaleDateString()}</span>
        </div>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class PostEditor {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchPost.bind(this));
    this.editor = null;
  }

  async fetchPost() {
    return this.id ? api.getPost(this.id) : null;
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const post = this.dataFetcher.data || {};
    const html = `
      <div class="post-editor">
        <h2>${this.id ? 'Modifier le post' : 'Nouveau post'}</h2>
        <form id="post-form">
          <div class="form-group">
            <label for="title">Titre</label>
            <input type="text" id="title" name="title" value="${post.title || ''}" required>
          </div>
          <div class="form-group">
            <label for="content">Contenu</label>
            <textarea id="content" name="content" rows="10" required>${post.content || ''}</textarea>
          </div>
          <div class="form-group">
            <label for="date">Date</label>
            <input type="date" id="date" name="date" value="${post.date ? new Date(post.date).toISOString().split('T')[0] : ''}">
          </div>
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    `;
    this.node.innerHTML = html;

    // Initialisation de CodeMirror
    this.editor = CodeMirror.fromTextArea(document.getElementById('content'), {
      mode: 'markdown',
      theme: 'monokai',
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true
    });

    const form = document.getElementById('post-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        title: formData.get('title'),
        content: this.editor.getValue(),
        date: formData.get('date')
      };

      try {
        if (this.id) {
          await api.getPost(this.id, data);
        } else {
          await api.createPost(data.title);
          // Mise à jour du contenu après création
          const newPost = await api.getPost(this.id);
          await api.getPost(newPost._id, data);
        }
        window.location.hash = '#/posts';
      } catch (error) {
        alert('Erreur lors de l\'enregistrement: ' + error.message);
      }
    });
  }

  destroy() {
    if (this.editor) {
      this.editor.toTextArea();
    }
    this.node.innerHTML = '';
  }
}

class PageEditor {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchPage.bind(this));
    this.editor = null;
  }

  async fetchPage() {
    return this.id ? api.getPage(this.id) : null;
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const page = this.dataFetcher.data || {};
    const html = `
      <div class="page-editor">
        <h2>${this.id ? 'Modifier la page' : 'Nouvelle page'}</h2>
        <form id="page-form">
          <div class="form-group">
            <label for="title">Titre</label>
            <input type="text" id="title" name="title" value="${page.title || ''}" required>
          </div>
          <div class="form-group">
            <label for="content">Contenu</label>
            <textarea id="content" name="content" rows="10" required>${page.content || ''}</textarea>
          </div>
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    `;
    this.node.innerHTML = html;

    // Initialisation de CodeMirror
    this.editor = CodeMirror.fromTextArea(document.getElementById('content'), {
      mode: 'markdown',
      theme: 'monokai',
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true
    });

    const form = document.getElementById('page-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        title: formData.get('title'),
        content: this.editor.getValue()
      };

      try {
        if (this.id) {
          await api.getPage(this.id, data);
        } else {
          await api.createPage(data.title);
          // Mise à jour du contenu après création
          const newPage = await api.getPage(this.id);
          await api.getPage(newPage._id, data);
        }
        window.location.hash = '#/pages';
      } catch (error) {
        alert('Erreur lors de l\'enregistrement: ' + error.message);
      }
    });
  }

  destroy() {
    if (this.editor) {
      this.editor.toTextArea();
    }
    this.node.innerHTML = '';
  }
}

class TeamEditor {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchTeam.bind(this));
  }

  async fetchTeam() {
    return this.id ? api.getEntry('team', this.id) : null;
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const team = this.dataFetcher.data || {};
    const html = `
      <div class="team-editor">
        <h2>${this.id ? 'Modifier l\'équipe' : 'Nouvelle équipe'}</h2>
        <form id="team-form">
          <div class="form-group">
            <label for="teamName">Nom de l'équipe</label>
            <input type="text" id="teamName" name="teamName" value="${team.teamName || ''}" required>
          </div>
          <div class="form-group">
            <label for="coach">Entraîneur</label>
            <input type="text" id="coach" name="coach" value="${team.coach || ''}">
          </div>
          <div class="form-group">
            <label for="stadium">Stade</label>
            <input type="text" id="stadium" name="stadium" value="${team.stadium || ''}">
          </div>
          <div class="form-group">
            <label for="founded">Année de création</label>
            <input type="number" id="founded" name="founded" value="${team.founded || ''}">
          </div>
          <div class="form-group">
            <label for="country">Pays</label>
            <input type="text" id="country" name="country" value="${team.country || ''}">
          </div>
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    `;
    this.node.innerHTML = html;

    const form = document.getElementById('team-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        teamName: formData.get('teamName'),
        coach: formData.get('coach'),
        stadium: formData.get('stadium'),
        founded: parseInt(formData.get('founded')),
        country: formData.get('country')
      };

      try {
        if (this.id) {
          await api.updateEntry('team', this.id, data);
        } else {
          await api.createEntry('team', data);
        }
        window.location.hash = '#/teams';
      } catch (error) {
        alert('Erreur lors de l\'enregistrement: ' + error.message);
      }
    });
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class StadeEditor {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchStade.bind(this));
  }

  async fetchStade() {
    return this.id ? api.getEntry('stade', this.id) : null;
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const stade = this.dataFetcher.data || {};
    const html = `
      <div class="stade-editor">
        <h2>${this.id ? 'Modifier le stade' : 'Nouveau stade'}</h2>
        <form id="stade-form">
          <div class="form-group">
            <label for="name">Nom du stade</label>
            <input type="text" id="name" name="name" value="${stade.name || ''}" required>
          </div>
          <div class="form-group">
            <label for="capacity">Capacité</label>
            <input type="number" id="capacity" name="capacity" value="${stade.capacity || ''}" required>
          </div>
          <div class="form-group">
            <label for="city">Ville</label>
            <input type="text" id="city" name="city" value="${stade.city || ''}" required>
          </div>
          <div class="form-group">
            <label for="country">Pays</label>
            <input type="text" id="country" name="country" value="${stade.country || ''}" required>
          </div>
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    `;
    this.node.innerHTML = html;

    const form = document.getElementById('stade-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        name: formData.get('name'),
        capacity: parseInt(formData.get('capacity')),
        city: formData.get('city'),
        country: formData.get('country')
      };

      try {
        if (this.id) {
          await api.updateEntry('stade', this.id, data);
        } else {
          await api.createEntry('stade', data);
        }
        window.location.hash = '#/stades';
      } catch (error) {
        alert('Erreur lors de l\'enregistrement: ' + error.message);
      }
    });
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class ResultEditor {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchResult.bind(this));
  }

  async fetchResult() {
    return this.id ? api.getEntry('result', this.id) : null;
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const result = this.dataFetcher.data || {};
    const html = `
      <div class="result-editor">
        <h2>${this.id ? 'Modifier le résultat' : 'Nouveau résultat'}</h2>
        <form id="result-form">
          <div class="form-group">
            <label for="homeTeam">Équipe à domicile</label>
            <input type="text" id="homeTeam" name="homeTeam" value="${result.homeTeam || ''}" required>
          </div>
          <div class="form-group">
            <label for="awayTeam">Équipe à l'extérieur</label>
            <input type="text" id="awayTeam" name="awayTeam" value="${result.awayTeam || ''}" required>
          </div>
          <div class="form-group">
            <label for="homeScore">Score domicile</label>
            <input type="number" id="homeScore" name="homeScore" value="${result.homeScore || ''}" required>
          </div>
          <div class="form-group">
            <label for="awayScore">Score extérieur</label>
            <input type="number" id="awayScore" name="awayScore" value="${result.awayScore || ''}" required>
          </div>
          <div class="form-group">
            <label for="date">Date</label>
            <input type="date" id="date" name="date" value="${result.date ? new Date(result.date).toISOString().split('T')[0] : ''}" required>
          </div>
          <div class="form-group">
            <label for="stadium">Stade</label>
            <input type="text" id="stadium" name="stadium" value="${result.stadium || ''}" required>
          </div>
          <div class="form-group">
            <label for="competition">Compétition</label>
            <input type="text" id="competition" name="competition" value="${result.competition || ''}" required>
          </div>
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    `;
    this.node.innerHTML = html;

    const form = document.getElementById('result-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        homeTeam: formData.get('homeTeam'),
        awayTeam: formData.get('awayTeam'),
        homeScore: parseInt(formData.get('homeScore')),
        awayScore: parseInt(formData.get('awayScore')),
        date: formData.get('date'),
        stadium: formData.get('stadium'),
        competition: formData.get('competition')
      };

      try {
        if (this.id) {
          await api.updateEntry('result', this.id, data);
        } else {
          await api.createEntry('result', data);
        }
        window.location.hash = '#/results';
      } catch (error) {
        alert('Erreur lors de l\'enregistrement: ' + error.message);
      }
    });
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class DataEditor {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchData.bind(this));
  }

  async fetchData() {
    return this.id ? api.getEntry('match', this.id) : null;
  }

  render() {
    this.dataFetcher.getData().then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error}</div>`;
      return;
    }

    const data = this.dataFetcher.data || {};
    const html = `
      <div class="data-editor">
        <h2>${this.id ? 'Modifier le match' : 'Nouveau match'}</h2>
        <form id="data-form">
          <div class="form-group">
            <label for="title">Titre</label>
            <input type="text" id="title" name="title" value="${data.title || ''}" required>
          </div>
          <div class="form-group">
            <label for="content">Contenu</label>
            <textarea id="content" name="content" rows="10" required>${data.content || ''}</textarea>
          </div>
          <div class="form-group">
            <label for="date">Date</label>
            <input type="date" id="date" name="date" value="${data.date ? new Date(data.date).toISOString().split('T')[0] : ''}" required>
          </div>
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    `;
    this.node.innerHTML = html;

    const form = document.getElementById('data-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        title: formData.get('title'),
        content: formData.get('content'),
        date: formData.get('date')
      };

      try {
        if (this.id) {
          await api.updateEntry('match', this.id, data);
        } else {
          await api.createEntry('match', data);
        }
        window.location.hash = '#/datas';
      } catch (error) {
        alert('Erreur lors de l\'enregistrement: ' + error.message);
      }
    });
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class App {
  constructor(node) {
    this.node = node;
    this.state = {
      currentRoute: '',
      currentView: null
    };
    this.init();
  }

  init() {
    this.initializeApp();
    this.setupEventListeners();
    this.handleRoute();
  }

  initializeApp() {
    const app = document.createElement('div');
    app.className = 'app';
    this.node.appendChild(app);
    
    const header = document.createElement('div');
    header.className = 'app_header';
    app.appendChild(header);
    
    const nav = document.createElement('ul');
    nav.className = 'app_nav';
    header.appendChild(nav);
    
    const menuItems = [
      { text: 'Posts', route: 'posts' },
      { text: 'Pages', route: 'pages' },
      { text: 'Équipes', route: 'teams' },
      { text: 'Stades', route: 'stades' },
      { text: 'Résultats', route: 'results' },
      { text: 'Matchs', route: 'datas' },
      { text: 'Paramètres', route: 'settings' },
      { text: 'À propos', route: 'about' }
    ];
    
    menuItems.forEach(item => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#/${item.route}`;
      a.textContent = item.text;
      li.appendChild(a);
      nav.appendChild(li);
    });
    
    const main = document.createElement('div');
    main.className = 'app_main';
    main.id = 'app_main';
    app.appendChild(main);
    
    this.main = main;
  }

  setupEventListeners() {
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  handleRoute() {
    const hash = window.location.hash.slice(1);
    console.log(hash.split('/'))
    const [bin,route, id] = hash.split('/');
    this.state.currentRoute = route;
    
    if (this.state.currentView) {
      this.state.currentView.destroy();
    }
    
    let view;
    switch (route) {
      case 'posts':
        view = new Posts(this.main);
        break;
      case 'post':
        if (id) {
          view = new PostEditor(this.main, id);
        } else {
          view = new PostEditor(this.main);
        }
        break;
      case 'post-edit':
        view = new PostEditor(this.main, id);
        break;
      case 'pages':
        view = new Pages(this.main);
        break;
      case 'page':
        if (id) {
          view = new Pageditor(this.main, id);
        } else {
          view = new PageEditor(this.main);
        }
        break;
      case 'page-edit':
        view = new PageEditor(this.main, id);
        break;
      case 'teams':
        view = new Teams(this.main);
        break;
      case 'team':
        if (id) {
          view = new TeamEditor(this.main, id);
        } else {
          view = new TeamEditor(this.main);
        }
        break;
      case 'team-edit':
        view = new TeamEditor(this.main, id);
        break;
      case 'stades':
        view = new Stades(this.main);
        break;
      case 'stade':
        if (id) {
          view = new StadeEditor(this.main, id);
        } else {
          view = new StadeEditor(this.main);
        }
        break;
      case 'stade-edit':
        view = new StadeEditor(this.main, id);
        break;
      case 'results':
        view = new Results(this.main);
        break;
      case 'result':
        if (id) {
          view = new ResultEditor(this.main, id);
        } else {
          view = new ResultEditor(this.main);
        }
        break;
      case 'result-edit':
        view = new ResultEditor(this.main, id);
        break;
      case 'datas':
        view = new Datas(this.main);
        break;
      case 'data':
        if (id) {
          view = new DataEditor(this.main, id);
        } else {
          view = new DataEditor(this.main);
        }
        break;
      case 'data-edit':
        view = new DataEditor(this.main, id);
        break;
      case 'settings':
        view = new Settings(this.main);
        break;
      case 'about':
        view = new About(this.main);
        break;
      default:
        view = new Posts(this.main);
    }
    
    this.state.currentView = view;
    view.render();
  }
}

// Initialisation de l'API
const url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/');
const rootPath = url.slice(0, url.indexOf('admin')).join('/');

api.init('rest', rootPath + '/admin/api');

// Ajout de CodeMirror dans le head
document.head.innerHTML += `
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/monokai.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/markdown/markdown.min.js"></script>
`;

// Création de la div et initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  new App(node);
});


