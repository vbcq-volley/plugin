const path = require('path')
const Promise = require('es6-promise').Promise
const api = require('./api')
const Editor = require('./editor')
const marked = require('marked')

class Editor_data {
  constructor() {
    this.state = {
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
  }

  init(container, props) {
    this.container = container
    this.props = props
    this.loadData()
  }

  loadData() {
    this.props.id = this.props.id || window.location.href.split('/').slice(-1)[0]
    
    if (this.props.id) {
      const type = this.props.type || this.state.pageType
      console.log(type)
      if (type) {
        let apiCall
        if (type === 'post') {
          apiCall = api.post(this.props.id)
        } else if (type === 'page') {
          apiCall = api.page(this.props.id)
        } else if (type === 'result') {
          api.getEntry('result', this.props.id).then((result) => {
            if (result) {
              this.state.text = result.title || 'Sans titre'
              this.state.pageType = type
              this.state.data = result
              this.state.loading = false
              this.render()
            } else {
              api.getEntry('match', this.props.id).then((match) => {
                if (match) {
                  this.state.text = `Résultat: ${match.team1} vs ${match.team2}`
                  this.state.pageType = type
                  this.state.data = {
                    matchId: match._id,
                    team1: match.team1,
                    team2: match.team2,
                    matchType: 'home',
                    team1Score: '',
                    team2Score: '',
                    isForfeit: false,
                    isPostponed: false
                  }
                  this.state.loading = false
                  this.render()
                }
              })
            }
          })
          return
        } else {
          apiCall = api.getEntry(type, this.props.id)
        }

        apiCall.then((entry) => {
          if (entry) {
            if (type === 'post' || type === 'page') {
              const parts = entry.raw.split('---')
              const _slice = parts[0] === '' ? 2 : 1
              const raw = parts.slice(_slice).join('---').trim()
              console.log("entry ="+JSON.stringify(entry,null,2))
              this.state.text = entry.title
              this.state.pageType = type
              this.state.data = entry
              this.state.raw = raw
              this.state.rendered = entry.content
              this.state.loading = false
            } else {
              this.state.text = entry.title || entry.teamName || 'Sans titre'
              this.state.pageType = type
              this.state.data = entry
              this.state.loading = false
            }
            this.render()
          }
        }).catch((err) => {
          console.error('Erreur lors du chargement des données:', err)
          this.state.loading = false
          this.render()
        })

        if (type === 'match' || type === 'result') {
          api.getEntries("match").then((matches) => {
            this.state.matches = matches
            this.render()
          })
        }
      }
    } else {
      this.state.loading = false
      this.render()
    }
  }

  handleCheckboxChange(field, e) {
    this.state[field] = e.target.checked
    this.onDataChange(field, e.target.checked)
    this.render()
  }

  onKeydown(e) {
    if (e.key === 'Enter') {
      this.onSubmit(e)
    }
  }

  onShow() {
    this.state.showing = true
    this.render()
  }

  onBlur(e) {
    if (this.state.showing && !this.isClickInsideForm(e)) {
      this.onCancel()
    }
  }

  isClickInsideForm(e) {
    return this.form.contains(e.relatedTarget)
  }

  onSubmit(e) {
    e.preventDefault()
    this.state.loading = true
    this.state.showing = true
    this.render()

    const formatDate = (dateTimeString) => {
      if (!dateTimeString) return ''
      const date = new Date(dateTimeString)
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date)
    }

    const pageData = {
      text: this.state.text,
      type: this.state.pageType,
      ...this.state.data
    }

    if (pageData.type === 'post') {
      api.post(pageData._id, pageData).then(() => {
        window.location.hash = '#/posts'
      }, (err) => {
        console.error('Erreur lors de la sauvegarde:', err)
        this.state.loading = false
        this.render()
      })
    } else if (pageData.type === 'page') {
      api.page(pageData._id, pageData).then(() => {
        window.location.hash = '#/pages'
      }, (err) => {
        console.error('Erreur lors de la sauvegarde:', err)
        this.state.loading = false
        this.render()
      })
    } else if (pageData.type === 'result') {
      api.addEntry('result', pageData).then(() => {
        window.location.hash = '#/results'
      }, (err) => {
        console.error('Erreur lors de la sauvegarde:', err)
        this.state.loading = false
        this.render()
      })
    }
  }

  onCancel() {
    this.state.showing = false
    this.render()
  }

  onDataChange(field, value) {
    this.state.data[field] = value
  }

  render() {
    if (this.state.loading) {
      this.container.innerHTML = '<div class="loading">Chargement...</div>'
      return
    }

    const container = document.createElement('div')
    container.className = 'editor-data'

    const form = document.createElement('form')
    form.className = 'editor-form'
    form.onsubmit = (e) => this.onSubmit(e)
    this.form = form

    const titleInput = document.createElement('input')
    titleInput.type = 'text'
    titleInput.className = 'editor-title'
    titleInput.value = this.state.text
    titleInput.onchange = (e) => {
      this.state.text = e.target.value
      this.render()
    }
    titleInput.onkeydown = (e) => this.onKeydown(e)
    titleInput.onblur = (e) => this.onBlur(e)

    form.appendChild(titleInput)

    if (this.state.pageType === 'result') {
      // Match selection
      const matchGroup = document.createElement('div')
      matchGroup.className = 'form-group'

      const matchLabel = document.createElement('label')
      matchLabel.textContent = 'Match'

      const matchSelect = document.createElement('select')
      matchSelect.className = 'form-control'
      matchSelect.value = this.state.data.matchId || ''
      matchSelect.onchange = (e) => {
        const matchId = e.target.value
        const selectedMatch = this.state.matches.find(m => m._id === matchId)
        if (selectedMatch) {
          this.state.data.matchId = selectedMatch._id
          this.state.data.team1 = selectedMatch.team1
          this.state.data.team2 = selectedMatch.team2
          this.state.data.date = selectedMatch.homeDate
          this.state.data.group = selectedMatch.group
          this.state.data.session = selectedMatch.session
          this.render()
        }
      }

      const defaultOption = document.createElement('option')
      defaultOption.value = ''
      defaultOption.textContent = 'Sélectionner un match...'
      matchSelect.appendChild(defaultOption)

      this.state.matches.forEach(match => {
        const option = document.createElement('option')
        option.value = match._id
        option.textContent = `${match.team1} vs ${match.team2} - ${match.homeDate}`
        matchSelect.appendChild(option)
      })

      matchGroup.appendChild(matchLabel)
      matchGroup.appendChild(matchSelect)
      form.appendChild(matchGroup)

      // Match type
      const typeGroup = document.createElement('div')
      typeGroup.className = 'form-group'

      const typeLabel = document.createElement('label')
      typeLabel.textContent = 'Type de Match'

      const typeSelect = document.createElement('select')
      typeSelect.className = 'form-control'
      typeSelect.value = this.state.data.matchType || 'home'
      typeSelect.onchange = (e) => {
        const matchType = e.target.value
        const selectedMatch = this.state.matches.find(m => m._id === this.state.data.matchId)
        if (selectedMatch) {
          this.state.data.matchType = matchType
          this.state.data.date = matchType === 'home' ? selectedMatch.homeDate : selectedMatch.awayDate
          this.render()
        }
      }

      const homeOption = document.createElement('option')
      homeOption.value = 'home'
      homeOption.textContent = 'Domicile'

      const awayOption = document.createElement('option')
      awayOption.value = 'away'
      awayOption.textContent = 'Extérieur'

      typeSelect.appendChild(homeOption)
      typeSelect.appendChild(awayOption)

      typeGroup.appendChild(typeLabel)
      typeGroup.appendChild(typeSelect)
      form.appendChild(typeGroup)

      // Team 1
      const team1Group = document.createElement('div')
      team1Group.className = 'form-group'

      const team1Label = document.createElement('label')
      team1Label.textContent = 'Équipe 1'

      const team1Input = document.createElement('input')
      team1Input.type = 'text'
      team1Input.className = 'form-control'
      team1Input.value = this.state.data.team1 || ''
      team1Input.required = true
      team1Input.onchange = (e) => {
        this.state.data.team1 = e.target.value
        this.render()
      }

      team1Group.appendChild(team1Label)
      team1Group.appendChild(team1Input)
      form.appendChild(team1Group)

      // Team 1 Score
      const score1Group = document.createElement('div')
      score1Group.className = 'form-group'

      const score1Label = document.createElement('label')
      score1Label.textContent = 'Score Équipe 1'

      const score1Input = document.createElement('input')
      score1Input.type = 'number'
      score1Input.className = 'form-control'
      score1Input.value = this.state.data.team1Score || ''
      score1Input.required = true
      score1Input.onchange = (e) => {
        this.state.data.team1Score = e.target.value
        this.render()
      }

      score1Group.appendChild(score1Label)
      score1Group.appendChild(score1Input)
      form.appendChild(score1Group)

      // Team 2 Score
      const score2Group = document.createElement('div')
      score2Group.className = 'form-group'

      const score2Label = document.createElement('label')
      score2Label.textContent = 'Score Équipe 2'

      const score2Input = document.createElement('input')
      score2Input.type = 'number'
      score2Input.className = 'form-control'
      score2Input.value = this.state.data.team2Score || ''
      score2Input.required = true
      score2Input.onchange = (e) => {
        this.state.data.team2Score = e.target.value
        this.render()
      }

      score2Group.appendChild(score2Label)
      score2Group.appendChild(score2Input)
      form.appendChild(score2Group)

      // Team 2
      const team2Group = document.createElement('div')
      team2Group.className = 'form-group'

      const team2Label = document.createElement('label')
      team2Label.textContent = 'Équipe 2'

      const team2Input = document.createElement('input')
      team2Input.type = 'text'
      team2Input.className = 'form-control'
      team2Input.value = this.state.data.team2 || ''
      team2Input.required = true
      team2Input.onchange = (e) => {
        this.state.data.team2 = e.target.value
        this.render()
      }

      team2Group.appendChild(team2Label)
      team2Group.appendChild(team2Input)
      form.appendChild(team2Group)

      // Date
      const dateGroup = document.createElement('div')
      dateGroup.className = 'form-group'

      const dateLabel = document.createElement('label')
      dateLabel.textContent = 'Date du match'

      const dateInput = document.createElement('input')
      dateInput.type = 'text'
      dateInput.className = 'form-control'
      dateInput.value = this.state.data.date || ''
      dateInput.placeholder = 'ex: 31 mars 2025 à 20:30'
      dateInput.required = true
      dateInput.onchange = (e) => {
        this.state.data.date = e.target.value
        this.render()
      }

      dateGroup.appendChild(dateLabel)
      dateGroup.appendChild(dateInput)
      form.appendChild(dateGroup)

      // Forfeit checkboxes
      const forfeit1Group = document.createElement('div')
      forfeit1Group.className = 'form-group'

      const forfeit1Label = document.createElement('label')
      const forfeit1Checkbox = document.createElement('input')
      forfeit1Checkbox.type = 'checkbox'
      forfeit1Checkbox.checked = this.state.data.team1Forfeit || false
      forfeit1Checkbox.onchange = (e) => this.handleCheckboxChange('team1Forfeit', e)
      forfeit1Label.appendChild(forfeit1Checkbox)
      forfeit1Label.appendChild(document.createTextNode(` ${this.state.data.team1 || 'Équipe 1'} - Forfait`))

      forfeit1Group.appendChild(forfeit1Label)
      form.appendChild(forfeit1Group)

      const forfeit2Group = document.createElement('div')
      forfeit2Group.className = 'form-group'

      const forfeit2Label = document.createElement('label')
      const forfeit2Checkbox = document.createElement('input')
      forfeit2Checkbox.type = 'checkbox'
      forfeit2Checkbox.checked = this.state.data.team2Forfeit || false
      forfeit2Checkbox.onchange = (e) => this.handleCheckboxChange('team2Forfeit', e)
      forfeit2Label.appendChild(forfeit2Checkbox)
      forfeit2Label.appendChild(document.createTextNode(` ${this.state.data.team2 || 'Équipe 2'} - Forfait`))

      forfeit2Group.appendChild(forfeit2Label)
      form.appendChild(forfeit2Group)

      // Postponed checkboxes
      const postponed1Group = document.createElement('div')
      postponed1Group.className = 'form-group'

      const postponed1Label = document.createElement('label')
      const postponed1Checkbox = document.createElement('input')
      postponed1Checkbox.type = 'checkbox'
      postponed1Checkbox.checked = this.state.data.team1Postponed || false
      postponed1Checkbox.onchange = (e) => this.handleCheckboxChange('team1Postponed', e)
      postponed1Label.appendChild(postponed1Checkbox)
      postponed1Label.appendChild(document.createTextNode(` ${this.state.data.team1 || 'Équipe 1'} - Reporté`))

      postponed1Group.appendChild(postponed1Label)
      form.appendChild(postponed1Group)

      const postponed2Group = document.createElement('div')
      postponed2Group.className = 'form-group'

      const postponed2Label = document.createElement('label')
      const postponed2Checkbox = document.createElement('input')
      postponed2Checkbox.type = 'checkbox'
      postponed2Checkbox.checked = this.state.data.team2Postponed || false
      postponed2Checkbox.onchange = (e) => this.handleCheckboxChange('team2Postponed', e)
      postponed2Label.appendChild(postponed2Checkbox)
      postponed2Label.appendChild(document.createTextNode(` ${this.state.data.team2 || 'Équipe 2'} - Reporté`))

      postponed2Group.appendChild(postponed2Label)
      form.appendChild(postponed2Group)
    }

    // Submit button
    const submitButton = document.createElement('button')
    submitButton.type = 'submit'
    submitButton.className = 'btn btn-primary'
    submitButton.textContent = 'Enregistrer'
    form.appendChild(submitButton)

    container.appendChild(form)

    this.container.innerHTML = ''
    this.container.appendChild(container)
  }
}

module.exports = Editor_data
