var writeGood = require('write-good')

class GrammarSuggestion {
  constructor(suggestion) {
    this.suggestion = suggestion;
    this.element = this.render();
  }

  render() {
    const suggestion = this.suggestion.split('\n');
    const reason = suggestion.pop();
    const endStrong = reason.indexOf('" ') + 1;

    const div = document.createElement('div');
    div.className = 'grammar_box';

    if (suggestion.length > 0) {
      const pre = document.createElement('pre');
      pre.className = 'grammar_suggestion';
      pre.textContent = suggestion.join('\n');
      div.appendChild(pre);
    }

    const p = document.createElement('p');
    p.className = 'grammar_reason';
    
    const strong = document.createElement('strong');
    strong.textContent = reason.substr(0, endStrong);
    p.appendChild(strong);
    p.appendChild(document.createTextNode(reason.slice(endStrong)));
    
    div.appendChild(p);
    return div;
  }
}

class CheckGrammar {
  constructor(options) {
    this.options = options;
    this.suggestions = [];
    this.element = null;
    this.init();
  }

  init() {
    this.element = document.createElement('div');
    this.element.className = 'post-content editor_rendered';
    this.updateSuggestions();
  }

  updateSuggestions() {
    const suggestions = writeGood.annotate(this.options.raw, writeGood(this.options.raw));
    this.suggestions = this.createSuggestionContents(suggestions);
    this.render();
  }

  createSuggestionContents(suggestions) {
    const contents = [];
    if (suggestions.length === 0) {
      const div = document.createElement('div');
      div.className = 'grammar_box';
      
      const p = document.createElement('p');
      p.className = 'grammar_reason';
      
      const i = document.createElement('i');
      i.style.color = 'gold';
      i.className = 'fa fa-star';
      
      p.appendChild(i);
      p.appendChild(document.createTextNode(' Nice! No possible improvements were found!'));
      
      div.appendChild(p);
      contents.push(div);
    } else {
      suggestions.forEach((suggestion, i) => {
        contents.push(new GrammarSuggestion(suggestion).element);
      });
    }
    return contents;
  }

  render() {
    // Nettoyer le contenu existant
    while (this.element.firstChild) {
      this.element.removeChild(this.element.firstChild);
    }

    // Ajouter le titre
    const h2 = document.createElement('h2');
    h2.textContent = 'Writing Suggestions';
    this.element.appendChild(h2);

    // Ajouter le crédit
    const creditStyle = {
      'margin-top': '-24px'
    };
    const p = document.createElement('p');
    Object.assign(p.style, creditStyle);
    p.textContent = 'Brought to you by ';
    
    const a = document.createElement('a');
    a.href = 'https://github.com/btford/write-good';
    a.target = '_blank';
    a.textContent = 'write-good';
    p.appendChild(a);
    p.appendChild(document.createTextNode('.'));
    
    this.element.appendChild(p);

    // Ajouter les suggestions
    this.suggestions.forEach(suggestion => {
      this.element.appendChild(suggestion);
    });

    // Ajouter le bouton de retour
    const button = document.createElement('button');
    button.className = 'pb-button grammar_backToPreview';
    button.textContent = 'Back to Preview';
    button.addEventListener('click', this.options.toggleGrammar);
    this.element.appendChild(button);
  }

  update(raw) {
    this.options.raw = raw;
    this.updateSuggestions();
  }
}

module.exports = CheckGrammar;
