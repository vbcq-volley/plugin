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
    console.log(files)
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
        <div class="header-actions">
          <h2>Posts</h2>
          <button class="create-button" onclick="window.location.hash='#/post'">Créer un nouveau post</button>
        </div>
        <ul>
          ${posts.map(post => `
            <li>
              <a href="#/post/${post._id}">${post.title}</a>
              <div class="post-details">
                <span class="date">${this.formatDate(post.date)}</span>
                <span class="author">${post.author || 'Anonyme'}</span>
              </div>
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

  formatDate(date) {
    if (!date) return '';
    
    // Vérifier si la date est dans l'ancien format (JJ/MM/AAAA HH:mm)
    if (typeof date === 'string' && date.includes('/')) {
      const [datePart, timePart] = date.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      date = new Date(year, month - 1, day, hours, minutes);
    }
    
    const d = new Date(date);
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} à ${hours}:${minutes}`;
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
        <div class="header-actions">
          <h2>Équipes</h2>
          <button class="create-button" onclick="window.location.hash='#/team'">Créer une équipe</button>
        </div>
        <ul>
          ${teams.map(team => `
            <li>
              <a href="#/team/${team._id}">${team.teamName}</a>
              <div class="team-details">
                <span class="coach">Entraîneur: ${team.coach}</span>
                <span class="group">Groupe: ${team.group}</span>
              </div>
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
        <div class="header-actions">
          <h2>Stades</h2>
          <button class="create-button" onclick="window.location.hash='#/stade'">Créer un stade</button>
        </div>
        <ul>
          ${stades.map(stade => `
            <li>
              <a href="#/stade/${stade._id}">${stade.stadeName}</a>
              <span class="address">${stade.address}</span>
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
        <div class="header-actions">
          <h2>Résultats</h2>
          <button class="create-button" onclick="window.location.hash='#/result'">Créer un résultat</button>
        </div>
        <ul>
          ${results.map(result => `
            <li>
              <a href="#/result/${result._id}">
                ${result.team1} ${result.team1Score} - ${result.team2Score} ${result.team2}
              </a>
            
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
        <div class="header-actions">
          <h2>Matchs</h2>
          <button class="create-button" onclick="window.location.hash='#/data'">Créer un match</button>
        </div>
        <ul>
          ${datas.map(data => `
            <li>
              <a href="#/data/${data._id}">${data.title}</a>
              <span class="date">${this.formatDate(data.homeDate)}</span>
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

  formatDate(date) {
    if (!date) return '';
    
    // Vérifier si la date est dans l'ancien format (JJ/MM/AAAA HH:mm)
    if (typeof date === 'string' && date.includes('/')) {
      const [datePart, timePart] = date.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      date = new Date(year, month - 1, day, hours, minutes);
    }
    
    const d = new Date(date);
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} à ${hours}:${minutes}`;
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
    const fetchReadme = async (username, repo) => {
      try {
        const response = await fetch(`https://raw.githubusercontent.com/${username}/${repo}/master/README.md`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération du README');
        }
        const readmeContent = await response.text();
        return readmeContent;
      } catch (error) {
        console.error('Erreur:', error);
        return null;
      }
    };

    const renderReadme = async (username, repo) => {
      const readmeContent = await fetchReadme(username, repo);
      if (readmeContent) {
        this.node.innerHTML=marked.parse(readmeContent)
        return readmeContent;
      }
      return 'Impossible de charger le README';
    };
  renderReadme("vbcq-volley","temp")
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
        <div class="content">${post._content}</div>
        <div class="meta">
          <span class="date">${this.formatDate(post.date)}</span>
          <span class="author">${post.author || 'Anonyme'}</span>
        </div>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }

  formatDate(date) {
    if (!date) return '';
    
    // Vérifier si la date est dans l'ancien format (JJ/MM/AAAA HH:mm)
    if (typeof date === 'string' && date.includes('/')) {
      const [datePart, timePart] = date.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      date = new Date(year, month - 1, day, hours, minutes);
    }
    
    const d = new Date(date);
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} à ${hours}:${minutes}`;
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
          <p><strong>Date:</strong> ${this.formatDate(result.date)}</p>
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

  formatDate(date) {
    if (!date) return '';
    
    // Vérifier si la date est dans l'ancien format (JJ/MM/AAAA HH:mm)
    if (typeof date === 'string' && date.includes('/')) {
      const [datePart, timePart] = date.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      date = new Date(year, month - 1, day, hours, minutes);
    }
    
    const d = new Date(date);
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} à ${hours}:${minutes}`;
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
          <span class="date">${this.formatDate(data.date)}</span>
        </div>
      </div>
    `;
    this.node.innerHTML = html;
  }

  destroy() {
    this.node.innerHTML = '';
  }

  formatDate(date) {
    if (!date) return '';
    
    // Vérifier si la date est dans l'ancien format (JJ/MM/AAAA HH:mm)
    if (typeof date === 'string' && date.includes('/')) {
      const [datePart, timePart] = date.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hours, minutes] = timePart.split(':');
      date = new Date(year, month - 1, day, hours, minutes);
    }
    
    const d = new Date(date);
    const months = [
      'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
      'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} à ${hours}:${minutes}`;
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
            <textarea id="content" name="content" rows="10" required>${post._content || ''}</textarea>
          </div>
          <div id="description-preview" class="preview"></div>
          <div class="form-group">
            <label for="date">Date</label>
            <input type="date" id="date" name="date" value="${post.date ? new Date(post.date).toISOString().split('T')[0] : ''}">
          </div>
          <div class="form-group">
           
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
    const updatePreview = () => {
      const preview = document.getElementById('description-preview');
      const content = this.editor.getValue();
      preview.innerHTML = marked.parse(content);
    };

    this.editor.on('change', updatePreview);
    updatePreview();
    const form = document.getElementById('post-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        title: formData.get('title'),
        _content: this.editor.getValue(),
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
          <div id="description-preview" class="preview"></div>
          <div class="form-group">
           
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
    const updatePreview = () => {
      const preview = document.getElementById('description-preview');
      const content = this.editor.getValue();
      preview.innerHTML = marked.parse(content);
    };
   
    this.editor.on('change', updatePreview);
    updatePreview();
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
    this.editor = null;
    this.continueEditing = localStorage.getItem('continueEditing') === 'true';
    this.lastGroup = localStorage.getItem('lastGroup') || '';
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
            <input type="text" id="coach" name="coach" value="${team.coach || ''}" required>
          </div>
          <div class="form-group">
            <label for="coachContact">Contact de l'entraîneur</label>
            <input type="tel" id="coachContact" name="coachContact" value="${team.coachContact || ''}" required placeholder="06 XX XX XX XX">
          </div>
          <div class="form-group">
            <label for="coachEmail">Email de l'entraîneur</label>
            <input type="email" id="coachEmail" name="coachEmail" value="${team.coachEmail || ''}" required placeholder="coach@example.com">
          </div>
          <div class="form-group">
            <label for="group">Groupe</label>
            <select id="group" name="group" required>
              <option value="">Sélectionner un groupe</option>
              <option value="1" ${(team.group === '1' || (!team.group && this.lastGroup === '1')) ? 'selected' : ''}>Groupe 1</option>
              <option value="2" ${(team.group === '2' || (!team.group && this.lastGroup === '2')) ? 'selected' : ''}>Groupe 2</option>
              <option value="3" ${(team.group === '3' || (!team.group && this.lastGroup === '3')) ? 'selected' : ''}>Groupe 3</option>
            </select>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" rows="10">${team.description || ''}</textarea>
            <div id="description-preview" class="preview"></div>
          </div>
          <div class="form-group">
          <label for="continueEditing">
              <input type="checkbox" id="continueEditing" name="continueEditing" ${this.continueEditing ? 'checked' : ''}>
              Continuer l'édition
            </label>
          </div>
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    `;
    this.node.innerHTML = html;
    const continueEditingCheckbox = document.getElementById('continueEditing');
    const groupSelect = document.getElementById('group');

    // Ajout de l'écouteur pour le checkbox "Continuer l'édition"
    continueEditingCheckbox.addEventListener('change', (e) => {
      localStorage.setItem('continueEditing', e.target.checked);
      this.continueEditing = e.target.checked;
    });

    // Ajout de l'écouteur pour sauvegarder le groupe sélectionné
    // Ajout des écouteurs d'événements pour le filtrage
    groupSelect.addEventListener('change', () => this.updateTeamOptions());
    sessionInput.addEventListener('change', () => this.updateTeamOptions());
    team1Select.addEventListener('change', () => this.updateTeamOptions());

    // Initialisation du filtrage
    this.updateTeamOptions();

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        team1: formData.get('team1'),
        team2: formData.get('team2'),
        homeDate: this.formatDate(formData.get('homeDate')),
        awayDate: this.formatDate(formData.get('awayDate')),
        homeLocation: formData.get('homeLocation'),
        awayLocation: formData.get('awayLocation'),
        group: formData.get('group'),
        session: parseInt(formData.get('session')),
        matchStatus: formData.get('matchStatus'),
        title: `${formData.get('team1')} vs ${formData.get('team2')}`
      };

      try {
        if (this.id) {
          await api.updateEntry('match', this.id, data);
        } else {
          await api.createEntry('match', data);
        }
        if (!this.continueEditing) {
          window.location.hash = '#/datas';
        } else {
          window.location.reload();
        }
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

    // Ajout du bouton de gestion des images
    const imageButton = document.createElement('button');
    imageButton.className = 'image-manager-button';
    imageButton.innerHTML = '📷 Images';
    imageButton.onclick = () => this.showImageModal();
    header.appendChild(imageButton);
    
    const main = document.createElement('div');
    main.className = 'app_main';
    main.id = 'app_main';
    app.appendChild(main);
    
    this.main = main;

    // Création de la modale des images
    this.createImageModal();
  }

  createImageModal() {
    const modal = document.createElement('div');
    modal.className = 'image-modal';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="image-modal-content">
        <div class="image-modal-header">
          <h2>Gestionnaire d'images</h2>
          <button class="close-button">&times;</button>
        </div>
        <div class="image-modal-body">
          <div class="image-upload-section">
            <input type="file" id="image-upload" accept="image/*" multiple>
            <button id="upload-button">Uploader</button>
          </div>
          <div class="image-gallery"></div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    this.imageModal = modal;

    const closeButton = modal.querySelector('.close-button');
    closeButton.onclick = () => this.hideImageModal();

    const uploadButton = modal.querySelector('#upload-button');
    uploadButton.onclick = () => this.handleImageUpload();

    modal.onclick = (e) => {
      if (e.target === modal) {
        this.hideImageModal();
      }
    };
  }

  showImageModal() {
    this.imageModal.style.display = 'block';
    this.loadImages();
  }

  hideImageModal() {
    this.imageModal.style.display = 'none';
  }

  async loadImages() {
    try {
      const images = await api.getGallery();
      const gallery = this.imageModal.querySelector('.image-gallery');
      gallery.innerHTML = images.map(image => `
        <div class="image-item">
          <img src="/images/${image.name}" alt="${image.name}">
          <button onclick="navigator.clipboard.writeText('![${image.name}](/images/${image.name})')" class="copy-button">
            Copier le code Markdown
          </button>
        </div>
      `).join('');
    } catch (error) {
      console.error('Erreur lors du chargement des images:', error);
    }
  }

  async handleImageUpload() {
    const fileInput = this.imageModal.querySelector('#image-upload');
    const files = Array.from(fileInput.files);
    const uploadButton = this.imageModal.querySelector('#upload-button');

    if (files.length === 0) {
      alert('Veuillez sélectionner au moins une image');
      return;
    }

    uploadButton.disabled = true;
    uploadButton.textContent = 'Upload en cours...';

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const reader = new FileReader();
        
        const imageData = await new Promise((resolve, reject) => {
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        await api.uploadImage(imageData, file.name);
      }
      await this.loadImages();
    } catch (error) {
      alert('Erreur lors de l\'upload: ' + error.message);
    } finally {
      uploadButton.disabled = false;
      uploadButton.textContent = 'Uploader';
      fileInput.value = '';
    }
  }

  setupEventListeners() {
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  handleRoute() {
    const hash = window.location.hash.slice(1);
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
          view = new PageEditor(this.main, id);
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

// Ajout de CodeMirror et Marked dans le head
document.head.innerHTML += `
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/theme/monokai.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/codemirror.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/mode/markdown/markdown.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/matchbrackets.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/edit/closebrackets.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/selection/active-line.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.2/addon/display/placeholder.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
`;

// Initialisation de CodeMirror après le chargement des scripts
window.addEventListener('load', () => {
  window.addEventListener('load', () => {
    if (typeof Marked !== 'undefined') {
      Marked.setOptions({
        breaks: true,      // Permet les retours à la ligne avec un simple saut de ligne
        gfm: true,         // Active GitHub Flavored Markdown
        headerIds: true,   // Ajoute des IDs aux titres
        mangle: false      // Ne modifie pas les caractères spéciaux dans les IDs
      });
    }
  });
  if (typeof CodeMirror !== 'undefined') {
    // Configuration globale de CodeMirror
    CodeMirror.defaults = {
      mode: 'markdown',
      theme: 'monokai',
      lineNumbers: true,
      lineWrapping: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      styleActiveLine: true,
      extraKeys: {
        "Enter": "newlineAndIndentContinueMarkdownList"
      }
    };
  }
});

// Ajout des styles CSS pour la modale
document.head.innerHTML += `
  <style>
    .image-manager-button {
      position: absolute;
      right: 20px;
      top: 20px;
      padding: 8px 16px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    .image-modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
      z-index: 1000;
    }

    .image-modal-content {
      position: relative;
      background-color: #fefefe;
      margin: 5% auto;
      padding: 20px;
      width: 80%;
      max-width: 800px;
      border-radius: 8px;
    }

    .image-modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .close-button {
      font-size: 24px;
      font-weight: bold;
      background: none;
      border: none;
      cursor: pointer;
    }

    .image-gallery {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .image-item {
      position: relative;
      border: 1px solid #ddd;
      border-radius: 4px;
      overflow: hidden;
    }

    .image-item img {
      width: 100%;
      height: 150px;
      object-fit: cover;
    }

    .copy-button {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: rgba(0,0,0,0.7);
      color: white;
      border: none;
      padding: 8px;
      cursor: pointer;
    }

    .image-upload-section {
      margin-bottom: 20px;
    }
  </style>
`;

// Ajout des styles CSS pour l'éditeur Markdown
document.head.innerHTML += `
  <style>
    .preview {
      margin-top: 10px;
      padding: 15px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: #fff;
    }

    .CodeMirror {
      height: 300px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  </style>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
`;

// Ajout des styles CSS pour la barre de progression
document.head.innerHTML += `
  <style>
    .upload-progress {
      margin: 20px 0;
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .progress-bar {
      width: 100%;
      height: 20px;
      background-color: #ddd;
      border-radius: 10px;
      overflow: hidden;
    }

    .progress-fill {
      width: 0%;
      height: 100%;
      background-color: #4CAF50;
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: center;
      margin-top: 5px;
      font-size: 14px;
      color: #666;
    }
  </style>
`;

// Création de la div et initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  new App(node);
});


