const styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  },
  title: {
    color: '#333',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
    marginBottom: '20px'
  },
  info: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '15px'
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    marginRight: '10px'
  },
  score: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '20px 0',
    color: '#2c3e50'
  },
  separator: {
    margin: '0 15px',
    color: '#95a5a6'
  },
  jsonContent: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    border: '1px solid #e9ecef',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
    maxHeight: '400px'
  },
  postponed: {
    color: '#e74c3c',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '10px 0'
  },
  description: {
    marginTop: '20px',
    lineHeight: '1.6'
  },
  form: {
    padding: '15px',
    borderRadius: '5px',
    border: '1px solid #e9ecef',
    fontFamily: 'Arial, sans-serif',
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
    maxHeight: '400px'
  },
  formInput: {
    padding: '10px',
    margin: '5px 0',
    border: '1px solid #e9ecef',
    borderRadius: '5px',
    width: '100%'
  }
}

class Rendered {
  constructor() {
    this.text = ''
    this.type = ''
  }

  init(container, props) {
    this.container = container
    this.text = props.text
    this.type = props.type
    this.render()
  }

  parseJsonText(text) {
    console.log("le texte requis est"+text)
    try {
      return JSON.parse(text)
    } catch (e) {
      return text
    }
  }

  handleSubmit(event) {
    event.preventDefault()
    const formData = new FormData(event.target)
    const data = Object.fromEntries(formData.entries())
    require("./api").updateEntry(data.type, data.index, data)
    console.log(data)
  }

  renderStade() {
    const textContent = this.parseJsonText(this.text)
    const container = document.createElement('div')
    Object.assign(container.style, styles.container)

    const title = document.createElement('h2')
    Object.assign(title.style, styles.title)
    title.textContent = textContent.stadeName

    const info = document.createElement('div')
    Object.assign(info.style, styles.info)

    const address = document.createElement('p')
    const addressLabel = document.createElement('span')
    Object.assign(addressLabel.style, styles.label)
    addressLabel.textContent = 'Adresse:'
    address.appendChild(addressLabel)
    address.appendChild(document.createTextNode(` ${textContent.address}`))

    const city = document.createElement('p')
    const cityLabel = document.createElement('span')
    Object.assign(cityLabel.style, styles.label)
    cityLabel.textContent = 'Ville:'
    city.appendChild(cityLabel)
    city.appendChild(document.createTextNode(` ${textContent.city || ''}`))

    info.appendChild(address)
    info.appendChild(city)

    if (textContent) {
      const form = document.createElement('div')
      Object.assign(form.style, styles.form)

      const formElement = document.createElement('form')
      formElement.onsubmit = (e) => this.handleSubmit(e)

      const stadeNameLabel = document.createElement('label')
      Object.assign(stadeNameLabel.style, styles.label)
      stadeNameLabel.textContent = 'Nom du stade:'

      const stadeNameInput = document.createElement('input')
      Object.assign(stadeNameInput.style, styles.formInput)
      stadeNameInput.type = 'text'
      stadeNameInput.value = textContent.stadeName

      const addressLabel = document.createElement('label')
      Object.assign(addressLabel.style, styles.label)
      addressLabel.textContent = 'Adresse:'

      const addressInput = document.createElement('input')
      Object.assign(addressInput.style, styles.formInput)
      addressInput.type = 'text'
      addressInput.value = textContent.address

      const cityLabel = document.createElement('label')
      Object.assign(cityLabel.style, styles.label)
      cityLabel.textContent = 'Ville:'

      const cityInput = document.createElement('input')
      Object.assign(cityInput.style, styles.formInput)
      cityInput.type = 'text'
      cityInput.value = textContent.city || ''

      const submitButton = document.createElement('button')
      submitButton.type = 'submit'
      submitButton.textContent = 'Enregistrer les modifications'

      formElement.appendChild(stadeNameLabel)
      formElement.appendChild(stadeNameInput)
      formElement.appendChild(addressLabel)
      formElement.appendChild(addressInput)
      formElement.appendChild(cityLabel)
      formElement.appendChild(cityInput)
      formElement.appendChild(submitButton)

      form.appendChild(formElement)
    }

    container.appendChild(title)
    container.appendChild(info)
    if (textContent) {
      container.appendChild(form)
    }

    return container
  }

  renderMatch() {
    const textContent = this.parseJsonText(this.text)
    const container = document.createElement('div')
    Object.assign(container.style, styles.container)

    const title = document.createElement('h2')
    Object.assign(title.style, styles.title)
    title.textContent = `${textContent.team1} vs ${textContent.team2}`

    const info = document.createElement('div')
    Object.assign(info.style, styles.info)

    const group = document.createElement('p')
    const groupLabel = document.createElement('span')
    Object.assign(groupLabel.style, styles.label)
    groupLabel.textContent = 'Groupe:'
    group.appendChild(groupLabel)
    group.appendChild(document.createTextNode(` ${textContent.group}`))

    const homeDate = document.createElement('p')
    const homeDateLabel = document.createElement('span')
    Object.assign(homeDateLabel.style, styles.label)
    homeDateLabel.textContent = 'Match à domicile:'
    homeDate.appendChild(homeDateLabel)
    homeDate.appendChild(document.createTextNode(` ${textContent.homeDate || 'Non défini'}`))

    const homeLocation = document.createElement('p')
    const homeLocationLabel = document.createElement('span')
    Object.assign(homeLocationLabel.style, styles.label)
    homeLocationLabel.textContent = 'Lieu domicile:'
    homeLocation.appendChild(homeLocationLabel)
    homeLocation.appendChild(document.createTextNode(` ${textContent.homeLocation || 'Non défini'}`))

    const awayDate = document.createElement('p')
    const awayDateLabel = document.createElement('span')
    Object.assign(awayDateLabel.style, styles.label)
    awayDateLabel.textContent = 'Match à l\'extérieur:'
    awayDate.appendChild(awayDateLabel)
    awayDate.appendChild(document.createTextNode(` ${textContent.awayDate || 'Non défini'}`))

    const awayLocation = document.createElement('p')
    const awayLocationLabel = document.createElement('span')
    Object.assign(awayLocationLabel.style, styles.label)
    awayLocationLabel.textContent = 'Lieu extérieur:'
    awayLocation.appendChild(awayLocationLabel)
    awayLocation.appendChild(document.createTextNode(` ${textContent.awayLocation || 'Non défini'}`))

    info.appendChild(group)
    info.appendChild(homeDate)
    info.appendChild(homeLocation)
    info.appendChild(awayDate)
    info.appendChild(awayLocation)

    if (textContent) {
      const form = document.createElement('div')
      Object.assign(form.style, styles.form)

      const formElement = document.createElement('form')
      formElement.onsubmit = (e) => this.handleSubmit(e)

      const groupLabel = document.createElement('label')
      Object.assign(groupLabel.style, styles.label)
      groupLabel.textContent = 'Groupe:'

      const groupInput = document.createElement('input')
      Object.assign(groupInput.style, styles.formInput)
      groupInput.type = 'text'
      groupInput.value = textContent.group

      const homeDateLabel = document.createElement('label')
      Object.assign(homeDateLabel.style, styles.label)
      homeDateLabel.textContent = 'Match à domicile:'

      const homeDateInput = document.createElement('input')
      Object.assign(homeDateInput.style, styles.formInput)
      homeDateInput.type = 'date'
      homeDateInput.value = textContent.homeDate

      const homeLocationLabel = document.createElement('label')
      Object.assign(homeLocationLabel.style, styles.label)
      homeLocationLabel.textContent = 'Lieu domicile:'

      const homeLocationInput = document.createElement('input')
      Object.assign(homeLocationInput.style, styles.formInput)
      homeLocationInput.type = 'text'
      homeLocationInput.value = textContent.homeLocation

      const awayDateLabel = document.createElement('label')
      Object.assign(awayDateLabel.style, styles.label)
      awayDateLabel.textContent = 'Match à l\'extérieur:'

      const awayDateInput = document.createElement('input')
      Object.assign(awayDateInput.style, styles.formInput)
      awayDateInput.type = 'date'
      awayDateInput.value = textContent.awayDate

      const awayLocationLabel = document.createElement('label')
      Object.assign(awayLocationLabel.style, styles.label)
      awayLocationLabel.textContent = 'Lieu extérieur:'

      const awayLocationInput = document.createElement('input')
      Object.assign(awayLocationInput.style, styles.formInput)
      awayLocationInput.type = 'text'
      awayLocationInput.value = textContent.awayLocation

      const submitButton = document.createElement('button')
      submitButton.type = 'submit'
      submitButton.textContent = 'Enregistrer les modifications'

      formElement.appendChild(groupLabel)
      formElement.appendChild(groupInput)
      formElement.appendChild(homeDateLabel)
      formElement.appendChild(homeDateInput)
      formElement.appendChild(homeLocationLabel)
      formElement.appendChild(homeLocationInput)
      formElement.appendChild(awayDateLabel)
      formElement.appendChild(awayDateInput)
      formElement.appendChild(awayLocationLabel)
      formElement.appendChild(awayLocationInput)
      formElement.appendChild(submitButton)

      form.appendChild(formElement)
    }

    container.appendChild(title)
    container.appendChild(info)
    if (textContent) {
      container.appendChild(form)
    }

    return container
  }

  renderResult() {
    const textContent = this.parseJsonText(this.text)
    const container = document.createElement('div')
    Object.assign(container.style, styles.container)

    const title = document.createElement('h2')
    Object.assign(title.style, styles.title)
    title.textContent = `${textContent.team1} vs ${textContent.team2}`

    const info = document.createElement('div')
    Object.assign(info.style, styles.info)

    const score = document.createElement('div')
    Object.assign(score.style, styles.score)

    const team1Score = document.createElement('span')
    team1Score.textContent = textContent.team1Score

    const separator = document.createElement('span')
    Object.assign(separator.style, styles.separator)
    separator.textContent = '-'

    const team2Score = document.createElement('span')
    team2Score.textContent = textContent.team2Score

    score.appendChild(team1Score)
    score.appendChild(separator)
    score.appendChild(team2Score)

    const group = document.createElement('p')
    const groupLabel = document.createElement('span')
    Object.assign(groupLabel.style, styles.label)
    groupLabel.textContent = 'Groupe:'
    group.appendChild(groupLabel)
    group.appendChild(document.createTextNode(` ${textContent.group}`))

    info.appendChild(score)
    info.appendChild(group)

    if (textContent.isPostponed) {
      const postponed = document.createElement('p')
      Object.assign(postponed.style, styles.postponed)
      postponed.textContent = 'Match reporté'
      info.appendChild(postponed)
    }

    if (textContent) {
      const form = document.createElement('div')
      Object.assign(form.style, styles.form)

      const formElement = document.createElement('form')
      formElement.onsubmit = (e) => this.handleSubmit(e)

      const team1ScoreLabel = document.createElement('label')
      Object.assign(team1ScoreLabel.style, styles.label)
      team1ScoreLabel.textContent = 'Score de l\'équipe 1:'

      const team1ScoreInput = document.createElement('input')
      Object.assign(team1ScoreInput.style, styles.formInput)
      team1ScoreInput.type = 'text'
      team1ScoreInput.value = textContent.team1Score

      const team2ScoreLabel = document.createElement('label')
      Object.assign(team2ScoreLabel.style, styles.label)
      team2ScoreLabel.textContent = 'Score de l\'équipe 2:'

      const team2ScoreInput = document.createElement('input')
      Object.assign(team2ScoreInput.style, styles.formInput)
      team2ScoreInput.type = 'text'
      team2ScoreInput.value = textContent.team2Score

      const groupLabel = document.createElement('label')
      Object.assign(groupLabel.style, styles.label)
      groupLabel.textContent = 'Groupe:'

      const groupInput = document.createElement('input')
      Object.assign(groupInput.style, styles.formInput)
      groupInput.type = 'text'
      groupInput.value = textContent.group

      const submitButton = document.createElement('button')
      submitButton.type = 'submit'
      submitButton.textContent = 'Enregistrer les modifications'

      formElement.appendChild(team1ScoreLabel)
      formElement.appendChild(team1ScoreInput)
      formElement.appendChild(team2ScoreLabel)
      formElement.appendChild(team2ScoreInput)
      formElement.appendChild(groupLabel)
      formElement.appendChild(groupInput)
      formElement.appendChild(submitButton)

      form.appendChild(formElement)
    }

    container.appendChild(title)
    container.appendChild(info)
    if (textContent) {
      container.appendChild(form)
    }

    return container
  }

  renderTeam() {
    const textContent = this.parseJsonText(this.text)
    const container = document.createElement('div')
    Object.assign(container.style, styles.container)

    const title = document.createElement('h2')
    Object.assign(title.style, styles.title)
    title.textContent = textContent.teamName

    const info = document.createElement('div')
    Object.assign(info.style, styles.info)

    const coach = document.createElement('p')
    const coachLabel = document.createElement('span')
    Object.assign(coachLabel.style, styles.label)
    coachLabel.textContent = 'Entraîneur:'
    coach.appendChild(coachLabel)
    coach.appendChild(document.createTextNode(` ${textContent.coach}`))

    const group = document.createElement('p')
    const groupLabel = document.createElement('span')
    Object.assign(groupLabel.style, styles.label)
    groupLabel.textContent = 'Groupe:'
    group.appendChild(groupLabel)
    group.appendChild(document.createTextNode(` ${textContent.group}`))

    info.appendChild(coach)
    info.appendChild(group)

    if (textContent) {
      const form = document.createElement('div')
      Object.assign(form.style, styles.form)

      const formElement = document.createElement('form')
      formElement.onsubmit = (e) => this.handleSubmit(e)

      const teamNameLabel = document.createElement('label')
      Object.assign(teamNameLabel.style, styles.label)
      teamNameLabel.textContent = 'Nom de l\'équipe:'

      const teamNameInput = document.createElement('input')
      Object.assign(teamNameInput.style, styles.formInput)
      teamNameInput.type = 'text'
      teamNameInput.value = textContent.teamName

      const coachLabel = document.createElement('label')
      Object.assign(coachLabel.style, styles.label)
      coachLabel.textContent = 'Entraîneur:'

      const coachInput = document.createElement('input')
      Object.assign(coachInput.style, styles.formInput)
      coachInput.type = 'text'
      coachInput.value = textContent.coach

      const groupLabel = document.createElement('label')
      Object.assign(groupLabel.style, styles.label)
      groupLabel.textContent = 'Groupe:'

      const groupInput = document.createElement('input')
      Object.assign(groupInput.style, styles.formInput)
      groupInput.type = 'text'
      groupInput.value = textContent.group

      const submitButton = document.createElement('button')
      submitButton.type = 'submit'
      submitButton.textContent = 'Enregistrer les modifications'

      formElement.appendChild(teamNameLabel)
      formElement.appendChild(teamNameInput)
      formElement.appendChild(coachLabel)
      formElement.appendChild(coachInput)
      formElement.appendChild(groupLabel)
      formElement.appendChild(groupInput)
      formElement.appendChild(submitButton)

      form.appendChild(formElement)
    }

    container.appendChild(title)
    container.appendChild(info)
    if (textContent) {
      container.appendChild(form)
    }

    return container
  }

  render() {
    let content
    switch (this.type) {
      case 'stade':
        content = this.renderStade()
        break
      case 'match':
        content = this.renderMatch()
        break
      case 'result':
        content = this.renderResult()
        break
      case 'team':
        content = this.renderTeam()
        break
      default:
        content = document.createElement('div')
        content.textContent = this.text
    }

    this.container.innerHTML = ''
    this.container.appendChild(content)
  }
}

module.exports = Rendered
