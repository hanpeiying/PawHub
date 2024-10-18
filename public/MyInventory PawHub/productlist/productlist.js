    // Toggle sort icon (up/down arrow)
    // function toggleSortIcon(iconElement, isAscending) {
    //     iconElement.textContent = isAscending ? '⬇️' : '⬆️';
    // }

    // function toggleSortIcon(iconElement, isAscending) {
    //     iconElement.classList.toggle("fa-solid fa-sort-down", isAscending);
    //     iconElement.classList.toggle("fa-solid fa-sort-up", !isAscending);
    // }

    const products = [
        { name: "Dog food 1", expiry: "2024-03-22", added: "2023-02-21", price: "$1,241", quantity: 44, image: "dog1.jpg" },
        { name: "iPhone 14 pro", expiry: "2023-03-22", added: "2022-02-21", price: "$1,499", quantity: 23, image: "iphone.png" },
        { name: "BYEBYE", expiry: "2025-03-11", added: "2023-02-21", price: "$215", quantity: 3, image: "keyboard.png" },
        { name: "Airpods Pro", expiry: "2025-03-11", added: "2027-02-21", price: "$249", quantity: 23, image: "airpods.png" },
        { name: "Samsung Galaxy Fold", expiry: "2028-03-11", added: "2026-02-21", price: "$1,199", quantity: 23, image: "galaxyfold.png" },
        { name: "Samsung Odyssey", expiry: "2027-03-11", added: "2025-02-21", price: "$500", quantity: 23, image: "odyssey.png" },
        { name: "Logitech Superlight", expiry: "2026-03-11", added: "2024-02-21", price: "$500", quantity: 23, image: "logitech.png" },
    ];
    
    const rowsPerPage = 5;
    let currentPage = 1;

    document.addEventListener('DOMContentLoaded', () => {
        const sortExpiryBtn = document.getElementById('sortExpiryBtn');
        const sortAddedBtn = document.getElementById('sortAddedBtn');
        const searchInput = document.getElementById('searchInput');
        let sortExpiryAscending = true;
        let sortAddedAscending = true;
        const allProducts = [...products]; // Copy of the original products list for filtering

    
        // Generalized sort function
        function sortTable(column, isAscending, filteredProducts) {
            filteredProducts.sort((a, b) => {
                const dateA = new Date(a[column]);
                const dateB = new Date(b[column]);
    
                return isAscending ? dateA - dateB : dateB - dateA;
            });
    
            displayProducts(filteredProducts, currentPage);
        }
    
        // Toggle the sort icons for expiry and date added
        function toggleSortIcon(iconElement, isAscending) {
            iconElement.classList.remove('fa-solid', 'fa-arrow-down-wide-short', 'fa-arrow-up-wide-short');
            if (isAscending) {
                iconElement.classList.add('fa-solid', 'fa-arrow-up-wide-short'); // Show up arrow for ascending
            } else {
                iconElement.classList.add('fa-solid', 'fa-arrow-down-wide-short'); // Show down arrow for descending
            }
        }
    
        // Sort by expiry date
        sortExpiryBtn.addEventListener('click', () => {
            const filteredProducts = filterProducts(searchInput.value);
            sortTable('expiry', sortExpiryAscending, filteredProducts);
            toggleSortIcon(sortIconExpiry, sortExpiryAscending);
            sortExpiryAscending = !sortExpiryAscending; // Toggle the sort direction
        });
    
        // Sort by date added
        sortAddedBtn.addEventListener('click', () => {
            const filteredProducts = filterProducts(searchInput.value);
            sortTable('added', sortAddedAscending, filteredProducts);
            toggleSortIcon(sortIconAdded, sortAddedAscending);
            sortAddedAscending = !sortAddedAscending; // Toggle the sort direction
        });
    
        // Filter products based on search input
        searchInput.addEventListener('input', () => {
            const searchValue = searchInput.value.toLowerCase();
            const filteredProducts = filterProducts(searchValue);
            displayProducts(filteredProducts, currentPage);
        });
    
        // Function to filter products based on the search value
        function filterProducts(searchValue) {
            return allProducts.filter(product => 
                product.name.toLowerCase().includes(searchValue)
            );
        }
    
        // Initial display of all products
        displayProducts(allProducts, currentPage);
    });
    
    // Function to render products in the table
    function displayProducts(filteredProducts, page) {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const paginatedProducts = filteredProducts.slice(start, end);
    
        const tableBody = document.getElementById('productTableBody');
        tableBody.innerHTML = ""; // Clear existing rows
    
        paginatedProducts.forEach((product, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `

                <div id="imageModal" class="image-modal">
                    <span class="close-btn" onclick="closeImageModal()">&times;</span>
                    <div class="image-modal-content">
                        <img id="enlargedImage" src="" alt="Product Image" class="zoomable-image">
                        <div id="zoomLens" class="zoom-lens"></div>
                    </div>
                </div>

                <td><input type="checkbox"></td>
                <td>
                    <div class="product-image-container" onclick="enlargeImage('${product.image}')">
                    <img src="${product.image}" alt="${product.name}" />
                    </div>
                </td>
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
    
        updatePaginationButtons(filteredProducts);
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
    function updatePaginationButtons(filteredProducts) {
        const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
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
                displayProducts(filteredProducts, currentPage);
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
                displayProducts(filteredProducts, currentPage);
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
                displayProducts(filteredProducts, currentPage);
            }
        });
        paginationContainer.appendChild(nextButton);
    }
    
    // Functions to increase/decrease quantity
    function increaseQuantity(index) {
        products[index].quantity += 1;
        displayProducts(products, currentPage);
    }
    

    // Start of minus button
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
            displayProducts(products, currentPage); // Pass products array here
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
    // End of minus function
    displayProducts(currentPage);

    // Function to enlarge the image and show the modal
    function enlargeImage(imageSrc) {
        const modal = document.getElementById('imageModal');
        const enlargedImage = document.getElementById('enlargedImage');
        const zoomLens = document.getElementById('zoomLens');
        enlargedImage.src = imageSrc; // Set the clicked image source to the modal image
        modal.classList.add('show'); // Show the modal

        // Add event listeners for zoom
        enlargedImage.addEventListener('mousemove', moveLens);
        enlargedImage.addEventListener('mouseleave', hideLens); // Hide lens on mouse leave
        zoomLens.style.display = 'block'; // Show the zoom lens when modal opens

        function moveLens(event) {
            const rect = enlargedImage.getBoundingClientRect();
            const lensSize = 150; // Size of the zoom lens (should match the CSS width/height)
            
            // Calculate mouse position relative to the image
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
        
            // Ensure the lens stays within image bounds
            let lensX = x - lensSize / 2;
            let lensY = y - lensSize / 2;
        
            // Prevent lens from moving outside image bounds
            if (lensX < 0) lensX = 0;
            if (lensY < 0) lensY = 0;
            if (lensX > rect.width - lensSize) lensX = rect.width - lensSize;
            if (lensY > rect.height - lensSize) lensY = rect.height - lensSize;
        
            // Position the lens
            zoomLens.style.left = `${lensX}px`;
            zoomLens.style.top = `${lensY}px`;
        
            // Calculate zoom percentages (where the zoomed area should be based on the lens position)
            const scale = 2; // Zoom level (adjust as needed)
            const zoomX = (lensX / rect.width) * 100; // X percentage of the zoom
            const zoomY = (lensY / rect.height) * 100; // Y percentage of the zoom
        
            // Apply the zoom transformation to the image
            enlargedImage.style.transform = `scale(${scale})`;
            enlargedImage.style.transformOrigin = `${zoomX}% ${zoomY}%`; // Zoom in on the specific area
        }

        function hideLens() {
            zoomLens.style.display = 'none'; // Hide lens when the mouse leaves the image
            enlargedImage.style.transform = 'scale(1)'; // Reset zoom
        }
    }

    // Function to close the image modal
    function closeImageModal() {
        const modal = document.getElementById('imageModal');
        const zoomLens = document.getElementById('zoomLens');
        modal.classList.remove('show'); // Hide the modal
        zoomLens.style.display = 'none'; // Hide the zoom lens
        const enlargedImage = document.getElementById('enlargedImage');
        enlargedImage.style.transform = 'scale(1)'; // Reset the zoom effect
    }