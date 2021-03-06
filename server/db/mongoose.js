var mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const mongoUrl = process.env.MONGODB_URI;


mongoose.connect(mongoUrl, {
    useMongoClient: true
});

module.exports = {mongoose};