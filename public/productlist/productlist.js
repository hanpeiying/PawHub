// Firebase setup
import { app } from "../firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, addDoc, collection, doc, updateDoc, query, where, getDocs, getDoc, deleteDoc, onSnapshot} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
let userUID = null;
let allProducts = []; // Store all user products
const rowsPerPage = 7;
let currentPage = 1;

// Monitor authentication state and get user ID
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, get the UID
        userUID = user.uid;
        console.log("Logged-in user UID:", userUID);

        // Load user-specific products after confirming user is logged in
        loadUserProducts(userUID);
        loadDeletedProducts(userUID);
        loadProductsWithConsumptionLogs(); 
    } else {
        console.log("No user is logged in");
        alert("You need to be logged in to list an item.");
    }
});


// Function to add a new product to the Firestore 'inventory' collection
export async function addProductToFirestore(product) {
    try {
        const docRef = await addDoc(collection(db, 'inventory'), {
            name: product.name,
            expiry: product.expiry,
            added: product.added,
            price: product.price,
            quantity: product.quantity,
            serving: product.quantity,
            image: product.image,
            userUID: userUID  // Store user ID for personalized data
        });
        console.log("Product added with ID: ", docRef.id);
        product.id = docRef.id; // Store the document ID for future updates
        allProducts.push(product); // Add the new product to the local list
        displayProducts(allProducts, currentPage); // Refresh the displayed products
    } catch (e) {
        console.error("Error adding product: ", e);
    }
}

// Function to update the stock of an existing product in Firestore
// async function updateProductStockInFirestore(productId, newQuantity) {
//     const productRef = doc(db, 'inventory', productId);
//     try {
//         await updateDoc(productRef, { quantity: newQuantity });
//         console.log("Product stock updated in Firestore.");
//     } catch (e) {
//         console.error("Error updating product stock: ", e);
//     }
// }

// Function to retrieve products for a specific user from Firestore
export async function loadUserProducts(userId) {
    console.log("Loading products for user ID:", userId);
    const products = [];
    const q = query(collection(db, 'inventory'), where("userUID", "==", userId));
    try {
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        allProducts = products;  // Update the global allProducts array
        displayProducts(allProducts, currentPage);  // Initial display with all products
    } catch (e) {
        console.error("Error loading products: ", e);
    }
}


// function filterProducts(searchValue) {
//     const filtered = allProducts.filter(product => 
//         product.name.toLowerCase().includes(searchValue)
//     );
//     displayProducts(filtered, 1);  // Start on the first page of filtered results
// }

function filterProducts(searchValue) {
    if (!allProducts) {
        // If allProducts is undefined or null, return an empty array
        return [];
    }

    const filtered = allProducts.filter(product => 
        product.name.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return filtered; // Always return an array
}




        // Adjust stock and handle the confirmation modal when stock reaches 0
        export async function adjustStock(productId, amount) {
            const productRef = doc(db, 'inventory', productId);
            const product = allProducts.find(p => p.id === productId);
        
            if (product) {
                let newQuantity = product.quantity + amount;
        
                // If quantity is zero and the amount is negative, show the confirmation modal without updating
                if (product.quantity === 0 && amount < 0) {
                    selectedProductIndex = allProducts.findIndex(p => p.id === productId);
                    const modal = document.getElementById('confirmationModal');
                    modal.style.display = 'flex'; // Show modal
                    console.log("Prompt shown: Quantity is zero.");
                    return; // Stop further execution
                }
        
                // Ensure the new quantity is non-negative before updating Firestore
                if (newQuantity >= 0) {
                    try {
                        // Update Firestore with the new quantity
                        await updateDoc(productRef, { quantity: newQuantity });
                        product.quantity = newQuantity; // Update local product data
        
                        // Log the reduction with a timestamp if the amount is negative
                        if (amount < 0) {
                            await logConsumption(productId, newQuantity);
                        }
                        selectAndDisplayProduct(productId);
        
                        // Refresh displayed products
                        displayProducts(allProducts, currentPage);
                        console.log(`Product quantity adjusted by ${amount}. New quantity: ${newQuantity}`);
                    } catch (error) {
                        console.error("Error adjusting stock:", error);
                    }
                } else {
                    console.log("Quantity cannot be reduced below zero.");
                }
                if (newQuantity === 0) {
                    selectedProductIndex = allProducts.findIndex(p => p.id === productId);
                    const modal = document.getElementById('confirmationModal');
                    modal.style.display = 'flex';  // Show modal
                }
            } else {
                console.error("Product not found.");
            }

        }
        
        


            // Function to log each consumption event with a timestamp
            async function logConsumption(productId, quantityAtTimestamp) {
                try {
                    const productRef = doc(db, 'inventory', productId);
                    const logRef = collection(productRef, 'consumptionLogs'); // Create a subcollection under the product document

                    await addDoc(logRef, {
                        quantityAtTimestamp: quantityAtTimestamp,
                        timestamp: new Date().toISOString()  // Current timestamp
                    });
                    console.log(`Logged consumption of ${quantityAtTimestamp} for product ${productId}`);
                } catch (error) {
                    console.error("Error logging consumption:", error);
                }
            }

            // Fetch consumption logs for a specific product
            async function fetchConsumptionData(productId) {
                const productRef = doc(db, 'inventory', productId);
                const productSnap = await getDoc(productRef);
                if (!productSnap.exists()) {
                    console.error("Product not found.");
                    return [];
                }

                const initialQuantity = productSnap.data().serving; // Starting quantity of the product
                const initialTimestamp = productSnap.data().added; // Use 'added' field as the initial timestamp
                const logsRef = collection(productRef, 'consumptionLogs');
                const querySnapshot = await getDocs(logsRef);

                const data = [];

                // Add initial quantity as the starting point
                data.push({
                    timestamp: new Date(initialTimestamp),
                    quantityAtTimestamp: initialQuantity
                });

                // Process each document in the consumption logs
                querySnapshot.forEach(doc => {
                    const log = doc.data();

                    data.push({
                        timestamp: new Date(log.timestamp),
                        quantityAtTimestamp: log.quantityAtTimestamp
                    });
                    // Update the quantity based on the reduction for the next entry
                    // currentQuantity -= log.quantityAtTimestamp;
                });

                // Sort data by timestamp to ensure chronological order
                data.sort((a, b) => a.timestamp - b.timestamp);
                console.log(data);
                return data;
            }

        import 'https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns';

            
        export async function renderConsumptionChart(productId) {
            const consumptionData = await fetchConsumptionData(productId);
            if (!consumptionData || consumptionData.length === 0) {
                console.error(`No consumption data available for product ID: ${productId}`);
                alert("No consumption data available for this product.");
                return;
            }

            // Prepare data for Chart.js
            const labels = consumptionData.map(entry => new Date(entry.timestamp));
            const quantitiesAtTimestamps = consumptionData.map(entry => entry.quantityAtTimestamp);

            const ctx = document.getElementById('consumptionChart')?.getContext('2d');
            console.log("Labels (timestamps):", labels);
            console.log("Quantities at Timestamps:", quantitiesAtTimestamps);


            if (!ctx) {
                console.error('Canvas context (ctx) is not available. Ensure the canvas element is in the DOM and fully loaded.');
                return;
            }

            if (window.consumptionChart instanceof Chart) {
                window.consumptionChart.destroy();
            }

            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

            window.consumptionChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Quantity',
                        data: quantitiesAtTimestamps,
                        fill: false,
                        borderColor: 'rgba(75, 192, 192, 1)',
                        backgroundColor: 'rgba(75, 192, 192, 0.4)', // Point color for visibility
                        borderWidth: 3, // Line thickness
                        pointRadius: 3, // Point size for better visibility
                        pointStyle:' circle',
                        tension: 0.1
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                color: '#8B4513',
                                font: { size: 14, family: 'Comic Sans MS' }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    return `Quantity: ${context.raw}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'hour', // Adjust this based on your data intervals
                                displayFormats: {
                                    hour: 'MMM d, h a', // Format for display
                                }
                            },
                            title: {
                                display: true,
                                text: 'Date'
                            },
                            min: labels[0], // Start with the first timestamp
                            max: labels[labels.length - 1], // End with the last timestamp
                            ticks: {
                                autoSkip: true,
                                maxRotation: 45, // Rotate labels to make them readable
                                minRotation: 45
                            }
                        },
                        y: {
                            beginAtZero: true,
                            suggestedMin: 0,
                            title: {
                                display: true,
                                text: 'Quantity'
                            }
                        }
                    }
                }
            });
        }

        export async function updateChart(productId) {
            try {
                const productRef = doc(db, 'inventory', productId);
                const productSnap = await getDoc(productRef);
        
                if (productSnap.exists()) {
                    const productName = productSnap.data().name;
                    document.getElementById('chartTitle').textContent = `Consumption Rate Over Time for ${productName}`;
                    renderConsumptionChart(productId);
                }
            } catch (error) {
                console.error("Error updating chart for selected product:", error);
            }
        }
        

        // Function to load all products for the dropdown menu
async function loadProductsWithConsumptionLogs() {
    const products = [];  // Collect all inventory items for the dropdown
    const q = query(collection(db, 'inventory'), where("userUID", "==", userUID)); // Only get user-specific items

    onSnapshot(q, (querySnapshot) => {
        const products = [];
        querySnapshot.forEach((doc) => {
            products.push({ id: doc.id, name: doc.data().name });
        });

        const productSelect = document.getElementById('productSelect');
        productSelect.innerHTML = ''; // Clear existing options

        // Populate dropdown
        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            productSelect.appendChild(option);
        });

        // Auto-select the first product and load its chart data
        if (products.length > 0) {
            updateChart(products[0].id); // Initial chart view for the first product
        }
    });
}

        document.addEventListener('DOMContentLoaded', loadProductsWithConsumptionLogs);



// Event listener for DOMContentLoaded to initialize UI components
document.addEventListener('DOMContentLoaded', () => {
    const sortExpiryBtn = document.getElementById('sortExpiryBtn');
    const sortAddedBtn = document.getElementById('sortAddedBtn');
    const searchInput = document.getElementById('searchInput');
    // const viewBtn = document.getElementById('view-btn');
    let sortExpiryAscending = true;
    let sortAddedAscending = true;

    // Sort by expiry date
    sortExpiryBtn.addEventListener('click', () => {
        const filteredProducts = filterProducts(searchInput.value); // This should always return an array now
        console.log("Filtered Products:", filteredProducts); // Log to verify filteredProducts is an array
        sortTable('expiry', sortExpiryAscending, filteredProducts);
        toggleSortIcon(sortExpiryBtn, sortExpiryAscending);
        sortExpiryAscending = !sortExpiryAscending;
    });

    // Sort by date added
    sortAddedBtn.addEventListener('click', () => {
        const filteredProducts = filterProducts(searchInput.value);
        sortTable('added', sortAddedAscending, filteredProducts);
        toggleSortIcon(sortAddedBtn, sortAddedAscending);
        sortAddedAscending = !sortAddedAscending;
    });

    // Filter products based on search input
    searchInput.addEventListener('input', () => {
        const searchValue = searchInput.value.toLowerCase();
        const filteredProducts = filterProducts(searchValue);
        displayProducts(filteredProducts, currentPage);
    });

    // Event delegation for handling clicks on dynamically added "View" buttons
    document.getElementById('productTableBody').addEventListener('click', (event) => {
        if (event.target.classList.contains('view-btn')) {
            // Scroll to the chart section
            document.getElementById('chartSection').scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    });

});

window.enableEditing=function(productId) {
    const quantityCell = document.getElementById(`quantity-${productId}`);
    const currentQuantity = quantityCell.textContent.trim();

    // Replace the quantity cell content with an input field
    quantityCell.innerHTML = `<input type="number" id="edit-quantity-${productId}" value="${currentQuantity}" class="edit-input" />`;

    // Focus on the input and select the current value
    const input = document.getElementById(`edit-quantity-${productId}`);
    input.focus();
    input.select();

    // Save the new quantity when Enter is pressed or editing is lost
    input.addEventListener('blur', () => saveQuantity(productId));
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveQuantity(productId);
    });
}

async function saveQuantity(productId) {
    const input = document.getElementById(`edit-quantity-${productId}`);
    const newQuantity = parseInt(input.value);

    // Check if the new quantity is a valid number
    if (!isNaN(newQuantity)) {
        try {
            // Update quantity in Firestore
            const productRef = doc(db, 'inventory', productId);
            await updateDoc(productRef, { quantity: newQuantity });

            // Update the quantity in the local allProducts array
            const product = allProducts.find(p => p.id === productId);
            if (product) product.quantity = newQuantity;

            // Refresh the displayed products
            displayProducts(allProducts, currentPage);
            console.log("Product quantity updated successfully.");
        } catch (error) {
            console.error("Error updating product quantity:", error);
        }
    } else {
        console.error("Invalid quantity entered.");
        // Revert to the original value if input is invalid
        const product = allProducts.find(p => p.id === productId);
        if (product) document.getElementById(`quantity-${productId}`).textContent = product.quantity;
    }
}

// Function to filter products based on the search value

// Function to render products in the table
// Store filtered products for pagination control
let filteredProducts = [];

function displayProducts(products, page = 1) {
    currentPage = page;
    filteredProducts = products;

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);

    // Clear existing rows in the table view
    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = "";

    // Populate the table view
    paginatedProducts.forEach((product, index) => {
        let stockClass = product.quantity <= 5 ? 'low-stock' : 'sufficient-stock';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><button class="view-btn" onclick="selectAndDisplayProduct('${product.id}')">View</button></td>
            <td>
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" onclick="enlargeImage('${product.image}')"/>
                </div>
            </td>
            <td>${product.name}</td>
            <td>${formatDate(product.expiry)}</td>
            <td>${formatDate(product.added)}</td>
            <td>${product.price}</td>
            <td id="quantity-${product.id}" class="${stockClass}" onclick="enableEditing('${product.id}')">${product.quantity}</td>
            <td>
                <button class="minus-btn" onclick="adjustStock('${product.id}', -1)">-</button>
                <button class="adding-btn" onclick="adjustStock('${product.id}', +1)">+</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // Populate the card view for small screens
    const cardContainer = document.querySelector('.card-container');
    cardContainer.innerHTML = ""; // Clear existing cards

    paginatedProducts.forEach((product) => {
        const card = document.createElement('div');
        card.classList.add('card');
        card.innerHTML = `
            <div class="card-body">
                <img src="${product.image}" alt="${product.name}" class="card-img-top">
                <div class="title-container">
                    <h5 class="card-title">${product.name}</h5>
                    <button class="view-btn" onclick="selectAndDisplayProduct('${product.id}')">View</button>
                </div>
                <p class="card-text">
                    Expiry Date: ${formatDate(product.expiry)}<br>
                    Date Added: ${formatDate(product.added)}<br>
                    Price: ${product.price}<br>
                <div class="title-container">    
                    Servings: ${product.quantity}
                </p>
                <div class="button-container">
                    <button class="minus-btn" onclick="adjustStock('${product.id}', -1)">-</button>
                    <button class="adding-btn ml-2" onclick="adjustStock('${product.id}', +1)">+</button>
                </div>
                </div>
            </div>
        `;
        cardContainer.appendChild(card);
    });

    updatePaginationButtons();
}
window.selectAndDisplayProduct = function(productId) {
    const productSelect = document.getElementById('productSelect');
    productSelect.value = productId; // Set the dropdown to the selected product
    updateChart(productId);          // Call chart update for the selected product
};




    let dragStartIndex;

    function handleDragStart(event) {
        dragStartIndex = event.target.closest('tr').dataset.index;  // Get the starting index
        event.dataTransfer.effectAllowed = 'move';
        event.dataTransfer.setData('text/html', event.target.outerHTML);
        event.target.classList.add('dragging');
    }

    function handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }

    function handleDrop(event) {
        event.stopPropagation();

        const dragEndIndex = event.target.closest('tr').dataset.index;  // Get the ending index

        // Swap items in the array
        const temp = filteredProducts[dragStartIndex];
        filteredProducts[dragStartIndex] = filteredProducts[dragEndIndex];
        filteredProducts[dragEndIndex] = temp;

        // Redisplay products
        displayProducts(filteredProducts, currentPage);
    }

    function handleDragEnd(event) {
        event.target.classList.remove('dragging');
    }

    // Utility functions for date formatting and validation
    function formatDate(isoDateString) {
        const [year, month, day] = isoDateString.split('-');
        return `${day}-${month}-${year.slice(-2)}`;
    }

    function isValidDate(dateString) {
        return !isNaN(Date.parse(dateString)) && /^\d{4}-\d{2}-\d{2}$/.test(dateString);
    }

    // Toggle the sort icons for expiry and date added
    function toggleSortIcon(iconElement, isAscending) {
        console.log(`Toggling icon for ${iconElement.id}, ascending: ${isAscending}`);
        iconElement.classList.remove('fa-arrow-down-wide-short', 'fa-arrow-up-wide-short');
        iconElement.classList.add(isAscending ? 'fa-arrow-up-wide-short' : 'fa-arrow-down-wide-short');
    }

    function sortTable(column, isAscending, products) {
        // Ensure that products is an array
        if (!Array.isArray(products)) {
            console.error("Error: products is undefined or not an array.");
            return;
        }
    
        products.sort((a, b) => {
            const dateA = new Date(a[column]);
            const dateB = new Date(b[column]);
            return isAscending ? dateA - dateB : dateB - dateA;
        });
        
        displayProducts(products, currentPage);
    }

    function updatePaginationButtons() {
        const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
        const paginationContainer = document.querySelector('.pagination');
        paginationContainer.innerHTML = '';
        
        // Create "prev" button
        const prevButton = document.createElement('button');
        prevButton.textContent = '<';
        prevButton.classList.add('page-btn'); // Use the same style as page buttons
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                displayProducts(filteredProducts, currentPage - 1);
            }
        });
        paginationContainer.appendChild(prevButton);
        
        // Create page buttons
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.classList.add('page-btn');
            if (i === currentPage) {
                pageButton.classList.add('active');
            }
            pageButton.addEventListener('click', () => displayProducts(filteredProducts, i));
            paginationContainer.appendChild(pageButton);
        }
        
        // Create "next" button
        const nextButton = document.createElement('button');
        nextButton.textContent = '>';
        nextButton.classList.add('page-btn'); // Use the same style as page buttons
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                displayProducts(filteredProducts, currentPage + 1);
            }
        });
        paginationContainer.appendChild(nextButton);
    }
    
    let selectedProductIndex = null;
    
    function hideConfirmationModal() {
        const modal = document.getElementById('confirmationModal');
        modal.style.display = 'none';  // Hide modal
    }

    // Function to delete a product from Firestore
    async function deleteProduct() {
        // Show a confirmation prompt before proceeding with the delete action
        const userConfirmed = confirm("Are you sure you want to delete this product?");
        
        if (userConfirmed && selectedProductIndex !== null) {
            const productId = allProducts[selectedProductIndex].id;  // Get the product ID
            await archiveDeletedProduct(productId);
            
            try {
                const productRef = doc(db, 'inventory', productId);
                await deleteDoc(productRef);  // Delete the product from Firestore
                
                // Remove the product from the local list
                allProducts.splice(selectedProductIndex, 1);
                currentPage = 1;
                
                hideConfirmationModal();
                displayProducts(allProducts, currentPage);  // Refresh the displayed products
                
                selectedProductIndex = null;  // Reset the selected product index
                console.log("Product successfully deleted.");
                loadDeletedProducts(userUID);
            } catch (error) {
                console.error("Error deleting product: ", error);
            }
        }
    }

    
    // Function to replenish the product (restore to original stock level)
        // async function replenishProduct() {
        //     if (selectedProductIndex !== null) {
        //         const productId = allProducts[selectedProductIndex].id;  // Get the selected product's ID
                
        //         try {
        //             // Fetch the product from Firestore to get the original serving (stock) value
        //             const productRef = doc(db, 'inventory', productId);
        //             const productSnapshot = await getDoc(productRef);

        //             if (productSnapshot.exists()) {
        //                 const productData = productSnapshot.data();
        //                 const originalStock = productData.serving;  // Get the original stock level
                        
        //                 // Update the 'quantity' field to match the original stock level
        //                 await updateDoc(productRef, { quantity: originalStock });
                        
        //                 // Update the local list with the new stock level
        //                 allProducts[selectedProductIndex].quantity = originalStock;
                        
        //                 hideConfirmationModal();
        //                 displayProducts(allProducts, currentPage);  // Refresh the displayed products
                        
        //                 console.log("Product stock replenished to original level.");
        //             } else {
        //                 console.log("Product does not exist in Firestore.");
        //             }
        //         } catch (error) {
        //             console.error("Error replenishing product: ", error);
        //         }
        //     }
        // }

    function searchProduct() {
        if (selectedProductIndex !== null) {
            const productName = allProducts[selectedProductIndex]?.name;
            if (productName) {
                localStorage.setItem("searchItemName", productName);
                window.location.href = "./shop.html"; // Debug
            } else {
                console.error("Product name not found");
            }
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        const deleteBtn = document.getElementById('deleteProductBtn'); // Updated to match HTML ID
        // const replenishBtn = document.getElementById('replenishProductBtn');
        const searchBtn = document.getElementById('searchProductBtn');
        const cancelBtn = document.getElementById('cancelBtn');
    
        // Ensure buttons are present before adding event listeners
        if (deleteBtn) {
            deleteBtn.addEventListener('click', deleteProduct);
        }
        // Uncomment if you want to use replenish function
        // if (replenishBtn) {
        //     replenishBtn.addEventListener('click', replenishProduct);
        // }
        if (searchBtn) {
            searchBtn.addEventListener('click', searchProduct); 
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', hideConfirmationModal);
        }
        
        // Make hideConfirmationModal globally accessible
        window.hideConfirmationModal = hideConfirmationModal;
    });

    // Function to handle image enlargement and zoom
    window.enlargeImage = function(imageSrc) {
        const modal = document.getElementById('imageModal');
        const enlargedImage = document.getElementById('enlargedImage');
        const zoomLens = document.getElementById('zoomLens');

        // Set the clicked image source to the modal image
        enlargedImage.src = imageSrc;

        // Show the modal
        modal.classList.add('show');

        // Add event listeners for zoom
        enlargedImage.addEventListener('mousemove', moveLens);
        enlargedImage.addEventListener('mouseleave', hideLens);
        zoomLens.style.display = 'block';

        function moveLens(event) {
            const rect = enlargedImage.getBoundingClientRect();
            const lensSize = 150;

            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;

            let lensX = x - lensSize / 2;
            let lensY = y - lensSize / 2;

            if (lensX < 0) lensX = 0;
            if (lensY < 0) lensY = 0;
            if (lensX > rect.width - lensSize) lensX = rect.width - lensSize;
            if (lensY > rect.height - lensSize) lensY = rect.height - lensSize;

            zoomLens.style.left = `${lensX}px`;
            zoomLens.style.top = `${lensY}px`;

            const scale = 2;
            const zoomX = (lensX / rect.width) * 100;
            const zoomY = (lensY / rect.height) * 100;

            enlargedImage.style.transform = `scale(${scale})`;
            enlargedImage.style.transformOrigin = `${zoomX}% ${zoomY}%`;
        }

        function hideLens() {
            zoomLens.style.display = 'none';
            enlargedImage.style.transform = 'scale(1)';
        }
        console.log(imageSrc)
    }

    window.closeImageModal = function() {
        const modal = document.getElementById('imageModal');
        modal.classList.remove('show');
    }

    async function archiveDeletedProduct(productId) {
        try {
            const productRef = doc(db, 'inventory', productId);
            const productSnapshot = await getDoc(productRef);
            
            if (productSnapshot.exists()) {
                const productData = productSnapshot.data();
                await addDoc(collection(db, 'deleted_inventory'), {
                    ...productData,
                    deletedAt: new Date().toISOString(),
                });
                console.log("Product archived to deleted_inventory:", productData.name);
            } else {
                console.log("Product does not exist in inventory.");
            }
        } catch (error) {
            console.error("Error archiving deleted product:", error);
        }
    }
    
    
    // async function deleteProduct(productId) {
    //     if (confirm('Are you sure you want to delete this listing?')) {
    //         await archiveDeletedProduct(productId); // Archive the product first
    //         try {
    //             await deleteDoc(doc(db, 'inventory', productId)); // Delete from inventory
    //             console.log("Product deleted from inventory.");
    //             loadUserProducts(userUID); // Refresh the product list
    //         } catch (error) {
    //             console.error("Error deleting product:", error);
    //         }
    //     }
    // }

    async function loadDeletedProducts(userId) {
        const deletedProducts = [];
        const q = query(collection(db, 'deleted_inventory'), where("userUID", "==", userId));
        try {
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach((doc) => {
                deletedProducts.push({ id: doc.id, ...doc.data() });
            });
            displayDeletedProducts(deletedProducts);
        } catch (error) {
            console.error("Error loading deleted products:", error);
        }
    }

    function formatDeletedDate(isoDateString) {
        const date = new Date(isoDateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    
    function displayDeletedProducts(deletedProducts) {
        const deletedTableBody = document.getElementById('deletedTableBody');
        deletedTableBody.innerHTML = ""; // Clear existing rows
    
        deletedProducts.forEach((product) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><img src="${product.image}" alt="${product.name}" class="product-image-small"></td>
                <td>${product.name}</td>
                <td>${product.price}</td>
                <td>${formatDeletedDate(product.deletedAt)}</td> 
                <td>
                <button class="delete-btn" onclick="deletePermanently('${product.id}')">
                    <i class="fas fa-trash"></i>
                </button>
                </td>
            `;
            console.log('Adding delete icon for product:', product);
            deletedTableBody.appendChild(row);
        });
    }

    async function deletePermanently(productId) {
        if (confirm('Do you want to permanently delete this product?')) {
            try {
                // Delete the product from Firestore 'deleted_inventory' collection
                const productRef = doc(db, 'deleted_inventory', productId);
                await deleteDoc(productRef);
    
                // Log the deletion and refresh the deleted inventory display
                console.log(`Product with ID: ${productId} permanently deleted.`);
                loadDeletedProducts(userUID); // Reload the deleted products to update the table
            } catch (error) {
                console.error('Error permanently deleting product:', error);
            }
        }
    }
    window.deletePermanently = deletePermanently;


        // Call this function when you load the page
        document.querySelectorAll('.info-btn').forEach(button => {
            const tooltip = button.querySelector('.info-tooltip');
        
            button.addEventListener('mouseenter', () => {
                // Append tooltip to the body for absolute positioning
                document.body.appendChild(tooltip);
        
                // Get button's position relative to the viewport and account for scrolling
                const rect = button.getBoundingClientRect();
                const scrollY = window.scrollY || window.pageYOffset;
                
                // Set initial position to the right of the button
                let tooltipTop = rect.top + scrollY;
                let tooltipLeft = rect.right + 10; // 10px space from the button
        
                // Adjust positioning if tooltip would overflow the right side of the viewport
                const tooltipWidth = tooltip.offsetWidth;
                const viewportWidth = window.innerWidth;
                if (tooltipLeft + tooltipWidth > viewportWidth) {
                    tooltipLeft = rect.left - tooltipWidth - 10;
                }
        
                // Set the calculated position for the tooltip
                tooltip.style.top = `${tooltipTop}px`;
                tooltip.style.left = `${tooltipLeft}px`;
        
                // Show the tooltip
                tooltip.style.display = 'block';
                tooltip.style.opacity = '1';
            });
        
            button.addEventListener('mouseleave', () => {
                // Hide the tooltip and re-attach it to the button to reset position
                tooltip.style.display = 'none';
                tooltip.style.opacity = '0';
                button.appendChild(tooltip);
            });
        });
    
    

