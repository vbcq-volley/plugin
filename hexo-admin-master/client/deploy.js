var api = require('./api')

class Deploy {
  constructor() {
    this.state = {
      stdout: '',
      stderr: '',
      error: null,
      message: '',
      status: 'initial'
    };
    this.element = null;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  handleSubmit(e) {
    e.preventDefault();
    const message = this.state.message;
    this.setState({
      message: '',
      error: null,
      stdout: '',
      stderr: '',
      status: 'loading'
    });
    
    api.deploy(message).then(result => {
      this.setState({
        status: result.error ? 'error' : 'success',
        error: result.error,
        stdout: result.stdout && result.stdout.trim(),
        stderr: result.stderr && result.stderr.trim()
      });
    });
  }

  render() {
    if (this.element) {
      // Mise à jour des éléments existants
      const messageInput = this.element.querySelector('.deploy_message');
      if (messageInput) {
        messageInput.value = this.state.message;
      }

      const bodyContainer = this.element.querySelector('.deploy_body');
      if (bodyContainer) {
        bodyContainer.innerHTML = '';
        let body;
        
        if (this.state.error) {
          const h4 = document.createElement('h4');
          h4.textContent = `Error: ${this.state.error}`;
          body = h4;
        } else if (this.state.status === 'loading') {
          const h4 = document.createElement('h4');
          h4.textContent = 'Loading...';
          body = h4;
        } else if (this.state.status === 'success') {
          const div = document.createElement('div');
          const h4 = document.createElement('h4');
          h4.textContent = 'Std Output';
          const pre = document.createElement('pre');
          pre.textContent = this.state.stdout;
          div.appendChild(h4);
          div.appendChild(pre);
          body = div;
        }

        if (body) {
          bodyContainer.appendChild(body);
        }
      }
      return this.element;
    }

    // Création initiale des éléments
    const div = document.createElement('div');
    div.className = 'deploy';
    div.style.whiteSpace = 'nowrap';

    const p = document.createElement('p');
    p.textContent = 'Type a message here and hit `deploy` to run your deploy script.';
    div.appendChild(p);

    const form = document.createElement('form');
    form.className = 'deploy_form';
    form.addEventListener('submit', this.handleSubmit.bind(this));

    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'deploy_message';
    input.value = this.state.message;
    input.placeholder = 'Deploy/commit message';
    input.addEventListener('input', (e) => this.setState({ message: e.target.value }));
    form.appendChild(input);

    const submitButton = document.createElement('input');
    submitButton.type = 'submit';
    submitButton.value = 'Deploy';
    form.appendChild(submitButton);

    div.appendChild(form);

    const bodyContainer = document.createElement('div');
    bodyContainer.className = 'deploy_body';
    div.appendChild(bodyContainer);

    this.element = div;
    this.render(); // Premier rendu
    return this.element;
  }
}

module.exports = Deploy;
