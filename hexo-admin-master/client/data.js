var DataFetcher = require('./data-fetcher');
var api = require('./api');
var React = require('react/addons')
var Editor_data = require('./editor-data')
var _ = require('lodash')
var moment = require('moment')

var Data = React.createClass({
  mixins: [DataFetcher((params) => {
    console.log(params)
    console.log()
    return {
      params:params,
      
      //tagsCategoriesAndMetadata: api.tagsCategoriesAndMetadata()
    }
  })],

  getInitialState: function () {
    return {
      updated: moment()
    }
  },

  componentDidMount: function () {
    
  },

  render: function () {
    return <Editor_data id={this.props.params.matchId} type="result" />
  }
});

module.exports = Data;
