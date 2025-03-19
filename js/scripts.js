
document.addEventListener("DOMContentLoaded", function () { 
    // Ladda header och footer
    fetch("header.html")
        .then(response => response.text())
        .then(data => {
            document.getElementById("header").innerHTML = data;
            updateCartIcon(); // Körs nu först efter att headern har laddats
        });
    fetch("footer.html")
        .then(response => response.text())
        .then(data => document.getElementById("footer").innerHTML = data);
    
    // Kontrollera vilken sida som är laddad
    if (document.getElementById("cart-items")) { displayCart();} // Ladda varukorgen på cart.html}
    if (document.getElementById("checkout-items")) { displayCheckout();} // Ladda varukorgen på checkout.html

    // updateCartIcon(); // Uppdatera varukorgsikon
    function updateCartIcon() {
        let cart = JSON.parse(localStorage.getItem("cart")) || [];
        let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        let cartIcon = document.getElementById("cart-icon");
        if (cartIcon) { cartIcon.innerText = `Cart (${totalItems})`;}
    }
    // Kontrollera vilken sida som är laddad
    //if (document.getElementById("cart-items")) { displayCart();} // Ladda varukorgen på cart.html}
    //if (document.getElementById("checkout-items")) { displayCheckout();} // Ladda varukorgen på checkout.html
});

// Place Order with API request
function placeOrder(event) {
    event.preventDefault();
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let address = document.getElementById("address").value.trim();
    let deliveryDate = document.getElementById("delivery-date").value;
    let deliveryTime = document.getElementById("delivery-time").value;
    let paymentMethod = document.querySelector('input[name="payment"]:checked');
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (!name || !email || !phone || !address || !deliveryDate || !deliveryTime || !paymentMethod) {
        alert("Please fill in all fields.");
        return false;
    }

    let orderData = {
        name, email, phone, address, deliveryDate, deliveryTime, paymentMethod: paymentMethod.value, cart
    };

    fetch("http://localhost:8080/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
    })
    .then(response => response.json())
    .then(data => {
        alert("Order placed successfully!");
        localStorage.removeItem("cart"); // Clear cart after order
        window.location.href = "index.html";
    })
    .catch(error => {
        console.error("Error placing order:", error);
        alert("Error placing order. Please try again.");
    });
}

// Add to Cart Functionality
function addToCart(productId, productName, productPrice) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let product = cart.find(item => item.id === productId);

    if (product) {
        product.quantity += 1;
    } else {
        cart.push({ id: productId, name: productName, price: productPrice, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    console.log("Updated cart:", cart); // 🔍 Felsökningslogg
    alert(`${productName} added to cart!`);
    updateCartIcon();
}


// Update Cart Icon Count
function updateCartIcon() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById("cart-icon").innerText = `Cart (${totalItems})`;
}

// Display Cart Items in Cart Page
function displayCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartItemsDiv = document.getElementById("cart-items");
    let total = 0;

    cartItemsDiv.innerHTML = ""; // Clear previous content

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            cartItemsDiv.innerHTML += `
                <div class="cart-item">
                    <p><strong>${item.name}</strong> - ${item.price} sek x ${item.quantity}</p>
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `;
        });
    }
    console.log(JSON.parse(localStorage.getItem("cart")));
    document.getElementById("cart-total").innerHTML = `<strong>Total: ${total.toFixed(2)} sek</strong>`;
}

// Update Quantity in Cart
function updateQuantity(productId, change) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let product = cart.find(item => item.id === productId);

    if (product) {
        product.quantity += change;
        if (product.quantity <= 0) {
            cart = cart.filter(item => item.id !== productId);
        }
        localStorage.setItem("cart", JSON.stringify(cart));
        displayCart();
        updateCartIcon();
    }
}

// Remove Item from Cart
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
    updateCartIcon();
}

// Clear Cart
function clearCart() {
    localStorage.removeItem("cart");
    displayCart();
    updateCartIcon();
}

// Display Checkout Order Summary
function displayCheckout() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let checkoutItemsDiv = document.getElementById("checkout-items");
    let total = 0;

    checkoutItemsDiv.innerHTML = "";
    cart.forEach(item => {
        total += item.price * item.quantity;
        checkoutItemsDiv.innerHTML += `<p><strong>${item.name}</strong> - ${item.price} sek x ${item.quantity}</p>`;
    });

    document.getElementById("checkout-total").innerHTML = `<strong>Total: ${total.toFixed(2)} sek</strong>`;
}

// Place Order
function placeOrder(event) {
    event.preventDefault();
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let address = document.getElementById("address").value.trim();
    let deliveryDate = document.getElementById("delivery-date").value;
    let deliveryTime = document.getElementById("delivery-time").value;
    let paymentMethod = document.querySelector('input[name="payment"]:checked');

    if (!name || !email || !phone || !address || !deliveryDate || !deliveryTime || !paymentMethod) {
        alert("Please fill in all fields.");
        return false;
    }

    alert("Order placed successfully!");
    localStorage.removeItem("cart"); // Clear cart after order
    window.location.href = "index.html"; // Redirect to homepage
}

// Form Validation (Contact & Checkout)
function validateForm(event, formType) {
    event.preventDefault();
    let name = document.getElementById("name").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let address = document.getElementById("address") ? document.getElementById("address").value.trim() : null;
    
    let emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let phonePattern = /^[0-9]{10,15}$/;

    if (name === "" || email === "" || phone === "") {
        alert("All fields are required.");
        return false;
    }

    if (!emailPattern.test(email)) {
        alert("Invalid email format.");
        return false;
    }

    if (!phonePattern.test(phone)) {
        alert("Invalid phone number.");
        return false;
    }

    if (formType === "checkout" && (address === "" || address === null)) {
        alert("Address is required for checkout.");
        return false;
    }

    alert(formType === "contact" ? "Message Sent!" : "Order Placed!");
    return true;
}
