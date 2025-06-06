var DataFetcher = require('./data-fetcher');
var api = require('./api');
var Editor_data = require('./editor-data');
var _ = require('lodash');
var moment = require('moment');

class Data {
  constructor(params) {
    this.params = params;
    this.state = {
      updated: moment()
    };
    this.element = null;
    this.dataFetcher = new DataFetcher((params) => {
      console.log(params);
      console.log();
      return {
        params: params
      };
    });
  }

  render() {
    if (this.element) {
      return this.element;
    }

    const editor = new Editor_data();
    editor.id = this.params.matchId;
    editor.type = "match";
    
    this.element = editor.render();
    return this.element;
  }
}

module.exports = Data;
