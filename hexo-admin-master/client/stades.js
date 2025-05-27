var React = require('react/addons')
var cx = React.addons.classSet
var Link = require('react-router').Link;
var Router = require('react-router');
var _ = require('lodash')
var moment = require('moment')
var SinceWhen = require('./since-when')

var Rendered = require('./rendered')
var DataFetcher = require('./data-fetcher');
var NewStade = require('./new-stade')
var api = require('./api');

var Stades = React.createClass({
  mixins: [DataFetcher((params) => {
    console.log(params)
    return {
      params: params
    }
  })],

  getInitialState: function () {
    return {
      selected: 0,
      showNewForm: false,
      stades: [],
      updated: moment()
    }
  },

  componentDidMount: function() {

    api.getEntries("stade").then((stades) => {
      console.log(this.state)
      console.log("la data est"+JSON.stringify(stades,null,2))
      try {
        this.setState({stades: stades})
      } catch (error) {
        console.log(error)
      }
      
      console.log(this.state)
      this.componentDidUpdate()
    })
    this.componentDidUpdate()
  },
  componentDidUpdate: function() {
    if (this.state.stades && this.state.stades.length !== 0) { // Vérification si les pages sont arrivées et non vides
      console.log("Pages arrivées, mise à jour du rendu");
      console.log(this.state.stades)
      this.state.stades.map((item)=>{
        console.log(item)
      })
      console.log(this.state)
      this.render(); // Force la mise à jour du rendu
    }
  },
  toggleNewForm: function() {
    this.componentDidUpdate()
    this.setState({ showNewForm: !this.state.showNewForm });
  },

  _onNew: function (stade) {
    var stades = this.state.stades.slice()
    stades.unshift(stade)
    this.setState({stades: stades})
    Router.transitionTo('stade', {matchId: stade._id})
  },

  _onDelete: function (id, e) {
    if (e) {
      e.preventDefault()
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce stade ?')) {
      api.deleteEntry("stade", id).then(() => {
        var stades = this.state.stades.filter(stade => stade._id !== id)
        this.setState({stades: stades})
      })
    }
  },

  goTo: function (id, e) {
    if (e) {
      e.preventDefault()
    }
    Router.transitionTo('stade', {stadeId: id})
  },

  render: function () {
    console.log(this.state)
    if (!this.state.stades) {
      return <div className='stades'>Loading...</div>
    }
    var current = this.state.stades[this.state.selected] || {}
    var url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/')
    var rootPath = url.slice(0, url.indexOf('admin')).join('/')
    return <div className="posts">
      <div className="posts_header">
        <h2>Stades</h2>
        <button onClick={this.toggleNewForm} className="new-stade-button">
          <i className="fa fa-plus" /> {this.state.showNewForm ? 'Annuler' : 'Nouveau stade'}
        </button>
      </div>
      {this.state.showNewForm && (
        <div className="new-stade-form-container">
          <NewStade onNew={this._onNew}/>
        </div>
      )}
      <ul className='posts_list'>
        {
          this.state.stades.map((stade, i) =>
            <li key={stade._id} className={cx({
                "posts_post": true,
                "posts_post--draft": false,
                "posts_post--selected": i === this.state.selected
              })}
              onDoubleClick={this.goTo.bind(null, stade._id)}
              onClick={this.setState.bind(this, {selected: i}, null)}
            >
              <span className="posts_post-title">
                {stade.stadeName}
              </span>
             
              
              <Link className='posts_edit-link' to={`stade`} stadeId={stade._id}>
                <i className='fa fa-pencil'/>
              </Link>
              <a className='posts_delete-link' onClick={this._onDelete.bind(null, stade._id)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-trash" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
                </svg>
              </a>
            </li>
          )
        }
      </ul>
      <div className={cx({
        'posts_display': true,
        'posts_display--draft': false
      })}>
      
        <Rendered
          ref="rendered"
          className="posts_content"
          text={JSON.stringify(current,null,2)}
          type="stade"/>
      </div>
    </div>
  }
});

module.exports = Stades;