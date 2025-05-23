var DataFetcher = require('./data-fetcher');
var api = require('./api');
var React = require('react/addons');
var _ = require('lodash');
var moment = require('moment');
var Editor_data = require('./editor-data');
var Data = React.createClass({
  mixins: [DataFetcher((params) => {
    console.log(params);
    return {
      params: params
      // Assuming you have an API call to fetch team data
       // You need to implement this function in your api module
    };
  })],

  getInitialState: function () {
    return {
      updated: moment(),
      team: [], // Initialize team data as null
      filteredEntries: [] // Initialize filtered entries as an empty array
    };
  },

  componentDidMount: function () {
    // Fetch the team data when the component is mounted
    this.fetchTeamData(this.props.params.matchId);
  },

  fetchTeamData: function (id) {
    console.log(id)
    // Assuming api.fetchTeamData returns a Promise
   api.getEntries("team").then((teams)=>{
    this.setState({team:teams.find(match => match._id === id)});
   })
   this.render()
  },

  filterEntriesWithAPI: function () {
    // Assuming the API has a getEntries method that filters the team data
    api.getEntries(this.state.team).then((filteredEntries) => {
      // Update the state with the filtered entries
      this.setState({ filteredEntries: filteredEntries });
    });
  },

  render: function () {
    if (!this.state.team) {
      return <div>Loading team data...</div>;
    }

    // Extract all keys from the team data
    

    return <Editor_data id={this.props.params.matchId} type="team" />;
  }
});

module.exports = Data;
