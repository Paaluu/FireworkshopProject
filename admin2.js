// Hämta token från localStorage och visa adminpanelen om token finns
let token = localStorage.getItem("token") || "";

if (token) showAdminPanel();

// Funktion för att hantera inloggning
function handleLogin() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })
    .then(res => res.json())
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

// Funktion för att hantera utloggning
function handleLogout() {
    localStorage.removeItem("token");
    token = "";
    document.getElementById("admin-section").style.display = "none";
    document.getElementById("login-section").style.display = "block";
}

// Funktion för att visa adminpanelen
function showAdminPanel() {
    document.getElementById("login-section").style.display = "none";
    document.getElementById("admin-section").style.display = "block";
    fetchProducts();
}

// Funktion för att hämta produkter från backend
function fetchProducts() {
    fetch("https://inventory.izettle.com", {
        headers: { "Authorization": `Bearer ${token}` },
    })
    .then(res => res.json())
    .then(data => {
        console.log("Fetched products:", data);
        const productList = document.getElementById("product-list");
        productList.innerHTML = "";
        data.forEach(product => {
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

// Funktion för att lägga till produkt
function addProduct() {
    const name = document.getElementById("product-name").value;
    const price = document.getElementById("product-price").value;

    fetch("http://localhost:8080/products", {
        method: "POST",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ name, price })
    })
    .then(res => res.json())
    .then(() => {
        alert("Product added successfully!");
        fetchProducts();
    })
    .catch(error => alert(error.message));
}

// Funktion för att ta bort produkt
function deleteProduct(id) {
    fetch(`http://localhost:8080/products/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
    })
    .then(res => res.json())
    .then(() => {
        alert("Product deleted successfully!");
        fetchProducts();
    })
    .catch(error => alert(error.message));
}
