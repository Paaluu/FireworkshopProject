// server.js
// 📌 **Importera nödvändiga moduler**
const express = require('express');
const mongoose = require('mongoose');
// const sql = require("mssql");
const cors = require("cors");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = 3000;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));

// Mongoose model for orders
const orderSchema = new mongoose.Schema({
    name_checkout: { type: String, required: true },
    email_checkout: { type: String, required: true },
    address_checkout: { type: String, required: true },
    phone_checkout: { type: String, required: true },
    delivery_date_checkout: { type: Date, required: true },
    delivery_time_checkout: { type: Date, required: true },
    payment_method_checkout: { type: String, required: true },
    products: [{
        id: { type: Number, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
    }]
});

const Order = mongoose.model('Order', orderSchema);
/*
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
*/
/*
const config = {
    user: '',        
    password: '',     
    server: 'np:\\.\pipe\LOCALDB#8A383783\tsql\query', // '(localdb)\MSSQLLocalDB',      
    database: 'fireworks_store',
    options: {
        trustedConnection: true,
        encrypt: true,          
        trustServerCertificate: true
    }
};

const poolPromise = new sql.ConnectionPool(config)
  .connect()
  .then(pool => {
    console.log('Connected to MSSQL');
    return pool;
  })
  .catch(err => console.error('Database connection failed:', err));
 
module.exports = {
  sql,
  poolPromise
};


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
*/
// Serva statiska filer (för frontend)
const path = require('path');
const { Time } = require('mssql');
app.use(express.static(path.join(__dirname)));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Starta servern
app.listen(port, () => console.log(`Server running at http://localhost:${port}`));
