var path = require('path')
var React = require('react/addons')
var cx = React.addons.classSet
var Promise = require('es6-promise').Promise
var PT = React.PropTypes
var api=require("./api")
var Router = require('react-router')
var Editor = require('./editor')

var Editor_data = React.createClass({

  // cmRef: null,

  propTypes: {
  
    id: PT.string,
    type: PT.string

  },

  getInitialState: function() {
    return {
      showing: true,
      loading: true,
      text: 'Untitled',
      pageType: 'result',
      data: {},
      matches: [],
      selectedMatch: null,
      raw: '',
      rendered: '',
      wordCount: 0,
      updated: null,
      isDraft: false
    }
  },

  componentDidMount: function() {
    this.props.id = this.props.id || window.location.href.split('/').slice(-1)[0];
    
    // Si on a un ID, charger les données correspondantes
    if (this.props.id) {
      // Utiliser le type spécifié dans les props ou par défaut
      const type = this.props.type || this.state.pageType;
      console.log(type)
      if (type) {
        // Utiliser l'API appropriée selon le type
        let apiCall;
        if (type === 'post') {
          apiCall = api.post(this.props.id);
        } else if (type === 'page') {
          apiCall = api.page(this.props.id);
        } else if (type === 'result') {
          // Pour les résultats, d'abord vérifier si le résultat existe
          api.getEntry('result', this.props.id).then((result) => {
            if (result) {
              // Si le résultat existe, l'utiliser
              this.setState({
                text: result.title || 'Sans titre',
                pageType: type,
                data: result,
                loading: false
              });
            } else {
              // Si le résultat n'existe pas, charger le match correspondant
              api.getEntry('match', this.props.id).then((match) => {
                if (match) {
                  this.setState({
                    text: `Résultat: ${match.team1} vs ${match.team2}`,
                    pageType: type,
                    data: {
                      matchId: match._id,
                      team1: match.team1,
                      team2: match.team2,
                      matchType: 'home',
                      team1Score: '',
                      team2Score: '',
                      isForfeit: false,
                      isPostponed: false
                    },
                    loading: false
                  });
                }
              });
            }
          });
          return; // Sortir de la fonction car on gère le cas des résultats différemment
        } else {
          apiCall = api.getEntry(type, this.props.id);
        }

        apiCall.then((entry) => {
          if (entry) {
            if (type === 'post' || type === 'page') {
              // Pour les posts et pages, extraire le contenu du front matter
              const parts = entry.raw.split('---');
              const _slice = parts[0] === '' ? 2 : 1;
              const raw = parts.slice(_slice).join('---').trim();
              
              this.setState({
                text: entry.title,
                pageType: type,
                data: entry,
                raw: raw,
                rendered: entry.content,
                loading: false
              });
            } else {
              this.setState({
                text: entry.title || entry.teamName || 'Sans titre',
                pageType: type,
                data: entry,
                loading: false
              });
            }
          }
        }).catch((err) => {
          console.error('Erreur lors du chargement des données:', err);
          this.setState({ loading: false });
        });

        // Si c'est un match ou un résultat, charger aussi la liste des matchs
        if (type === 'match' || type === 'result') {
          api.getEntries("match").then((matches) => {
            this.setState({ matches: matches });
          });
        }
      }
    } else {
      this.setState({ loading: false });
    }
  },

  // recreate previewLink
 

  


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

    const formatDate = (dateTimeString) => {
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
      ...this.state.data
    };

    if (pageData.type === 'post') {
      api.post(pageData).then((page) => {
        Router.transitionTo('posts');
      }, (err) => {
        console.error('Échec de la création du post', err);
      });
    } else if (pageData.type === 'page') {
      api.page(pageData).then((page) => {
        Router.transitionTo('pages');
      }, (err) => {
        console.error('Échec de la création de la page', err);
      });
    } else {
      api.addEntry(pageData.type, pageData).then((page) => {
        if (pageData.type === 'match') {
          Router.transitionTo('matches');
        } else if (pageData.type === 'team') {
          Router.transitionTo('teams');
        } else if (pageData.type === 'result') {
          Router.transitionTo('results');
        } else {
          Router.transitionTo('datas');
        }
      }, (err) => {
        console.error('Échec de la création de l\'entrée', err);
      });
    }
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
      pageType: e.target.value,
      data: {} // Reset data when changing type
    });
  },

  _onDataChange: function (field, value) {
    console.log("la data est"+JSON.stringify(this.state.data))
    const newData = { ...this.state.data };
    newData[field] = value;
    this.setState({ data: newData });
  },

  handleChangeTitle: function(title) {
    this.setState({ text: title });
  },

  handleChangeContent: function(content) {
    this.setState({ 
      raw: content,
      updated: new Date()
    });
  },

  handlePublish: function() {
    this.setState({ isDraft: false });
  },

  handleUnpublish: function() {
    this.setState({ isDraft: true });
  },

  renderFormFields: function() {
    const { pageType, data } = this.state;
    
    switch(pageType) {
      case 'match':
        return (
          <div className="visible">
            <label>
              Équipe 1:
              <input
                type="text"
                placeholder="Équipe 1"
                value={data.team1 || ''}
                onChange={(e) => this._onDataChange('team1', e.target.value)}
              />
            </label>
            <label>
              Équipe 2:
              <input
                type="text"
                placeholder="Équipe 2"
                value={data.team2 || ''}
                onChange={(e) => this._onDataChange('team2', e.target.value)}
              />
            </label>
            <label>
              Date et heure du match à domicile:
              <input
                type="datetime-local"
                value={data.homeDateTime || ''}
                onChange={(e) => this._onDataChange('homeDateTime', e.target.value)}
              />
            </label>
            <label>
              Date et heure du match à l'extérieur:
              <input
                type="datetime-local"
                value={data.awayDateTime || ''}
                onChange={(e) => this._onDataChange('awayDateTime', e.target.value)}
              />
            </label>
            <label>
              Lieu du match à domicile:
              <input
                type="text"
                placeholder="Lieu du match à domicile"
                value={data.homeLocation || ''}
                onChange={(e) => this._onDataChange('homeLocation', e.target.value)}
              />
            </label>
            <label>
              Lieu du match à l'extérieur:
              <input
                type="text"
                placeholder="Lieu du match à l'extérieur"
                value={data.awayLocation || ''}
                onChange={(e) => this._onDataChange('awayLocation', e.target.value)}
              />
            </label>
            <label>
              Groupe:
              <select 
                value={data.group || ''} 
                onChange={(e) => this._onDataChange('group', e.target.value)}
              >
                <option value="">Sélectionnez un groupe</option>
                <option value="1">Groupe 1</option>
                <option value="2">Groupe 2</option>
                <option value="3">Groupe 3</option>
              </select>
            </label>
            <label>
              Statut du match:
              <select 
                value={data.matchStatus || 'scheduled'} 
                onChange={(e) => this._onDataChange('matchStatus', e.target.value)}
              >
                <option value="scheduled">Programmé</option>
                <option value="forfeit">Forfait</option>
                <option value="postponed">Report demandé</option>
              </select>
            </label>
            
          </div>
        );
      
      case 'result':
        return (
          <div className="visible">
            <label>
              Type de match:
              <select 
                value={data.matchType || 'home'} 
                onChange={(e) => this._onDataChange('matchType', e.target.value)}
              >
                <option value="home">Match à domicile</option>
                <option value="away">Match à l'extérieur</option>
              </select>
            </label>
            <label>
              Score Équipe 1:
              <input
                type="number"
                placeholder="Score Équipe 1"
                value={data.team1Score || ''}
                onChange={(e) => this._onDataChange('team1Score', e.target.value)}
                disabled={data.isForfeit || data.isPostponed}
              />
            </label>
            <label>
              Score Équipe 2:
              <input
                type="number"
                placeholder="Score Équipe 2"
                value={data.team2Score || ''}
                onChange={(e) => this._onDataChange('team2Score', e.target.value)}
                disabled={data.isForfeit || data.isPostponed}
              />
            </label>
            <label>
              Forfait:
              <input
                type="checkbox"
                checked={data.isForfeit || false}
                onChange={(e) => {
                  const newData = { ...this.state.data };
                  newData.isForfeit = e.target.checked;
                  if (e.target.checked) {
                    newData.isPostponed = false;
                    newData.team1Score = '';
                    newData.team2Score = '';
                  }
                  this.setState({ data: newData });
                }}
              />
            </label>
            {data.isForfeit && (
              <label>
                Équipe en forfait:
                <select 
                  value={data.forfeitTeam || ''} 
                  onChange={(e) => this._onDataChange('forfeitTeam', e.target.value)}
                >
                  <option value="">Sélectionnez l'équipe</option>
                  <option value="team1">{data.team1}</option>
                  <option value="team2">{data.team2}</option>
                </select>
              </label>
            )}
            <label>
              Reporté:
              <input
                type="checkbox"
                checked={data.isPostponed || false}
                onChange={(e) => {
                  const newData = { ...this.state.data };
                  newData.isPostponed = e.target.checked;
                  if (e.target.checked) {
                    newData.isForfeit = false;
                    newData.team1Score = '';
                    newData.team2Score = '';
                  }
                  this.setState({ data: newData });
                }}
              />
            </label>
            {data.isPostponed && (
              <label>
                Équipe demandant le report:
                <select 
                  value={data.postponedTeam || ''} 
                  onChange={(e) => this._onDataChange('postponedTeam', e.target.value)}
                >
                  <option value="">Sélectionnez l'équipe</option>
                  <option value="team1">{data.team1}</option>
                  <option value="team2">{data.team2}</option>
                </select>
              </label>
            )}
          </div>
        );

      case 'team':
        return (
          <div className="visible">
            <label>
              Nom de l'équipe:
              <input
                type="text"
                placeholder="Nom de l'équipe"
                value={data.teamName || ''}
                onChange={(e) => this._onDataChange('teamName', e.target.value)}
              />
            </label>
              <label>
                Description:
                <textarea
                  placeholder="Description de l'équipe"
                  value={data.description || ''}
                  onChange={(e) => this._onDataChange('description', e.target.value)}
                />
              </label>
              <label>
                Coach:
                <input
                  type="text"
                  placeholder="Coach de l'équipe"
                  value={data.coach || ''}
                  onChange={(e) => this._onDataChange('coach', e.target.value)}
                />
              </label>
              <label>
                  Groupe:
                  <select 
                    value={data.group || ''} 
                    onChange={(e) => this._onDataChange('group', e.target.value)}
                  >
                    <option value="">Sélectionnez un groupe</option>
                    <option value="1">Groupe 1</option>
                    <option value="2">Groupe 2</option>
                    <option value="3">Groupe 3</option>
                  </select>
                </label>
            <label>
              Lien public:
              <input
                type="text"
                placeholder="Lien public de l'équipe"
                value={data.publicLink || ''}
                onChange={(e) => this._onDataChange('publicLink', e.target.value)}
              />
            </label>
            





            </div>
        );

      case 'post':
      case 'page':
        return (
          <Editor
            post={this.props.post || { path: this.state.text }}
            raw={this.state.raw}
            rendered={this.state.rendered}
            onChangeTitle={this.handleChangeTitle}
            title={this.state.text}
            updated={this.state.updated}
            isDraft={this.state.isDraft}
            onPublish={this.handlePublish}
            onUnpublish={this.handleUnpublish}
            onChangeContent={this.handleChangeContent}
            wordCount={this.state.wordCount}
            type={pageType}
            adminSettings={this.props.adminSettings}
          />
        );

      default:
        return null;
    }
  },

  render: function () {
    if (!this.state.showing) {
      return (
        <div className="new-post" onClick={this._onShow}>
          <div className="new-post_button">
            <i className="fa fa-plus" />{' '}
            Nouvelle entrée
          </div>
        </div>
      );
    }

    if (this.state.pageType === 'post' || this.state.pageType === 'page') {
      return this.renderFormFields();
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
        
        <label>
          Type de données:
          <select value={this.state.pageType} onChange={this._onPageTypeChange}>
            <option value="match">Match</option>
            <option value="result">Résultat</option>
            <option value="team">Équipe</option>
            <option value="post">Article</option>
            <option value="page">Page</option>
          </select>
        </label>

        {this.renderFormFields()}

        <i className="fa fa-check-circle new-post_ok" onMouseDown={this._onSubmit}></i>
        <i className="fa fa-times-circle new-post_cancel" onMouseDown={this._onCancel}></i>
      </div>
    );
  }// end of render()
})// end of component

module.exports = Editor_data
