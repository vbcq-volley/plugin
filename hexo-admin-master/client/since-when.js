class SinceWhen {
  constructor() {
    this.interval = null
    this.container = null
    this.state = {
      time: ''
    }
  }

  init(container, props) {
    this.container = container
    this.props = props
    this.state.time = props.time.fromNow()
    this.render()

    this.interval = setInterval(() => this.tick(), 5000)
  }

  tick() {
    if (!this.container) {
      clearInterval(this.interval)
      return
    }
    this.state.time = this.props.time.fromNow()
    this.render()
  }

  render() {
    const span = document.createElement('span')
    span.textContent = this.props.prefix + this.state.time
    span.className = this.props.className || ''

    this.container.innerHTML = ''
    this.container.appendChild(span)
  }

  destroy() {
    if (this.interval) {
      clearInterval(this.interval)
    }
  }
}

module.exports = SinceWhen
