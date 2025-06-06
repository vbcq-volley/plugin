const CM = require('codemirror/lib/codemirror')
const api = require('./api')

class CodeMirror {
  constructor() {
    this.cm = null
    this.lastCursor = null
    this.container = null
  }

  init(container, props) {
    this.container = container
    this.props = props

    require('codemirror/mode/markdown/markdown')

    const editorSettings = {
      value: props.initialValue || '',
      theme: 'default',
      mode: 'markdown',
      lineWrapping: true,
    }

    for (const key in props.adminSettings.editor) {
      editorSettings[key] = props.adminSettings.editor[key]
    }

    this.cm = CM(container, editorSettings)
    this.cm.on('change', (cm) => {
      props.onChange(cm.getValue())
    })

    this.cm.on('scroll', (cm) => {
      const node = cm.getScrollerElement()
      const max = node.scrollHeight - node.getBoundingClientRect().height
      props.onScroll(node.scrollTop / max)
    })

    this.cm.on('focus', cm => {
      this.lastCursor = this.cm.getCursor()
      if (props.onFocus) props.onFocus()
    })

    this.cm.on('blur', cm => {
      this.lastCursor = this.cm.getCursor()
    })

    this.cm.on('cursorActivity', cm => {
      this.lastCursor = this.cm.getCursor()
    })

    const box = container.parentNode.getBoundingClientRect()
    this.cm.setSize(box.width, box.height - 32)

    window.addEventListener('resize', this._onResize.bind(this))
    document.addEventListener('paste', this._onPaste.bind(this))
  }

  update(props) {
    if (props.initialValue !== this.props.initialValue) {
      this.cm.setValue(props.initialValue)
    }

    if (props.forceLineNumbers !== this.props.forceLineNumbers) {
      if (!(props.adminSettings.editor || {}).lineNumbers) {
        this.cm.setOption('lineNumbers', props.forceLineNumbers)
      }
    }

    if (props.cursor !== this.props.cursor) {
      this.cm.focus()
      this.cm.setCursor(props.cursor)
    }

    if (props.mdImg !== this.props.mdImg) {
      this.cm.focus()
      const cursor = this.lastCursor
      const pos = {
        line: cursor.line,
        ch: 0
      }
      this.cm.replaceRange(props.mdImg + '\r\n', pos, pos)
    }

    if (props.mdLink !== this.props.mdLink) {
      this.cm.focus()
      const cursor = this.lastCursor
      const pos = {
        line: cursor.line,
        ch: this.cm.getLine(cursor.line).length
      }
      // Limiter le nombre de liens à 300
      const currentContent = this.cm.getValue()
      const linkCount = (currentContent.match(/\[lien\]/g) || []).length
      
      if (linkCount < 3) {
        this.cm.replaceRange(props.mdLink, pos, pos)
      } else {
        alert('Nombre maximum de liens atteint (300)')
      }
      props.mdLink = null
    }

    this.props = props
  }

  _onResize() {
    const box = this.container.parentNode.getBoundingClientRect()
    this.cm.setSize(box.width, box.height - 32)
  }

  _onPaste(event) {
    const items = (event.clipboardData || event.originalEvent.clipboardData).items
    if (!items.length) return

    let blob
    for (let i = items.length - 1; i >= 0; i--) {
      if (items[i].kind == 'file') {
        blob = items[i].getAsFile()
        break
      }
    }
    if (!blob) return

    const settings = this.props.adminSettings
    const reader = new FileReader()
    reader.onload = (event) => {
      let filename = null
      if (settings.options) {
        if (!!settings.options.askImageFilename) {
          const filePath = !!settings.options.imagePath ? settings.options.imagePath : '/images'
          filename = prompt(`What would you like to name the photo? All files saved as pngs. Name will be relative to ${filePath}.`, 'image.png')
        }
      }
      console.log(filename)
      api.uploadImage(event.target.result, filename).then((res) =>
        this.cm.replaceSelection(`\n![${res.msg}](${res.src})`)
      )
    }
    reader.readAsDataURL(blob)
  }

  destroy() {
    document.removeEventListener('paste', this._onPaste.bind(this))
    document.removeEventListener('resize', this._onResize.bind(this))
  }

  getCodeMirror() {
    return this.cm
  }
}

module.exports = CodeMirror
