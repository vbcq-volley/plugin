var React = require('react/addons')
var cx = React.addons.classSet
var Link = require('react-router').Link;
var Router = require('react-router');
var _ = require('lodash')
var moment = require('moment')
var SinceWhen = require('./since-when')

var Rendered = require('./rendered')
var DataFetcher = require('./data-fetcher');
var Newteam = require('./new-team')
var api = require('./api');
 
var Datas = React.createClass({
  mixins: [DataFetcher((params) => {
    return {
     
    }
  })],

  getInitialState: function () {
    return {
      selected: 0,
      pages: [], // Initialisation à null pour indiquer que les données ne sont pas encore chargées
      showNewForm: false
    }
  },

  componentDidMount: function () {
    api.getEntries("team").then((data) => {
      this.setState({pages: data})
 
    })
  },

  toggleNewForm: function() {
    this.setState({ showNewForm: !this.state.showNewForm });
  },

  _onNew: function (page) {
    var pages = this.state.pages.slice()
    console.log(pages)
    pages.unshift(page)
    this.setState({pages: pages})
    Router.transitionTo('team', {matchId: page._id})
  },

  _onDelete: function (id, e) {
    if (e) {
      e.preventDefault()
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
      api.deleteEntry("team", id).then(() => {
        var pages = this.state.pages.filter(page => page.index !== id)
        this.setState({pages: pages})
      })
    }
  },

  _onUpdate: function (id, e) {
    if (e) {
      e.preventDefault()
    }
    Router.transitionTo('team', {matchId: id})
  },

  goTo: function (id, e) {
    if (e) {
      e.preventDefault()
    }
    Router.transitionTo('team', {matchId: id})
  },

  render: function () {
    if (!this.state.pages) {
      return <div className='pages'>Loading...</div>
    }
    var current = this.state.pages[this.state.selected] || {}
    var url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/')
    var rootPath = url.slice(0, url.indexOf('admin')).join('/')
    return <div className="teams-container">
      <div className="posts_header">
        <h2>Équipes</h2>
        <button onClick={this.toggleNewForm} className="new-team-button">
          <i className="fa fa-plus" /> {this.state.showNewForm ? 'Annuler' : 'Nouvelle équipe'}
        </button>
      </div>
      {this.state.showNewForm && (
        <div className="new-team-form-container">
          <Newteam onNew={this._onNew}/>
        </div>
      )}
      <div className="teams-list">
        <ul className='posts_list'>
          {
            this.state.pages.map((page, i) =>
              <li key={page._id} className={cx({
                  "posts_post": false,
                  "posts_post--draft": page.isDraft,
                  "posts_post--selected": i === this.state.selected
                })}
                onDoubleClick={this.goTo.bind(null, page._id)}
                onClick={this.setState.bind(this, {selected: i}, null)}
              >
                <span className="posts_post-title">
                  {page.teamName}
                </span>
                <span className="posts_post-date">
                  {moment(page.date).format('MMM Do YYYY')}
                </span>
                <a className='posts_perma-link' target="_blank" href={rootPath + '/' + page.path}>
                  <i className='fa fa-link'/>
                </a>
                <Link className='posts_edit-link' to="data" matchId={page._id}>
                  <i className='fa fa-pencil'/>
                </Link>
                <a className='posts_delete-link' onClick={this._onDelete.bind(null, page.index)}>
                  <i className='fa fa-trash'/>
                </a>
              </li>
            )
          }
        </ul>
      </div>
      <div className={cx({
        'posts_display': true,
        'posts_display--draft': current.isDraft
      })}>
        {current.isDraft && <div className="posts_draft-message">Draft</div>}
        <Rendered
          ref="rendered"
          className="posts_content"
          text={JSON.stringify(current,null,2)}
          type="team"/>
      </div>
    </div>
  }
});

module.exports = Datas;
