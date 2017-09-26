const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb")

const {app} = require("../server");
const {Todo} = require("../models/todo");
const {User} = require("../models/user");

const testTodos = [{
    _id: new ObjectID(),
    text: "Sample text 1"
}, {
    _id: new ObjectID(),
    text: "Sample text 2"
}];

beforeEach((done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(testTodos);
    }).then(() => done());
});

describe("POST /todos", () => {

    it("should create a new todo", (done) => {

        var text = "Test todo creation";

        request(app)
            .post("/todos")
            .send({text})
            .expect(200)
            .expect((response) => {
                expect(response.body.text).toBe(text);
            })
            .end((error, response) => {
                if(error) {
                    done(error);
                    return;
                }
                Todo.find({text}).then((todos) => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((e) => done(e));
            })
    });

    it("should not create new todo with empty text", (done) => {

        request(app)
            .post("/todos")
            .send({
                text: ""
            })
            .expect(400)
            .end((error, response) => {
                if(error) {
                    done(error);
                    return;
                }
                Todo.find().then((todos) => {
                    expect(todos.length).toBe(2);
                    done();
                }).catch((e) => done(e));
            });

    })

});

describe("GET /todos", () => {

    it("should retrieve todos from the database", (done) => {

        request(app)
            .get("/todos")
            .expect(200)
            .expect((response) => {
                expect(response.body.todos.length).toBe(2);
            })
            .end(done);

    })

});

describe("GET /todos/:id", () => {

    it("should return a todo doc", (done) => {

        request(app)
            .get(`/todos/${testTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(testTodos[0].text);
            })
            .end(done);

    });

    it("should return 404 if todo not found", (done) => {

        let testID = new ObjectID();

        request(app)
            .get(`/todos/${testID.toHexString()}`)
            .expect(404)
            .end(done);

    });

    it("should return 404 for non-object IDs", (done) => {

        request(app)
            .get("/todos/123456")
            .expect(404)
            .end(done);

    });

});