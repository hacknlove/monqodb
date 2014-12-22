monqodb
=======

The mongodb Q promises wrapper that we use at Crowdference
   
## install
    npm install --dev monqodb


## use
    var monqodb = require('monqodb');

    monqodb().then(function(){
        // connected to the database that process.env says 
    });


    monqodb({someName:{url:'mongodb://...',options:{...} },otherName:{...}}).then(function(){
        // connected to someName and otherName
    });
    
    monqodb.someName.someCollection.findOne({...},...)
    .then(function(response){

    });


## TODO

* [] tests
* [] documentation
    
