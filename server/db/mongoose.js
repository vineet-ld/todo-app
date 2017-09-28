var mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const mongoUrl = process.env.MONGODB_URI || "mongodb://localhost:27017/TodoApp";


mongoose.connect(mongoUrl, {
    useMongoClient: true
});

module.exports = {mongoose};