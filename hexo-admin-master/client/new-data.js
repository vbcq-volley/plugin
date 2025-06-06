const api = require('./api');

class NewData {
  constructor() {
    this.state = {
      showing: false,
      loading: true,
      text: 'Untitled',
      pageType: 'match',
      team1: '',
      team2: '',
      homeDateTime: '',
      awayDateTime: '',
      homeLocation: '',
      awayLocation: '',
      group: '',
      team1Score: '',
      team2Score: '',
      isForfeit: false,
      isPostponed: false,
      matches: [],
      team: [],
      selectedMatch: null,
      matchType: 'home',
      team1Forfeit: false,
      team2Forfeit: false,
      team1Postponed: false,
      team2Postponed: false,
      session: 0
    };
    this.onNew = null;
  }

  _onKeydown(e) {
    if (e.key === 'Enter') {
      this._onSubmit(e);
    }
  }

  _onShow() {
    const temp = { showing: true };
    api.getEntries("match").then((matches) => {
      console.log(matches);
      temp["match"] = matches;
      this.state.matches = matches;
      this.render();
    });
    api.getEntries("team").then((team) => {
      temp["team"] = team;
      this.state.team = team;
      this.render();
    });
  }

  _onBlur(e) {
    if (this.state.showing && !this._isClickInsideForm(e)) {
      this._onCancel();
    }
  }

  _isClickInsideForm(e) {
    return this.form.contains(e.relatedTarget);
  }

  _onSubmit(e) {
    e.preventDefault();
    this.state.loading = true;
    this.state.showing = false;
    this.render();

    const formatDate = (dateTimeString) => {
      console.log(dateTimeString);
      if (!dateTimeString) return '';
      const date = new Date(dateTimeString);
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    };

    const pageData = {
      text: this.state.text,
      type: this.state.pageType,
      session: parseInt(this.state.session)
    };

    console.log(this.state);
    if (this.state.pageType === 'match') {
      pageData.team1 = this.state.team1;
      pageData.team2 = this.state.team2;
      pageData.homeDate = formatDate(this.state.homeDateTime);
      pageData.awayDate = formatDate(this.state.awayDateTime);
      pageData.homeLocation = this.state.homeLocation;
      pageData.awayLocation = this.state.awayLocation;
      pageData.group = this.state.group;
    } else if (this.state.pageType === 'result') {
      pageData.team1 = this.state.team1;
      pageData.team2 = this.state.team2;
      pageData.group = this.state.group;
      pageData.date = this.state.matchType === 'home' ? this.state.homeDate : this.state.awayDate;
      pageData.team1Score = this.state.isForfeit ? 'Forfait' : this.state.team1Score;
      pageData.team2Score = this.state.isForfeit ? 'Forfait' : this.state.team2Score;
      pageData.isPostponed = this.state.isPostponed;
    }

    api.addEntry(pageData.type, pageData).then((page) => {
      this.state.showing = false;
      this.state.text = 'Untitled';
      this.state.pageType = 'match';
      this.state.team1 = '';
      this.state.team2 = '';
      this.state.homeDateTime = '';
      this.state.awayDateTime = '';
      this.state.homeLocation = '';
      this.state.awayLocation = '';
      this.state.group = '';
      this.state.team1Score = '';
      this.state.team2Score = '';
      this.state.isForfeit = false;
      this.state.isPostponed = false;
      this.state.selectedMatch = null;
      this.state.matchType = 'home';
      this.state.session = 0;
      if (this.onNew) {
        this.onNew(page);
      }
    }, (err) => {
      console.error('Failed! to make page', err);
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

  _onPageTypeChange(e) {
    this.state.pageType = e.target.value;
    this.render();
  }

  _onTeam1Change(e) {
    this.state.team1 = e.target.value;
    this.render();
  }

  _onTeam2Change(e) {
    this.state.team2 = e.target.value;
    this.render();
  }

  _onHomeDateTimeChange(e) {
    this.state.homeDateTime = e.target.value;
    this.render();
  }

  _onAwayDateTimeChange(e) {
    this.state.awayDateTime = e.target.value;
    this.render();
  }

  _onHomeLocationChange(e) {
    this.state.homeLocation = e.target.value;
    this.render();
  }

  _onAwayLocationChange(e) {
    this.state.awayLocation = e.target.value;
    this.render();
  }

  _onGroupChange(e) {
    this.state.group = e.target.value;
    this.render();
  }

  _onTeam1ScoreChange(e) {
    this.state.team1Score = e.target.value;
    this.render();
  }

  _onTeam2ScoreChange(e) {
    this.state.team2Score = e.target.value;
    this.render();
  }

  _onForfeitChange(e) {
    this.state.isForfeit = e.target.checked;
    this.render();
  }

  _onPostponedChange(e) {
    this.state.isPostponed = e.target.checked;
    this.render();
  }

  _onMatchTypeChange(e) {
    this.state.matchType = e.target.value;
    this.render();
  }

  _onSessionChange(e) {
    this.state.session = parseInt(e.target.value);
    this.render();
  }

  _onMatchSelect(e) {
    const selectedMatchId = e.target.value;
    const selectedMatch = this.state.matches.find(match => match._id === selectedMatchId);
    this.state.selectedMatch = selectedMatch;

    if (selectedMatch) {
      this.state.team1 = selectedMatch.team1;
      this.state.team2 = selectedMatch.team2;
      this.state.homeDateTime = selectedMatch.homeDateTime;
      this.state.awayDateTime = selectedMatch.awayDateTime;
      this.state.homeLocation = selectedMatch.homeLocation;
      this.state.awayLocation = selectedMatch.awayLocation;
      this.state.group = selectedMatch.group;
      this.state.session = selectedMatch.session;
    }
    this.render();
  }

  render() {
    const container = document.createElement('div');
    container.className = 'new-data';

    if (!this.state.showing) {
      const button = document.createElement('div');
      button.className = 'new-data_button';
      button.innerHTML = '<i class="fa fa-plus"></i> New Data';
      button.addEventListener('click', this._onShow.bind(this));
      container.appendChild(button);
      return container;
    }

    this.form = container;
    container.addEventListener('blur', this._onBlur.bind(this), true);

    const form = document.createElement('form');
    form.className = 'new-data-form';
    form.addEventListener('submit', this._onSubmit.bind(this));

    // Page Type
    const pageTypeGroup = document.createElement('div');
    pageTypeGroup.className = 'form-group';

    const pageTypeLabel = document.createElement('label');
    pageTypeLabel.textContent = 'Type de page';

    const pageTypeSelect = document.createElement('select');
    pageTypeSelect.className = 'form-control';
    pageTypeSelect.value = this.state.pageType;
    pageTypeSelect.addEventListener('change', this._onPageTypeChange.bind(this));

    const matchOption = document.createElement('option');
    matchOption.value = 'match';
    matchOption.textContent = 'Match';
    pageTypeSelect.appendChild(matchOption);

    const resultOption = document.createElement('option');
    resultOption.value = 'result';
    resultOption.textContent = 'Résultat';
    pageTypeSelect.appendChild(resultOption);

    pageTypeGroup.appendChild(pageTypeLabel);
    pageTypeGroup.appendChild(pageTypeSelect);
    form.appendChild(pageTypeGroup);

    // Title
    const titleGroup = document.createElement('div');
    titleGroup.className = 'form-group';

    const titleLabel = document.createElement('label');
    titleLabel.textContent = 'Titre';

    const titleInput = document.createElement('input');
    titleInput.type = 'text';
    titleInput.className = 'form-control';
    titleInput.value = this.state.text;
    titleInput.addEventListener('change', this._onChange.bind(this));

    titleGroup.appendChild(titleLabel);
    titleGroup.appendChild(titleInput);
    form.appendChild(titleGroup);

    // Team 1
    const team1Group = document.createElement('div');
    team1Group.className = 'form-group';

    const team1Label = document.createElement('label');
    team1Label.textContent = 'Équipe 1';

    const team1Input = document.createElement('input');
    team1Input.type = 'text';
    team1Input.className = 'form-control';
    team1Input.value = this.state.team1;
    team1Input.addEventListener('change', this._onTeam1Change.bind(this));

    team1Group.appendChild(team1Label);
    team1Group.appendChild(team1Input);
    form.appendChild(team1Group);

    // Team 2
    const team2Group = document.createElement('div');
    team2Group.className = 'form-group';

    const team2Label = document.createElement('label');
    team2Label.textContent = 'Équipe 2';

    const team2Input = document.createElement('input');
    team2Input.type = 'text';
    team2Input.className = 'form-control';
    team2Input.value = this.state.team2;
    team2Input.addEventListener('change', this._onTeam2Change.bind(this));

    team2Group.appendChild(team2Label);
    team2Group.appendChild(team2Input);
    form.appendChild(team2Group);

    // Home Date Time
    const homeDateTimeGroup = document.createElement('div');
    homeDateTimeGroup.className = 'form-group';

    const homeDateTimeLabel = document.createElement('label');
    homeDateTimeLabel.textContent = 'Date et heure (domicile)';

    const homeDateTimeInput = document.createElement('input');
    homeDateTimeInput.type = 'datetime-local';
    homeDateTimeInput.className = 'form-control';
    homeDateTimeInput.value = this.state.homeDateTime;
    homeDateTimeInput.addEventListener('change', this._onHomeDateTimeChange.bind(this));

    homeDateTimeGroup.appendChild(homeDateTimeLabel);
    homeDateTimeGroup.appendChild(homeDateTimeInput);
    form.appendChild(homeDateTimeGroup);

    // Away Date Time
    const awayDateTimeGroup = document.createElement('div');
    awayDateTimeGroup.className = 'form-group';

    const awayDateTimeLabel = document.createElement('label');
    awayDateTimeLabel.textContent = 'Date et heure (extérieur)';

    const awayDateTimeInput = document.createElement('input');
    awayDateTimeInput.type = 'datetime-local';
    awayDateTimeInput.className = 'form-control';
    awayDateTimeInput.value = this.state.awayDateTime;
    awayDateTimeInput.addEventListener('change', this._onAwayDateTimeChange.bind(this));

    awayDateTimeGroup.appendChild(awayDateTimeLabel);
    awayDateTimeGroup.appendChild(awayDateTimeInput);
    form.appendChild(awayDateTimeGroup);

    // Home Location
    const homeLocationGroup = document.createElement('div');
    homeLocationGroup.className = 'form-group';

    const homeLocationLabel = document.createElement('label');
    homeLocationLabel.textContent = 'Lieu (domicile)';

    const homeLocationInput = document.createElement('input');
    homeLocationInput.type = 'text';
    homeLocationInput.className = 'form-control';
    homeLocationInput.value = this.state.homeLocation;
    homeLocationInput.addEventListener('change', this._onHomeLocationChange.bind(this));

    homeLocationGroup.appendChild(homeLocationLabel);
    homeLocationGroup.appendChild(homeLocationInput);
    form.appendChild(homeLocationGroup);

    // Away Location
    const awayLocationGroup = document.createElement('div');
    awayLocationGroup.className = 'form-group';

    const awayLocationLabel = document.createElement('label');
    awayLocationLabel.textContent = 'Lieu (extérieur)';

    const awayLocationInput = document.createElement('input');
    awayLocationInput.type = 'text';
    awayLocationInput.className = 'form-control';
    awayLocationInput.value = this.state.awayLocation;
    awayLocationInput.addEventListener('change', this._onAwayLocationChange.bind(this));

    awayLocationGroup.appendChild(awayLocationLabel);
    awayLocationGroup.appendChild(awayLocationInput);
    form.appendChild(awayLocationGroup);

    // Group
    const groupGroup = document.createElement('div');
    groupGroup.className = 'form-group';

    const groupLabel = document.createElement('label');
    groupLabel.textContent = 'Groupe';

    const groupInput = document.createElement('input');
    groupInput.type = 'text';
    groupInput.className = 'form-control';
    groupInput.value = this.state.group;
    groupInput.addEventListener('change', this._onGroupChange.bind(this));

    groupGroup.appendChild(groupLabel);
    groupGroup.appendChild(groupInput);
    form.appendChild(groupGroup);

    // Session
    const sessionGroup = document.createElement('div');
    sessionGroup.className = 'form-group';

    const sessionLabel = document.createElement('label');
    sessionLabel.textContent = 'Session';

    const sessionInput = document.createElement('input');
    sessionInput.type = 'number';
    sessionInput.className = 'form-control';
    sessionInput.value = this.state.session;
    sessionInput.addEventListener('change', this._onSessionChange.bind(this));

    sessionGroup.appendChild(sessionLabel);
    sessionGroup.appendChild(sessionInput);
    form.appendChild(sessionGroup);

    // Submit Button
    const submitButton = document.createElement('button');
    submitButton.type = 'submit';
    submitButton.className = 'btn btn-primary';
    submitButton.innerHTML = '<i class="fa fa-save"></i> Enregistrer';
    form.appendChild(submitButton);

    // Cancel Button
    const cancelButton = document.createElement('button');
    cancelButton.type = 'button';
    cancelButton.className = 'btn btn-secondary';
    cancelButton.innerHTML = '<i class="fa fa-times"></i> Annuler';
    cancelButton.addEventListener('click', this._onCancel.bind(this));
    form.appendChild(cancelButton);

    container.appendChild(form);
    return container;
  }
}

module.exports = NewData;
