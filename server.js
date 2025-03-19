// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// Använd inbyggd fetch om Node.js 18+ eller node-fetch som fallback
const fetch = globalThis.fetch || require('node-fetch');

const ZETTLE_API_KEY = process.env.ZETTLE_API_KEY;
const ZETTLE_API_SECRET = process.env.ZETTLE_API_SECRET;

// Variabler för att cacha OAuth-token och dess utgångstid
let accessToken = null;
let tokenExpiry = null;

// Funktion som hämtar ett nytt OAuth-token om det saknas eller gått ut
async function getAccessToken() {
    if (accessToken && tokenExpiry && Date.now() < tokenExpiry) {
        return accessToken;
    }

    const response = await fetch('https://oauth.izettle.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: ZETTLE_API_KEY,
            client_secret: ZETTLE_API_SECRET
        })
    });

    if (!response.ok) {
        throw new Error(`Error fetching token: ${response.statusText}`);
    }

    const data = await response.json();
    accessToken = data.access_token;
    // Sätt utgångstid med en liten buffert (exempelvis 1 minut)
    tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000;
    return accessToken;
}

// Inloggningsendpoint (använd gärna JWT istället för ett hårdkodat token)
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const adminUser = { username: "admin", password: "password123" };

    if (username === adminUser.username && password === adminUser.password) {
        const token = "secure-token-123"; // Generera JWT här istället
        res.json({ token });
    } else {
        res.status(401).json({ error: "Invalid credentials" });
    }
});

// Endpoint för att hämta produkter via iZettle Inventory API v2
app.get('/products', async (req, res) => {
    try {
        if (!ZETTLE_API_KEY || !ZETTLE_API_SECRET) {
            throw new Error('Missing ZETTLE_API_KEY or ZETTLE_API_SECRET in environment variables');
        }

        const token = await getAccessToken();
        const response = await fetch('https://inventory.izettle.com/v2/products', {
            headers: { 'Authorization': `Bearer ${token}` }
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

// Serva statiska filer (för frontend)
const path = require('path');
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Starta servern
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
