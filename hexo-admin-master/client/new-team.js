var React = require('react');
var PT = React.PropTypes;
var api = require('./api');

var NewTeam = React.createClass({
  propTypes: {
    onNew: PT.func
  },

  getInitialState: function () {
    return {
      showing: true,
      loading: true,
      text: 'Untitled',
      teamName: '',
      coach: '',
      group: ''
    }
  },

  componentDidMount: function () {
    // Fetch any necessary data for teams, if needed
  },

  componentDidUpdate: function (prevProps, prevState) {
    if (this.state.showing && !prevState.showing) {
      var node = this.refs.input.getDOMNode();
      node.focus();
      node.selectionStart = 0;
      node.selectionEnd = node.value.length;
    }
  },

  _onKeydown: function (e) {
    if (e.key === 'Enter') {
      this._onSubmit(e);
    }
  },

  _onShow: function () {
    this.setState({ showing: true });
  },

  _onBlur: function (e) {
    if (this.state.showing && !this._isClickInsideForm(e)) {
      this._onCancel();
    }
  },

  _isClickInsideForm: function (e) {
    var formNode = this.refs.form.getDOMNode();
    return formNode.contains(e.relatedTarget);
  },

  _onSubmit: function (e) {
    e.preventDefault();
    this.setState({ loading: true, showing: true });

    var teamData = {
      text: this.state.text,
      teamName: this.state.teamName,
      coach: this.state.coach,
      group: this.state.group
    };

    api.addEntry('team', teamData).then((team) => {
      this.setState({
        showing: true,
        text: 'Untitled',
        teamName: '',
        coach: '',
        group: ''
      });
      this.props.onNew(team);
    }, (err) => {
      console.error('Failed to create team', err);
    });
  },

  _onCancel: function () {
    this.setState({ showing: false });
  },

  _onChange: function (e) {
    this.setState({
      text: e.target.value
    });
  },

  _onTeamNameChange: function (e) {
    this.setState({
      teamName: e.target.value
    });
  },

  _onCoachChange: function (e) {
    this.setState({
      coach: e.target.value
    });
  },

  _onGroupChange: function (e) {
    this.setState({
      group: e.target.value
    });
  },

  render: function () {
    if (!this.state.showing) {
      return (
        <div className="new-team" onClick={this._onShow}>
          <div className="new-team_button">
            <i className="fa fa-plus" /> New Team
          </div>
        </div>
      );
    }

    return (
      <div className="new-team" ref="form">
        <input
          className="new-team_input"
          ref="input"
          value={this.state.text}
          onBlur={this._onBlur}
          onKeyPress={this._onKeydown}
          onChange={this._onChange}
        />

        <div>
          <label>
            Team Name:
            <input
              type="text"
              value={this.state.teamName}
              onChange={this._onTeamNameChange}
            />
          </label>
          <label>
            Coach:
            <input
              type="text"
              value={this.state.coach}
              onChange={this._onCoachChange}
            />
          </label>
          <label>
            Group:
            <select value={this.state.group} onChange={this._onGroupChange}>
              <option value="">Select a group</option>
              <option value="1">Group 1</option>
              <option value="2">Group 2</option>
              <option value="3">Group 3</option>
            </select>
          </label>
        </div>

        <i className="fa fa-check-circle new-team_ok" onMouseDown={this._onSubmit}></i>
        <i className="fa fa-times-circle new-team_cancel" onMouseDown={this._onCancel}></i>
      </div>
    );
  }
});

module.exports = NewTeam;
