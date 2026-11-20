const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./db");
const { ObjectId } = require("mongodb");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

let productsCollection;

// Get all products
app.get("/api/products", async (req, res) => {
    try {
        const products = await productsCollection.find().toArray();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add product
app.post("/api/products", async (req, res) => {
    try {
        const { name, quantity } = req.body;

        if (!name || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
            return res.status(400).json({ message: "Enter valid product details" });
        }

        const product = {
            name: name.trim(),
            quantity: Number(quantity)
        };

        const result = await productsCollection.insertOne(product);

        res.status(201).json({
            _id: result.insertedId,
            ...product
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update product
app.put("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, quantity } = req.body;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        if (!name || !Number.isFinite(Number(quantity)) || Number(quantity) <= 0) {
            return res.status(400).json({ message: "Enter valid product details" });
        }

        const result = await productsCollection.updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    name: name.trim(),
                    quantity: Number(quantity)
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product updated successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
    try {
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID" });
        }

        const result = await productsCollection.deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Connect MongoDB and start server
async function startServer() {
    try {
        const db = await connectDB();

        if (!db) {
            throw new Error("MongoDB connection failed");
        }

        productsCollection = db.collection("products");

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log("MongoDB connected successfully!");
        });
    } catch (error) {
        console.error("Server startup error:", error);
    }
}

startServer();