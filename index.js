'use strict';
var MongoClient   = require('mongodb').MongoClient,
ObjectID      = require('mongodb').ObjectID,
_             = require('lodash'),
Q             = require('q'     ),
qfiki = function(collection){
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
},
that = function(config){
  if(config===undefined){
    var mongoHost = process.env.MONGO_PORT_27017_TCP_ADDR || process.env.MONGO_ADDR || 'localhost',
    mongoPort = process.env.MONGO_PORT_27017_TCP_PORT||process.env.MONGO_PORT || 27017,
    mongoDatabase = process.env.MONGO_PORT_27017_TCP_DATABASE||process.env.MONGO_DATABASE || 'test',
    mongoName = process.env.MONGO_PORT_27017_TCP_DATABASE||process.env.MONGO_DATABASE||process.env.MONGO_NAME || 'db';
    config = {};
    config[mongoName] = {url:'mongodb://'+mongoHost+':'+mongoPort+'/'+mongoDatabase};
  }
  var promises = [];
  Object.keys(config).forEach(function(connection){
    var defer = Q.defer(),
    options = _.assign({},connection.options, that.defaultOptions);
    promises.push(defer.promise);
    MongoClient.connect( config[connection].url, options, function (err, db){
      if(err){
        throw err;
      }
      that.__connections[connection] = db;
      
      that[connection] = {};
      db.collections(function(err, collections){
        if(err){
          throw err;
        }
        collections.forEach(function(collection){
          if(collection.collectionName.match(/^system\./)){
            return;
          }
          that[connection][collection.collectionName] = qfiki(collection);
        });
        defer.resolve(true);
      });
    });
  });
  return Q.all(promises);
};

that.close = function(){
  Object.keys(that.__connections).forEach(function(db){
    that.__connections[db].close();
  });
};

that.ObjectID = ObjectID;
that.ObjectId = ObjectID;
that.__connections = {};
that.__defaultOptions= {
  db:{
    w:1,
  },
  server:{
    poolSize:5,
    auto_reconnect:true
  },
};
module.exports = that;
