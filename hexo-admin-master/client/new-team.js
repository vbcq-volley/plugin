const api = require('./api');

class NewTeam {
  constructor() {
    this.state = {
      showing: true,
      loading: true,
      text: 'Untitled',
      teamName: '',
      coach: '',
      group: '',
      link: ''
    };
    this.onNew = null;
  }

  _onKeydown(e) {
    if (e.key === 'Enter') {
      this._onSubmit(e);
    }
  }

  _onShow() {
    this.state.showing = true;
    this.render();
  }

  _onBlur(e) {
    if (this.state.showing && !this._isClickInsideForm(e)) {
      this._onCancel();
    }
  }

  _isClickInsideForm(e) {
    const formNode = this.form;
    return formNode.contains(e.relatedTarget);
  }

  _onSubmit(e) {
    e.preventDefault();
    this.state.loading = true;
    this.state.showing = true;
    this.render();

    const teamData = {
      text: this.state.text,
      teamName: this.state.teamName,
      coach: this.state.coach,
      group: this.state.group
    };

    api.addEntry('team', teamData).then((team) => {
      this.state.showing = true;
      this.state.text = 'Untitled';
      this.state.teamName = '';
      this.state.coach = '';
      this.state.group = '';
      if (this.onNew) {
        this.onNew(team);
      }
    }, (err) => {
      console.error('Failed to create team', err);
    });
  }

  _onCancel() {
    this.state.showing = false;
    this.render();
  }

  _onChange(e) {
    this.state.text = e.target.value;
    this.render();
  }

  _onTeamNameChange(e) {
    this.state.teamName = e.target.value;
    this.render();
  }

  _onCoachChange(e) {
    this.state.coach = e.target.value;
    this.render();
  }

  _onGroupChange(e) {
    this.state.group = e.target.value;
    this.render();
  }

  _onLinkChange(e) {
    this.state.link = e.target.value;
    this.render();
  }

  render() {
    const container = document.createElement('div');
    container.className = 'new-team';

    if (!this.state.showing) {
      const button = document.createElement('div');
      button.className = 'new-team_button';
      button.innerHTML = '<i class="fa fa-plus"></i> New Team';
      button.addEventListener('click', this._onShow.bind(this));
      container.appendChild(button);
      return container;
    }

    this.form = container;
    container.addEventListener('blur', this._onBlur.bind(this), true);

    const input = document.createElement('input');
    input.className = 'new-team_input';
    input.value = this.state.text;
    input.addEventListener('keypress', this._onKeydown.bind(this));
    input.addEventListener('change', this._onChange.bind(this));
    container.appendChild(input);

    const formGroup = document.createElement('div');

    const teamNameLabel = document.createElement('label');
    teamNameLabel.textContent = 'Team Name:';
    const teamNameInput = document.createElement('input');
    teamNameInput.type = 'text';
    teamNameInput.value = this.state.teamName;
    teamNameInput.addEventListener('change', this._onTeamNameChange.bind(this));
    teamNameLabel.appendChild(teamNameInput);
    formGroup.appendChild(teamNameLabel);

    const coachLabel = document.createElement('label');
    coachLabel.textContent = 'Coach:';
    const coachInput = document.createElement('input');
    coachInput.type = 'text';
    coachInput.value = this.state.coach;
    coachInput.addEventListener('change', this._onCoachChange.bind(this));
    coachLabel.appendChild(coachInput);
    formGroup.appendChild(coachLabel);

    const groupLabel = document.createElement('label');
    groupLabel.textContent = 'Group:';
    const groupSelect = document.createElement('select');
    groupSelect.value = this.state.group;
    groupSelect.addEventListener('change', this._onGroupChange.bind(this));
    
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select a group';
    groupSelect.appendChild(defaultOption);
    
    ['1', '2', '3'].forEach(group => {
      const option = document.createElement('option');
      option.value = group;
      option.textContent = `Group ${group}`;
      groupSelect.appendChild(option);
    });
    
    groupLabel.appendChild(groupSelect);
    formGroup.appendChild(groupLabel);
    container.appendChild(formGroup);

    const linkLabel = document.createElement('label');
    const linkInput = document.createElement('input');
    linkInput.type = 'link';
    linkInput.value = this.state.link;
    linkInput.addEventListener('change', this._onLinkChange.bind(this));
    linkLabel.appendChild(linkInput);
    container.appendChild(linkLabel);

    const okButton = document.createElement('i');
    okButton.className = 'fa fa-check-circle new-team_ok';
    okButton.addEventListener('mousedown', this._onSubmit.bind(this));
    container.appendChild(okButton);

    const cancelButton = document.createElement('i');
    cancelButton.className = 'fa fa-times-circle new-team_cancel';
    cancelButton.addEventListener('mousedown', this._onCancel.bind(this));
    container.appendChild(cancelButton);

    return container;
  }
}

module.exports = NewTeam;
