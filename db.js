const { MongoClient } = require("mongodb");

const url = "mongodb://127.0.0.1:27017";

const client = new MongoClient(url);

async function connectDB() {
    try {
        await client.connect();
        console.log("MongoDB Connected Successfully!");

        const db = client.db("StockFlowDB");

        return db;
    } catch (error) {
        console.log("Database Connection Error:", error);
        throw error;
    }
}

module.exports = connectDB;