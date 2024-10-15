const products = [
    { name: "Dog food 1", expiry: "2024-03-22", added: "2023-02-21", price: "$1,241", quantity: 44, image: "dogfood.png" },
    { name: "iPhone 14 pro", expiry: "2024-03-22", added: "2023-02-21", price: "$1,499", quantity: 23, image: "iphone.png" },
    { name: "Zoom75", expiry: "2025-03-11", added: "2023-02-21", price: "$215", quantity: 23, image: "keyboard.png" },
    { name: "Airpods Pro", expiry: "2025-03-11", added: "2027-02-21", price: "$249", quantity: 23, image: "airpods.png" },
    { name: "Samsung Galaxy Fold", expiry: "2028-03-11", added: "2026-02-21", price: "$1,199", quantity: 23, image: "galaxyfold.png" },
    { name: "Samsung Odyssey", expiry: "2027-03-11", added: "2025-02-21", price: "$500", quantity: 23, image: "odyssey.png" },
    { name: "Logitech Superlight", expiry: "2026-03-11", added: "2024-02-21", price: "$500", quantity: 23, image: "logitech.png" },
    // Add more products as needed
];

const rowsPerPage = 5;
let currentPage = 1;


document.addEventListener('DOMContentLoaded', () => {
    const sortExpiryBtn = document.getElementById('sortExpiryBtn');
    const sortAddedBtn = document.getElementById('sortAddedBtn');
    let sortExpiryAscending = true;
    let sortAddedAscending = true;

    // Generalized sort function
    function sortTable(column, isAscending) {
        products.sort((a, b) => {
            const dateA = new Date(a[column]);
            const dateB = new Date(b[column]);

            return isAscending ? dateA - dateB : dateB - dateA;
        });

        displayProducts(currentPage);
    }

    // Sort by expiry date
    sortExpiryBtn.addEventListener('click', () => {
        sortTable('expiry', sortExpiryAscending);
        sortExpiryAscending = !sortExpiryAscending; // Toggle the sort direction
    });

    // Sort by date added
    sortAddedBtn.addEventListener('click', () => {
        sortTable('added', sortAddedAscending);
        sortAddedAscending = !sortAddedAscending; // Toggle the sort direction
    });

    displayProducts(currentPage);
});

// Function to validate if a string is a valid date in the format YYYY-MM-DD
function isValidDate(dateString) {
    return !isNaN(Date.parse(dateString)) && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

// Function to render products in the table
function displayProducts(page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedProducts = products.slice(start, end);

    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = ""; // Clear existing rows

    paginatedProducts.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td><img src="${product.image}" alt="${product.name}"></td>
            <td>${product.name}</td>
            <td>${isValidDate(product.expiry) ? formatDate(product.expiry) : 'Invalid Date'}</td> <!-- Format the expiry date here -->
            <td>${formatDate(product.added)}</td> <!-- Format the added date here -->
            <td>${product.price}</td>
            <td>${product.quantity}</td>
        `;
        tableBody.appendChild(row);
    });

    updatePaginationButtons();
}

function formatDate(isoDateString) {
    const [year, month, day] = isoDateString.split('-');
    const shortYear = year.slice(-2);  // Extract last two digits of the year
    return `${day}-${month}-${shortYear}`;
}

function updatePaginationButtons() {
    const totalPages = Math.ceil(products.length / rowsPerPage);
    const pageButtons = document.querySelectorAll('.page-btn');

    pageButtons.forEach(btn => {
        const page = btn.getAttribute('data-page');
        
        if (page === "prev") {
            btn.disabled = currentPage === 1;
        } else if (page === "next") {
            btn.disabled = currentPage === totalPages;
        } else {
            btn.classList.toggle('active', parseInt(page) === currentPage);
        }
    });
}