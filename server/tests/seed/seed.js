const {ObjectID} = require("mongodb");
const jwt = require("jsonwebtoken");

const {Todo} = require("./../../models/todo");
const {User} = require("./../../models/user");

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const seed = {

    testTodos : [{
        _id: new ObjectID(),
        text: "Sample text 1",
        _creator: userOneId
    }, {
        _id: new ObjectID(),
        text: "Sample text 2",
        completed: true,
        completedAt: new Date().getTime(),
        _creator: userTwoId
    }],

    setTodos: (done) => {
        Todo.remove({}).then(() => {
            return Todo.insertMany(seed.testTodos);
        }).then(() => done());
    },

    testUsers: [{
        _id: userOneId,
        email: "testuser1@test.com",
        password: "userone",
        tokens: [{
            access: "auth",
            token: jwt.sign({_id: userOneId}, process.env.JWT_SECRET)
        }]
    }, {
        _id: userTwoId,
        email: "testuser2@test.com",
        password: "usertwo",
        tokens: [{
            access: "auth",
            token: jwt.sign({_id: userTwoId}, process.env.JWT_SECRET)
        }]
    }],

    setUsers: (done) => {
        User.remove({})
            .then(() => {
                var user1 = new User(seed.testUsers[0]).save();
                var user2 = new User(seed.testUsers[1]).save();

                return Promise.all([user1, user2]);

            })
            .then(() => done());
    }

};

module.exports = seed;