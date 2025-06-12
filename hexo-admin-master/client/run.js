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
    return this.getEntries('matches');
  }

  async getTournamentMatches() {
    return this.getEntries('tournament_matches');
  }

  async getTournamentMatch(id) {
    return this.getEntry('tournament_matches', id);
  }

  async createTournamentMatch(data) {
    return this.createEntry('tournament_matches', data);
  }

  async updateTournamentMatch(id, data) {
    return this.updateEntry('tournament_matches', id, data);
  }

  async deleteTournamentMatch(id) {
    return this.deleteEntry('tournament_matches', id);
  }

  async getTournamentResults() {
    return this.getEntries('tournament_results');
  }

  async getTournamentResult(id) {
    return this.getEntry('tournament_results', id);
  }

  async createTournamentResult(data) {
    return this.createEntry('tournament_results', data);
  }

  async updateTournamentResult(id, data) {
    return this.updateEntry('tournament_results', id, data);
  }

  async deleteTournamentResult(id) {
    return this.deleteEntry('tournament_results', id);
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

    const page = this.dataFetcher.data || {};
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
    groupSelect.addEventListener('change', (e) => {
      localStorage.setItem('lastGroup', e.target.value);
      this.lastGroup = e.target.value;
    });

    // Initialisation de CodeMirror
    this.editor = CodeMirror.fromTextArea(document.getElementById('description'), {
      mode: 'markdown',
      theme: 'monokai',
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true
    });

    // Mise à jour de la prévisualisation
    const updatePreview = () => {
      const preview = document.getElementById('description-preview');
      const content = this.editor.getValue();
      preview.innerHTML = marked.parse(content);
    };

    this.editor.on('change', updatePreview);
    updatePreview();

    const form = document.getElementById('team-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        teamName: formData.get('teamName'),
        coach: formData.get('coach'),
        coachContact: formData.get('coachContact'),
        coachEmail: formData.get('coachEmail'),
        group: formData.get('group'),
        description: this.editor.getValue()
      };

      try {
        if (this.id) {
          await api.updateEntry('team', this.id, data);
        } else {
          await api.createEntry('team', data);
        }
        if (!this.continueEditing) {
          window.location.hash = '#/teams';
        } else {
          window.location.reload();
        }
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

class StadeEditor {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchStade.bind(this));
    this.editor = null;
    this.continueEditing = localStorage.getItem('continueEditing') === 'true';
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
            <label for="stadeName">Nom du stade</label>
            <input type="text" id="stadeName" name="stadeName" value="${stade.stadeName || ''}" required>
          </div>
          <div class="form-group">
            <label for="address">Adresse</label>
            <input type="text" id="address" name="address" value="${stade.address || ''}" required>
          </div>
          <div class="form-group">
            <label for="description">Description</label>
            <textarea id="description" name="description" rows="10">${stade.description || ''}</textarea>
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

    // Ajout de l'écouteur pour le checkbox "Continuer l'édition"
    continueEditingCheckbox.addEventListener('change', (e) => {
      localStorage.setItem('continueEditing', e.target.checked);
      this.continueEditing = e.target.checked;
    });
    // Initialisation de CodeMirror
    this.editor = CodeMirror.fromTextArea(document.getElementById('description'), {
      mode: 'markdown',
      theme: 'monokai',
      lineNumbers: true,
      lineWrapping: true,
      autofocus: true
    });

    // Mise à jour de la prévisualisation
    const updatePreview = () => {
      const preview = document.getElementById('description-preview');
      const content = this.editor.getValue();
      preview.innerHTML = marked.parse(content);
    };

    this.editor.on('change', updatePreview);
    updatePreview();

    const form = document.getElementById('stade-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        stadeName: formData.get('stadeName'),
        address: formData.get('address'),
        description: this.editor.getValue()
      };

      try {
        if (this.id) {
          await api.updateEntry('stade', this.id, data);
        } else {
          await api.createEntry('stade', data);
        }
        if (!this.continueEditing) {
          window.location.hash = '#/stades';
        } else {
          window.location.reload();
        }
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

class ResultEditor {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchResult.bind(this));
    this.matchesFetcher = new DataFetcher(this.fetchMatches.bind(this));
    this.continueEditing = localStorage.getItem('continueEditing') === 'true';
  }

  async fetchResult() {
    return this.id ? api.getEntry('result', this.id) : null;
  }

  async fetchMatches() {
    return api.getEntries('match');
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

  parseDate(dateStr) {
    if (!dateStr) return null;
    const months = {
      'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
      'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    };
    
    const parts = dateStr.split(' ');
    const dayNum = parseInt(parts[0]);
    const monthNum = months[parts[1].toLowerCase()];
    const yearNum = parseInt(parts[2]);
    const time = parts[4].split(':');
    const hours = parseInt(time[0]);
    const minutes = parseInt(time[1]);
    
    return new Date(yearNum, monthNum, dayNum, hours, minutes).toISOString();
  }

  render() {
    Promise.all([
      this.dataFetcher.getData(),
      this.matchesFetcher.getData()
    ]).then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading || this.matchesFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error || this.matchesFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error || this.matchesFetcher.error}</div>`;
      return;
    }

    const result = this.dataFetcher.data || {};
    const matches = this.matchesFetcher.data || [];

    const html = `
      <div class="result-editor">
        <h2>${this.id ? 'Modifier le résultat' : 'Nouveau résultat'}</h2>
        <form id="result-form">
          <div class="form-group">
            <label for="matchId">Match</label>
            <select id="matchId" name="matchId" required>
              <option value="">Sélectionner un match</option>
              ${matches.map(match => `
                <option value="${match._id}" 
                  ${result.matchId === match._id ? 'selected' : ''}
                  data-team1="${match.team1}"
                  data-team2="${match.team2}"
                  data-home-date="${this.formatDate(match.homeDate)}"
                  data-away-date="${this.formatDate(match.awayDate)}"
                  data-group="${match.group}"
                  data-session="${match.session}">
                  ${match.team1} vs ${match.team2} (${this.formatDate(match.homeDate)})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="matchType">Type de match</label>
            <select id="matchType" name="matchType" required>
              <option value="home" ${result.matchType === 'home' ? 'selected' : ''}>Match à domicile</option>
              <option value="away" ${result.matchType === 'away' ? 'selected' : ''}>Match à l'extérieur</option>
            </select>
          </div>
          <div class="form-group">
            <label for="team1Score">Score équipe 1</label>
            <input type="number" id="team1Score" name="team1Score" value="${result.team1Score || ''}" required>
          </div>
          <div class="form-group">
            <label for="team2Score">Score équipe 2</label>
            <input type="number" id="team2Score" name="team2Score" value="${result.team2Score || ''}" required>
          </div>
          <div class="form-group">
            <label for="isForfeit">Forfait</label>
            <input type="checkbox" id="isForfeit" name="isForfeit" ${result.isForfeit ? 'checked' : ''}>
          </div>
          <div class="form-group" id="forfeitTeamGroup" style="display: ${result.isForfeit ? 'block' : 'none'}">
            <label for="forfeitTeam">Équipe en forfait</label>
            <input type="text" id="forfeitTeam" name="forfeitTeam" value="${result.forfeitTeam || ''}">
          </div>
          <div class="form-group">
            <label for="isPostponed">Reporté</label>
            <input type="checkbox" id="isPostponed" name="isPostponed" ${result.isPostponed ? 'checked' : ''}>
          </div>
          <div class="form-group" id="postponedTeamGroup" style="display: ${result.isPostponed ? 'block' : 'none'}">
            <label for="postponedTeam">Équipe reportée</label>
            <input type="text" id="postponedTeam" name="postponedTeam" value="${result.postponedTeam || ''}">
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

    // Ajout de l'écouteur pour le checkbox "Continuer l'édition"
    continueEditingCheckbox.addEventListener('change', (e) => {
      localStorage.setItem('continueEditing', e.target.checked);
      this.continueEditing = e.target.checked;
    });
    // Gestion de l'affichage des champs conditionnels
    const isForfeitCheckbox = document.getElementById('isForfeit');
    const forfeitTeamGroup = document.getElementById('forfeitTeamGroup');
    const isPostponedCheckbox = document.getElementById('isPostponed');
    const postponedTeamGroup = document.getElementById('postponedTeamGroup');
    const matchSelect = document.getElementById('matchId');

    isForfeitCheckbox.addEventListener('change', () => {
      forfeitTeamGroup.style.display = isForfeitCheckbox.checked ? 'block' : 'none';
    });

    isPostponedCheckbox.addEventListener('change', () => {
      postponedTeamGroup.style.display = isPostponedCheckbox.checked ? 'block' : 'none';
    });

    // Mise à jour des équipes et dates en fonction du match sélectionné
    matchSelect.addEventListener('change', () => {
      const selectedOption = matchSelect.options[matchSelect.selectedIndex];
      if (selectedOption.value) {
        const team1 = selectedOption.dataset.team1;
        const team2 = selectedOption.dataset.team2;
        const homeDate = selectedOption.dataset.homeDate;
        const awayDate = selectedOption.dataset.awayDate;
        const group = selectedOption.dataset.group;
        const session = selectedOption.dataset.session;

        // Mise à jour des champs cachés
        const form = document.getElementById('result-form');
        form.dataset.team1 = team1;
        form.dataset.team2 = team2;
        form.dataset.homeDate = homeDate;
        form.dataset.awayDate = awayDate;
        form.dataset.group = group;
        form.dataset.session = session;
      }
    });

    const form = document.getElementById('result-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const matchType = formData.get('matchType');
      const selectedMatch = matches.find(m => m._id === formData.get('matchId'));
      
      const data = {
        matchType,
        team1: selectedMatch.team1,
        team2: selectedMatch.team2,
        team1Score: formData.get('team1Score'),
        team2Score: formData.get('team2Score'),
        isForfeit: formData.get('isForfeit') === 'on',
        forfeitTeam: formData.get('forfeitTeam'),
        isPostponed: formData.get('isPostponed') === 'on',
        postponedTeam: formData.get('postponedTeam'),
        matchId: formData.get('matchId'),
        group: selectedMatch.group,
        session: parseInt(selectedMatch.session),
        date: matchType === 'home' ? selectedMatch.homeDate : selectedMatch.awayDate
      };

      try {
        if (this.id) {
          await api.updateEntry('result', this.id, data);
        } else {
          await api.createEntry('result', data);
        }
        if (!this.continueEditing) {
          window.location.hash = '#/results';
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

class DataEditor {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.dataFetcher = new DataFetcher(this.fetchData.bind(this));
    this.teamsFetcher = new DataFetcher(this.fetchTeams.bind(this));
    this.stadesFetcher = new DataFetcher(this.fetchStades.bind(this));
    this.matchesFetcher = new DataFetcher(this.fetchMatches.bind(this));
    this.continueEditing = localStorage.getItem('continueEditing') === 'true';
  }

  async fetchData() {
    return this.id ? api.getEntry('match', this.id) : null;
  }

  async fetchTeams() {
    return api.getEntries('team');
  }

  async fetchStades() {
    return api.getEntries('stade');
  }

  async fetchMatches() {
    return api.getEntries('match');
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

  parseDate(dateStr) {
    if (!dateStr) return null;
    const months = {
      'janvier': 0, 'février': 1, 'mars': 2, 'avril': 3, 'mai': 4, 'juin': 5,
      'juillet': 6, 'août': 7, 'septembre': 8, 'octobre': 9, 'novembre': 10, 'décembre': 11
    };
    
    const parts = dateStr.split(' ');
    const dayNum = parseInt(parts[0]);
    const monthNum = months[parts[1].toLowerCase()];
    const yearNum = parseInt(parts[2]);
    const time = parts[4].split(':');
    const hours = parseInt(time[0]);
    const minutes = parseInt(time[1]);
    
    return new Date(yearNum, monthNum, dayNum, hours, minutes).toISOString();
  }

  isTeamAvailable(teamName, session=1, currentMatchId = null) {
    return !this.matchesFetcher.data.some(match => 
      match._id !== currentMatchId && 
      match.session === session && 
      (match.team1 === teamName || match.team2 === teamName)
    );
  }

  updateTeamOptions() {
    const groupSelect = document.getElementById('group');
    const sessionInput = document.getElementById('session');
    const team1Select = document.getElementById('team1');
    const team2Select = document.getElementById('team2');

    const selectedGroup = groupSelect.value;
    const session = parseInt(sessionInput.value);
    const currentMatchId = this.id;

    // Mise à jour des options pour team1
    Array.from(team1Select.options).forEach(option => {
      if (option.value === '') return;
      const teamGroup = option.dataset.group;
      const teamName = option.dataset.team;
      const isAvailable = this.isTeamAvailable(teamName, session, currentMatchId);
      
      if (teamGroup === selectedGroup && isAvailable) {
        option.style.display = '';
        option.disabled = false;
      } else {
        option.style.display = 'none';
        option.disabled = true;
      }
    });

    // Mise à jour des options pour team2
    Array.from(team2Select.options).forEach(option => {
      if (option.value === '') return;
      const teamGroup = option.dataset.group;
      const teamName = option.dataset.team;
      const isAvailable = this.isTeamAvailable(teamName, session, currentMatchId);
      
      if (teamGroup === selectedGroup && isAvailable && teamName !== team1Select.value) {
        option.style.display = '';
        option.disabled = false;
      } else {
        option.style.display = 'none';
        option.disabled = true;
      }
    });
  }

  render() {
    Promise.all([
      this.dataFetcher.getData(),
      this.teamsFetcher.getData(),
      this.stadesFetcher.getData(),
      this.matchesFetcher.getData()
    ]).then(() => this.updateView());
  }

  updateView() {
    if (this.dataFetcher.loading || this.teamsFetcher.loading || this.stadesFetcher.loading || this.matchesFetcher.loading) {
      this.node.innerHTML = '<div class="loading">Chargement...</div>';
      return;
    }

    if (this.dataFetcher.error || this.teamsFetcher.error || this.stadesFetcher.error || this.matchesFetcher.error) {
      this.node.innerHTML = `<div class="error">${this.dataFetcher.error || this.teamsFetcher.error || this.stadesFetcher.error || this.matchesFetcher.error}</div>`;
      return;
    }

    const data = this.dataFetcher.data || {};
    const teams = this.teamsFetcher.data || [];
    const stades = this.stadesFetcher.data || [];
    const matches = this.matchesFetcher.data || [];

    const html = `
      <div class="data-editor">
        <h2>${this.id ? 'Modifier le match' : 'Nouveau match'}</h2>
        <form id="data-form">
          <div class="form-group">
            <label for="group">Groupe</label>
            <select id="group" name="group" required>
              <option value="">Sélectionner un groupe</option>
              <option value="1" ${data.group === '1' ? 'selected' : ''}>Groupe 1</option>
              <option value="2" ${data.group === '2' ? 'selected' : ''}>Groupe 2</option>
              <option value="3" ${data.group === '3' ? 'selected' : ''}>Groupe 3</option>
            </select>
          </div>
          <div class="form-group">
            <label for="session">Session</label>
            <input type="number" id="session" name="session" value="${data.session || ''}" required>
          </div>
          <div class="form-group">
            <label for="team1">Équipe 1</label>
            <select id="team1" name="team1" required>
              <option value="">Sélectionner une équipe</option>
              ${teams.map(team => `
                <option value="${team.teamName}" 
                  ${data.team1 === team.teamName ? 'selected' : ''}
                  data-group="${team.group}"
                  class="team-option"
                  data-team="${team.teamName}">
                  ${team.teamName} (${team.coach})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="team2">Équipe 2</label>
            <select id="team2" name="team2" required>
              <option value="">Sélectionner une équipe</option>
              ${teams.map(team => `
                <option value="${team.teamName}" 
                  ${data.team2 === team.teamName ? 'selected' : ''}
                  data-group="${team.group}"
                  class="team-option"
                  data-team="${team.teamName}">
                  ${team.teamName} (${team.coach})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="homeDate">Date du match à domicile</label>
            <input type="datetime-local" id="homeDate" name="homeDate" value="${this.parseDate(data.homeDate) || ''}" required>
          </div>
          <div class="form-group">
            <label for="awayDate">Date du match à l'extérieur</label>
            <input type="datetime-local" id="awayDate" name="awayDate" value="${this.parseDate(data.awayDate) || ''}" required>
          </div>
          <div class="form-group">
            <label for="homeLocation">Lieu du match à domicile</label>
            <select id="homeLocation" name="homeLocation" required>
              <option value="">Sélectionner un stade</option>
              ${stades.map(stade => `
                <option value="${stade.stadeName}" 
                  ${data.homeLocation === stade.stadeName ? 'selected' : ''}>
                  ${stade.stadeName} (${stade.address})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="awayLocation">Lieu du match à l'extérieur</label>
            <select id="awayLocation" name="awayLocation" required>
              <option value="">Sélectionner un stade</option>
              ${stades.map(stade => `
                <option value="${stade.stadeName}" 
                  ${data.awayLocation === stade.stadeName ? 'selected' : ''}>
                  ${stade.stadeName} (${stade.address})
                </option>
              `).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="matchStatus">Statut du match</label>
            <select id="matchStatus" name="matchStatus">
              <option value="scheduled" ${data.matchStatus === 'scheduled' ? 'selected' : ''}>Planifié</option>
              <option value="in_progress" ${data.matchStatus === 'in_progress' ? 'selected' : ''}>En cours</option>
              <option value="completed" ${data.matchStatus === 'completed' ? 'selected' : ''}>Terminé</option>
              <option value="cancelled" ${data.matchStatus === 'cancelled' ? 'selected' : ''}>Annulé</option>
            </select>
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

    const form = document.getElementById('data-form');
    const groupSelect = document.getElementById('group');
    const sessionInput = document.getElementById('session');
    const team1Select = document.getElementById('team1');
    const continueEditingCheckbox = document.getElementById('continueEditing');

    // Ajout de l'écouteur pour le checkbox "Continuer l'édition"
    continueEditingCheckbox.addEventListener('change', (e) => {
      localStorage.setItem('continueEditing', e.target.checked);
      this.continueEditing = e.target.checked;
    });

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

class TournamentMatch {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.data = null;
    this.teams = [];
    this.tournamentTeams = [];
  }

  async fetchMatch() {
    if(this.id){
      this.data = await api.getEntry('tournament_matches', this.id);
    }
    
    await this.fetchTeams();
    await this.fetchTournamentTeams();
  }

  async fetchTeams() {
    this.teams = await api.getEntries('team');
  }

  async fetchTournamentTeams() {
    const matches = await api.getTournamentMatches();
    this.tournamentTeams = matches
      .filter(match => match._id !== this.id && match.winner)
      .map(match => ({
        id: `winner_${match._id}`,
        teamName: match.winner
      }));
  }

  render() {
    this.node.innerHTML = this.template();
    this.fetchMatch().then((data)=>{
      this.updateView();
    })
    
  }

  updateView() {

    //if (!this.data) return;

    const form = this.node.querySelector('form');
    const team1Select = form.querySelector('[name="team1"]');
    const team2Select = form.querySelector('[name="team2"]');
    var teamOptions=[]
    // Remplir les options des équipes
    const allTeams = [...this.teams, ...this.tournamentTeams]; 
    if(this.data){
       teamOptions = allTeams.map(team => 
        `<option value="${team._id}" ${this.data.team1 === team._id ? 'selected' : ''}>${team.teamName}</option>`
      ).join('');
    }else{
       teamOptions = allTeams.map(team => 
        `<option value="${team._id}"  ''>${team.teamName}</option>`
      ).join('');
    }
    
    console.log(allTeams)
    team1Select.innerHTML = '<option value="">Sélectionner une équipe</option>' + teamOptions;
    team2Select.innerHTML = '<option value="">Sélectionner une équipe</option>' + teamOptions;

    // Si on modifie un match existant, pré-remplir les champs
    if (this.data) {
      form.querySelector('[name="matchDate"]').value = this.data.matchDate;
      form.querySelector('[name="round"]').value = this.data.round;
    }

    // Ajouter l'écouteur d'événement pour le bouton de suppression
    const deleteButton = form.querySelector('#deleteMatch');
    if (deleteButton) {
      deleteButton.addEventListener('click', () => this.deleteMatch());
    }

    // Gérer la soumission du formulaire
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        team1: formData.get('team1'),
        team2: formData.get('team2'),
        matchDate: formData.get('matchDate'),
        round: formData.get('round'),
        team1Name: allTeams.find(t => t._id === formData.get('team1'))?.teamName,
        team2Name: allTeams.find(t => t._id === formData.get('team2'))?.teamName
      };

      try {
        if (this.id) {
          await api.updateTournamentMatch(this.id, data);
        } else {
          await api.createTournamentMatch(data);
        }
        window.location.hash = '#/tournament-matches';
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement du match:', error);
        alert('Une erreur est survenue lors de l\'enregistrement du match');
      }
    });
  }

  template() {
    return `
      <div class="tournament-match-editor">
        <h2>${this.id ? 'Modifier le match' : 'Nouveau match'}</h2>
        <form>
          <div class="form-group">
            <label>Équipe 1</label>
            <select name="team1" required>
              <option value="">Sélectionner une équipe</option>
            </select>
          </div>
          <div class="form-group">
            <label>Équipe 2</label>
            <select name="team2" required>
              <option value="">Sélectionner une équipe</option>
            </select>
          </div>
          <div class="form-group">
            <label>Date du match</label>
            <input type="datetime-local" name="matchDate" required>
          </div>
          <div class="form-group">
            <label>Tour</label>
            <select name="round" required>
              <option value="preliminary">Préliminaire</option>
              <option value="quarter">Quart de finale</option>
              <option value="semi">Demi-finale</option>
              <option value="final">Finale</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Enregistrer</button>
            ${this.id ? '<button type="button" class="btn btn-danger" id="deleteMatch">Supprimer</button>' : ''}
            <a href="#/tournament-matches" class="btn btn-secondary">Annuler</a>
          </div>
        </form>
      </div>
    `;
  }

  destroy() {
    this.node.innerHTML = '';
  }

  async deleteMatch() {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) {
      try {
        await api.deleteTournamentMatch(this.id);
        window.location.hash = '#/tournament-matches';
      } catch (error) {
        console.error('Erreur lors de la suppression du match:', error);
        alert('Une erreur est survenue lors de la suppression du match');
      }
    }
  }
}

class TournamentResult {
  constructor(node, id = null) {
    this.node = node;
    this.id = id;
    this.data = null;
    this.match = null;
  }

  async fetchResult() {
    this.data = await api.getEntry('tournament_results', this.id);
    if (this.data) {
      await this.fetchMatch();
    }
  }

  async fetchMatch() {
    this.match = await api.getEntry('tournament_matches', this.data.matchId);
  }

  render() {
    this.node.innerHTML = this.template();
    
    this.updateView();
  }

  updateView() {
    if (!this.data) return;

    const form = this.node.querySelector('form');
    const matchSelect = form.querySelector('[name="matchId"]');

    // Charger les matchs disponibles
    this.loadMatches(matchSelect);

    // Si on modifie un résultat existant, pré-remplir les champs
    if (this.data) {
      matchSelect.value = this.data.matchId;
      form.querySelector('[name="score1"]').value = this.data.score1;
      form.querySelector('[name="score2"]').value = this.data.score2;
      form.querySelector('[name="stats"]').value = this.data.stats || '';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
      const data = {
        matchId: formData.get('matchId'),
        score1: parseInt(formData.get('score1')),
        score2: parseInt(formData.get('score2')),
        stats: formData.get('stats')
      };

      // Déterminer le gagnant
      const score1 = parseInt(formData.get('score1'));
      const score2 = parseInt(formData.get('score2'));
      let winner = null;
      if (score1 > score2) {
        winner = this.match.team1Name;
      } else if (score2 > score1) {
        winner = this.match.team2Name;
      }

      try {
        // Mettre à jour le résultat
        if (this.id) {
          await api.updateEntry('tournament_results', this.id, data);
        } else {
          await api.createEntry('tournament_results', data);
        }

        // Mettre à jour le match avec le gagnant
        if (winner) {
          await api.updateEntry('tournament_matches', data.matchId, {
            ...this.match,
            winner: winner
          });
        }

        window.location.hash = '#/tournament-results';
      } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
      }
    });
  }

  async loadMatches(select) {
    try {
      const matches = await api.getTournamentMatches();
      const options = matches
        .filter(match => !match.winner || match.id === this.data?.matchId)
        .map(match => `
          <option value="${match.id}" ${this.data?.matchId === match.id ? 'selected' : ''}>
            ${match.team1Name} vs ${match.team2Name} (${match.round})
          </option>
        `).join('');
      
      select.innerHTML = '<option value="">Sélectionner un match</option>' + options;
    } catch (error) {
      console.error('Erreur lors du chargement des matchs:', error);
    }
  }

  template() {
    return `
      <div class="tournament-result-editor">
        <h2>${this.id ? 'Modifier le résultat' : 'Nouveau résultat de tournoi'}</h2>
        <form>
          <div class="form-group">
            <label>Match</label>
            <select name="matchId" required>
              <option value="">Sélectionner un match</option>
            </select>
          </div>
          <div class="form-group">
            <label>Score Équipe 1</label>
            <input type="number" name="score1" min="0" required>
          </div>
          <div class="form-group">
            <label>Score Équipe 2</label>
            <input type="number" name="score2" min="0" required>
          </div>
          <div class="form-group">
            <label>Statistiques</label>
            <textarea name="stats" rows="4"></textarea>
          </div>
          <button type="submit">Enregistrer</button>
        </form>
      </div>
    `;
  }

  destroy() {
    this.node.innerHTML = '';
  }
}

class TournamentMatches {
  constructor(node) {
    this.node = node;
    this.data = null;
  }

  async fetchMatches() {
    this.data = await api.getTournamentMatches();
  }

  render() {
    this.node.innerHTML = this.template();
    this.fetchMatches().then(()=>{
      this.updateView();
    })
    
  }

  updateView() {
    console.log(this.data)
    if (!this.data) return;

    const tbody = this.node.querySelector('tbody');
    tbody.innerHTML = this.data.map(match => `
      <tr> 
        <td>${match.team1Name}</td>
        <td>${match.team2Name}</td>
        <td>${this.formatDate(match.matchDate)}</td>
        <td>${match.round}</td>
        <td>
          <a href="#/tournament-match/${match._id}" class="btn btn-primary">Modifier</a>
          <button class="btn btn-danger" onclick="deleteMatch('${match._id}')">Supprimer</button>
        </td>
      </tr>
    `).join('');
  }

  template() {
    return `
      <div class="tournament-matches">
        <h2>Matchs de Tournoi</h2>
        <div class="actions">
          <a href="#/tournament-match" class="btn btn-success">Nouveau Match</a>

        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Équipe 1</th>
              <th>Équipe 2</th>
              <th>Date</th>
              <th>Tour</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;
  }

  destroy() {
    this.node.innerHTML = '';
  }

  formatDate(date) {
    return new Date(date).toLocaleString('fr-FR');
  }
}

class TournamentResults {
  constructor(node) {
    this.node = node;
    this.data = null;
  }

  async fetchResults() {
    this.data = await api.getTournamentResults();
  }

  render() {
    this.node.innerHTML = this.template();
    this.updateView();
  }

  updateView() {
    if (!this.data) return;

    const tbody = this.node.querySelector('tbody');
    tbody.innerHTML = this.data.map(result => `
      <tr>
        <td>${result.matchId}</td>
        <td>${result.score1}</td>
        <td>${result.score2}</td>
        <td>
          <a href="#/tournament-result/${result.id}" class="btn btn-primary">Modifier</a>
          <button class="btn btn-danger" onclick="deleteResult('${result.id}')">Supprimer</button>
        </td>
      </tr>
    `).join('');
  }

  template() { 
    return `
      <div class="tournament-results">
        <h2>Résultats de Tournoi</h2>
        <div class="actions">
          <a href="#/tournament-result" class="btn btn-success">Nouveau Résultat</a>
      
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Match</th>
              <th>Score Équipe 1</th>
              <th>Score Équipe 2</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody></tbody>
        </table>
      </div>
    `;
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
      { text: 'Matchs Tournoi', route: 'tournament-matches' },
      { text: 'Résultats Tournoi', route: 'tournament-results' },
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
      case 'settings':
        view = new Settings(this.main);
        break;
      case 'about':
        view = new About(this.main);
        break;
      case 'tournament-matches':
        view = new TournamentMatches(this.main);
        break;
      case 'tournament-match':
        if (id) {
          view = new TournamentMatch(this.main, id);
        } else {
          view = new TournamentMatch(this.main);
        }
        break;
      case 'tournament-results':
        view = new TournamentResults(this.main);
        break;
      case 'tournament-result':
        if (id) {
          view = new TournamentResult(this.main, id);
        } else {
          view = new TournamentResult(this.main);
        }
        break;
      default:
        view = new Posts(this.main);
    }

    if (this.currentView) {
      this.currentView.destroy();
    }
    this.currentView = view;
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

// Ajout des styles CSS pour les boutons d'action
document.head.innerHTML += `
  <style>
    .actions {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    .btn-info {
      background-color: #17a2b8;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      text-decoration: none;
    }
    .btn-info:hover {
      background-color: #138496;
    }
  </style>
`;

// Création de la div et initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
  const node = document.createElement('div');
  document.body.appendChild(node);
  new App(node);
});


