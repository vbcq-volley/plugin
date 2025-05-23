var path = require('path')
var fs = require('fs')
var yml = require('js-yaml')
var deepAssign = require('deep-assign')
var extend = require('extend')
const { source } = require('superagent')
var updateAny = require('./update')
  , updatePage = updateAny.bind(null, 'Page')
  , update = updateAny.bind(null, 'Post')
  , deploy = require('./deploy')
const uuid=require("uuid")

// Classe DB améliorée avec validation et gestion d'erreurs
class DB {
    constructor(options, filename) {
        if (!options || typeof options !== 'object') {
            throw new Error('Options must be an object');
        }
        this.options = options;
        this.data = {};
        this.filename = filename||this.options.filename||'./db.json';
        
        try {
            this.loadFromFile(this.filename);
        } catch (error) {
            console.error(`Error loading database: ${error.message}`);
            this.data = {};
        }
    }

    /**
     * Create or retrieve a model
     * @param {string} name - The name of the model
     * @returns {object} The model
     */
    model(name) {
        if (!name || typeof name !== 'string') {
            throw new Error('Model name must be a non-empty string');
        }

        if (!this.data[name]) {
            this.data[name] = {
                entries: [],
                metadata: {
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                }
            };
        }

        return this.data[name];
    }

    /**
     * Create a new entry in the model
     * @param {string} modelName - The name of the model
     * @param {object} entry - The entry to create
     */
    create(modelName, entry) {
        try {
            const model = this.model(modelName);
            if (!entry) {
                throw new Error('Entry data is required');
            }
            
            entry._id = entry._id || uuid.v7();
            entry.created_at = new Date().toISOString();
            entry.updated_at = entry.created_at;
            
            model.entries.push(entry);
            model.metadata.updated_at = entry.updated_at;
            model.entries.map((entry, index) => ({...entry, index}))
            this.saveToFile(this.filename);
            return entry;
        } catch (error) {
            console.error(`Error creating entry: ${error.message}`);
            throw error;
        }
    }

    /**
     * Retrieve entries from the model
     * @param {string} modelName - The name of the model
     * @returns {array} The list of entries
     */
    read(modelName) {
        try {
            const model = this.model(modelName);
            return model.entries.map((entry, index) => ({...entry, index})) || [];
        } catch (error) {
            console.error(`Error reading entries: ${error.message}`);
            throw error;
        }
    }

    /**
     * Update an entry in the model
     * @param {string} modelName - The name of the model
     * @param {number} index - The index of the entry to update
     * @param {object} newEntry - The new entry data
     */
    update(modelName, index, newEntry) {
        try {
            const model = this.model(modelName);
            if (!model.entries || !model.entries[index]) {
                throw new Error('Entry not found');
            }
            
            newEntry.updated_at = new Date().toISOString();
            model.entries[index] = { ...model.entries[index], ...newEntry };
            if (model.metadata) {
                model.metadata.updated_at = newEntry.updated_at;
            } else {
                model.metadata = { updated_at: newEntry.updated_at };
            }
            
            this.saveToFile(this.filename);
            return model.entries[index];
        } catch (error) {
            console.error(`Error updating entry: ${error.message}`);
            throw error;
        }
    }

    /**
     * Delete an entry from the model
     * @param {string} modelName - The name of the model
     * @param {number} index - The index of the entry to delete
     */
    delete(modelName, index) {
        try {
            const model = this.model(modelName);
            if (!model.entries || !model.entries[index]) {
                throw new Error('Entry not found');
            }
            
            model.entries.splice(index, 1);
            model.metadata.updated_at = new Date().toISOString();
            
            this.saveToFile(this.filename);
        } catch (error) {
            console.error(`Error deleting entry: ${error.message}`);
            throw error;
        }
    }

    /**
     * Save the data to a file
     * @param {string} filename - The name of the file to save the data
     */
    saveToFile(filename) {
        try {
            fs.writeFileSync(filename, JSON.stringify(this.data, null, 2));
        } catch (error) {
            console.error(`Error saving to file: ${error.message}`);
            throw error;
        }
    }

    /**
     * Load the data from a file
     * @param {string} filename - The name of the file to load the data from
     */
    loadFromFile(filename) {
        try {
            if (fs.existsSync(filename)) {
                const fileData = fs.readFileSync(filename, 'utf8');
                this.data = JSON.parse(fileData);
            }
        } catch (error) {
            console.error(`Error loading from file: ${error.message}`);
            throw error;
        }
    }

    /**
     * Set up automatic saving of data
     */
   
}
const db=new DB({ 
  filename:"./source/_data/db.json"
})

function updateMatchTitles() {
  const matches = db.read("match");
const updatedMatches = matches.map((item, index) => {
  if (!item.title || item.title !== `${item.team1} vs ${item.team2}`) {
    item.title = `${item.team1} vs ${item.team2}`;
    db.update('match', index, item);
  }
  return item;
});
}
module.exports = function (app, hexo) {

  function addIsDraft(post) {
  //  hexo.log.d(post)
    post.isDraft = post.source.indexOf('_draft') === 0
    post.isDiscarded = post.source.indexOf('_discarded') === 0
    return post
  }

  function tagsCategoriesAndMetadata() {
    var cats = {}
      , tags = {}
    hexo.model('Category').forEach(function (cat) {
      cats[cat._id] = cat.name
    })
    hexo.model('Tag').forEach(function (tag) {
      tags[tag._id] = tag.name
    })
    return {
      categories: cats,
      tags: tags,
      metadata: Object.keys(hexo.config.metadata || {})
    }
  }

  // reads admin panel settings from _admin-config.yml
  // or writes it if it does not exist
  function getSettings() {
    var path = hexo.base_dir + '_admin-config.yml'
    if (!fs.existsSync(path)) {
      hexo.log.d('admin config not found, creating one')
      fs.writeFile(hexo.base_dir+'_admin-config.yml', '')
      return {}
    } else {
      var settings = yml.load(fs.readFileSync(path))

      if (!settings) return {}
      return settings
    }
  }

  function remove(id, body, res) {
    var post = hexo.model('Post').update().get(id)
    hexo.log.d(post)
    if (!post) return res.send(404, "Post not found")
    var newSource = '_discarded/' + post.source.slice('_drafts'.length)
    update(id, {source: newSource}, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done(addIsDraft(post))
    }, hexo)
  }

  function publish(id, body, res) {
    var post = hexo.model('Post').get(id)
    hexo.log.d(post)
    if (!post) return res.send(404, "Post not found")
    var newSource = '_posts/' + post.source.slice('_drafts/'.length)
    update(id, {source: newSource}, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done(addIsDraft(post))
    }, hexo)
  }

  function unpublish(id, body, res) {
    var post = hexo.model('Post').get(id)
    hexo.log.d(post)
    if (!post) return res.send(404, "Post not found")
    var newSource = '_drafts/' + post.source.slice('_posts/'.length)
    update(id, {source: newSource}, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done(addIsDraft(post))
    }, hexo)
  }

  function rename(id, body, res) {
    var model = 'Post'
    var post = hexo.model('Post').get(id)
    //hexo.log.d(post)
    if (!post) {
      model = 'Page'
      post = hexo.model('Page').get(id)
      //hexo.log.d(post)
      if (!post) return res.send(404, "Post not found")
    }
    // remember old path w/o index.md
    var oldPath = post.full_source
    oldPath = oldPath.slice(0, oldPath.indexOf('index.md'))

    updateAny(model, id, {source: body.filename}, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      hexo.log.d(`renamed ${model.toLowerCase()} to ${body.filename}`)

      // remove old folder if empty
      if (model === 'Page' && fs.existsSync(oldPath)) {
        if (fs.readdirSync(oldPath).length === 0) {
          fs.rmdirSync(oldPath)
          hexo.log.d('removed old page\'s empty directory')
        }
      }

      res.done(addIsDraft(post))
    }, hexo)
  }

  var use = function (path, fn) {
    app.use(hexo.config.root + 'admin/api/' + path, function (req, res) {
      hexo.log.d(`API Request: ${req.method} ${path}`);
      
      var done = function (val) {
        //hexo.log.d(val)
        if (!val) {
          res.statusCode = 204;
          return res.end('');
        }
        res.setHeader('Content-type', 'application/json');
        res.end(JSON.stringify(val, function(k, v) {
          if (k == 'tags' || k == 'categories') {
            return v.toArray ? v.toArray().map(function(obj) {
              return obj.name;
            }) : v;
          }
          return v;
        }));
      };
      
      res.done = done;
      res.send = function (num, data) {
        hexo.log.d(`API Response: ${num} ${data}`);
        res.statusCode = num;
        res.end(data);
      };
      
      try {
        fn(req, res);
      } catch (err) {
        hexo.log.e(`API Error: ${err}`);
        res.send(500, `Internal Server Error: ${err}`);
      }
    });
  }

  //TODO, get gallery data
  use('gallery/list', function (req, res) {
    var json = 'hexo-admin-ehc-images.json';
    var file = path.join(hexo.source_dir, json);
    var content = fs.readFileSync(file);
    res.done(JSON.parse(content));
  });
  //TODO, save new uploads to json
  use('gallery/set', function (req, res) {
    res.done({
      result: 'success'
    })
  });


  use('tags-categories-and-metadata', function (req, res) {
    res.done(tagsCategoriesAndMetadata())
  });

  use('settings/list', function (req, res) {
    res.done(getSettings())
  });

  use('settings/set', function (req, res, next) {
    if (req.method !== 'POST') return next()
    if (!req.body.name) {
      hexo.log.d('no name')
      hexo.log.d('no name')
      return res.send(400, 'No name given')
    }
    // value is capable of being false
    if (typeof req.body.value === 'undefined') {
      hexo.log.d('no value')
      hexo.log.d('no value')
      return res.send(400, 'No value given')
    }

    var name = req.body.name
    var value = req.body.value

    // no addOptions means we just want to set a single value in the admin options
    // usually for text-based option setting
    var addedOptsExist = !!req.body.addedOptions

    settings = getSettings()
    // create options section if it doesn't exist, ie. first time changing settings
    if (!settings.options) {
      settings.options = {}
    }

    settings.options[name] = value

    var addedOptions = addedOptsExist ? req.body.addedOptions : 'no additional options'
    if (addedOptsExist) {
      settings = deepAssign(settings, addedOptions)
    }
    hexo.log.d('set', name, '=', value, 'with', JSON.stringify(addedOptions))

    fs.writeFileSync(hexo.base_dir + '_admin-config.yml', yml.dump(settings))
    res.done({
      updated: 'Successfully updated ' + name + ' = ' + value,
      settings: settings
    })
  });

  use('pages/list', function (req, res) {
   var page = hexo.model('Page')
   //.log(page)
   res.done(page.toArray());
  });


// Endpoint pour ajouter une entrée dans un modèle
use('db/', function(req, res) {
  updateMatchTitles();
    if (req.method === 'POST') {
        try {
            const modelName = req.url.split('/').filter(Boolean)[0];
            if (!modelName) {
                return res.send(400, 'Model name is required');
            }
            
            const entry = req.body;
            if (!entry) {
                return res.send(400, 'Entry data is required');
            }
            
            const createdEntry = db.create(modelName, entry);
            hexo.log.d(`Created new entry in ${modelName}`);
            
            return res.done(createdEntry);
        } catch (error) {
            hexo.log.e(`Error creating entry: ${error.message}`);
            return res.send(400, `Bad Request: ${error.message}`);
        }
    } else if (req.method === 'GET') {
        try {
            const modelName = req.url.split('/').filter(Boolean)[0];
            if (!modelName) {
                return res.send(400, 'Model name is required');
            }
            if(req.url.split('/').filter(Boolean)[1]){
              const entries = db.read(modelName);
              const entry = entries.find(item => item._id === req.url.split('/').filter(Boolean)[1]);
              hexo.log.d(`Retrieved ${entries.length} entries from ${modelName}`);
              
              return res.done(entry);
            }else{
              const entries = db.read(modelName);
              hexo.log.d(`Retrieved ${entries.length} entries from ${modelName}`);
              
              return res.done(entries);
            }
        } catch (error) {
            hexo.log.e(`Error reading entries: ${error.message}`);
            return res.send(400, `Bad Request: ${error.message}`);
        }
    } else {
        return res.send(405, 'Method Not Allowed');
    }
});

// Endpoint pour obtenir toutes les entrées d'un modèle


// Endpoint pour mettre à jour une entrée dans un modèle
use('db/:model/:index', function(req, res) {
    const modelName = req.url.split('/').filter(Boolean)[0];
    const index = parseInt(req.url.split('/').filter(Boolean)[1]);
    
    if (isNaN(index)) {
        return res.send(400, 'Invalid index');
    }
    
    if (req.method === 'PUT') {
        try {
            if (!req.body) {
                return res.send(400, 'No update data provided');
            }
            
            const updatedEntry = db.update(modelName, index, req.body);
            hexo.log.d(`Updated entry in ${modelName} at index ${index}`);
            
            return res.done(updatedEntry);
        } catch (error) {
            hexo.log.e(`Error updating entry: ${error.message}`);
            return res.send(400, `Bad Request: ${error.message}`);
        }
    } else if (req.method === 'DELETE') {
        try {
            db.delete(modelName, index);
            hexo.log.d(`Deleted entry from ${modelName} at index ${index}`);
            
            return res.done({ success: true });
        } catch (error) {
            hexo.log.e(`Error deleting entry: ${error.message}`);
            return res.send(400, `Bad Request: ${error.message}`);
        }
    } else if (req.method === 'GET') {
        try {
            const entries = db.read(modelName);
            const entry = entries.find(item => item._id === req.url.split('/').filter(Boolean)[1]);
            hexo.log.d(`Retrieved entry from ${modelName} with id ${index}`);
            hexo.log.d(entry)
            return res.done(entry);
        } catch (error) {
            hexo.log.e(`Error getting entry: ${error.message}`);
            return res.send(400, `Bad Request: ${error.message}`);
        }
    } else {
        return res.send(405, 'Method Not Allowed');
    }
});

// Endpoint pour supprimer une entrée d'un modèle


  use('pages/new', function (req, res, next) {
    if (req.method !== 'POST') return next()
    if (!req.body) {
      return res.send(400, 'No page body given');
    }
    if (!req.body.title) {
      return res.send(400, 'No title given');
    }

    hexo.post.create({title: req.body.title, layout: 'page', date: new Date()})
    .error(function(err) {
      console.error(err, err.stack)
      return res.send(500, 'Failed to create page')
    })
    .then(function (file) {
      var source = file.path.slice(hexo.source_dir.length)

      hexo.source.process([source]).then(function () {
        var page = hexo.model('Page').findOne({source: source})
        res.done(addIsDraft(page));
      });
    });
  });

  use('data/new', function (req, res, next) {
    if (req.method !== 'POST') return next()
    if (!req.body) {
      return res.send(400, 'No page body given');
    }
    hexo.log.d(req.body)
    if (!req.body.data.text) {
      return res.send(400, 'No title given');
    }
    
    if(req.body.data.type=="normal"){
      hexo.post.create({title: req.body.data.text, layout: 'page', date: new Date()})
      .error(function(err) {
        console.error(err, err.stack)
        return res.send(500, 'Failed to create page')
      })
      .then(function (file) {
        var source = file.path.slice(hexo.source_dir.length)
  return res.send(200,"good")
      
      });
    }else{
      req.body.data._id= uuid.v7()
   db.create(req.body.data.type,req.body.data)
return res.done(db.read(req.body.data.type))  }
  
   
    
  });


  use('pages/', function (req, res, next) {
    var url = req.url
    hexo.log.d('in pages', url)
    if (url[url.length - 1] === '/') {
      url = url.slice(0, -1)
    }
    var parts = url.split('/')
    var last = parts[parts.length-1]
    // not currently used?
    if (last === 'remove') {
      return remove(parts[parts.length-2], req.body, res)
    }
    if (last === 'rename') {
      return remove(parts[parts.length-2], req.body, res)
    }

    var id = last
    if (id === 'pages' || !id) return next()
    if (req.method === 'GET') {
      var page = hexo.model('Page').get(id)
      hexo.log.d(page)
      return res.done(addIsDraft(page))
    }

    if (!req.body) {
      return res.send(400, 'No page body given');
    }

    updatePage(id, req.body, function (err, page) {
      if (err) {
        return res.send(400, err);
      }
      res.done({
        page: addIsDraft(page),
        tagsCategoriesAndMetadata: tagsCategoriesAndMetadata()
      })
    }, hexo);
  });

  use('posts/list', function (req, res) {
   var post = hexo.model('Post')
   hexo.log.d(post)
   res.done(post.map(addIsDraft));
  });

  use('posts/new', function (req, res, next) {
    if (req.method !== 'POST') return next()
    if (!req.body) {
      return res.send(400, 'No post body given');
    }
    if (!req.body.title) {
      return res.send(400, 'No title given');
    }

    var postParameters = {title: req.body.title, layout: 'posts', date: new Date(), author: hexo.config.author,source:"_post"};
    hexo.log.d(postParameters)
    hexo.post.create(postParameters)
    .error(function(err) {
      hexo.log.d("l'erreur est a la création du post")
      console.error(err, err.stack)
      return res.send(500, 'Failed to create post')
    })
    .then(function (file) {
      var source = postParameters.source
      hexo.log.d(file)
      res.send(200,"succes")
    });
  });

  use('posts/', function (req, res, next) {
    var url = req.url
    if (url[url.length - 1] === '/') {
      url = url.slice(0, -1)
    }
    var parts = url.split('/')
    var last = parts[parts.length-1]
    if (last === 'publish') {
      return publish(parts[parts.length-2], req.body, res)
    }
    if (last === 'unpublish') {
      return unpublish(parts[parts.length-2], req.body, res)
    }
    if (last === 'remove') {
      return remove(parts[parts.length-2], req.body, res)
    }
    if (last === 'rename') {
      return rename(parts[parts.length-2], req.body, res)
    }

    var id = last
    if (id === 'posts' || !id) return next()
    if (req.method === 'GET') {
      var post = hexo.model('Post').get(id)
      if (!post) return next()
      return res.done(  post)
    }

    if (!req.body) {
      return res.send(400, 'No post body given');
    }

    update(id, req.body, function (err, post) {
      if (err) {
        return res.send(400, err);
      }
      res.done({
        post: addIsDraft(post),
        tagsCategoriesAndMetadata: tagsCategoriesAndMetadata()
      })
    }, hexo);
  });

  use('images/upload', function (req, res, next) {
    hexo.log.d('Processing image upload');
    
    if (req.method !== 'POST') return next();
    if (!req.body) {
        return res.send(400, 'No post body given');
    }
    if (!req.body.data) {
        return res.send(400, 'No data given');
    }
    
    try {
        var settings = getSettings();
        var imagePath = settings.options?.imagePath || '/images';
        var imagePrefix = settings.options?.imagePrefix || 'pasted-';
        var overwriteImages = settings.options?.overwriteImages || false;
        
        // Validation du chemin d'image
        if (!fs.existsSync(path.join(hexo.source_dir, imagePath))) {
            fs.mkdirSync(path.join(hexo.source_dir, imagePath), { recursive: true });
        }
        
        var filename = generateUniqueFilename(imagePath, imagePrefix, req.body.filename, overwriteImages);
        var outpath = path.join(hexo.source_dir, imagePath, filename);
        
        var dataURI = req.body.data.slice('data:image/png;base64,'.length);
        var buf = Buffer.from(dataURI, 'base64');
        
        fs.writeFile(outpath, buf, function (err) {
            if (err) {
                hexo.log.e(`Error saving image: ${err.message}`);
                return res.send(500, `Failed to save image: ${err.message}`);
            }
            
            hexo.source.process().then(function () {
                res.done({
                    src: hexo.config.url + path.join(imagePath, filename),
                    msg: 'Image uploaded successfully'
                });
            });
        });
    } catch (error) {
        hexo.log.e(`Error processing image upload: ${error.message}`);
        return res.send(500, `Internal Server Error: ${error.message}`);
    }
  });

  // Fonction utilitaire pour générer un nom de fichier unique
  function generateUniqueFilename(imagePath, prefix, customFilename, overwrite) {
    if (customFilename) {
        if (!customFilename.toLowerCase().endsWith('.png')) {
            customFilename += '.png';
        }
        
        if (fs.existsSync(path.join(hexo.source_dir, imagePath, customFilename))) {
            if (overwrite) {
                return customFilename;
            }
        } else {
            return customFilename;
        }
    }
    
    var i = 0;
    var filename;
    do {
        filename = `${prefix}${i}.png`;
        i++;
    } while (fs.existsSync(path.join(hexo.source_dir, imagePath, filename)));
    
    return filename;
  }

  // using deploy to generate static pages
  // @2018/01/22
  use('deploy', function(req, res, next) {
    if (req.method !== 'POST') return next();

    hexo.call('generate').then(function(){
      var result = {status: 'success', stdout: 'Done!'};
      hexo.exit();
      res.done(result);
    }).catch(function(err){
      return hexo.exit(err);
    });

  });

}
