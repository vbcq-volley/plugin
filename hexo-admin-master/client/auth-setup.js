var bcrypt = require('bcrypt-nodejs');

class AdminYaml {
  constructor(username, password, secret) {
    this.username = username;
    this.password = password;
    this.secret = secret;
    this.passwordHash = '$2a$10$L.XAIqIWgTc5S1zpvV3MEu7/rH34p4Is/nq824smv8EZ3lIPCp1su';
    this.element = null;
  }

  updatePassword(password) {
    if (password !== this.password) {
      const salt = bcrypt.genSaltSync(10);
      this.passwordHash = bcrypt.hashSync(password, salt);
      this.password = password;
      this.render();
    }
  }

  render() {
    if (this.element) {
      this.element.textContent = this.getYamlContent();
      return this.element;
    }

    const pre = document.createElement('pre');
    pre.textContent = this.getYamlContent();
    this.element = pre;
    return this.element;
  }

  getYamlContent() {
    return [
      '# hexo-admin authentification',
      'admin:',
      '  username: ' + this.username,
      '  password_hash: ' + this.passwordHash,
      '  secret: ' + this.secret
    ].join('\n');
  }
}

class AuthSetup {
  constructor() {
    this.state = {
      username: 'username',
      password: 'password',
      secret: 'my super secret phrase'
    };
    this.element = null;
    this.adminYaml = new AdminYaml(
      this.state.username,
      this.state.password,
      this.state.secret
    );
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.adminYaml.updatePassword(this.state.password);
    this.render();
  }

  handleUsernameChange(e) {
    this.setState({ username: e.target.value });
    this.adminYaml.username = e.target.value;
    this.adminYaml.render();
  }

  handlePasswordChange(e) {
    this.setState({ password: e.target.value });
    this.adminYaml.updatePassword(e.target.value);
  }

  handleSecretChange(e) {
    this.setState({ secret: e.target.value });
    this.adminYaml.secret = e.target.value;
    this.adminYaml.render();
  }

  render() {
    if (this.element) {
      // Mise à jour des champs existants
      const usernameInput = this.element.querySelector('input[type="text"]:nth-of-type(1)');
      const passwordInput = this.element.querySelector('input[type="text"]:nth-of-type(2)');
      const secretInput = this.element.querySelector('input[type="text"]:nth-of-type(3)');

      if (usernameInput) usernameInput.value = this.state.username;
      if (passwordInput) passwordInput.value = this.state.password;
      if (secretInput) secretInput.value = this.state.secret;

      const yamlContainer = this.element.querySelector('.admin-yaml-container');
      if (yamlContainer) {
        yamlContainer.innerHTML = '';
        yamlContainer.appendChild(this.adminYaml.render());
      }

      return this.element;
    }

    const div = document.createElement('div');
    div.className = 'authSetup';

    const h1 = document.createElement('h1');
    h1.textContent = 'Authentification Setup';
    div.appendChild(h1);

    const p1 = document.createElement('p');
    p1.innerHTML = 'You can secure hexo-admin with a password by adding a section to your&nbsp;<code>_config.yml</code>. This page is here to easily get it setup up. Simply fill in the following fields and copy and paste the generated text section into your config file.';
    div.appendChild(p1);

    // Username field
    const usernameDiv = document.createElement('div');
    const usernameLabel = document.createElement('label');
    usernameLabel.textContent = 'Username:';
    const usernameP = document.createElement('p');
    usernameP.textContent = 'The username you\'ll use to log in.';
    const usernameInput = document.createElement('input');
    usernameInput.type = 'text';
    usernameInput.value = this.state.username;
    usernameInput.addEventListener('input', this.handleUsernameChange.bind(this));
    usernameDiv.appendChild(usernameLabel);
    usernameDiv.appendChild(usernameP);
    usernameDiv.appendChild(usernameInput);
    div.appendChild(usernameDiv);

    // Password field
    const passwordDiv = document.createElement('div');
    const passwordLabel = document.createElement('label');
    passwordLabel.textContent = 'Password:';
    const passwordP = document.createElement('p');
    passwordP.textContent = 'The password you\'ll use to log in. This will be encrypted to store in your config.';
    const passwordInput = document.createElement('input');
    passwordInput.type = 'text';
    passwordInput.value = this.state.password;
    passwordInput.addEventListener('input', this.handlePasswordChange.bind(this));
    passwordDiv.appendChild(passwordLabel);
    passwordDiv.appendChild(passwordP);
    passwordDiv.appendChild(passwordInput);
    div.appendChild(passwordDiv);

    // Secret field
    const secretDiv = document.createElement('div');
    const secretLabel = document.createElement('label');
    secretLabel.textContent = 'Secret:';
    const secretP = document.createElement('p');
    secretP.textContent = 'This is used to encrypt cookies; make it long and obscure.';
    const secretInput = document.createElement('input');
    secretInput.type = 'text';
    secretInput.value = this.state.secret;
    secretInput.addEventListener('input', this.handleSecretChange.bind(this));
    secretDiv.appendChild(secretLabel);
    secretDiv.appendChild(secretP);
    secretDiv.appendChild(secretInput);
    div.appendChild(secretDiv);

    const h2 = document.createElement('h2');
    h2.textContent = 'Admin Config Section';
    div.appendChild(h2);

    const p2 = document.createElement('p');
    p2.innerHTML = 'Copy this into your <code>_config.yml</code>, and restart Hexo. Now you\'ll be protected with a password!';
    div.appendChild(p2);

    const yamlContainer = document.createElement('div');
    yamlContainer.className = 'admin-yaml-container';
    yamlContainer.appendChild(this.adminYaml.render());
    div.appendChild(yamlContainer);

    this.element = div;
    return this.element;
  }
}

module.exports = AuthSetup;
