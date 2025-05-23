var React = require('react');
var PT = React.PropTypes;
var api = require('./api');

var NewData = React.createClass({
  propTypes: {
    onNew: PT.func
  },

  getInitialState: function () {
    return {
      showing: false,
      loading: true,
      text: 'Untitled',
      pageType: 'match',
      team1: '',
      team2: '',
      homeDateTime: '',
      awayDateTime: '',
      homeLocation: '',
      awayLocation: '',
      group: '',
      team1Score: '',
      team2Score: '',
      isForfeit: false,
      isPostponed: false,
      matches: [],
      team:[],
      selectedMatch: null,
      matchType: 'home',
      team1Forfeit: false,
      team2Forfeit: false,
      team1Postponed: false,
      team2Postponed: false,
      session: 0
    }
  },

  componentDidMount: function () {
    api.getEntries("match").then((matches) => {
      console.log(matches);
      this.setState({ matches: matches });
    });
    api.getEntries("team").then((team)=>{
      this.setState({ team: team });
    })
    this.render()
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
    this.setState({ loading: true, showing: false });

    const formatDate = (dateTimeString) => {
      console.log(dateTimeString)
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    var pageData = {
      text: this.state.text,
      type: this.state.pageType,
      session: parseInt(this.state.session)
    };
    console.log(this.state)
    if (this.state.pageType === 'match') {
      pageData.team1 = this.state.team1;
      pageData.team2 = this.state.team2;
      pageData.homeDate = formatDate(this.state.homeDateTime);
      pageData.awayDate = formatDate(this.state.awayDateTime);
      pageData.homeLocation = this.state.homeLocation;
      pageData.awayLocation = this.state.awayLocation;
      pageData.group = this.state.group;
    } else if (this.state.pageType === 'result') {
      pageData.team1 = this.state.team1;
      pageData.team2 = this.state.team2;
      pageData.group = this.state.group;
      pageData.date = this.state.matchType === 'home' ? this.state.homeDate : this.state.awayDate;
      pageData.team1Score = this.state.isForfeit ? 'Forfait' : this.state.team1Score;
      pageData.team2Score = this.state.isForfeit ? 'Forfait' : this.state.team2Score;
      pageData.isPostponed = this.state.isPostponed;
    }

    api.addEntry(pageData.type,pageData).then((page) => {
      this.setState({
        showing: false,
        text: 'Untitled',
        pageType: 'match',
        team1: '',
        team2: '',
        homeDateTime: '',
        awayDateTime: '',
        homeLocation: '',
        awayLocation: '',
        group: '',
        team1Score: '',
        team2Score: '',
        isForfeit: false,
        isPostponed: false,
        selectedMatch: null,
        matchType: 'home',
        session: 0
      });
      this.props.onNew(page);
    }, (err) => {
      console.error('Failed! to make page', err);
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

  _onPageTypeChange: function (e) {
    this.setState({
      pageType: e.target.value
    });
  },

  _onTeam1Change: function (e) {
    this.setState({
      team1: e.target.value
    });
  },

  _onTeam2Change: function (e) {
    this.setState({
      team2: e.target.value
    });
  },

  _onHomeDateTimeChange: function (e) {
    this.setState({
      homeDateTime: e.target.value
    });
  },

  _onAwayDateTimeChange: function (e) {
    this.setState({
      awayDateTime: e.target.value
    });
  },

  _onHomeLocationChange: function (e) {
    this.setState({
      homeLocation: e.target.value
    });
  },

  _onAwayLocationChange: function (e) {
    this.setState({
      awayLocation: e.target.value
    });
  },

  _onGroupChange: function (e) {
    this.setState({
      group: e.target.value
    });
  },

  _onTeam1ScoreChange: function (e) {
    this.setState({
      team1Score: e.target.value
    });
  },

  _onTeam2ScoreChange: function (e) {
    this.setState({
      team2Score: e.target.value
    });
  },

  _onForfeitChange: function (e) {
    this.setState({
      isForfeit: e.target.checked
    });
  },

  _onPostponedChange: function (e) {
    this.setState({
      isPostponed: e.target.checked
    });
  },

  _onMatchTypeChange: function (e) {
    this.setState({
      matchType: e.target.value
    });
  },

  _onSessionChange: function (e) {
    this.setState({
      session: parseInt(e.target.value)
    });
  },

  _onMatchSelect: function (e) {
    const selectedMatchId = e.target.value;
    const selectedMatch = this.state.matches.find(match => match._id === selectedMatchId);
    this.setState({ selectedMatch: selectedMatch });

    if (selectedMatch) {
      this.setState({
        team1: selectedMatch.team1,
        team2: selectedMatch.team2,
        homeDateTime: selectedMatch.homeDate,
        awayDateTime: selectedMatch.awayDate,
        homeLocation: selectedMatch.homeLocation,
        awayLocation: selectedMatch.awayLocation,
        group: selectedMatch.group,
        session: selectedMatch.session
      });
    }
  },

render: function () {
  if (!this.state.showing) {
    return (
      <div className="new-post" onClick={this._onShow}>
        <div className="new-post_button">
          <i className="fa fa-plus" />{' '}
          nouveau match
        </div>
      </div>
    );
  }

  return (
    <div className="new-post" ref="form">
      <input
        className="new-post_input"
        ref="input"
        value={this.state.text}
        onBlur={this._onBlur}
        onKeyPress={this._onKeydown}
        onChange={this._onChange}
      />

      <div className={this.state.pageType === 'match' ? 'visible' : 'hidden'}>
        <label>
          Session:
          <input 
            type="number"
            value={this.state.session}
            onChange={this._onSessionChange}
            min="0"
            max="20"
          />
        </label>
        <label>
          Équipe 1:
           <select value={this.state.team1} onChange={this._onTeam1Change}>
            <option value="">Sélectionnez une équipe </option>
            {
              this.state.team.filter((item) => {
                return item.group === this.state.group;
              }).map((page, i) => {
                return <option key={i} value={page.teamName}>{page.teamName}</option>;
              })
            }
          </select>
        </label>
        <label>
          Équipe 2:
           <select value={this.state.team2} onChange={this._onTeam2Change}>
            <option value="">Sélectionnez une équipe </option>
            {
              this.state.team.filter((item) => {
                return item.group === this.state.group;
              }).map((page, i) => {
                return <option key={i} value={page.teamName}>{page.teamName}</option>;
              })
            }
          </select>
        </label>
        <label>
          Date et heure du match à domicile:
          <input
            type="datetime-local"
            value={this.state.homeDateTime}
            onChange={this._onHomeDateTimeChange}
          />
        </label>
        <label>
          Date et heure du match à l'extérieur:
          <input
            type="datetime-local"
            value={this.state.awayDateTime}
            onChange={this._onAwayDateTimeChange}
          />
        </label>
        <label>
          Lieu du match à domicile:
          <input
            type="text"
            placeholder="Lieu du match à domicile"
            value={this.state.homeLocation}
            onChange={this._onHomeLocationChange}
          />
        </label>
        <label>
          Lieu du match à l'extérieur:
          <input
            type="text"
            placeholder="Lieu du match à l'extérieur"
            value={this.state.awayLocation}
            onChange={this._onAwayLocationChange}
          />
        </label>
        <label>
          Groupe:
          <select value={this.state.group} onChange={this._onGroupChange}>
            <option value="">Sélectionnez un groupe</option>
            <option value="1">Groupe 1</option>
            <option value="2">Groupe 2</option>
            <option value="3">Groupe 3</option>
          </select>
        </label>
      </div>

      <i className="fa fa-check-circle new-post_ok" onMouseDown={this._onSubmit}></i>
      <i className="fa fa-times-circle new-post_cancel" onMouseDown={this._onCancel}></i>
    </div>
  );
}

});

module.exports = NewData;
