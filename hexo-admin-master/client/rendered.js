var React = require('react')

var styles = {
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px'
  },
  title: {
    color: '#333',
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
    marginBottom: '20px'
  },
  info: {
    backgroundColor: '#f9f9f9',
    padding: '15px',
    borderRadius: '5px',
    marginBottom: '15px'
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    marginRight: '10px'
  },
  score: {
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '20px 0',
    color: '#2c3e50'
  },
  separator: {
    margin: '0 15px',
    color: '#95a5a6'
  },
  jsonContent: {
    backgroundColor: '#f8f9fa',
    padding: '15px',
    borderRadius: '5px',
    border: '1px solid #e9ecef',
    fontFamily: 'monospace',
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
    maxHeight: '400px'
  },
  postponed: {
    color: '#e74c3c',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '10px 0'
  },
  description: {
    marginTop: '20px',
    lineHeight: '1.6'
  },
  form: {
    padding: '15px',
    borderRadius: '5px',
    border: '1px solid #e9ecef',
    fontFamily: 'Arial, sans-serif',
    whiteSpace: 'pre-wrap',
    overflow: 'auto',
    maxHeight: '400px'
  },
  formInput: {
    padding: '10px',
    margin: '5px 0',
    border: '1px solid #e9ecef',
    borderRadius: '5px',
    width: '100%'
  }
};

var Rendered = React.createClass({
  propTypes: {
    text: React.PropTypes.string,
    type: React.PropTypes.string
    
  },

  parseJsonText: function(text) {
    console.log("le texte requis est"+text)
    try {
      return JSON.parse(text);
    } catch (e) {
      return text;
    }
  },
  handleSubmit: function(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    // Ici, vous pouvez ajouter votre logique pour envoyer les données au serveur ou les traiter localement
    require("./api").updateEntry(data.type,data.index,data) 
    console.log(data);
  },
  renderMatch: function() {
    const textContent = this.parseJsonText(this.props.text);
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>{textContent.team1} vs {textContent.team2}</h2>
        <div style={styles.info}>
          <p><span style={styles.label}>Groupe:</span> {textContent.group}</p>
          <p><span style={styles.label}>Match à domicile:</span> {textContent.homeDate || 'Non défini'}</p>
          <p><span style={styles.label}>Lieu domicile:</span> {textContent.homeLocation || 'Non défini'}</p>
          <p><span style={styles.label}>Match à l'extérieur:</span> {textContent.awayDate || 'Non défini'}</p>
          <p><span style={styles.label}>Lieu extérieur:</span> {textContent.awayLocation || 'Non défini'}</p>
        </div>
        {textContent && (
          <div style={styles.form}>
            <form onSubmit={this.handleSubmit}>
              <label style={styles.label}>Groupe:</label>
              <input style={styles.formInput} type="text" value={textContent.group} />
              <label style={styles.label}>Match à domicile:</label>
              <input style={styles.formInput} type="date" value={textContent.homeDate} />
              <label style={styles.label}>Lieu domicile:</label>
              <input style={styles.formInput} type="text" value={textContent.homeLocation} />
              <label style={styles.label}>Match à l'extérieur:</label>
              <input style={styles.formInput} type="date" value={textContent.awayDate} />
              <label style={styles.label}>Lieu extérieur:</label>
                <input style={styles.formInput} type="text" value={textContent.awayLocation} />
              <button type="submit">Enregistrer les modifications</button>
            </form>
          </div>
        )}
      </div>
    )
  },
  
  renderResult: function() {
    const textContent = this.parseJsonText(this.props.text);
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>{textContent.team1} vs {textContent.team2}</h2>
        <div style={styles.info}>
          <div style={styles.score}>  
            <span>{textContent.team1Score}</span>
            <span style={styles.separator}>-</span>
            <span>{textContent.team2Score}</span>
          </div>
          <p><span style={styles.label}>Groupe:</span> {textContent.group}</p>
          {textContent.isPostponed && <p style={styles.postponed}>Match reporté</p>}
        </div>
        {textContent && (
          <div style={styles.form}>
            <form onSubmit={this.handleSubmit}>
              <label style={styles.label}>Score de l'équipe 1:</label>
              <input style={styles.formInput} type="text" value={textContent.team1Score} />
              <label style={styles.label}>Score de l'équipe 2:</label>
              <input style={styles.formInput} type="text" value={textContent.team2Score} />
              <label style={styles.label}>Groupe:</label>
              <input style={styles.formInput} type="text" value={textContent.group} />
              <button type="submit">Enregistrer les modifications</button>
            </form>
          </div>
        )}
      </div>
    )
  },

  renderTeam: function() {
    const textContent = this.parseJsonText(this.props.text);
    return (
      <div style={styles.container}>
        <h2 style={styles.title}>{textContent.teamName}</h2>
        <div style={styles.info}>
          <p><span style={styles.label}>Entraîneur:</span> {textContent.coach}</p>
          <p><span style={styles.label}>Groupe:</span> {textContent.group}</p>
        </div>
        {textContent && (
          <div style={styles.form}>
            <form onSubmit={this.handleSubmit}>
              <label style={styles.label}>Nom de l'équipe:</label>
              <input style={styles.formInput} type="text" value={textContent.teamName} />
              <label style={styles.label}>Entraîneur:</label>
              <input style={styles.formInput} type="text" value={textContent.coach} />
              <label style={styles.label}>Groupe:</label>
                <input style={styles.formInput} type="number" defaultValue={textContent.group} />
              <button type="submit">Enregistrer les modifications</button>
            </form>
          </div>
        )}
      </div>
    )
  },

  render: function () {
    const textContent = this.parseJsonText(this.props.text);
    console.log(this.props)
    switch(this.props.type) {
      case "match":
        return this.renderMatch();
      case "result":
        return this.renderResult();
      case "team":
        return this.renderTeam();
      case "post":
        return (
          <div style={styles.container}>
            <div style={styles.jsonContent}
              dangerouslySetInnerHTML={{
                __html: textContent ? 
                  (typeof textContent === 'string' ? textContent : JSON.stringify(textContent, null, 2)) : 
                  '<h1 class="editor_no-content">Il n\'y a pas de contenu ici</h1>'
              }}
            />
          </div>
        );
      default:
        return this.transferPropsTo(
          <div className="post-content"
            dangerouslySetInnerHTML={{
              __html: this.props.text || '<h1 class="editor_no-content">There doesn\'t seem to be anything here</h1>'
            }}/>)
    }
  }
})

module.exports = Rendered;
