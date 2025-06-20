var path = require('path')
var fs = require('fs')
var yml = require('js-yaml')
var deepAssign = require('deep-assign')
//var extend = require('extend')
const { source } = require('superagent')
var updateAny = require('./update')
  , updatePage = updateAny.bind(null, 'Page')
  , update = updateAny.bind(null, 'Post')
  , deploy = require('./deploy')
const uuid=require("uuid")

// Classe DB améliorée avec validation et gestion d'erreurs
/**
 * A class to manage a simple file-based database system.
 * 
 * This class provides methods to perform CRUD operations on models stored in a JSON file.
 * Each model consists of entries and metadata. The database supports automatic saving
 * and loading of data from a specified file.
 */
class DB {
    /**
     * Constructor for the DB class
     * @param {object} options - Options for the class
     * @param {string} [filename] - The filename to load the data from
     */
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
    findIndex(modelName,entry){
      const model = this.model(modelName);
      return model.entries.findIndex(item=>item._id===entry._id);
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
            
            // Réindexer les entrées après la mise à jour
            model.entries = model.entries.map((entry, idx) => ({...entry, index: idx}));
            
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
      /**
   * Load the database from a file
   * @param {string} filename - The file to load from
   * @throws {Error} If file load operation fails
   */
  loadFromFile(filename) {
        try {
            if (fs.existsSync(filename)) {
                const fileData = fs.readFileSync(filename, 'utf8');
                this.data = JSON.parse(fileData);
                
                // Indexer les données par type
                Object.keys(this.data).forEach(modelName => {
                    const model = this.data[modelName];
                    if (model.entries) {
                        // Créer un index par _id
                        
                        model.entries.forEach((entry, index) => {
                            if (!entry.index) {
                                entry.index = index;
                            }
                        });
                    }
                });
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
db.read("result").map(
  (result)=>{
    const m= db.read("match").find((item)=>{
      return item._id===result.matchId
    })
    if(!result.date){
      
      if(result.matchType=="home"){
        result.date=m.homeDate
      }else{
        result.date=m.awayDate
      }
    }
    result.group=m.group
    result.session=m.session
    db.update("result",result.index,result)
  }
)

}
updateMatchTitles()
module.exports = function (app, hexo) {

  function addIsDraft(post) {
  //  hexo.log.d(post)
 // console.log(post)
  if(!post){
    return{}
  }
  if(post.source){
    post.isDraft = post.source.indexOf('_draft') === 0
    post.isDiscarded = post.source.indexOf('_discarded') === 0
  }
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
   // console.log(cats)
    //console.log(tags)
    if (Object.keys(cats).length === 0 ) {
      cats= null;
    }
    if (Object.keys(tags).length === 0 ) {
      tags= null;
    }
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
      fs.writeFileSync(hexo.base_dir+'_admin-config.yml', '')
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

  /**
   * Create a new API route with error handling
   * @param {string} path - The API route path
   * @param {Function} fn - The route handler function
   * @throws {Error} If route handler fails
   * @example
   * // Create a new API endpoint
   * use('my-endpoint', function(req, res) {
   *   // Handle request
   * });
   */
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

          if ( k=="tags" || k == 'categories') {
            if(v===null){
              return 
            }
            return (v||[]).toArray() ? (v||[]).toArray().map(function(obj) {
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
        hexo.log.e(`API Error: ${err.message}\n${err.stack}`);
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
   //console.log(page)
   res.done(page.map(addIsDraft));
  });


// Endpoint pour ajouter une entrée dans un modèle
use('db/', function(req, res) {
  updateMatchTitles();
  
  const modelName = req.url.split('/').filter(Boolean)[0];
  if (!modelName) {
    return res.send(400, 'Model name is required');
  }
  hexo.log.d(req.method)
  switch(req.method) {
    case 'POST':
      try {
        const entry = req.body;
        if (!entry) {
          return res.send(400, 'Entry data is required');
        }
        const entries = db.read(modelName);
        const index=db.findIndex(modelName,entry)
        if(index!==-1){
          db.update(modelName,index,entry)
          return res.done(entry);
        }
        const createdEntry = db.create(modelName, entry);
        hexo.log.d(`Created new entry in ${modelName}`);
        
        // Mettre à jour le classement si c'est un résultat de tournoi
        if (modelName === 'tournament_results') {
          updateTournamentRanking();
        }
        
        return res.done(createdEntry);
      } catch (error) {
        hexo.log.e(`Error creating entry: ${error.message}`);
        return res.send(400, `Bad Request: ${error.message}`);
      }
      break;

    case 'GET':
      try {
        const id = req.url.split('/').filter(Boolean)[1];
        const entries = db.read(modelName);
        
        if (id) {
          const entry = entries.find(item => item._id === id);
          hexo.log.d(`Retrieved entry from ${modelName}`);
          return res.done(entry);
        } else {
          hexo.log.d(`Retrieved ${entries.length} entries from ${modelName}`);
          return res.done(entries);
        }
      } catch (error) {
        hexo.log.e(`Error reading entries: ${error.message}`);
        return res.send(400, `Bad Request: ${error.message}`);
      }
      break;

    case 'PUT':
      try {
        if (!req.body) {
          return res.send(400, 'No update data provided');
        }
        
        const id = req.url.split('/').filter(Boolean)[1];
        const entries = db.read(modelName);
        const index = entries.findIndex(item => item._id === id);
        
        if (index === -1) {
          return res.send(404, 'Entry not found');
        }
        
        const updatedEntry = db.update(modelName, index, req.body);
        hexo.log.d(`Updated entry in ${modelName} at index ${index}`);
        
        // Mettre à jour le classement si c'est un résultat de tournoi
        if (modelName === 'tournament_results') {
          updateTournamentRanking();
        }
        
        return res.done(updatedEntry);
      } catch (error) {
        hexo.log.e(`Error updating entry: ${error.message}`);
        return res.send(400, `Bad Request: ${error.message}`);
      }
      break;

    case 'DELETE':
      try {
        const id = req.url.split('/').filter(Boolean)[1];
        const entries = db.read(modelName);
        const index = entries.findIndex(item => item._id === id);
        
        if (index === -1) {
          return res.send(404, 'Entry not found');
        }
        
        db.delete(modelName, index);
        hexo.log.d(`Deleted entry from ${modelName} at index ${index}`);
        
        // Mettre à jour le classement si c'est un résultat de tournoi
        if (modelName === 'tournament_results') {
          updateTournamentRanking();
        }
        
        return res.done({ success: true });
      } catch (error) {
        hexo.log.e(`Error deleting entry: ${error.message}`);
        
        return res.send(400, `Bad Request: ${error.message}`);
      }
      

    default:
      return res.send(405, 'Method Not Allowed');
  }
});

// Endpoint pour la génération des matchs
use('tournament_matches/generate/', function(req, res) {
  try {
    const { type, startDate, teams } = req.body;
    if (!type || !startDate || !Array.isArray(teams)) {
      return res.send(400, 'Missing required parameters');
    }

    const matches = generateTournamentMatches(type, startDate, teams);
    
    // Créer les matchs dans la base de données
    matches.forEach(match => {
      console.log(match)
      db.create('tournament_matches', match);
    });

    res.done(matches);
  } catch (error) {
    hexo.log.e(`Error generating matches: ${error.message}`);
    res.send(400, `Bad Request: ${error.message}`);
  }
});

// Endpoint pour obtenir le classement du tournoi
use('tournament/ranking/', function(req, res) {
  try {
    const teams = db.read('team');
    const results = db.read('tournament_results');
    const ranking = calculateTournamentRanking(teams, results);
    res.done(ranking);
  } catch (error) {
    hexo.log.e(`Error getting tournament ranking: ${error.message}`);
    res.send(400, `Bad Request: ${error.message}`);
  }
});

// Endpoint pour obtenir le classement d'une poule spécifique
use('tournament/ranking/group/:groupId', function(req, res) {
  try {
    const { groupId } = req.params;
    const ranking = db.read('tournament_ranking');
    const groupRanking = ranking.entries?.find(r => r.group === groupId);
    
    if (!groupRanking) {
      return res.send(404, `Group ranking not found for group ${groupId}`);
    }
    
    res.done(groupRanking);
  } catch (error) {
    hexo.log.e(`Error getting group ranking: ${error.message}`);
    res.send(400, `Bad Request: ${error.message}`);
  }
});

// Endpoint pour obtenir les statistiques du tournoi
use('tournament/stats/', function(req, res) {
  try {
    const matches = db.read('tournament_matches');
    const results = db.read('tournament_results');
    
    const stats = calculateTournamentStats(matches, results);
    res.done(stats);
  } catch (error) {
    hexo.log.e(`Error getting tournament stats: ${error.message}`);
    res.send(400, `Bad Request: ${error.message}`);
  }
});

// Fonction utilitaire pour générer les matchs du tournoi
function generateTournamentMatches(type, startDate, teams) {
  const matches = [];
  const teamCount = teams.length;
  console.log(type)
  if (type === 'poule') {
    // Générer tous les matchs possibles
    for (let i = 0; i < teamCount; i++) {
      for (let j = i + 1; j < teamCount; j++) {
        const matchDate = new Date(startDate);
        matchDate.setDate(matchDate.getDate() + matches.length * 2);
       
        matches.push({
          team1: teams[i]._id,
          team2: teams[j]._id,
          matchDate: matchDate.toISOString(),
          round: 'poule',
          poule: Math.max(...db.read("tournament_matches").filter((m)=> m.poule).map((item)=>{return item.poule}),0)+1,
          team1Name: teams[i].teamName,
          team2Name: teams[j].teamName
        });
      }
    }
  } else if (type === 'elimination') {
    // Générer les matchs éliminatoires
    let currentRound = 'quart';
    let matchNumber = teamCount;
    const roundTab = ['quart', 'semi', 'final'];
    while (matchNumber > 1) {
      const roundMatches = [];
      
      for (let i = 0; i < matchNumber; i += 2) {
        const matchDate = new Date(startDate);
        matchDate.setDate(matchDate.getDate() + matches.length * 7);
        let team1Ref;
        let team2Ref;
        // Pour les quarts, utiliser les IDs des équipes directement
        // Pour les autres tours, utiliser les IDs des matchs précédents
        if(currentRound === 'quart'){
          team1Ref = teams[i]._id;
          team2Ref = teams[i + 1]._id;
        }else{
          // Filtrer les matchs du round précédent
          const previousRounds = matches.filter(m => m.round === roundTab[roundTab.indexOf(currentRound) - 1]);
          
          // Pour les demi-finales, on prend les gagnants des quarts 1 et 2, puis 3 et 4
          // Pour la finale, on prend les gagnants des demi-finales
          const matchIndex = Math.floor(i / 2);
          const match1 = previousRounds[matchIndex * 2];
          const match2 = previousRounds[matchIndex * 2 + 1];
          console.log(match1)
          console.log(match2)
          team1Ref = match1._id;
          team2Ref = match2._id;
        }
        
        roundMatches.push({
          team1: teams[i]._id,
          team2: teams[i+1]._id,
          matchDate: matchDate.toISOString(),
          round: currentRound,
          poule:0,
          team1Name: currentRound === 'quart' ? teams[i].teamName : `Gagnant du match ${team1Ref}`,
          team2Name: currentRound === 'quart' ? teams[i + 1].teamName : `Gagnant du match ${team2Ref}`,
          team1Ref: currentRound === 'quart' ? null : team1Ref,
          team2Ref: currentRound === 'quart' ? null : team2Ref,
          winner: null,_id:uuid.v4(),
        });
      }
      
      matches.push(...roundMatches);
      teams = roundMatches;
      matchNumber = Math.ceil(matchNumber / 2);
      
      if (currentRound === 'quart') {
        currentRound = 'semi';
      } else if (currentRound === 'semi') {
        currentRound = 'final';
      }
    }
  }
  
  return matches;
}

// Fonction utilitaire pour calculer le classement
function calculateTournamentRanking(teams, results) {
  // Récupérer les groupes des matchs de tournoi
  const tournamentMatches = db.read('tournament_matches');
  //console.log(tournamentMatches)
  const groups = [...new Set(tournamentMatches.map(match => match.poule))];

  // Initialiser le classement par groupe
  const rankingByGroup = groups.map(group => ({
    group: group,
    teams: teams.map(team => ({
      _id: team._id,
      teamName: team.teamName,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDifference: 0,
      rank: 0
    }))
  }));

  // Calculer les statistiques pour chaque groupe
  rankingByGroup.map(groupRanking => {
    const groupResults = results.filter(result => {
      const match = tournamentMatches.find(m => m._id === result.matchId);
      return match && match.poule === groupRanking.group;
    });

    groupResults.forEach(result => {
      const matches=db.read("tournament_results")
      const match = matches.find(m => m.matchId === result._id);
      //console.log(match)
      if (!match) return;

      const team1 = groupRanking.teams.find(t => t._id === result.team1);
      const team2 = groupRanking.teams.find(t => t._id === result.team2);
      console.log(team1)
      console.log(team2)
      if (!team1 || !team2) return;

      const score1 = parseInt(match.score1) || 0;
      const score2 = parseInt(match.score2) || 0;

      // Mise à jour des statistiques
      team1.goalsFor += score1;
      team1.goalsAgainst += score2;
      team2.goalsFor += score2;
      team2.goalsAgainst += score1;

      if (score1 > score2) {
        team1.points += 3;
        team1.wins++;
        team2.losses++;
      } else if (score2 > score1) {
        team2.points += 3;
        team2.wins++;
        team1.losses++;
      } else {
        team1.points += 1;
        team2.points += 1;
        team1.draws++;
        team2.draws++;
      }
      team1.goalDifference = team1.goalsFor - team1.goalsAgainst;
      team2.goalDifference = team2.goalsFor - team2.goalsAgainst;
    });

    // Trier le classement du groupe
    groupRanking.teams.sort((a, b) => {
      if (a.points !== b.points) {
        return b.points - a.points;
      }
      if (a.goalDifference !== b.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }
      return b.goalsFor - a.goalsFor;
    });

    // Ajouter le classement pour ce groupe
    groupRanking.teams.forEach((team, index) => {
      team.rank = index + 1;
    });
    console.log("les équipe valide sont "+groupRanking.teams.filter((team)=>{return team.points!=0}))
    return groupRanking
  });

  return rankingByGroup;
}

// Fonction utilitaire pour calculer les statistiques
function calculateTournamentStats(matches, results) {
  const stats = {
    totalMatches: matches.length,
    completedMatches: results.length,
    topScorers: [],
    mostGoalsFor: null,
    mostGoalsAgainst: null,
    cleanSheets: 0,
    averageGoalsPerMatch: 0
  };

  // Calculer les buts totaux
  let totalGoals = 0;
  const goalsByPlayer = {};
  
  results.forEach(result => {
    const score1 = parseInt(result.score1) || 0;
    const score2 = parseInt(result.score2) || 0;
    totalGoals += score1 + score2;

    // Calculer les clean sheets
    if (score1 === 0 || score2 === 0) {
      stats.cleanSheets++;
    }

    // Calculer les buts par joueur
    result.stats?.forEach(stat => {
      if (stat.player && stat.goals) {
        goalsByPlayer[stat.player] = (goalsByPlayer[stat.player] || 0) + stat.goals;
      }
    });
  });

  // Calculer les statistiques moyennes
  stats.averageGoalsPerMatch = totalGoals / stats.completedMatches;

  // Trouver les meilleurs buteurs
  Object.entries(goalsByPlayer).forEach(([player, goals]) => {
    stats.topScorers.push({ player, goals });
  });
  stats.topScorers.sort((a, b) => b.goals - a.goals);
  stats.topScorers = stats.topScorers.slice(0, 3); // Top 3 buteurs

  return stats;
}

// Fonction pour mettre à jour le classement après un résultat
function updateTournamentRanking() {
  const teams = db.read('team');
  const results = db.read('tournament_results');
  if(db.read("tournament_matches").length==0){
    return;
  }
  const ranking = calculateTournamentRanking(teams, results);
  const oldRanking = db.read('tournament_ranking');

  // Sauvegarder le classement mis à jour
  const currentRanking = oldRanking || [];
  
  // Mettre à jour chaque classement par poule
  ranking.forEach(groupRanking => {
    const groupIndex = [... new Set(currentRanking.map(r => r.group))].indexOf(groupRanking.group);
    
    if (groupIndex !== -1) {
      // Mettre à jour le classement existant pour cette poule
      currentRanking[groupIndex] = groupRanking;
    } else {
      // Ajouter un nouveau classement pour cette poule
      currentRanking.push(groupRanking);
    }
  });

  // Sauvegarder la mise à jour complète
  //db.update('tournament_ranking', db.findIndex(oldRanking), currentRanking);

  // Mettre à jour les matchs suivants basés sur les résultats
  updateNextMatches();

  // Mettre à jour le classement global
  const globalRanking = currentRanking.flatMap(group => group.teams);
  globalRanking.sort((a, b) => {
    if (a.points !== b.points) {
      return b.points - a.points;
    }
    if (a.goalDifference !== b.goalDifference) {
      return b.goalDifference - a.goalDifference;
    }
    return b.goalsFor - a.goalsFor;
  });
  
  // Ajouter les rangs globaux
  globalRanking.forEach((team, index) => {
    team.globalRank = index + 1;
  });

  // Mettre à jour l'entrée de classement global
  const globalRankingEntry = currentRanking.find(r => r.group === 'global');
  if (globalRankingEntry) {
    globalRankingEntry.teams = globalRanking;
  } else {
    currentRanking.push({
      group: 'global',
      teams: globalRanking
    });
  }
  console.log(db.data.tournament_ranking)
  // Sauvegarder la mise à jour complète avec le classement global
  db.data.tournament_ranking.entries = currentRanking;
  db.saveToFile(db.filename)
}
updateTournamentRanking();
// Fonction pour mettre à jour les matchs suivants
function updateNextMatches() {
  const matches = db.read('tournament_matches');
  const results = db.read('tournament_results');
  
  // Pour chaque résultat
  results.forEach(result => {
    // Trouver le match correspondant
    const match = matches.find(m => m._id === result.matchId);
    if (!match) return;
    console.log(result)
    if(!result.winner){
      if(result.score1<result.score2){
        result.winner=match.team2
      }else{
        result.winner=match.team1
      }
    }
    // Mettre à jour le gagnant du match
    const updatedMatch = {
      ...match,
      winner: result.winner
    };
    db.update('tournament_matches', db.findIndex('tournament_matches', match), updatedMatch);
    
    // Mettre à jour les matchs suivants si c'est un match éliminatoire
    if (match.round !== 'final') {
      // Trouver le round suivant
      const roundTab = ['quart', 'semi', 'final'];
      const currentRoundIndex = roundTab.indexOf(match.round);
      if (currentRoundIndex === -1) return;
      
      // Trouver les matchs du round suivant qui référencent ce match
      const nextRoundMatches = matches.filter(m => 
        m.round === roundTab[currentRoundIndex + 1] && 
        (m.team1Ref === match._id || m.team2Ref === match._id)
      );
      
      nextRoundMatches.forEach(nextMatch => {
        // Récupérer le nom de l'équipe gagnante
        const teams = db.read('team');
        const winnerTeam = teams.find(t => t._id === result.winner);
        const winnerTeamName = winnerTeam ? winnerTeam.teamName : '';

        // Mettre à jour la référence du gagnant et son nom dans le match suivant
        const updatedNextMatch = {
          ...nextMatch,
          team1: nextMatch.team1Ref === match._id ? result.winner : nextMatch.team1,
          team2: nextMatch.team2Ref === match._id ? result.winner : nextMatch.team2,
          team1Name: nextMatch.team1Ref === match._id ? winnerTeamName : nextMatch.team1Name,
          team2Name: nextMatch.team2Ref === match._id ? winnerTeamName : nextMatch.team2Name
        }; 
        db.update('tournament_matches', db.findIndex('tournament_matches', nextMatch), updatedNextMatch);
      });
    }
  });
}

// Endpoint pour obtenir les gagnants des matchs précédents
use('tournament/matches/winners/', function(req, res) {
  try {
    const { round } = req.body;
    if (!round) {
      return res.send(400, 'Round is required');
    }

    const matches = db.read('tournament_matches');
    const results = db.read('tournament_results');
    
    // Trouver les matchs du round précédent
    const previousRound = getPreviousRound(round);
    const previousMatches = matches.filter(m => m.round === previousRound);
    
    // Trouver les gagnants
    const winners = previousMatches.map(match => {
      const result = results.find(r => r.matchId === match._id);
      if (result && result.winner) {
        return {
          _id: match._id,
          winner: result.winner,
          teamName: match.team1Name,
          matchDate: match.matchDate
        };
      }
      return null;
    }).filter(winner => winner !== null);

    res.done(winners);
  } catch (error) {
    hexo.log.e(`Error getting match winners: ${error.message}`);
    res.send(400, `Bad Request: ${error.message}`);
  }
});

// Fonction utilitaire pour obtenir le round précédent
/**
 * Get the previous round in tournament sequence
 * @param {string} round - Current round name
 * @returns {string|null} Previous round name or null if first round
 */
function getPreviousRound(round) {
  const rounds = ['poule', 'quart', 'semi', 'final'];
  const index = rounds.indexOf(round);
  return index > 0 ? rounds[index - 1] : null;
}

// Endpoint pour mettre à jour un match avec un gagnant précédent
use('tournament/matches/update-winner/', function(req, res) {
  try {
    const { matchId, previousMatchId } = req.body;
    if (!matchId || !previousMatchId) {
      return res.send(400, 'Missing required parameters');
    }

    const match = db.read('tournament_matches').find(m => m._id === matchId);
    if (!match) {
      return res.send(404, 'Match not found');
    }

    // Mettre à jour le match avec le gagnant du match précédent
    const previousResult = db.read('tournament_results').find(r => r.matchId === previousMatchId);
    if (!previousResult || !previousResult.winner) {
      return res.send(404, 'Previous match winner not found');
    }

    const updatedMatch = {
      ...match,
      winner: previousResult.winner,
      previousMatch: previousMatchId
    };

    db.update('tournament_matches', db.findIndex('tournament_matches', match), updatedMatch);
    
    // Mettre à jour le classement
    updateTournamentRanking();

    res.done(updatedMatch);
  } catch (error) {
    hexo.log.e(`Error updating match winner: ${error.message}`);
    res.send(400, `Bad Request: ${error.message}`);
  }
});

// Endpoint pour gérer les forfaits
use('tournament/matches/forfeit/', function(req, res) {
  try {
    const { matchId, teamId, reason } = req.body;
    if (!matchId || !teamId) {
      return res.send(400, 'Missing required parameters');
    }

    const match = db.read('tournament_matches').find(m => m._id === matchId);
    if (!match) {
      return res.send(404, 'Match not found');
    }

    // Créer un résultat avec forfait
    const result = {
      matchId: matchId,
      team1: match.team1,
      team2: match.team2,
      score1: teamId === match.team1 ? 0 : 3,
      score2: teamId === match.team1 ? 3 : 0,
      winner: teamId === match.team1 ? match.team2 : match.team1,
      forfeit: true,
      forfeitTeam: teamId,
      forfeitReason: reason || 'Forfait'
    };

    // Créer le résultat
    db.create('tournament_results', result);
    
    // Mettre à jour le match
    const updatedMatch = {
      ...match,
      winner: result.winner
    };
    db.update('tournament_matches', db.findIndex('tournament_matches', match), updatedMatch);

    // Mettre à jour le classement
    updateTournamentRanking();

    res.done(result);
  } catch (error) {
    hexo.log.e(`Error handling forfeit: ${error.message}`);
    res.send(400, `Bad Request: ${error.message}`);
  }
});

// Endpoint pour gérer les matchs nuls
use('tournament/matches/draw/', function(req, res) {
  try {
    const { matchId, score } = req.body;
    if (!matchId || typeof score !== 'number') {
      return res.send(400, 'Missing required parameters');
    }

    const match = db.read('tournament_matches').find(m => m._id === matchId);
    if (!match) {
      return res.send(404, 'Match not found');
    }

    // Créer un résultat avec match nul
    const result = {
      matchId: matchId,
      team1: match.team1,
      team2: match.team2,
      score1: score,
      score2: score,
      draw: true
    };

    // Créer le résultat
    db.create('tournament_results', result);

    // Mettre à jour le classement
    updateTournamentRanking();

    res.done(result);
  } catch (error) {
    hexo.log.e(`Error handling draw: ${error.message}`);
    res.send(400, `Bad Request: ${error.message}`);
  }
});

// Endpoint pour le tirage au sort des matchs
use('tournament/matches/drawlots/', function(req, res) {
  try {
    const { teams, round } = req.body;
    if (!teams || !Array.isArray(teams) || !round) {
      return res.send(400, 'Missing required parameters');
    }

    // Mélanger les équipes
    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    
    // Créer les matchs
    const matches = [];
    for (let i = 0; i < shuffledTeams.length; i += 2) {
      matches.push({
        team1: shuffledTeams[i]._id,
        team2: shuffledTeams[i + 1]?._id,
        round: round,
        team1Name: shuffledTeams[i].teamName,
        team2Name: shuffledTeams[i + 1]?.teamName,
        drawLots: true,
        drawDate: new Date().toISOString()
      });
    }

    // Créer les matchs dans la base de données
    matches.forEach(match => {
      db.create('tournament_matches', match);
    });

    res.done(matches);
  } catch (error) {
    hexo.log.e(`Error drawing lots: ${error.message}`);
    res.send(400, `Bad Request: ${error.message}`);
  }
});

// Endpoint pour obtenir toutes les entrées d'un modèle


// Endpoint pour mettre à jour une entrée dans un modèle


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
      var source = file.path.slice(hexo.source_dir.length).replace("\\","/")

      hexo.source.process([source]).then(function () {
        var page = hexo.model('Page').findOne({source: source})
        //console.log(source)
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
    //if (id === 'pages' || !id) return next()
    if (req.method === 'GET') {
      var page = hexo.model('Page').get(id)
      hexo.log.d(page)
      return res.done(addIsDraft(page))
    }

    if (!req.body) {
      return res.send(400, 'No page body given');
    }
    //console.log(req.body)
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

  /**
 * Create new post endpoint
 * Creates a new post in the Hexo site
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @example
 * // Create a new post via API
 * const postData = {
 *   title: 'Hello World',
 *   layout: 'post',
 *   date: '2025-06-20T10:00:00Z'
 * };
 * // POST to /admin/api/posts/new with postData
 */
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
      var source = file.path.slice(hexo.source_dir.length).replace("\\","/")

      hexo.source.process([source]).then(function () {
        var page = hexo.model('Post').findOne({source: source})
        //console.log(source)
        res.done(addIsDraft(page));
      });
  
      
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
    //if (id === 'posts' || !id) return next()
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
            
            // Mise à jour du fichier JSON des images
            var imagesFile = path.join(hexo.source_dir, 'hexo-admin-ehc-images.json');
            var imagesData = [];
            
            try {
                if (fs.existsSync(imagesFile)) {
                    imagesData = JSON.parse(fs.readFileSync(imagesFile));
                }
            } catch (e) {
                hexo.log.w('Error reading images file, starting fresh');
            }
            
            // Ajout de la nouvelle image au début du tableau
            imagesData.unshift({
                name: filename,
                date: new Date().getTime()
            });
            
            // Sauvegarde du fichier JSON mis à jour
            fs.writeFileSync(imagesFile, JSON.stringify(imagesData));
            
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
