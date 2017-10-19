const expect = require("expect");
const request = require("supertest");
const {ObjectID} = require("mongodb");

const {app} = require("../server");
const {Todo} = require("../models/todo");
const {User} = require("../models/user");
const seed = require("./seed/seed");

beforeEach(seed.setUsers);
beforeEach(seed.setTodos);

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
            .get(`/todos/${seed.testTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect((res) => {
                expect(res.body.todo.text).toBe(seed.testTodos[0].text);
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

describe("DELETE /todos/:id", () => {

    it("should remove a todo", (done) => {

        let hexId = seed.testTodos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(200)
            .expect((response) => {
                expect(response.body.todo._id).toBe(hexId);
            })
            .end((error, response) => {
                if(error) {
                    return done(error);
                }
                Todo.findById(hexId).then((todo) => {
                    expect(todo).toBe(null);
                    done();
                }).catch((e) => done(e));
            })

    });

    it("should return 404 if todo not found", (done) => {

        let testID = new ObjectID();

        request(app)
            .delete(`/todos/${testID.toHexString()}`)
            .expect(404)
            .end(done);

    });

    it("should return 404 if object id is invalid", (done) => {
        request(app)
            .delete("/todos/123456")
            .expect(404)
            .end(done);
    })

});

describe("PATCH /todos/:id", () => {

    it("should update the todo", (done) => {

        request(app)
            .patch(`/todos/${seed.testTodos[0]._id.toHexString()}`)
            .send({
                text: "Text changed for test",
                completed: true
            })
            .expect(200)
            .expect((response) => {
                let todo = response.body.todo;
                expect(todo.text).toBe("Text changed for test");
                expect(todo.completed).toBeTruthy();
                expect(typeof todo.completedAt).toBe("number");
            })
            .end(done);

    });

    it("should clear completedAt when todo is not completed", (done) => {

        request(app)
            .patch(`/todos/${seed.testTodos[1]._id.toHexString()}`)
            .send({
                text: "Text changed for test",
                completed: false
            })
            .expect(200)
            .expect((response) => {
                let todo = response.body.todo;
                expect(todo.text).toBe("Text changed for test");
                expect(todo.completed).toBeFalsy();
                expect(todo.completedAt).toBeNull();
            })
            .end(done);

    });

});

describe("GET /users/me", () => {

    it("should return user if authenticated", (done) => {

        request(app).get("/users/me")
            .set("x-auth", seed.testUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(seed.testUsers[0]._id.toHexString());
                expect(res.body.email).toBe(seed.testUsers[0].email);
            })
            .end(done);
    });

    it("should return 401 if not authenticated", (done) => {

        request(app).get("/users/me")
            .expect(401)
            .expect((res) => {
                expect(res.body).toMatchObject({});
            })
            .end(done);

    });

});

describe("POST /users", () => {

    it("should create a user", (done) => {

        let email = "testuser3@test.com";
        let password = "userthree";

        request(app).post("/users")
            .send({email, password})
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBeDefined();
                expect(res.body.email).toBe(email);
                expect(res.headers["x-auth"]).toBeDefined();
            })
            .end((err) => {
                if(err) {
                    return done(err);
                }
                User.findOne({email})
                    .then((user) => {
                        expect(user).toBeDefined();
                        expect(user.password).not.toBe(password);
                        done();
                    })
                    .catch((e) => done(e));
            });

    });

    it("should return validation errors if request invalid", (done) => {

        let email = "invalidemail";
        let password = "short";

        request(app).post("/users")
            .send({email, password})
            .expect(400)
            .expect((res) => {
                expect(res.body.errors.email).toBeDefined();
                expect(res.body.errors.password).toBeDefined();
            })
            .end((err) => {
                if(err) {
                    return done(err);
                }
                User.findOne({email})
                    .then((user) => {
                        expect(user).toBeNull();
                        done();
                    })
                    .catch((e) => done(e));
            });

    });

    it("should not create user if email in use", (done) => {

        let email = "testuser1@test.com";
        let password = "anypassword";

        request(app).post("/users")
            .send({email, password})
            .expect(400)
            .expect((res) => {
                expect(res.body.code).toBe(11000);
            })
            .end(done);

    });

});

describe("POST /users/login", () => {

    it("should login user and return auth token", (done) => {

        request(app).post("/users/login")
            .send({
                email: seed.testUsers[1].email,
                password: seed.testUsers[1].password
            })
            .expect(200)
            .expect((res) => {
                expect(res.body.email).toBe(seed.testUsers[1].email);
                expect(res.headers["x-auth"]).toBeDefined();
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                User.findById(seed.testUsers[1]._id)
                    .then((user) => {
                        expect(user.tokens[0].access).toBe("auth");
                        expect(user.tokens[0].token).toBe(res.headers["x-auth"]);
                        done();
                    })
                    .catch((e) => done(e));
            });

    });

    it("should reject invalid login", (done) => {

        request(app).post("/users/login")
            .send({
                email: seed.testUsers[1].email,
                password: "notvalid"
            })
            .expect(404)
            .expect((res) => {
                expect(res.body).not.toHaveProperty("email");
                expect(res.headers["x-auth"]).toBeUndefined();
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                User.findById(seed.testUsers[1]._id)
                    .then((user) => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    })
                    .catch((e) => done(e));
            });

    });

});

