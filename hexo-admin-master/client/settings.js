var api = require('./api');
var _ = require('lodash');
var moment = require('moment');

class Settings {
  constructor() {
    this.state = {
      settings: {},
      loading: true
    };
    this.init();
  }

  async init() {
    await this.fetchSettings();
  }

  async fetchSettings() {
    try {
      const settings = await api.getSettings();
      this.state.settings = settings;
      this.state.loading = false;
      this.render();
    } catch (error) {
      console.error('Error fetching settings:', error);
      this.state.loading = false;
      this.render();
    }
  }

  async updateSetting(key, value) {
    try {
      await api.updateSetting(key, value);
      this.state.settings[key] = value;
      this.render();
    } catch (error) {
      console.error('Error updating setting:', error);
    }
  }

  render() {
    if (this.state.loading) {
      return document.createElement('div').textContent = 'Loading settings...';
    }

    const container = document.createElement('div');
    container.className = 'settings-container';

    Object.entries(this.state.settings).forEach(([key, value]) => {
      const settingElement = document.createElement('div');
      settingElement.className = 'setting-item';

      const label = document.createElement('label');
      label.textContent = key;

      const input = document.createElement('input');
      input.type = 'text';
      input.value = value;
      input.addEventListener('change', (e) => this.updateSetting(key, e.target.value));

      settingElement.appendChild(label);
      settingElement.appendChild(input);
      container.appendChild(settingElement);
    });

    return container;
  }
}

module.exports = Settings;
