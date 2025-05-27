var React = require('react/addons')
var Router = require('react-router')
var api = require('./api')

var NewResult = React.createClass({
  getInitialState: function() {
    return {
      team1: '',
      team2: '',
      team1Score: '',
      team2Score: '',
      matchType: 'home',
      team1Forfeit: false,
      team2Forfeit: false,
      team1Postponed: false,
      team2Postponed: false,
      matchId: '',
      group: '1',
      session: 1,
      date: '',
      matches: []
    }
  },

  componentDidMount: function() {
    api.getEntries('match').then((matches) => {
      this.setState({ matches: matches });
    });
  },

  handleMatchSelect: function(e) {
    const matchId = e.target.value;
    const selectedMatch = this.state.matches.find(m => m._id === matchId);
    
    if (selectedMatch) {
      this.setState({
        matchId: selectedMatch._id,
        team1: selectedMatch.team1,
        team2: selectedMatch.team2,
        date: selectedMatch.homeDate,
        group: selectedMatch.group,
        session: selectedMatch.session
      });
    }
  },

  handleMatchTypeChange: function(e) {
    const matchType = e.target.value;
    const selectedMatch = this.state.matches.find(m => m._id === this.state.matchId);
    
    if (selectedMatch) {
      this.setState({
        matchType: matchType,
        date: matchType === 'home' ? selectedMatch.homeDate : selectedMatch.awayDate
      });
    }
  },

  handleSubmit: function(e) {
    e.preventDefault()
    const forfeitTeam = this.state.team1Forfeit ? this.state.team1 : 
                       this.state.team2Forfeit ? this.state.team2 : null;
    const postponedTeam = this.state.team1Postponed ? this.state.team1 :
                         this.state.team2Postponed ? this.state.team2 : null;

    api.addEntry('result', {
      team1: this.state.team1,
      team2: this.state.team2,
      team1Score: this.state.team1Score,
      team2Score: this.state.team2Score,
      matchType: this.state.matchType,
      isForfeit: this.state.team1Forfeit || this.state.team2Forfeit,
      forfeitTeam: forfeitTeam,
      isPostponed: this.state.team1Postponed || this.state.team2Postponed,
      postponedTeam: postponedTeam,
      matchId: this.state.matchId,
      group: this.state.group,
      session: this.state.session,
      date: this.state.date,
      text: `Résultat: ${this.state.team1} vs ${this.state.team2}`,
      type: 'result'
    }).then(() => {
      Router.transitionTo('results')
    })
  },

  handleChange: function(field, e) {
    var newState = {}
    newState[field] = e.target.value
    this.setState(newState)
  },

  handleCheckboxChange: function(field, e) {
    var newState = {}
    newState[field] = e.target.checked
    this.setState(newState)
  },

  render: function() {
    return <div className="new-result-page">
      <h2>Créer un nouveau résultat</h2>
      <form onSubmit={this.handleSubmit} className="new-result-form">
        <div className="form-group">
          <label>Sélectionner un match</label>
          <select 
            value={this.state.matchId}
            onChange={this.handleMatchSelect}
            className="form-control"
          >
            <option value="">Sélectionner un match...</option>
            {this.state.matches.map((match) => (
              <option key={match._id} value={match._id}>
                {match.team1} vs {match.team2} - {match.homeDate}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Type de Match</label>
          <select 
            value={this.state.matchType}
            onChange={this.handleMatchTypeChange}
            className="form-control"
          >
            <option value="home">Domicile</option>
            <option value="away">Extérieur</option>
          </select>
        </div>
        <div className="form-group">
          <label>Équipe 1</label>
          <input 
            type="text" 
            value={this.state.team1}
            onChange={this.handleChange.bind(this, 'team1')}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Score Équipe 1</label>
          <input 
            type="number" 
            value={this.state.team1Score}
            onChange={this.handleChange.bind(this, 'team1Score')}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Score Équipe 2</label>
          <input 
            type="number" 
            value={this.state.team2Score}
            onChange={this.handleChange.bind(this, 'team2Score')}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Équipe 2</label>
          <input 
            type="text" 
            value={this.state.team2}
            onChange={this.handleChange.bind(this, 'team2')}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Date du match</label>
          <input 
            type="text" 
            value={this.state.date}
            onChange={this.handleChange.bind(this, 'date')}
            className="form-control"
            placeholder="ex: 31 mars 2025 à 20:30"
            required
          />
        </div>
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={this.state.team1Forfeit}
              onChange={this.handleCheckboxChange.bind(this, 'team1Forfeit')}
            />
            {this.state.team1} - Forfait
          </label>
        </div>
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={this.state.team2Forfeit}
              onChange={this.handleCheckboxChange.bind(this, 'team2Forfeit')}
            />
            {this.state.team2} - Forfait
          </label>
        </div>
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={this.state.team1Postponed}
              onChange={this.handleCheckboxChange.bind(this, 'team1Postponed')}
            />
            {this.state.team1} - Demande de report
          </label>
        </div>
        <div className="form-group">
          <label>
            <input 
              type="checkbox" 
              checked={this.state.team2Postponed}
              onChange={this.handleCheckboxChange.bind(this, 'team2Postponed')}
            />
            {this.state.team2} - Demande de report
          </label>
        </div>
        <button type="submit" className="btn btn-primary">
          <i className="fa fa-save" /> Enregistrer
        </button>
      </form>
    </div>
  }
})

module.exports = NewResult