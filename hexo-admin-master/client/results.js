const _ = require('lodash')
const moment = require('moment')
const SinceWhen = require('./since-when')
const Rendered = require('./rendered')
const NewResult = require('./new-result')
const api = require('./api')

class Results {
  constructor() {
    this.state = {
      selected: 0,
      showNewForm: false,
      results: [],
      updated: moment(),
      displayKeys: ['text'],
      allKeys: ['team1', 'team1Score', 'team2Score', 'team2', 'matchType', 'isForfeit', 'isPostponed'],
      keyLabels: {
        'team1': 'Équipe 1',
        'team1Score': 'Score Équipe 1',
        'team2Score': 'Score Équipe 2', 
        'team2': 'Équipe 2',
        'matchType': 'Type de Match',
        'isForfeit': 'Forfait',
        'isPostponed': 'Reporté',
        'text':'match'
      }
    }
  }

  init(container) {
    this.container = container
    this.loadData()
    this.render()
  }

  loadData() {
    api.getEntries("result").then((results) => {
      console.log("la data est"+JSON.stringify(results))
      this.state.results = results
      this.render()
    })
  }

  toggleNewForm() {
    this.state.showNewForm = !this.state.showNewForm
    this.render()
  }

  onNew(result) {
    const results = this.state.results.slice()
    results.unshift(result)
    this.state.results = results
    window.location.hash = `#/result/${result._id}`
  }

  onDelete(id, e) {
    if (e) {
      e.preventDefault()
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer ce résultat ?')) {
      api.deleteEntry("result", id).then(() => {
        const results = this.state.results.filter(result => result._id !== id)
        this.state.results = results
        this.render()
      })
    }
  }

  goTo(id, e) {
    if (e) {
      e.preventDefault()
    }
    window.location.hash = `#/result/${id}`
  }

  render() {
    if (!this.state.results) {
      this.container.innerHTML = '<div class="results">Loading...</div>'
      return
    }

    const current = this.state.results[this.state.selected] || {}
    const url = window.location.href.replace(/^.*\/\/[^\/]+/, '').split('/')
    const rootPath = url.slice(0, url.indexOf('admin')).join('/')

    const container = document.createElement('div')
    container.className = 'posts'

    const header = document.createElement('div')
    header.className = 'posts_header'

    const title = document.createElement('h2')
    title.textContent = 'Résultats'

    const newButton = document.createElement('button')
    newButton.className = 'new-result-button'
    newButton.innerHTML = `<i class="fa fa-plus"></i> ${this.state.showNewForm ? 'Annuler' : 'Nouveau résultat'}`
    newButton.onclick = () => this.toggleNewForm()

    header.appendChild(title)
    header.appendChild(newButton)
    container.appendChild(header)

    if (this.state.showNewForm) {
      const formContainer = document.createElement('div')
      formContainer.className = 'new-result-form-container'
      const newResult = new NewResult()
      newResult.init(formContainer, (result) => this.onNew(result))
      container.appendChild(formContainer)
    }

    const list = document.createElement('ul')
    list.className = 'posts_list'

    this.state.results.forEach((result, i) => {
      const item = document.createElement('li')
      item.className = `posts_post posts_post--draft ${i === this.state.selected ? 'posts_post--selected' : ''}`
      item.ondblclick = () => this.goTo(result._id)
      item.onclick = () => {
        this.state.selected = i
        this.render()
      }

      const title = document.createElement('span')
      title.className = 'posts_post-title'
      title.textContent = result.text

      const date = document.createElement('span')
      date.className = 'posts_post-date'
      date.textContent = result.date

      const editLink = document.createElement('a')
      editLink.className = 'posts_edit-link'
      editLink.href = `#/result/${result._id}`
      editLink.innerHTML = '<i class="fa fa-pencil-square-o"></i>'

      const deleteLink = document.createElement('a')
      deleteLink.className = 'posts_delete-link'
      deleteLink.onclick = (e) => this.onDelete(result._id, e)

      if (i === this.state.selected) {
        deleteLink.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"/>
            <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"/>
          </svg>
        `
      }

      item.appendChild(title)
      item.appendChild(date)
      item.appendChild(editLink)
      item.appendChild(deleteLink)
      list.appendChild(item)
    })

    container.appendChild(list)

    const display = document.createElement('div')
    display.className = 'posts_display posts_display--draft'

    const rendered = new Rendered()
    rendered.init(display, {
      text: JSON.stringify(current, null, 2),
      type: 'result'
    })

    container.appendChild(display)

    this.container.innerHTML = ''
    this.container.appendChild(container)
  }
}

module.exports = new Results()