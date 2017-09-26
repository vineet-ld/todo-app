var express = require("express");
var bodyParser = require("body-parser");
var {ObjectID} = require("mongodb");

var {mongoose} = require("./db/mongoose");
var {User} = require("./models/user");
var {Todo} = require("./models/todo");

const port = process.env.PORT || 3002;

var app = express();

app.use(bodyParser.json());

app.post("/todos", (request, response) => {

    var todo = new Todo(request.body);
    todo.save().then((result) => {
        response.send(result);
    }).catch((e) => {
        response.status(400).send(e);
    })

});

app.get("/todos", (request, response) => {
    Todo.find()
        .then((todos) => response.send({todos}))
        .catch((e) => response.status(400).send(e));
});

app.get("/todos/:id", (request, response) => {

    let id = request.params.id;

    if(!ObjectID.isValid(id)) {
        return response.status(404).send({
            error: "Invalid ID"
        });
    }

    Todo.findById(id).then((todo) => {
        if(!todo) {
            return response.status(404).send({
                error: "Todo not found"
            });
        }
        response.send({todo});
    }).catch((e) => response.status(400).send(e));

});

app.listen(port, () => {
    console.log(`Server started at ${port}`);
});

module.exports = {app};