var React = require('react/addons')
var Router = require('react-router')
var Link = Router.Link
var api = require('./api')
var NewStade = require('./new-stade')

var Stades = React.createClass({
  getInitialState: function() {
    return {
      stades: [],
      showNewForm: false,
      selectedStade: null
    }
  },

  componentDidMount: function() {
    api.getEntries('stade').then((stades) => {
      this.setState({ stades: stades });
      this.render();
    });
  },

  toggleNewForm: function() {
    this.setState({ showNewForm: !this.state.showNewForm });
  },

  handleStadeSelect: function(stade) {
    this.setState({ selectedStade: stade });
  },

  handleDelete: function(id, e) {
    if (e) {
      e.preventDefault();
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce stade ?')) {
      api.deleteEntry("stade", id).then(() => {
        var stades = this.state.stades.filter(stade => stade._id !== id);
        this.setState({ stades: stades });
      });
    }
  },

  handleUpdate: function(id, e) {
    if (e) {
      e.preventDefault();
    }
    Router.transitionTo('stade', {stadeId: id});
  },

  render: function() {
    return <div className="stades">
      <div className="stades_header">
        <h2>Stades</h2>
        <button onClick={this.toggleNewForm} className="new-stade-button">
          <i className="fa fa-plus" /> {this.state.showNewForm ? 'Annuler' : 'Nouveau stade'}
        </button>
      </div>
      {this.state.showNewForm && (
        <div className="new-stade-form-container">
          <NewStade />
        </div>
      )}
      <div className="stades-container">
        <div className="stades_list">
          <table className="stades_table">
            <thead>
              <tr>
                <th>Nom du stade</th>
                <th>Adresse</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {this.state.stades.map((stade) => (
                <tr key={stade.index}>
                  <td>{stade.stadeName}</td>
                  <td>{stade.address}</td>
                  <td>
                    <button 
                      onClick={() => this.handleStadeSelect(stade)}
                      className="btn btn-info"
                    >
                      <i className="fa fa-info-circle" /> Détails
                    </button>
                    <Link to={`/stade/${stade._id}`} className="btn btn-primary">
                      <i className="fa fa-pencil" /> Modifier
                    </Link>
                    <button 
                      onClick={(e) => this.handleDelete(stade._id, e)}
                      className="btn btn-danger"
                    >
                      <i className="fa fa-trash" /> Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {this.state.selectedStade && (
          <div className="stade-details">
            <h3>{this.state.selectedStade.stadeName}</h3>
            <p><strong>Adresse:</strong> {this.state.selectedStade.address}</p>
            <div className="map-container">
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(this.state.selectedStade.address)}&marker=${encodeURIComponent(this.state.selectedStade.address)}&layer=mapnik`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  }
})

module.exports = Stades