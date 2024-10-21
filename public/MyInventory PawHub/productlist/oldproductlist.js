const products = [
    { name: "Dog food 1", expiry: "2024-03-22", added: "2023-02-21", price: "$1,241", quantity: 44, image: "dogfood.png" },
    { name: "iPhone 14 pro", expiry: "2024-03-22", added: "2023-02-21", price: "$1,499", quantity: 23, image: "iphone.png" },
    { name: "BYEBYE", expiry: "2025-03-11", added: "2023-02-21", price: "$215", quantity: 3, image: "keyboard.png" },
    { name: "Airpods Pro", expiry: "2025-03-11", added: "2027-02-21", price: "$249", quantity: 23, image: "airpods.png" },
    { name: "Samsung Galaxy Fold", expiry: "2028-03-11", added: "2026-02-21", price: "$1,199", quantity: 23, image: "galaxyfold.png" },
    { name: "Samsung Odyssey", expiry: "2027-03-11", added: "2025-02-21", price: "$500", quantity: 23, image: "odyssey.png" },
    { name: "Logitech Superlight", expiry: "2026-03-11", added: "2024-02-21", price: "$500", quantity: 23, image: "logitech.png" },
];

const rowsPerPage = 5;
let currentPage = 1;

// Event listeners for sorting buttons
document.addEventListener('DOMContentLoaded', () => {
    const sortExpiryBtn = document.getElementById('sortExpiryBtn');
    const sortAddedBtn = document.getElementById('sortAddedBtn');
    const searchInput = document.getElementById('searchInput'); // Search input
    let sortExpiryAscending = true;
    let sortAddedAscending = true;
    const allProducts = [...products]; // Keep a copy of the original products list for filtering


    // Generalized sort function
    function sortTable(column, isAscending) {
        products.sort((a, b) => {
            const dateA = new Date(a[column]);
            const dateB = new Date(b[column]);

            return isAscending ? dateA - dateB : dateB - dateA;
        });

        displayProducts(currentPage);
    }

    function toggleSortIcon(iconElement, isAscending) {
        // Clear both classes first
        iconElement.classList.remove('fa-sort-up', 'fa-sort-down');
    
        // Add the correct icon based on the sorting order
        if (isAscending) {
            iconElement.classList.add('fa-sort-down');  // Show down arrow for ascending
        } else {
            iconElement.classList.add('fa-sort-up');    // Show up arrow for descending
        }
    }
    // Sort by expiry date
    sortExpiryBtn.addEventListener('click', () => {
        sortTable('expiry', sortExpiryAscending);
        toggleSortIcon(sortIconExpiry, sortExpiryAscending);
        sortExpiryAscending = !sortExpiryAscending; // Toggle the sort direction
    });

    // Sort by date added
    sortAddedBtn.addEventListener('click', () => {
        sortTable('added', sortAddedAscending);
        toggleSortIcon(sortIconAdded, sortAddedAscending);
        sortAddedAscending = !sortAddedAscending; // Toggle the sort direction
    });

    displayProducts(currentPage); // Initial display    
});

// Function to render products in the table
function displayProducts(page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedProducts = products.slice(start, end);

    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = ""; // Clear existing rows

    paginatedProducts.forEach((product, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td><img src="${product.image}" alt="${product.name}" width="50"></td>
            <td>${product.name}</td>
            <td>${isValidDate(product.expiry) ? formatDate(product.expiry) : 'Invalid Date'}</td>
            <td>${formatDate(product.added)}</td>
            <td>${product.price}</td>
            <td id="quantity-${index}">${product.quantity}</td>
            <td> 
                <button class="minus-btn" data-index="${start + index}" onclick="decreaseQuantity(${start + index})">-</button> 
                <button class="add-btn" data-index="${start + index}" onclick="increaseQuantity(${start + index})">+</button> 
            </td>
        `;
        tableBody.appendChild(row);
    });

    

    updatePaginationButtons();
}

// Function to format date (YYYY-MM-DD to DD-MM-YY)
function formatDate(isoDateString) {
    const [year, month, day] = isoDateString.split('-');
    const shortYear = year.slice(-2);  // Extract last two digits of the year
    return `${day}-${month}-${shortYear}`;
}

// Function to validate if a string is a valid date in the format YYYY-MM-DD
function isValidDate(dateString) {
    return !isNaN(Date.parse(dateString)) && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

// Dynamically update pagination buttons
function updatePaginationButtons() {
    const totalPages = Math.ceil(products.length / rowsPerPage);
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ''; // Clear existing buttons

    // Create "prev" button
    const prevButton = document.createElement('button');
    prevButton.classList.add('page-btn');
    prevButton.textContent = '<';
    prevButton.disabled = currentPage === 1;
    prevButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            displayProducts(currentPage);
        }
    });
    paginationContainer.appendChild(prevButton);

    // Create page number buttons dynamically
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.classList.add('page-btn');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayProducts(currentPage);
        });
        if (i === currentPage) {
            pageButton.classList.add('active'); // Highlight the current page
        }
        paginationContainer.appendChild(pageButton);
    }

    // Create "next" button
    const nextButton = document.createElement('button');
    nextButton.classList.add('page-btn');
    nextButton.textContent = '>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayProducts(currentPage);
        }
    });
    paginationContainer.appendChild(nextButton);
}

    // Functions to increase/decrease quantity
    function increaseQuantity(index) {
        products[index].quantity += 1;
        displayProducts(currentPage);
    }

    let selectedProductIndex = null; // To track the product to be deleted

    // Show the confirmation modal
    function showConfirmationModal(index) {
        selectedProductIndex = index; // Save the selected product's index
        const modal = document.getElementById('confirmationModal');
        modal.style.display = 'flex'; // Show modal
    }

    // Hide the confirmation modal
    function hideConfirmationModal() {
        const modal = document.getElementById('confirmationModal');
        modal.style.display = 'none'; // Hide modal
    }

    // Decrease quantity and show confirmation if it reaches 0
    function decreaseQuantity(index) {
        if (products[index].quantity > 1) {
            products[index].quantity -= 1;
            displayProducts(currentPage);
        } else if (products[index].quantity === 1) {
            // Show confirmation modal if quantity is about to become 0
            showConfirmationModal(index);
        }
    }

    // Delete the product from the list
    function deleteProduct() {
        if (selectedProductIndex !== null) {
            products.splice(selectedProductIndex, 1); // Remove the product
            hideConfirmationModal();
            displayProducts(currentPage); // Update the display
            selectedProductIndex = null;
        }
    }

    // Replenish the product (redirect to another webpage)
    function replenishProduct() {
        hideConfirmationModal();
        window.location.href = "../../shop.html"; // Redirect to the replenishment page

    }


// Event listeners for modal buttons
document.getElementById('deleteProductBtn').addEventListener('click', deleteProduct);
document.getElementById('replenishProductBtn').addEventListener('click', replenishProduct);
document.getElementById('cancelBtn').addEventListener('click', hideConfirmationModal);

// Initial display of products
displayProducts(currentPage);