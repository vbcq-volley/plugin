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

var Teams = React.createClass({
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
      teams: [],
      updated: moment()
    }
  },

  componentDidMount: function() {
    api.getEntries("team").then((teams) => {
      this.setState({teams: teams})
      this.render()
    })
  },

  toggleNewForm: function() {
    this.setState({ showNewForm: !this.state.showNewForm });
  },

  _onNew: function (team) {
    var teams = this.state.teams.slice()
    teams.unshift(team)
    this.setState({teams: teams})
    Router.transitionTo('team', {matchId: team._id})
  },

  _onDelete: function (id, e) {
    if (e) {
      e.preventDefault()
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette équipe ?')) {
      api.deleteEntry("team", id).then(() => {
        var teams = this.state.teams.filter(team => team._id !== id)
        this.setState({teams: teams})
      })
    }
  },

  goTo: function (id, e) {
    if (e) {
      e.preventDefault()
    }
    Router.transitionTo('team', {matchId: id})
  },

  render: function () {
    if (!this.state.teams) {
      return <div className='teams'>Loading...</div>
    }
    var current = this.state.teams[this.state.selected] || {}
    var url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/')
    var rootPath = url.slice(0, url.indexOf('admin')).join('/')
    return <div className="posts">
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
      <ul className='posts_list'>
        {
          this.state.teams.map((team, i) =>
            <li key={team._id} className={cx({
                "posts_post": true,
                "posts_post--draft": team.isDraft,
                "posts_post--selected": i === this.state.selected
              })}
              onDoubleClick={this.goTo.bind(null, team._id)}
              onClick={this.setState.bind(this, {selected: i}, null)}
            >
              <span className="posts_post-title">
                {team.teamName}
              </span>
              <span className="posts_post-date">
                {team.date}
              </span>
              <a className='posts_perma-link' target="_blank" href={rootPath + '/' + team.path}>
                <i className='fa fa-link'/>
              </a>
              <Link className='posts_edit-link' to="team" matchId={team._id}>
                <i className='fa fa-pencil'/>
              </Link>
              <a className='posts_delete-link' onClick={this._onDelete.bind(null, team._id)}>
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

module.exports = Teams;
