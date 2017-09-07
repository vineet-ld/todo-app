const {MongoClient, ObjectID} = require("mongodb");

MongoClient.connect("mongodb://localhost:27017/TodosApp", (err, db) => {

    if(err) {
        console.log("Unable to connect to mongodb");
        return;
    }

    /*db.collection("users").deleteMany({name: "Don Henry"}).then((result) => {
        console.log(JSON.stringify(result, undefined, 2));
    }).catch((err) => {
        console.log("Unable to retrieve data from mongodb");
    });*/

    db.collection("users").findOneAndDelete({_id: new ObjectID("59a48116cde1fe1a01f3e07c")}).then((result) => {
        console.log(JSON.stringify(result, undefined, 2));
    }).catch((err) => {
        console.log("Unable to retrieve data from mongodb");
    });

});