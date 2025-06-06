const path = require('path')
const Promise = require('es6-promise').Promise
const CodeMirror = require('./code-mirror')
const SinceWhen = require('./since-when')
const Rendered = require('./rendered')
const CheckGrammar = require('./check-grammar')
const ConfigDropper = require('./config-dropper')
const RenameFile = require('./rename-file')
const PopGallery = require('./pop-gallery')
const codemirror = require('codemirror')

// Étendre la classe Date
Date.prototype.fromNow = function() {
  const now = new Date()
  const diffInMilliseconds = now - this

  // Convertir la différence en secondes, minutes, heures, jours, etc.
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInDays > 0) {
    return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`
  } else if (diffInHours > 0) {
    return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`
  } else if (diffInMinutes > 0) {
    return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`
  } else {
    return `il y a ${diffInSeconds} seconde${diffInSeconds !== 1 ? 's' : ''}`
  }
}

class Editor {
  constructor() {
    this.state = {
      postPath: '',
      previewLink: '',
      checkingGrammar: false,
      openGallery: false,
      renderedType: '',
      tagsCategoriesAndMetadata: {},
      onChange: null,
      onChangeContent: null,
      onChangeTitle: null,
      onPublish: null,
      onUnpublish: null,
      onRemove: null,
      mdLink: null
    }
  }

  init(container, props) {
    this.container = container
    this.props = props

    const url = window.location.href.split('/')
    const rootPath = url.slice(0, url.indexOf('admin')).join('/')
    const completeURL = rootPath + '/' + props.post.path

    this.state = {
      postPath: props.post.path,
      previewLink: completeURL,
      checkingGrammar: false,
      openGallery: false,
      renderedType: props.type,
      tagsCategoriesAndMetadata: props.tagsCategoriesAndMetadata,
      onChange: props.onChange,
      onChangeContent: props.onChangeContent,
      onChangeTitle: props.onChangeTitle,
      onPublish: props.onPublish,
      onUnpublish: props.onUnpublish,
      onRemove: props.onRemove,
      mdLink: null
    }

    this.render()
  }

  handlePreviewLink(postNewPath) {
    const url = window.location.href.split('/')
    const rootPath = url.slice(0, url.indexOf('admin')).join('/')
    const completeURL = rootPath + '/' + postNewPath
    this.state.postPath = postNewPath
    this.state.previewLink = completeURL
    this.render()
  }

  handleChangeTitle(e) {
    return this.props.onChangeTitle(e.target.value)
  }

  handleScroll(percent) {
    if (!this.state.checkingGrammar) {
      const node = this.rendered
      const height = node.getBoundingClientRect().height
      node.scrollTop = (node.scrollHeight - height) * percent
    }
  }

  onCheckGrammar() {
    this.state.checkingGrammar = !this.state.checkingGrammar
    this.render()
  }

  onAddImage() {
    this.state.openGallery = !this.state.openGallery
    this.render()
  }

  handleEditFocus() {
    this.state.openGallery = false
    this.render()
  }

  handleImgSelect(img) {
    this.state.mdImg = '![image](/images/' + img + ')'
    this.render()
  }

  onAddLink() {
    const linkText = '\n[lien](lien a mettre)'
    navigator.clipboard.writeText(linkText).then(() => {
      const notification = document.createElement('div')
      notification.textContent = 'Le lien a été copié dans votre presse-papier'
      notification.style.position = 'fixed'
      notification.style.top = '20px'
      notification.style.right = '20px'
      notification.style.padding = '10px'
      notification.style.backgroundColor = '#4CAF50'
      notification.style.color = 'white'
      notification.style.borderRadius = '4px'
      notification.style.zIndex = '1000'
      document.body.appendChild(notification)
      setTimeout(() => {
        notification.remove()
      }, 3000)
    }).catch(err => {
      console.error('Erreur lors de la copie dans le presse-papier:', err)
    })
  }

  render() {
    console.log(this.props)
    const container = document.createElement('div')
    container.className = `editor ${this.props.isDraft ? 'editor--draft' : ''}`

    const top = document.createElement('div')
    top.className = 'editor_top'

    const titleInput = document.createElement('input')
    titleInput.className = 'editor_title'
    titleInput.value = this.props.title
    titleInput.onchange = (e) => this.props.onChangeTitle(e.target.value)

    top.appendChild(titleInput)

    if (this.state.renderedType === 'post' && !this.props.isPage) {
      const configDropper = new ConfigDropper()
      configDropper.init(top, {
        post: this.props.post,
        tagsCategoriesAndMetadata: this.props.tagsCategoriesAndMetadata,
        onChange: this.props.onChange
      })

      if (this.props.isDraft) {
        const publishButton = document.createElement('button')
        publishButton.className = 'editor_publish'
        publishButton.onclick = this.props.onPublish
        publishButton.textContent = 'Publish'
        top.appendChild(publishButton)

        const removeButton = document.createElement('button')
        removeButton.className = 'editor_remove'
        removeButton.title = 'Remove'
        removeButton.onclick = this.props.onRemove
        removeButton.innerHTML = '<i class="fa fa-trash-o" aria-hidden="true"></i>'
        top.appendChild(removeButton)
      } else {
        const unpublishButton = document.createElement('button')
        unpublishButton.className = 'editor_unpublish'
        unpublishButton.onclick = this.props.onUnpublish
        unpublishButton.textContent = 'Unpublish'
        top.appendChild(unpublishButton)

        const removeButton = document.createElement('button')
        removeButton.className = 'editor_remove'
        removeButton.title = 'Can\'t Remove Published Post'
        removeButton.onclick = this.props.onRemove
        removeButton.disabled = true
        removeButton.innerHTML = '<i class="fa fa-trash-o" aria-hidden="true"></i>'
        top.appendChild(removeButton)
      }
    }

    container.appendChild(top)

    this.container.innerHTML = ''
    this.container.appendChild(container)
  }
}

module.exports = Editor
