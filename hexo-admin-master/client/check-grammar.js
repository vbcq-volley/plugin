var writeGood = require('write-good');

class GrammarSuggestion {
  constructor(options) {
    this.suggestion = options.suggestion;
  }

  render() {
    const suggestion = this.suggestion.split('\n');
    const reason = suggestion.pop();
    const endStrong = reason.indexOf('" ') + 1;

    const container = document.createElement('div');
    container.className = 'grammar_box';

    if (suggestion.length > 0) {
      const pre = document.createElement('pre');
      pre.className = 'grammar_suggestion';
      pre.textContent = suggestion.join('\n');
      container.appendChild(pre);
    }

    const reasonP = document.createElement('p');
    reasonP.className = 'grammar_reason';
    
    const strong = document.createElement('strong');
    strong.textContent = reason.substr(0, endStrong);
    reasonP.appendChild(strong);
    reasonP.appendChild(document.createTextNode(reason.slice(endStrong)));
    
    container.appendChild(reasonP);
    return container;
  }
}

function suggestionContents(suggestions) {
  if (suggestions.length === 0) {
    const container = document.createElement('div');
    container.className = 'grammar_box';
    
    const p = document.createElement('p');
    p.className = 'grammar_reason';
    
    const i = document.createElement('i');
    i.style.color = 'gold';
    i.className = 'fa fa-star';
    
    p.appendChild(i);
    p.appendChild(document.createTextNode('\u00A0Nice! No possible improvements were found!'));
    container.appendChild(p);
    
    return container;
  }

  const fragment = document.createDocumentFragment();
  suggestions.forEach((suggestion, i) => {
    const grammarSuggestion = new GrammarSuggestion({ suggestion });
    fragment.appendChild(grammarSuggestion.render());
  });
  return fragment;
}

class CheckGrammar {
  constructor(options) {
    this.options = options;
    this.state = {
      suggestions: []
    };
    this.element = null;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  updateSuggestions() {
    const suggestions = writeGood.annotate(this.options.raw, writeGood(this.options.raw));
    this.setState({ suggestions: suggestionContents(suggestions) });
  }

  render() {
    if (this.element) {
      // Mise à jour des éléments existants
      const suggestionsContainer = this.element.querySelector('.suggestions-container');
      if (suggestionsContainer) {
        suggestionsContainer.innerHTML = '';
        suggestionsContainer.appendChild(this.state.suggestions);
      }
      return this.element;
    }

    const container = document.createElement('div');
    container.className = 'post-content editor_rendered';

    const title = document.createElement('h2');
    title.textContent = 'Writing Suggestions';
    container.appendChild(title);

    const credit = document.createElement('p');
    credit.style.marginTop = '-24px';
    credit.textContent = 'Brought to you by ';
    
    const link = document.createElement('a');
    link.href = 'https://github.com/btford/write-good';
    link.target = '_blank';
    link.textContent = 'write-good';
    credit.appendChild(link);
    container.appendChild(credit);

    const suggestionsContainer = document.createElement('div');
    suggestionsContainer.className = 'suggestions-container';
    suggestionsContainer.appendChild(this.state.suggestions);
    container.appendChild(suggestionsContainer);

    const backButton = document.createElement('button');
    backButton.className = 'pb-button grammar_backToPreview';
    backButton.textContent = 'Back to Preview';
    backButton.addEventListener('click', this.options.toggleGrammar);
    container.appendChild(backButton);

    this.element = container;

    // Initialiser les suggestions
    this.updateSuggestions();

    return this.element;
  }
}

module.exports = CheckGrammar;
