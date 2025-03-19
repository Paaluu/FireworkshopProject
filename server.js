// server.js
require('dotenv').config();
const express = require("express");
const sql = require("mssql");
const cors = require("cors");

const app = express();
const port = 8080;

app.use(cors());
app.use(express.json());

// 📌 **SQL Server-konfiguration** - Uppdatera dessa värden med din databasinfo
const dbConfig = {
    user: "din_användare",       // Ex: "sa"
    password: "ditt_lösenord",   // Ditt SQL Server-lösenord
    server: "localhost",         // localhost Eller servernamn/IP, ex: "(localdb)\\MSSQLLocalDB"
    database: "fireworks_store",
    options: {
        encrypt: true,          // Sätt till true om du kör Azure SQL
        trustServerCertificate: true
    }
};

// 📌 **Anslut till databasen**
async function connectDB() {
    try {
        await sql.connect(dbConfig);
        console.log("✅ Ansluten till SQL Server!");
    } catch (err) {
        console.error("❌ Fel vid anslutning till databasen:", err);
    }
}
connectDB();

// 📌 **Lägg till en ny order**
app.post("/orders", async (req, res) => {
    const { name, email, phone, address, deliveryDate, deliveryTime, paymentMethod, cart } = req.body;

    try {
        const pool = await sql.connect(dbConfig);

        // 📌 **1. Skapa en ny order**
        const result = await pool.request()
            .input("name", sql.NVarChar, name)
            .input("email", sql.NVarChar, email)
            .input("phone", sql.NVarChar, phone)
            .input("address", sql.NVarChar, address)
            .input("deliveryDate", sql.Date, deliveryDate)
            .input("deliveryTime", sql.Time, deliveryTime)
            .input("paymentMethod", sql.NVarChar, paymentMethod)
            .query(`
                INSERT INTO orders (name, email, phone, address, delivery_date, delivery_time, payment_method)
                OUTPUT INSERTED.id
                VALUES (@name, @email, @phone, @address, @deliveryDate, @deliveryTime, @paymentMethod)
            `);

        const orderId = result.recordset[0].id;

        // 📌 **2. Lägg till orderrader**
        for (let item of cart) {
            await pool.request()
                .input("orderId", sql.Int, orderId)
                .input("productId", sql.Int, item.id)
                .input("productName", sql.NVarChar, item.name)
                .input("price", sql.Decimal(10, 2), item.price)
                .input("quantity", sql.Int, item.quantity)
                .query(`
                    INSERT INTO order_items (order_id, product_id, product_name, price, quantity)
                    VALUES (@orderId, @productId, @productName, @price, @quantity)
                `);
        }

        res.status(201).json({ message: "Order placerad!", orderId });

    } catch (err) {
        console.error("❌ Fel vid orderplacering:", err);
        res.status(500).json({ error: "Internt serverfel" });
    }
});

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
