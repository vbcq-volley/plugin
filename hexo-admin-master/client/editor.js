var path = require('path')
var React = require('react/addons')
var cx = React.addons.classSet
var Promise = require('es6-promise').Promise
var PT = React.PropTypes
var CodeMirror = require('./code-mirror')
var SinceWhen = require('./since-when')
var Rendered = require('./rendered')
var CheckGrammar = require('./check-grammar')
var ConfigDropper = require('./config-dropper')
var RenameFile = require('./rename-file')
var PopGallery = require('./pop-gallery')
const codemirror = require('codemirror')

// Étendre la classe Date
Date.prototype.fromNow = function() {
  const now = new Date();
  const diffInMilliseconds = now - this;

  // Convertir la différence en secondes, minutes, heures, jours, etc.
  const diffInSeconds = Math.floor(diffInMilliseconds / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInDays > 0) {
      return `il y a ${diffInDays} jour${diffInDays > 1 ? 's' : ''}`;
  } else if (diffInHours > 0) {
      return `il y a ${diffInHours} heure${diffInHours > 1 ? 's' : ''}`;
  } else if (diffInMinutes > 0) {
      return `il y a ${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''}`;
  } else {
      return `il y a ${diffInSeconds} seconde${diffInSeconds !== 1 ? 's' : ''}`;
  }
};

// Exemple d'utilisation
const pastDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // Il y a 2 jours
console.log(pastDate.fromNow()); // Affiche "il y a 2 jours"

var Editor = React.createClass({

  // cmRef: null,

  propTypes: {
    post: PT.object,
    raw: PT.string,
    updatedRaw: PT.string,
    onChangeTitle: PT.func,
    title: PT.string,
    updated: PT.object,
    isDraft: PT.bool,
    onPublish: PT.func.isRequired,
    onUnpublish: PT.func.isRequired,
    tagsCategoriesAndMetadata: PT.object,
    adminSettings: PT.object,
    type: PT.string,
    onChange: PT.func,
    onChangeContent: PT.func,
    onRemove: PT.func
  },

  getInitialState: function() {
    //FIXME, use href is right!
    var url = window.location.href.split('/')
    var rootPath = url.slice(0, url.indexOf('admin')).join('/');
    var completeURL = rootPath+'/'+this.props.post.path;
    return {
      postPath: this.props.post.path,
      previewLink: completeURL,
      checkingGrammar: false,
      openGallery: false,
      renderedType: this.props.type,
      tagsCategoriesAndMetadata: this.props.tagsCategoriesAndMetadata,
      onChange: this.props.onChange,
      onChangeContent: this.props.onChangeContent,
      onChangeTitle: this.props.onChangeTitle,
      onPublish: this.props.onPublish,
      onUnpublish: this.props.onUnpublish,
      onRemove: this.props.onRemove,
      mdLink: null
    }
  },

  // TODO, ...just for test
  componentDidMount: function() {

  },

  // recreate previewLink
  handlePreviewLink: function(postNewPath) {
    var url = window.location.href.split('/')
    var rootPath = url.slice(0, url.indexOf('admin')).join('/');
    var completeURL = rootPath+'/'+postNewPath;
    this.setState({
      postPath: postNewPath,
      previewLink: completeURL
    })
  },

  handleChangeTitle: function (e) {
    return this.props.onChangeTitle(e.target.value)
  },

  handleScroll: function (percent) {
    if (!this.state.checkingGrammar) {
      var node = this.refs.rendered.getDOMNode()
      var height = node.getBoundingClientRect().height
      node.scrollTop = (node.scrollHeight - height) * percent
    }
  },

  onCheckGrammar: function () {
    this.setState({
      checkingGrammar: !this.state.checkingGrammar
    });
  },

  // TODO, ...add real image address...
  onAddImage: function () {
    this.setState({
      // mdImg: '![image]()',
      openGallery: !this.state.openGallery
    });
  },

  // hide the gallery
  handleEditFocus: function () {
    this.setState({openGallery: false});
  },

  handleImgSelect: function (img) {
    this.setState({
      mdImg: '![image](/images/'+img+')',
     
    });
  },

  onAddLink: function () {
    const linkText = '\n[lien](lien a mettre)';
    navigator.clipboard.writeText(linkText).then(() => {
      this.setState({
      //  mdLink: linkText
      });
     const notification = document.createElement('div');
     notification.textContent = 'Le lien a été copié dans votre presse-papier';
     notification.style.position = 'fixed';
     notification.style.top = '20px';
     notification.style.right = '20px';
     notification.style.padding = '10px';
     notification.style.backgroundColor = '#4CAF50';
     notification.style.color = 'white';
     notification.style.borderRadius = '4px';
     notification.style.zIndex = '1000';
     document.body.appendChild(notification);
     setTimeout(() => {
       notification.remove();
     }, 3000);
     // this.props.onChangeContent(this.props.raw + linkText);
    }).catch(err => {
      console.error('Erreur lors de la copie dans le presse-papier:', err);
    });
  },

  render: function () {
    console.log(this.props)
    return <div className={cx({
      "editor": true,
      "editor--draft": this.props.isDraft
    })}>
      <div className="editor_top">
        <input
          className='editor_title'
          value={this.props.title}
          onChange={this.props.onChangeTitle}/>

        {this.state.renderedType === 'post' && !this.props.isPage && <ConfigDropper
          post={this.props.post}
          tagsCategoriesAndMetadata={this.props.tagsCategoriesAndMetadata}
          onChange={this.props.onChange}/>}

        {this.state.renderedType === 'post' && !this.props.isPage && (this.props.isDraft ?
          /* this is a comment for publish button */
          <button className="editor_publish" onClick={this.props.onPublish}>
            Publish
          </button> :
          <button className="editor_unpublish" onClick={this.props.onUnpublish}>
            Unpublish
          </button>)}

        {this.state.renderedType === 'post' && !this.props.isPage && (this.props.isDraft ?
          <button className="editor_remove" title="Remove"
                  onClick={this.props.onRemove}>
            <i className="fa fa-trash-o" aria-hidden="true"/>
          </button> :
          <button className="editor_remove" title="Can't Remove Published Post"
                  onClick={this.props.onRemove} disabled>
            <i className="fa fa-trash-o" aria-hidden="true"/>
          </button>)}

        {this.state.renderedType === 'post' && !this.props.isPage &&
        <button className="editor_checkGrammar" title="Check for Writing Improvements"
                onClick={this.onCheckGrammar}>
          <i className="fa fa-check-circle-o"/>
        </button>}
      
        {this.state.renderedType === 'post' && !this.props.isPage &&
          <button className="editor_addImage" title="Add Image to Post"
                  onClick={this.onAddImage}>
            <i className="fa fa-picture-o"/>
          </button>
        }
      <button className="editor_addlink" title="Add Link to Post"
      onClick={this.onAddLink}>
      <i className="fa fa-link"/>
      </button>
      </div>

      <div className="editor_main">
        <div className="editor_edit">
          <div className="editor_md-header">
            {this.props.updated &&
                <SinceWhen className="editor_updated"
                prefix="saved "
                time={new Date(this.props.post.updated)}/>}
            <span>Markdown&nbsp;&nbsp;
              <RenameFile post={this.props.post}
                handlePreviewLink={this.handlePreviewLink} /></span>
          </div>
          <CodeMirror
            mdImg={this.state.mdImg}
            mdLink={this.state.mdLink}
            onFocus={this.handleEditFocus}
            forceLineNumbers={this.state.checkingGrammar}
            onScroll={this.handleScroll}
            initialValue={this.props.raw}
            onChange={this.props.onChangeContent}
            adminSettings={this.props.adminSettings} />
        </div>
        {/* end of editor */}
        <div className="editor_display">
          <div className="editor_display-header">
            <span className="editor_word-count">
              {this.props.wordCount} words
            </span>
            Preview
            {' '}<a className="editor_perma-link" href={this.state.previewLink} target="_blank">
              <i className="fa fa-link"/> {this.state.postPath}
            </a>
          </div>
          {!this.state.checkingGrammar && <Rendered
            ref="rendered"
            className="editor_rendered"
            text={this.props.rendered}
            type={this.state.renderedType}/>}
          {this.state.checkingGrammar && <CheckGrammar
            toggleGrammar={this.onCheckGrammar}
            raw={this.props.updatedRaw} />}
        </div>
 
      </div>
    
      {this.state.openGallery && <PopGallery onChange={this.handleImgSelect}/>}
    </div>;
    
  }// end of render()
})// end of component

module.exports = Editor
