console.log("StockFlow Dashboard Loaded!");

// Load products when page opens
document.addEventListener("DOMContentLoaded", function () {
    loadProducts();
});


// =================================
// LOAD PRODUCTS FROM MONGODB
// =================================

async function loadProducts() {
    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Failed to load products");
        }

        const products = await response.json();

        let tbody = document.getElementById("productList");

        tbody.innerHTML = "";

        products.forEach(product => {

            let row = tbody.insertRow();

            row.dataset.id = product._id;

            row.insertCell(0).innerText = product.name;

            row.insertCell(1).innerText = product.quantity;

            let actions = row.insertCell(2);

            actions.innerHTML = `
                <button onclick="editProduct(this.parentElement.parentElement)">
                    Edit
                </button>

                <button onclick="deleteProduct(this.parentElement.parentElement)">
                    Delete
                </button>
            `;
        });

        updateDashboard();

    } catch (error) {
        console.error("Error loading products:", error);
    }
}


// =================================
// ADD PRODUCT
// =================================

async function addProduct() {

    let name = prompt("Enter Product Name:");

    if (!name || !name.trim()) {
        alert("Please enter product name");
        return;
    }

    let quantity = prompt("Enter Quantity:");

    if (
        quantity === null ||
        quantity.trim() === "" ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0
    ) {
        alert("Please enter a valid quantity");
        return;
    }

    try {

        const response = await fetch("/api/products", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name.trim(),
                quantity: Number(quantity)
            })
        });

        if (!response.ok) {
            throw new Error("Product not added");
        }

        alert("Product Added Successfully!");

        await loadProducts();

    } catch (error) {
        console.error(error);
        alert("Error adding product");
    }
}


// =================================
// EDIT PRODUCT
// =================================

async function editProduct(row) {

    let id = row.dataset.id;

    let oldName = row.cells[0].innerText;
    let oldQuantity = row.cells[1].innerText;

    let name = prompt("Enter Product Name:", oldName);

    if (!name || !name.trim()) return;

    let quantity = prompt("Enter Quantity:", oldQuantity);

    if (
        quantity === null ||
        quantity.trim() === "" ||
        !Number.isInteger(Number(quantity)) ||
        Number(quantity) <= 0
    ) {
        alert("Invalid quantity");
        return;
    }

    try {

        const response = await fetch(
            `/api/products/${encodeURIComponent(id)}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    name: name.trim(),
                    quantity: Number(quantity)
                })
            }
        );

        if (!response.ok) {
            throw new Error("Update failed");
        }

        alert("Product Updated Successfully!");

        await loadProducts();

    } catch (error) {
        console.error(error);
        alert("Error updating product");
    }
}


// =================================
// DELETE PRODUCT
// =================================

async function deleteProduct(row) {

    let confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmDelete) return;

    let id = row.dataset.id;

    try {

        const response = await fetch(
            `/api/products/${encodeURIComponent(id)}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Delete failed");
        }

        alert("Product Deleted Successfully!");

        await loadProducts();

    } catch (error) {
        console.error(error);
        alert("Error deleting product");
    }
}


// =================================
// SEARCH PRODUCT
// =================================

function searchProduct() {

    let searchInput = document.querySelector(
        'input[placeholder="Search Product..."]'
    );

    if (!searchInput) return;

    let searchValue = searchInput.value.toLowerCase();

    let tbody = document.getElementById("productList");

    let rows = tbody.getElementsByTagName("tr");

    for (let i = 0; i < rows.length; i++) {

        let productName =
            rows[i].cells[0].innerText.toLowerCase();

        if (productName.includes(searchValue)) {
            rows[i].style.display = "";
        } else {
            rows[i].style.display = "none";
        }
    }
}


// =================================
// UPDATE DASHBOARD
// =================================

function updateDashboard() {

    let tbody = document.getElementById("productList");

    let rows = tbody.getElementsByTagName("tr");

    let totalProducts = 0;
    let totalStock = 0;
    let lowStock = 0;

    for (let i = 0; i < rows.length; i++) {

        let quantity = Number(rows[i].cells[1].innerText);

        totalProducts++;

        totalStock += quantity;

        if (quantity <= 5) {
            lowStock++;

            rows[i].style.backgroundColor = "#ffeccc";

        } else {
            rows[i].style.backgroundColor = "";
        }
    }

    document.getElementById("totalProducts").innerText =
        totalProducts;

    document.getElementById("totalStock").innerText =
        totalStock;

    document.getElementById("lowStock").innerText =
        lowStock;
}