const expect = require("expect");
const request = require("supertest");

const {app} = require("../server");
const {Todo} = require("../models/todo");
const {User} = require("../models/user");

beforeEach((done) => {
    Todo.remove({}).then(() => done());
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
                Todo.find().then((todos) => {
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
                    expect(todos.length).toBe(0);
                    done();
                }).catch((e) => done(e));
            });

    })

});