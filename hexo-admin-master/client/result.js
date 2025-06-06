const Editor_data = require('./editor-data')

class Result {
  constructor() {
    this.editor = new Editor_data()
  }

  init(container, params) {
    this.editor.init(container, {
      id: params.id,
      type: 'result'
    })
  }
}

module.exports = new Result() 