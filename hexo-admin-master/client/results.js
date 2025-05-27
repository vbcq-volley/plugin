var React = require('react/addons')
var Router = require('react-router')
var Link = Router.Link
var api = require('./api')
var AutoList = require('./auto-list')
var NewResult = require('./new-result')

var Results = React.createClass({
  getInitialState: function() {
    return {
      results: [],
      showNewForm: false,
      displayKeys: ['text'],
      allKeys: ['team1', 'team1Score', 'team2Score', 'team2', 'matchType', 'isForfeit', 'isPostponed'],
      keyLabels: {
        'team1': 'Équipe 1',
        'team1Score': 'Score Équipe 1',
        'team2Score': 'Score Équipe 2', 
        'team2': 'Équipe 2',
        'matchType': 'Type de Match',
        'isForfeit': 'Forfait',
        'isPostponed': 'Reporté',
        'text':'match'
      },
      selectedResult: null
    }
  },

  componentDidMount: function() {
    api.getEntries('result').then((results) => {
      this.setState({ results: results });
    });
  },

  handleResultSelect: function(result) {
    this.setState({ selectedResult: result });
  },

  handleDelete: function(id, e) {
    console.log(id._id)
    if (e) {
      e.preventDefault();
    }
   
      api.deleteEntry("result", id._id).then(() => {
        var results = this.state.results.filter(result => result._id !== id._id);
        this.setState({ results: results });
      });
    
  },

  handleUpdate: function(id, e) {
    if (e) {
      e.preventDefault();
    }
    Router.transitionTo('result', {resultId: id});
  },

  toggleNewForm: function() {
    this.setState({ showNewForm: !this.state.showNewForm });
  },

  render: function() {
    return <div className="results">
      <div className="results_header">
        <h2>Résultats</h2>
        <button onClick={this.toggleNewForm} className="new-result-button">
          <i className="fa fa-plus" /> {this.state.showNewForm ? 'Annuler' : 'Nouveau résultat'}
        </button>
      </div>
      {this.state.showNewForm && (
        <div className="new-result-form-container">
          <NewResult />
        </div>
      )}
      <div className="results-container">
        <div className="results_list">
          <table className="results_table">
            <thead>
              <tr>
                {this.state.displayKeys.map((key) => (
                  <th key={key}>{this.state.keyLabels[key]}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.results.map((result) => (
                <tr 
                  key={result._id}
                  onClick={() => this.handleResultSelect(result)}
                  className={this.state.selectedResult && this.state.selectedResult._id === result._id ? 'selected' : ''}
                >
                  {this.state.displayKeys.map((key) => {
                    let value = result[key];
                    if (key === 'team1Score' || key === 'team2Score') {
                      value = value || '0';
                    }
                    return <td key={key}>{value}</td>;
                  })}
                  <td>
                    <Link to={`/resultat/${result._id}`} className="result_edit">
                      <i className="fa fa-pencil" /> Modifier
                    </Link>
                    <button 
                      onClick={(e) => this.handleDelete(result, e)}
                      className="result_delete"
                    >
                      <i className="fa fa-trash" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {this.state.selectedResult && (
          <div className="result-details">
            <h3>Détails du résultat</h3>
            {this.state.allKeys.map((key) => {
              let value = this.state.selectedResult[key];
              if (typeof value === 'boolean') {
                value = value ? 'Oui' : 'Non';
              } else if (key === 'matchType') {
                value = value === 'home' ? 'Domicile' : 'Extérieur';
              }
              return (
                <div key={key} className="detail-item">
                  <strong>{this.state.keyLabels[key]}:</strong> {value}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  }
})

module.exports = Results