var DataFetcher = require('./data-fetcher');
var api = require('./api');
var _ = require('lodash');
var moment = require('moment');
var Editor_data = require('./editor-data');

class Stade {
  constructor(params) {
    this.params = params;
    this.state = {
      updated: moment(),
      stade: [],
      filteredEntries: []
    };
    this.init();
  }

  async init() {
    await this.fetchStadeData(this.params.matchId);
  }

  async fetchStadeData(id) {
    console.log(id);
    const stades = await api.getEntries("stade");
    this.state.stade = stades.find(match => match._id === id);
    this.render();
  }

  async filterEntriesWithAPI() {
    const filteredEntries = await api.getEntries(this.state.stade);
    this.state.filteredEntries = filteredEntries;
    this.render();
  }

  render() {
    if (!this.state.stade) {
      return document.createElement('div').textContent = 'Loading stade data...';
    }

    const editor = new Editor_data(this.params.matchId, "stade");
    return editor.render();
  }
}

module.exports = Stade; 