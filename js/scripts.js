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
    if (document.getElementById("cart-items")) { displayCart(); } // Ladda varukorgen på cart.html
    if (document.getElementById("checkout-items")) { displayCheckout(); } // Ladda varukorgen på checkout.html
});

// Uppdatera varukorgsikonen
function updateCartIcon() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    let cartIcon = document.getElementById("cart-icon");
    if (cartIcon) { cartIcon.innerText = `Cart (${totalItems})`; }
}

// **Lägga en beställning och skicka data till backend**
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

    // Validera inmatade fält
    if (!name || !email || !phone || !address || !deliveryDate || !deliveryTime || !paymentMethod) {
        alert("Please fill in all fields.");
        return false;
    }

    if (cart.length === 0) {
        alert("Your cart is empty. Please add items before placing an order.");
        return false;
    }

    const orderData = {
        name_checkout: name,
        email_checkout: email,
        phone_checkout: phone,
        delivery_date_checkout: deliveryDate,
        delivery_time_checkout: deliveryTime,
        payment_method_checkout: paymentMethod.value,
        address_checkout: address,
        products: JSON.parse(localStorage.getItem('data'))
    };
    app.post('/submit_order', async (req, res) => {
        // Destructure the data from the request body
        const {
            name_checkout,
            email_checkout,
            phone_checkout,
            delivery_date_checkout,
            delivery_time_checkout,
            payment_method_checkout,
            address_checkout,
            products
        } = req.body;
     
        // Check if products are provided
        if (!products || products.length === 0) {
            return res.status(400).send('You must add at least one product to your order.');
        }
     
        // Calculate the total amount for the products (in cents)
        const totalAmount = products.reduce((total, prod) => {
            const price = prod.price * 100;  // Convert to cents
            return total + price * prod.item; // Multiply price with quantity (prod.item)
        }, 0);
     
        try {
            // Create a new order object to save
            const newOrder = new Order({
                name_checkout,
                email_checkout,
                phone_checkout,
                delivery_date_checkout,
                delivery_time_checkout,
                payment_method_checkout,
                address_checkout,
                products,
                totalAmount  // Save the total amount
            });
     
            // Save the new order to the database
            await newOrder.save();
     
            // Send success response
            res.status(201).send('<h1>Thank you. Your order has been placed successfully!</h1>');
        } catch (error) {
            // Handle any errors during saving the order
            res.status(500).send(`Internal Server Error: ${error.message}`);
        }
    });
}
/*
    // Skicka orderdata till backend
    fetch("http://localhost:3000/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to place order. Please try again.");
            }
            return response.json();
        })
        .then(data => {
            alert("Order placed successfully!");
            localStorage.removeItem("cart"); // Rensa varukorg efter order
            window.location.href = "index.html"; // Omdirigera till startsidan
        })
        .catch(error => {
            console.error("Error placing order:", error);
            alert("Error placing order. Please try again.");
        });
        console.log("Order data:", orderData); // 🔍 Felsökningslogg
}
*/
// **Visa varukorg på Cart-sidan**
function displayCart() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let cartItemsDiv = document.getElementById("cart-items");
    let total = 0;

    cartItemsDiv.innerHTML = "";

    if (cart.length === 0) {
        cartItemsDiv.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            cartItemsDiv.innerHTML += `
                <div class="cart-item">
                    <p><strong>${item.name}</strong> - ${item.price} SEK x ${item.quantity}</p>
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                    <button onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            `;
        });
    }
    document.getElementById("cart-total").innerHTML = `<strong>Total: ${total.toFixed(2)} SEK</strong>`;
}

// **Visa order sammanfattning på Checkout-sidan**
function displayCheckout() {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let checkoutItemsDiv = document.getElementById("checkout-items");
    let total = 0;

    checkoutItemsDiv.innerHTML = "";
    cart.forEach(item => {
        total += item.price * item.quantity;
        checkoutItemsDiv.innerHTML += `<p><strong>${item.name}</strong> - ${item.price} SEK x ${item.quantity}</p>`;
    });

    document.getElementById("checkout-total").innerHTML = `<strong>Total: ${total.toFixed(2)} SEK</strong>`;
}

// **Uppdatera kvantitet i varukorgen**
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

// **Ta bort artikel från varukorgen**
function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter(item => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(cart));
    displayCart();
    updateCartIcon();
}

// **Clear Cart**
function clearCart() {
    localStorage.removeItem("cart");
    displayCart();
    updateCartIcon();
}

// **Formulärvalidering för Checkout och Kontakt**
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

// **Lägg till produkt i varukorgen**
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
