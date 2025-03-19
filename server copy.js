const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 8080;

const SECRET_KEY = "your_jwt_secret"; // Byt ut mot en säker nyckel
const ZETTLE_API_KEY = 'eyJraWQiOiIwIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJpWmV0dGxlIiwiYXVkIjoiQVBJIiwiZXhwIjoyNjg4NTg5MzU4LCJzdWIiOiJiNzI2MjY0MC1kNjgzLTExZTctYWFkZS00MmNiN2YwNjgwZDYiLCJpYXQiOjE3NDE4ODE1ODIsImNsaWVudF9pZCI6IjJkMGU4OWZjLTAwMjQtMTFmMC05ZTA2LWIyN2I0NjEyMGM4OSIsInR5cGUiOiJ1c2VyLWFzc2VydGlvbiIsInVzZXIiOnsidXNlclR5cGUiOiJVU0VSIiwidXVpZCI6ImI3MjYyNjQwLWQ2ODMtMTFlNy1hYWRlLTQyY2I3ZjA2ODBkNiIsIm9yZ1V1aWQiOiJiNzIzZGM1MC1kNjgzLTExZTctYTY1MC1lMjNlYWY1ODdhZjUiLCJ1c2VyUm9sZSI6Ik9XTkVSIn0sInNjb3BlIjpbIlJFQUQ6UFJPRFVDVCJdfQ.R48Ydi8jr1t0bBnmSTEZra-S7jMAOnDjyfhnqcIRaV1KW888wjyyDNPMAY7ZAgRb5Tmw8UbkXevVY7i2NHOGASNo8GDGANfkC0MfFjwg82Q220cHdCaifC5fj6dnMXeMRHUvmnPpYhs9syiQO_CBIJ_XqKF4hbv7_7XfkTjjS-HQyFf1UIfcSOkdo93BK2cdLZo7SpfivmW5aOYGxdjjjPtO6iPQ6oxckAtxh4ywFm6U6-PbqvtHfXpeZqdp6CantTLQojJCX3IGY-Z7VlkxXJ-lTOJmNyNqIOb6N6byjtZZZTcAtfRTEaJBtiV7qp6urEPt_psWlHGE1aTcXjG_cA';

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Simulerad admin-användare
const users = [{ username: "admin", password: "1234" }];

// Simulerad produktlista
let products = [];

// Login Route
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// Middleware för att verifiera JWT
function verifyToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ error: "No token provided" });
    
    jwt.verify(token.split(' ')[1], SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Unauthorized" });
        req.user = decoded;
        next();
    });
}

// Hämta säljrapporter från Zettle
app.get('/sales-report', verifyToken, async (req, res) => {
    try {
        const response = await axios.get('https://api.zettle.com/reporting-api/sales', {
            headers: { 'Authorization': `Bearer ${ZETTLE_API_KEY}` }
        });
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch sales report" });
    }
});

// Hämta alla produkter
// app.get('/products', verifyToken, (req, res) => {res.json(products);});

app.get('/products', async (req, res) => {
    try {
        const response = await fetch('https://api.zettle.com/v1/products', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${ZETTLE_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// app.listen(8080, () => {console.log('Server is running on http://localhost:8080');});

// Lägg till en ny produkt
app.post('/products', verifyToken, (req, res) => {
    const { id, name, price, description, image } = req.body;
    if (!id || !name || !price) {
        return res.status(400).json({ error: "Missing required fields" });
    }
    products.push({ id, name, price, description, image });
    res.status(201).json({ message: "Product added successfully" });
});

// Uppdatera en produkt
app.put('/products/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    const { name, price, description, image } = req.body;
    let product = products.find(p => p.id == id);
    if (!product) {
        return res.status(404).json({ error: "Product not found" });
    }
    product.name = name || product.name;
    product.price = price || product.price;
    product.description = description || product.description;
    product.image = image || product.image;
    res.json({ message: "Product updated successfully" });
});

// Ta bort en produkt
app.delete('/products/:id', verifyToken, (req, res) => {
    const { id } = req.params;
    products = products.filter(p => p.id != id);
    res.json({ message: "Product deleted successfully" });
});

// Serva statiska filer
app.get('/', (req, res) => { res.sendFile(path.join(__dirname, 'index.html'));});
app.get('/header.html', (req, res) => { res.sendFile(path.join(__dirname, 'header.html'));});
app.get('/footer.html', (req, res) => { res.sendFile(path.join(__dirname, 'footer.html'));});

// Starta servern
app.listen(port, () => { console.log(`Server running at http://localhost:${port}`);});
