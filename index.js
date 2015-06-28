'use strict';
var MongoClient   = require('mongodb').MongoClient;
var ObjectID      = require('mongodb').ObjectID;
var _             = require('lodash');
var Q             = require('q'     );
var qfiki = function(collection){
  var response = {
    collection:collection,
    toArray : function(selector,fields,options){
      return Q.ninvoke(collection.find(selector, fields, options), 'toArray');
    }
  };
  
  ['findOne','update','insert','remove','distinct','count','findAndModify','findAndRemove','geoNear','geoHaystackSearch']
  .forEach(function(key){
    response[key] = Q.nbind(collection[key], collection);
  });

  return response;
};
var connections = [];
var MongoClientConnect = Q.nbind(MongoClient.connect, MongoClient);
var procesarDatabase = function(local){
  return Q.ninvoke(local.db, 'collections')
  .then(function(collections){
    local.glocal.response[local.name] = local.glocal.response[local.name] || {};
    if(!local.glocal.priv){
      module.exports[local.name] = module.exports[local.name] || {};
    }
    collections.forEach(function(collection){
      if(collection.collectionName.match(/^system\./)){
        return;
      }
      local.glocal.response[local.name][collection.collectionName] = qfiki(collection);
      if(!local.glocal.priv){
        module.exports[local.name][collection.collectionName] = local.glocal.response[local.name][collection.collectionName];
      }
    });
  });
};
var procesarDatabases = function(databases){
  var glocal = this.glocal;
  var db = this.db;
  
  return Q.all(databases.databases.map(function(database){
    return procesarDatabase({glocal:glocal, db:db.db(database.name), name:database.name})
  }));
};
var connect = function(connection){
  var glocal = this;

  return MongoClientConnect(
    glocal.config[connection].url,
    _.assign({},connection.options, module.exports.defaultOptions
  ))
  .then(function(db){
    if(glocal.config[connection].all){
      return Q.ninvoke(db.admin(),'listDatabases').then(procesarDatabases.bind({glocal:glocal, db:db}));
    }else{
      return procesarDatabase({glocal:glocal, db:db, name:connection});
    }
  });
};

module.exports = function(config, priv){
  if(config===undefined){
    config = {
      defauldb:{
        url:'mongodb://localhost',
        all:true
      }
    };
  }
  var glocal = {
    config:config,
    priv:priv,
    response:{}
  };
  return Q.all(Object.keys(config).map(connect,glocal))
  .then(function(){return glocal.response;});
};
module.exports.close = function(){
  connections.forEach(function(db){
    db.close();
  });
};
module.exports.ObjectID = ObjectID;
module.exports.ObjectId = ObjectID;
module.exports.__defaultOptions= {
  db:{
    w:1,
  },
  server:{
    poolSize:5,
    auto_reconnect:true
  },
};
