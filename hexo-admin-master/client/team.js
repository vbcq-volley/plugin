var DataFetcher = require('./data-fetcher');
var api = require('./api');
var _ = require('lodash');
var moment = require('moment');
var Editor_data = require('./editor-data');

class Team {
  constructor(params) {
    this.params = params;
    this.state = {
      updated: moment(),
      team: [],
      filteredEntries: []
    };
    this.init();
  }

  async init() {
    await this.fetchTeamData(this.params.matchId);
  }

  async fetchTeamData(id) {
    console.log(id);
    const teams = await api.getEntries("team");
    this.state.team = teams.find(match => match._id === id);
    this.render();
  }

  async filterEntriesWithAPI() {
    const filteredEntries = await api.getEntries(this.state.team);
    this.state.filteredEntries = filteredEntries;
    this.render();
  }

  render() {
    if (!this.state.team) {
      return document.createElement('div').textContent = 'Loading team data...';
    }

    const editor = new Editor_data(this.params.matchId, "team");
    return editor.render();
  }
}

module.exports = Team;
