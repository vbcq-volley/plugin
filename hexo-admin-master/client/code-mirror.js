var React = require('react')
var CM = require('codemirror/lib/codemirror')
var PT = React.PropTypes
var api = require('./api')

var CodeMirror = React.createClass({
  propTypes: {
    onScroll: PT.func,
    forceLineNumbers: PT.bool,
    adminSettings: PT.object,
    onFocus: PT.func,
    onBlur: PT.func,
    onCusorActivity: PT.func
  },

  componentDidUpdate: function (prevProps) {
    if (prevProps.initialValue !== this.props.initialValue) {
      this.cm.setValue(this.props.initialValue)
    }
    if (prevProps.forceLineNumbers !== this.props.forceLineNumbers) {
      if (!(this.props.adminSettings.editor || {}).lineNumbers) {
        this.cm.setOption('lineNumbers', this.props.forceLineNumbers);
      }
    }
    if(prevProps.cusor !== this.props.cusor) {
      this.cm.focus();
      this.cm.setCursor(this.props.cusor);
    }

    if(prevProps.mdImg !== this.props.mdImg) {
      this.cm.focus();
      var cursor = this.lastCusor;
      var pos = {
          line: cursor.line,
          ch: 0
      }
      this.cm.replaceRange(this.props.mdImg+'\r\n', pos, pos);
    }

    if(prevProps.mdLink !== this.props.mdLink) {
      this.cm.focus();
      var cursor = this.lastCusor;
      var pos = {
          line: cursor.line,
          ch: this.cm.getLine(cursor.line).length
      }
      // Limiter le nombre de liens à 300
      var currentContent = this.cm.getValue();
      var linkCount = (currentContent.match(/\[lien\]/g) || []).length;
      
      if (linkCount < 3) {
        this.cm.replaceRange(this.props.mdLink, pos, pos);
      } else {
        alert('Nombre maximum de liens atteint (300)');
      }
      this.props.mdLink = null;
    }
  },

  componentDidMount: function () {
    require('codemirror/mode/markdown/markdown')

    var editorSettings = {
      value: this.props.initialValue || '',
      theme: 'default',
      mode: 'markdown',
      lineWrapping: true,
    }
    for (var key in this.props.adminSettings.editor) {
      editorSettings[key] = this.props.adminSettings.editor[key]
    }
    this.cm = CM(this.getDOMNode(), editorSettings);
    this.cm.on('change', (cm) => {
      this.props.onChange(cm.getValue());
    })
    this.cm.on('scroll', (cm) => {
      var node = cm.getScrollerElement()
      var max = node.scrollHeight - node.getBoundingClientRect().height
      this.props.onScroll(node.scrollTop / max)
    })
    this.cm.on('focus', cm => {
      this.lastCusor = this.cm.getCursor();
      if(this.props.onFocus) this.props.onFocus();
    })
    this.cm.on('blur', cm => {
      this.lastCusor = this.cm.getCursor();
    })
    this.cm.on('cursorActivity', cm => {
      this.lastCusor = this.cm.getCursor();
    })
    var box = this.getDOMNode().parentNode.getBoundingClientRect()
    this.cm.setSize(box.width, box.height - 32)

    window.addEventListener('resize', this._onResize)
    document.addEventListener('paste', this._onPaste)
  },

  _onResize: function () {
    var box = this.getDOMNode().parentNode.getBoundingClientRect()
    this.cm.setSize(box.width, box.height - 32)
  },

  componentWillUnmount: function () {
    document.removeEventListener('paste', this._onPaste)
    document.removeEventListener('resize', this._onResize)
  },

  _onPaste: function (event) {
    var items = (event.clipboardData || event.originalEvent.clipboardData).items;
    if (!items.length) return
    var blob;
    for (var i = items.length - 1; i >= 0; i--) {
      if (items[i].kind == 'file'){
        blob = items[i].getAsFile();
        break;
      }
    };
    if (!blob) return

    var settings = this.props.adminSettings
    var reader = new FileReader();
    reader.onload = (event) => {
      var filename = null;
      if (settings.options) {
        if(!!settings.options.askImageFilename) {
          var filePath = !!settings.options.imagePath ? settings.options.imagePath : '/images'
          filename = prompt(`What would you like to name the photo? All files saved as pngs. Name will be relative to ${filePath}.`, 'image.png')
        }
      }
      console.log(filename)
      api.uploadImage(event.target.result, filename).then((res) =>
        this.cm.replaceSelection(`\n![${res.msg}](${res.src})`)
      );
    };
    reader.readAsDataURL(blob);
  },

  getCodeMirror: function getCodeMirror() {
    return this.cm;
  },

  render: function () {
    return <div/>
  }
})

module.exports = CodeMirror
