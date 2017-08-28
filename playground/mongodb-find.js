const {MongoClient, ObjectID} = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodosApp", (err, db) => {

    if(err) {
        console.log("Unable to connect to mongodb");
        return;
    }

    db.collection("users").find({name: "Vineet Dandekar"}).count().then((result) => {
        console.log(JSON.stringify(result, undefined, 2));
    }).catch((err) => {
        console.log("Unable to retrieve data from mongodb");
    })

});