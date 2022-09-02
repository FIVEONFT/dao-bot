const mongoose = require('mongoose');
const config = require('./config/config.js');

module.exports = async function () {

    const db = mongoose.connection;
    let isConnectedBefore = false;
    const mongooseConnect = () => mongoose.connect(config.db.driver);

    db.on('connecting', function () {
        console.log('connecting to MongoDB...');
    });

    db.on('error', function (error) {
        console.error('Error in MongoDb connection: ' + error);
        mongoose.disconnect();
    });

    db.on('connected', function () {
        isConnectedBefore = true;
        console.log('MongoDB connected!');
    });

    db.once('open', function () {
        console.log('MongoDB connection opened!');
    });

    db.on('reconnected', function () {
        console.log('MongoDB reconnected!');
    });

    db.on('disconnected', function () {
        console.log('MongoDB disconnected!');
        if (isConnectedBefore) {
            setTimeout(() => {
                mongooseConnect();
            }, 5000);
        }
    });

    await mongooseConnect();
};