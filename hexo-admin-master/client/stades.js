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
    return {
      stades: api.getEntries("stade")
    }
  })],

  getInitialState: function () {
    return {
      selected: 0,
      showNewForm: false
    }
  },

  toggleNewForm: function() {
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
    Router.transitionTo('stade', {matchId: id})
  },

  render: function () {
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
                "posts_post--draft": stade.isDraft,
                "posts_post--selected": i === this.state.selected
              })}
              onDoubleClick={this.goTo.bind(null, stade._id)}
              onClick={this.setState.bind(this, {selected: i}, null)}
            >
              <span className="posts_post-title">
                {stade.stadeName}
              </span>
              <span className="posts_post-date">
                {moment(stade.date).format('MMM Do YYYY')}
              </span>
              <a className='posts_perma-link' target="_blank" href={rootPath + '/' + stade.path}>
                <i className='fa fa-link'/>
              </a>
              <Link className='posts_edit-link' to="stade" matchId={stade._id}>
                <i className='fa fa-pencil'/>
              </Link>
              <a className='posts_delete-link' onClick={this._onDelete.bind(null, stade._id)}>
                <i className='fa fa-trash'/>
              </a>
            </li>
          )
        }
      </ul>
      <div className={cx({
        'posts_display': true,
        'posts_display--draft': current.isDraft
      })}>
        {current.isDraft && <div className="posts_draft-message">Draft</div>}
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