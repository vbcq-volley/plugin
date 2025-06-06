const App = require('./app');
const Post = require('./post');
const Posts = require('./posts');
const Page = require('./page');
const Pages = require('./pages');
const About = require('./about');
const Deploy = require('./deploy');
const Settings = require('./settings');
const AuthSetup = require('./auth-setup');
const datas = require("./datas");
const data = require("./data");
const team = require("./team");
const teams = require("./teams");
const stade = require("./stade");
const stades = require("./stades");
const result = require("./result");
const results = require("./results");

class Router {
  constructor() {
    this.routes = {
      'posts': Posts,
      'post': Post,
      'page': Page,
      'pages': Pages,
      'datas': datas,
      'data': data,
      'teams': teams,
      'team': team,
      'stades': stades,
      'stade': stade,
      'results': results,
      'result': result,
      'about': About,
      'deploy': Deploy,
      'settings': Settings,
      'auth-setup': AuthSetup
    };
    
    this.params = {};
  }

  init() {
    window.addEventListener('hashchange', this.handleRoute.bind(this));
    this.handleRoute();
  }

  handleRoute() {
    const hash = window.location.hash.slice(2);
    const [route, ...params] = hash.split('/');
    
    const handler = this.routes[route] || Posts;
    this.params = params;
    
    const main = document.querySelector('.app_main');
    main.innerHTML = '';
    
    if (typeof handler === 'function') {
      const instance = new handler();
      if (typeof instance.render === 'function') {
        main.appendChild(instance.render());
      }
    }
  }

  getParams() {
    return this.params;
  }
}

module.exports = new Router();
