const MongoClient = require("mongodb").MongoClient;

MongoClient.connect("mongodb://localhost:27017/TodosApp", (err, db) => {

    if(err) {
        return console.log("Could not connect to Mongo DB");
    }

    console.log("Connected to Mongo DB successfully");

    /*db.collection("todos").insertOne({
        text: "Do something fast again",
        complete: false
    }, (err, result) => {
        if(err) {
            return console.log("Could not insert record");
        }

        console.log(JSON.stringify(result.ops, undefined, 2));
    });*/

    db.collection("users").insertOne({
        name: "Don Henry",
        age: 55
    }, (err, result) => {
        if(err) {
            console.log("Could not insert data", err);
            return;
        }

        console.log(JSON.stringify(result.ops, undefined, 2));
    });

    db.close();

});