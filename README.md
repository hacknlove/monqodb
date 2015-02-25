monqodb
=======

The mongodb Q promises wrapper that we use at Crowdference
   
## install
    npm install --save monqodb


## use
    var monqodb = require('monqodb');


## Connect to the database

### Zeroconf connection

Currently when `monqodb` is called without options, it looks process.env for mongodb server's configuration:

  host = MONGO_PORT_27017_TCP_ADDR || MONGO_ADDR || 'localhost'

  port = MONGO_PORT_27017_TCP_PORT || MONGO_PORT || 27017
  
  database = MONGO_PORT_27017_TCP_DATABASE || MONGO_DATABASE || 'test'

  mongoName = MONGO_PORT_27017_TCP_NAME || MONGO_NAME || 'db'

That way it needs no configuration to connect to a docker container linked with the name mongo.

### Custom connection.

If you need to configure the name of the database, (on the server or on the app); to configure other connection parameters like the poolSize or the writeConcern, or if you need to connect to more than one mongodb server or database, you need to pass an object with the configuration parameters.

Each key correspond with the in-application-name of the database, and his value has the options as documented [mongo native docuentation](http://mongodb.github.io/node-mongodb-native/api-generated/mongoclient.html#connect)

**IMPORTANT**
The `url` must include the database name.
 
    {
      db:{
        url:'mongodb://localhost/mydb',
        db:{
          w:1,
        },
        server:{
          poolSize:2,
          auto_reconnect:true
        },  
      },
      capped:{
        url:'mongodb://localhost/myCapped',
        db:{
          w:0,
        },
        server:{
          poolSize:1,
          auto_reconnect:true
        },
      }
    }  
  
### Connection promise

When you call `monqodb` to connect, it returns you a promise that will be fullfilled with `[true, true, ...]` when it has successfully connect to all databases. 
  
  require `monqodb`;

  // ...

  monqodb(options)
  .then(function(){
    // YOU know you are connected

    server.listen(9000) 

  })
  .catch(function(err){
    console.log(err.stack);
    console.log(err)
  });
  
### Default Options

Default options are

    {
      db:{
        w:1,
      },
      server:{
        poolSize:5,
        auto_reconnect:true
      },
    }
    
You can change them before connect, at `monqodb.____defaultOptions`
  
## Use

Your databases are members of monqodb and your collections members of those.

  monqodb = require('monqodb');
  
  // you have connected previously with foo and bar databases that have some collections

  // monqodb.bar.oneCollectionfromBar.findOne(...).then(...)
  // monqodb.foo.oneCollectionFromFoo.update(....).then(...)
  // monqodb.bar.otherCollectionfromBar.insert(...).then(...)
  // monqodb.foo.otherCollectionFromFoo.remove(....).then(...)


With monqodb you can use   `findOne`, `update`, `insert`, `remove`, `distinct`, `count`, `findAndModify`, `findAndRemove`, `geoNear`, `geoHaystackSearch` in the Q promises way.

`someCollection.someMethod(someOptions..., someCallback)` becomes `someCollection.someMethod(someOptions).then(someCallback)`

On top of that, monqodb adds the `toArray` with which `someCollection.find(someOptions).toArray(someCallback)` becomes `someCollection.toArray(someOptions).then(someCallback)`

### goodies

  `monqodb.ObjectID` has `ObjectID` 
  `monqodb.close()` closes all monqodb connections.

### using the mongo native api

you have all connections at the object `monqodb.__connections`, whose keys are the inAppDatabaseNames.

you have the original collection object at `monqodb.{{inAppDatabaseName}}.{{collectionName}}.collection`

 


