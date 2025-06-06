const api = require('./api')

class NewResult {
  constructor() {
    this.state = {
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
  }

  init(container, onNew) {
    this.container = container
    this.onNew = onNew
    this.loadData()
    this.render()
  }

  loadData() {
    api.getEntries('match').then((matches) => {
      this.state.matches = matches
      this.render()
    })
  }

  handleMatchSelect(e) {
    const matchId = e.target.value
    const selectedMatch = this.state.matches.find(m => m._id === matchId)
    
    if (selectedMatch) {
      this.state.matchId = selectedMatch._id
      this.state.team1 = selectedMatch.team1
      this.state.team2 = selectedMatch.team2
      this.state.date = selectedMatch.homeDate
      this.state.group = selectedMatch.group
      this.state.session = selectedMatch.session
      this.render()
    }
  }

  handleMatchTypeChange(e) {
    const matchType = e.target.value
    const selectedMatch = this.state.matches.find(m => m._id === this.state.matchId)
    
    if (selectedMatch) {
      this.state.matchType = matchType
      this.state.date = matchType === 'home' ? selectedMatch.homeDate : selectedMatch.awayDate
      this.render()
    }
  }

  handleSubmit(e) {
    e.preventDefault()
    const forfeitTeam = this.state.team1Forfeit ? this.state.team1 : 
                       this.state.team2Forfeit ? this.state.team2 : null
    const postponedTeam = this.state.team1Postponed ? this.state.team1 :
                         this.state.team2Postponed ? this.state.team2 : null

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
    }).then((result) => {
      if (this.onNew) {
        this.onNew(result)
      } else {
        window.location.hash = '#/results'
      }
    })
  }

  handleChange(field, e) {
    this.state[field] = e.target.value
    this.render()
  }

  handleCheckboxChange(field, e) {
    this.state[field] = e.target.checked
    this.render()
  }

  render() {
    const container = document.createElement('div')
    container.className = 'new-result-page'

    const title = document.createElement('h2')
    title.textContent = 'Créer un nouveau résultat'

    const form = document.createElement('form')
    form.className = 'new-result-form'
    form.onsubmit = (e) => this.handleSubmit(e)

    // Match selection
    const matchGroup = document.createElement('div')
    matchGroup.className = 'form-group'

    const matchLabel = document.createElement('label')
    matchLabel.textContent = 'Sélectionner un match'

    const matchSelect = document.createElement('select')
    matchSelect.className = 'form-control'
    matchSelect.value = this.state.matchId
    matchSelect.onchange = (e) => this.handleMatchSelect(e)

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
    typeSelect.value = this.state.matchType
    typeSelect.onchange = (e) => this.handleMatchTypeChange(e)

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
    team1Input.value = this.state.team1
    team1Input.required = true
    team1Input.onchange = (e) => this.handleChange('team1', e)

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
    score1Input.value = this.state.team1Score
    score1Input.required = true
    score1Input.onchange = (e) => this.handleChange('team1Score', e)

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
    score2Input.value = this.state.team2Score
    score2Input.required = true
    score2Input.onchange = (e) => this.handleChange('team2Score', e)

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
    team2Input.value = this.state.team2
    team2Input.required = true
    team2Input.onchange = (e) => this.handleChange('team2', e)

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
    dateInput.value = this.state.date
    dateInput.placeholder = 'ex: 31 mars 2025 à 20:30'
    dateInput.required = true
    dateInput.onchange = (e) => this.handleChange('date', e)

    dateGroup.appendChild(dateLabel)
    dateGroup.appendChild(dateInput)
    form.appendChild(dateGroup)

    // Forfeit checkboxes
    const forfeit1Group = document.createElement('div')
    forfeit1Group.className = 'form-group'

    const forfeit1Label = document.createElement('label')
    const forfeit1Checkbox = document.createElement('input')
    forfeit1Checkbox.type = 'checkbox'
    forfeit1Checkbox.checked = this.state.team1Forfeit
    forfeit1Checkbox.onchange = (e) => this.handleCheckboxChange('team1Forfeit', e)
    forfeit1Label.appendChild(forfeit1Checkbox)
    forfeit1Label.appendChild(document.createTextNode(` ${this.state.team1} - Forfait`))

    forfeit1Group.appendChild(forfeit1Label)
    form.appendChild(forfeit1Group)

    const forfeit2Group = document.createElement('div')
    forfeit2Group.className = 'form-group'

    const forfeit2Label = document.createElement('label')
    const forfeit2Checkbox = document.createElement('input')
    forfeit2Checkbox.type = 'checkbox'
    forfeit2Checkbox.checked = this.state.team2Forfeit
    forfeit2Checkbox.onchange = (e) => this.handleCheckboxChange('team2Forfeit', e)
    forfeit2Label.appendChild(forfeit2Checkbox)
    forfeit2Label.appendChild(document.createTextNode(` ${this.state.team2} - Forfait`))

    forfeit2Group.appendChild(forfeit2Label)
    form.appendChild(forfeit2Group)

    // Postponed checkboxes
    const postponed1Group = document.createElement('div')
    postponed1Group.className = 'form-group'

    const postponed1Label = document.createElement('label')
    const postponed1Checkbox = document.createElement('input')
    postponed1Checkbox.type = 'checkbox'
    postponed1Checkbox.checked = this.state.team1Postponed
    postponed1Checkbox.onchange = (e) => this.handleCheckboxChange('team1Postponed', e)
    postponed1Label.appendChild(postponed1Checkbox)
    postponed1Label.appendChild(document.createTextNode(` ${this.state.team1} - Reporté`))

    postponed1Group.appendChild(postponed1Label)
    form.appendChild(postponed1Group)

    const postponed2Group = document.createElement('div')
    postponed2Group.className = 'form-group'

    const postponed2Label = document.createElement('label')
    const postponed2Checkbox = document.createElement('input')
    postponed2Checkbox.type = 'checkbox'
    postponed2Checkbox.checked = this.state.team2Postponed
    postponed2Checkbox.onchange = (e) => this.handleCheckboxChange('team2Postponed', e)
    postponed2Label.appendChild(postponed2Checkbox)
    postponed2Label.appendChild(document.createTextNode(` ${this.state.team2} - Reporté`))

    postponed2Group.appendChild(postponed2Label)
    form.appendChild(postponed2Group)

    // Submit button
    const submitButton = document.createElement('button')
    submitButton.type = 'submit'
    submitButton.className = 'btn btn-primary'
    submitButton.textContent = 'Créer'
    form.appendChild(submitButton)

    container.appendChild(title)
    container.appendChild(form)

    this.container.innerHTML = ''
    this.container.appendChild(container)
  }
}

module.exports = NewResult