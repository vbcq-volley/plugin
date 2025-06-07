/**
 * admin menu bar
 */
const router = require('./router');
class App {
  constructor() {
    this.init();
  }

  init() {
    const app = document.createElement('div');
    app.className = 'app';
    
    const header = document.createElement('div');
    header.className = 'app_header';
    
    const nav = document.createElement('ul');
    nav.className = 'app_nav';
    
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
    
    header.appendChild(nav);
    app.appendChild(header);
    
    const main = document.createElement('div');
    main.className = 'app_main';
    main.id=main.className
    app.appendChild(main);
    
    // Attendre que le DOM soit chargé
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(app);
      });
    } else {
      document.body.appendChild(app);
    }
    
    // Gestion du routage
    window.addEventListener('hashchange', this.handleRoute.bind(this));
    this.handleRoute(main);
  }
  
  handleRoute(div) {
    router.handleRoute(div);
  }
}

module.exports = new App();
