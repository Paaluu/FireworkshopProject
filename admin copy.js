const express = require('express');
//const fetch = require('node-fetch');
const app = express();
// Deklarera Zettle API-nyckel högst upp i koden
const ZETTLE_API_KEY = 'eyJraWQiOiIwIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJpWmV0dGxlIiwiYXVkIjoiQVBJIiwiZXhwIjoyNjg4NTg5MzU4LCJzdWIiOiJiNzI2MjY0MC1kNjgzLTExZTctYWFkZS00MmNiN2YwNjgwZDYiLCJpYXQiOjE3NDE4ODE1ODIsImNsaWVudF9pZCI6IjJkMGU4OWZjLTAwMjQtMTFmMC05ZTA2LWIyN2I0NjEyMGM4OSIsInR5cGUiOiJ1c2VyLWFzc2VydGlvbiIsInVzZXIiOnsidXNlclR5cGUiOiJVU0VSIiwidXVpZCI6ImI3MjYyNjQwLWQ2ODMtMTFlNy1hYWRlLTQyY2I3ZjA2ODBkNiIsIm9yZ1V1aWQiOiJiNzIzZGM1MC1kNjgzLTExZTctYTY1MC1lMjNlYWY1ODdhZjUiLCJ1c2VyUm9sZSI6Ik9XTkVSIn0sInNjb3BlIjpbIlJFQUQ6UFJPRFVDVCJdfQ.R48Ydi8jr1t0bBnmSTEZra-S7jMAOnDjyfhnqcIRaV1KW888wjyyDNPMAY7ZAgRb5Tmw8UbkXevVY7i2NHOGASNo8GDGANfkC0MfFjwg82Q220cHdCaifC5fj6dnMXeMRHUvmnPpYhs9syiQO_CBIJ_XqKF4hbv7_7XfkTjjS-HQyFf1UIfcSOkdo93BK2cdLZo7SpfivmW5aOYGxdjjjPtO6iPQ6oxckAtxh4ywFm6U6-PbqvtHfXpeZqdp6CantTLQojJCX3IGY-Z7VlkxXJ-lTOJmNyNqIOb6N6byjtZZZTcAtfRTEaJBtiV7qp6urEPt_psWlHGE1aTcXjG_cA';

// Hämta token från localStorage (deklarera en gång)
let token = localStorage.getItem("token") || "";

// Om token finns, visa adminpanelen
if (token) showAdminPanel();

function handleLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    .then(res => {
        if (!res.ok) throw new Error("Login failed. Check username/password.");
        return res.json();
    })
    .then(data => {
        if (data.token) {
            localStorage.setItem("token", data.token);
            token = data.token;
            showAdminPanel();
        } else {
            alert("Login failed");
        }
    })
    .catch(error => alert(error.message));
}

function handleLogout() {
    localStorage.removeItem("token");
    token = "";
    document.getElementById("admin-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
}

// Visa adminpanelen om inloggning lyckas
function showAdminPanel() {
    console.log("Showing admin panel...");
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-section").style.display = "block";
    fetchProducts();
}
// Key läs Produktinformation: eyJraWQiOiIwIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJpWmV0dGxlIiwiYXVkIjoiQVBJIiwiZXhwIjoyNjg4NTg5MzU4LCJzdWIiOiJiNzI2MjY0MC1kNjgzLTExZTctYWFkZS00MmNiN2YwNjgwZDYiLCJpYXQiOjE3NDE4ODE1ODIsImNsaWVudF9pZCI6IjJkMGU4OWZjLTAwMjQtMTFmMC05ZTA2LWIyN2I0NjEyMGM4OSIsInR5cGUiOiJ1c2VyLWFzc2VydGlvbiIsInVzZXIiOnsidXNlclR5cGUiOiJVU0VSIiwidXVpZCI6ImI3MjYyNjQwLWQ2ODMtMTFlNy1hYWRlLTQyY2I3ZjA2ODBkNiIsIm9yZ1V1aWQiOiJiNzIzZGM1MC1kNjgzLTExZTctYTY1MC1lMjNlYWY1ODdhZjUiLCJ1c2VyUm9sZSI6Ik9XTkVSIn0sInNjb3BlIjpbIlJFQUQ6UFJPRFVDVCJdfQ.R48Ydi8jr1t0bBnmSTEZra-S7jMAOnDjyfhnqcIRaV1KW888wjyyDNPMAY7ZAgRb5Tmw8UbkXevVY7i2NHOGASNo8GDGANfkC0MfFjwg82Q220cHdCaifC5fj6dnMXeMRHUvmnPpYhs9syiQO_CBIJ_XqKF4hbv7_7XfkTjjS-HQyFf1UIfcSOkdo93BK2cdLZo7SpfivmW5aOYGxdjjjPtO6iPQ6oxckAtxh4ywFm6U6-PbqvtHfXpeZqdp6CantTLQojJCX3IGY-Z7VlkxXJ-lTOJmNyNqIOb6N6byjtZZZTcAtfRTEaJBtiV7qp6urEPt_psWlHGE1aTcXjG_cA
// Hämta produkter från API
// Din Zettle API-nyckel
// const ZETTLE_API_KEY = 'eyJraWQiOiIwIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJpc3MiOiJpWmV0dGxlIiwiYXVkIjoiQVBJIiwiZXhwIjoyNjg4NTg5MzU4LCJzdWIiOiJiNzI2MjY0MC1kNjgzLTExZTctYWFkZS00MmNiN2YwNjgwZDYiLCJpYXQiOjE3NDE4ODE1ODIsImNsaWVudF9pZCI6IjJkMGU4OWZjLTAwMjQtMTFmMC05ZTA2LWIyN2I0NjEyMGM4OSIsInR5cGUiOiJ1c2VyLWFzc2VydGlvbiIsInVzZXIiOnsidXNlclR5cGUiOiJVU0VSIiwidXVpZCI6ImI3MjYyNjQwLWQ2ODMtMTFlNy1hYWRlLTQyY2I3ZjA2ODBkNiIsIm9yZ1V1aWQiOiJiNzIzZGM1MC1kNjgzLTExZTctYTY1MC1lMjNlYWY1ODdhZjUiLCJ1c2VyUm9sZSI6Ik9XTkVSIn0sInNjb3BlIjpbIlJFQUQ6UFJPRFVDVCJdfQ.R48Ydi8jr1t0bBnmSTEZra-S7jMAOnDjyfhnqcIRaV1KW888wjyyDNPMAY7ZAgRb5Tmw8UbkXevVY7i2NHOGASNo8GDGANfkC0MfFjwg82Q220cHdCaifC5fj6dnMXeMRHUvmnPpYhs9syiQO_CBIJ_XqKF4hbv7_7XfkTjjS-HQyFf1UIfcSOkdo93BK2cdLZo7SpfivmW5aOYGxdjjjPtO6iPQ6oxckAtxh4ywFm6U6-PbqvtHfXpeZqdp6CantTLQojJCX3IGY-Z7VlkxXJ-lTOJmNyNqIOb6N6byjtZZZTcAtfRTEaJBtiV7qp6urEPt_psWlHGE1aTcXjG_cA';

// Hämta produkter från Zettle API
function fetchProducts() {
    fetch("http://localhost:8080/products")
    .then(res => res.json())
    .then(data => console.log("Fetched products:", data))
    .catch(err => console.error("Fetch error:", err));
}


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

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080');
});
/*
function fetchProducts() {
    fetch("https://my.zettle.com", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${ZETTLE_API_KEY}`,
            "Content-Type": "application/json",
        },
    })
    .then(res => {
        if (!res.ok) throw new Error("Unauthorized or failed to fetch products.");
        return res.json();
    })
    .then(data => {
        // Förutsatt att data är en lista med produkter
        console.log("Fetched products from Zettle:", data);
        const productList = document.getElementById("product-list");
        productList.innerHTML = "";
        data.products.forEach(product => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>
                    <h3>${product.name}</h3>
                    <p>${product.description || 'No description available'}</p>
                    <img src="${product.imageUrl}" alt="${product.name}" width="100" />
                    <p>Price: ${product.price.formatted}</p>
                    <button onclick="deleteProduct(${product.id})">Delete</button>
                </div>
            `;
            productList.appendChild(li);
        });
    })
    .catch(err => {
        console.error("Fetch error:", err);
        alert(err.message);
    });
}

/*
function fetchProducts() {
    fetch("/products", {
        headers: { "Authorization": `Bearer ${token}` },
    })
    .then(res => {
        console.log("Fetch Products - Response status:", res.status);
        if (!res.ok) throw new Error("Unauthorized: Invalid or expired token.");
        return res.json();
    })
    .then(data => {
        console.log("Fetched products:", data);
        const productList = document.getElementById("product-list");
        productList.innerHTML = "";
        data.forEach(product => {
            const li = document.createElement("li");
            li.innerHTML = `${product.name} - $${product.price} 
                <button onclick="deleteProduct(${product.id})">Delete</button>`;
            productList.appendChild(li);
        });
    })
    .catch(err => {
        console.error("Fetch error:", err);
        alert(err.message);
        handleLogout(); // Om token är ogiltig, logga ut
    });
}
*/

// Lägg till produkt
function addProduct() {
    const name = document.getElementById("product-name").value;
    const price = document.getElementById("product-price").value;

    fetch("/products", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ name, price }),
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to add product.");
        return res.json();
    })
    .then(() => {
        alert("Product added successfully!");
        fetchProducts();
    })
    .catch(error => alert(error.message));
}

// Ta bort produkt
function deleteProduct(id) {
    fetch(`/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to delete product.");
        return res.json();
    })
    .then(() => {
        alert("Product deleted successfully!");
        fetchProducts();
    })
    .catch(error => alert(error.message));
}

// Hämta försäljningsrapport
function fetchSalesReport() {
    fetch("/sales-report", {
        headers: { "Authorization": `Bearer ${token}` },
    })
    .then(res => {
        if (!res.ok) throw new Error("Failed to fetch sales report.");
        return res.json();
    })
    .then(data => {
        document.getElementById("sales-report").innerText = JSON.stringify(data, null, 2);
    })
    .catch(error => {
        console.error(error.message);
        alert(error.message);
    });
}
