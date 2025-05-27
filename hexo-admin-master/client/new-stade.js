var React = require('react/addons')
var Router = require('react-router')
var api = require('./api')

var NewStade = React.createClass({
  getInitialState: function() {
    return {
      stadeName: '',
      address: ''
    }
  },

  handleSubmit: function(e) {
    e.preventDefault()
    api.addEntry('stade', {
      stadeName: this.state.stadeName,
      address: this.state.address
    }).then(() => {
      Router.transitionTo('stades')
    })
  },

  handleChange: function(field, e) {
    var newState = {}
    newState[field] = e.target.value
    this.setState(newState)
  },

  render: function() {
    return <div className="new-stade-page">
      <h2>Créer un nouveau stade</h2>
      <form onSubmit={this.handleSubmit} className="new-stade-form">
        <div className="form-group">
          <label>Nom du stade</label>
          <input 
            type="text" 
            value={this.state.stadeName}
            onChange={this.handleChange.bind(this, 'stadeName')}
            className="form-control"
            required
          />
        </div>
        <div className="form-group">
          <label>Adresse</label>
          <input 
            type="text" 
            value={this.state.address}
            onChange={this.handleChange.bind(this, 'address')}
            className="form-control"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">
          <i className="fa fa-save" /> Enregistrer
        </button>
      </form>
    </div>
  }
})

module.exports = NewStade 