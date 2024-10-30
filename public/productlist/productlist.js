// Firebase setup
import { app } from "../firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, addDoc, collection, doc, updateDoc, query, where, getDocs} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
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
async function updateProductStockInFirestore(productId, newQuantity) {
    const productRef = doc(db, 'inventory', productId);
    try {
        await updateDoc(productRef, { quantity: newQuantity });
        console.log("Product stock updated in Firestore.");
    } catch (e) {
        console.error("Error updating product stock: ", e);
    }
}

// Function to retrieve products for a specific user from Firestore
export async function loadUserProducts(userId) {
    console.log("Loading products for user ID:", userId);
    const products = [];
    const q = query(collection(db, 'inventory'), where("userUID", "==", userId));
    try {
        const querySnapshot = await getDocs(q);
        console.log("Query executed, snapshot size:", querySnapshot.size);
        querySnapshot.forEach(doc => {
            console.log("hi", doc.id)
            products.push({ id: doc.id, ...doc.data() });
        });
        console.log("User products loaded:", products);
        allProducts = products; // Update the global list with fetched products
        console.log("Displaying products:", allProducts);
        displayProducts(allProducts, currentPage); // Display the loaded products
    } catch (e) {
        console.error("Error loading products: ", e);
    }
}

// Function to adjust stock quantity in the UI and Firestore
async function adjustStock(productId, adjustment) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) {
        console.error("Product not found with ID:", productId);
        return;
    } 

    const newQuantity = Math.max(0, product.quantity + adjustment); // Ensure quantity doesn’t go below 0
    product.quantity = newQuantity;
    
    if (newQuantity === 0) {
        // Show the confirmation modal when the quantity reaches 0
        const modal = document.getElementById('confirmationModal');
        modal.style.display = 'flex'; // Display the modal
    } else {
        try {
        
            // Update the stock quantity in Firestore
            const productRef = doc(db, 'inventory', productId);
            await updateDoc(productRef, { quantity: newQuantity });

            console.log("Product stock updated in Firestore.");

            // Refresh the displayed products after updating
            displayProducts(allProducts, currentPage);
        } catch (e) {
            console.error("Error updating product stock: ", e);
        }
    }
}
window.adjustStock = adjustStock;

// Event listener for DOMContentLoaded to initialize UI components
document.addEventListener('DOMContentLoaded', () => {
    const sortExpiryBtn = document.getElementById('sortExpiryBtn');
    const sortAddedBtn = document.getElementById('sortAddedBtn');
    const searchInput = document.getElementById('searchInput');
    let sortExpiryAscending = true;
    let sortAddedAscending = true;

    // Sort by expiry date
    sortExpiryBtn.addEventListener('click', () => {
        const filteredProducts = filterProducts(searchInput.value);
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
});

// Function to filter products based on the search value
function filterProducts(searchValue) {
    return allProducts.filter(product => 
        product.name.toLowerCase().includes(searchValue)
    );
}

// Function to render products in the table
function displayProducts(filteredProducts, page) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedProducts = filteredProducts.slice(start, end);

    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = ""; // Clear existing rows

    paginatedProducts.forEach((product, index) => {
        let stockClass = product.quantity <= 5 ? 'low-stock' : 'sufficient-stock';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td>
                <div class="product-image-container">
                    <img src="${product.image}" alt="${product.name}" onclick="enlargeImage('${product.image}')"/>
                </div>
            </td>
            <td>${product.name}</td>
            <td>${isValidDate(product.expiry) ? formatDate(product.expiry) : 'Invalid Date'}</td>
            <td>${formatDate(product.added)}</td>
            <td>${product.price}</td>
             <td id="quantity-${product.id}" class="${stockClass}">${product.quantity}</td>
            <td>
                    <button class="minus-btn" onclick="adjustStock('${product.id}', -1)" data-tooltip="Deduct serving">-</button> 
                    <button class="add-btn" onclick="adjustStock('${product.id}', +1)" data-tooltip="Add serving">+</button>                
            </td>
            
        
            `;
        tableBody.appendChild(row);
    });

    updatePaginationButtons(filteredProducts);
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
    iconElement.classList.remove('fa-arrow-down-wide-short', 'fa-arrow-up-wide-short');
    iconElement.classList.add(isAscending ? 'fa-arrow-up-wide-short' : 'fa-arrow-down-wide-short');
}

function sortTable(column, isAscending, filteredProducts) {
    filteredProducts.sort((a, b) => {
        const dateA = new Date(a[column]);
        const dateB = new Date(b[column]);
        return isAscending ? dateA - dateB : dateB - dateA;
    });
    displayProducts(filteredProducts, currentPage);
    }

    function updatePaginationButtons(filteredProducts) {
        const totalPages = Math.ceil(filteredProducts.length / rowsPerPage);
        const paginationContainer = document.querySelector('.pagination');
        paginationContainer.innerHTML = '';
    
        // Create "prev" button
        const prevButton = document.createElement('button');
        prevButton.textContent = '<';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayProducts(filteredProducts, currentPage);
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
            pageButton.addEventListener('click', () => {
                currentPage = i;
                displayProducts(filteredProducts, currentPage);
            });
            paginationContainer.appendChild(pageButton);
        }
    
        // Create "next" button
        const nextButton = document.createElement('button');
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
    

function hideConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    modal.style.display = 'none'; // Hide modal
    console.log("closeee")
}

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
    window.location.href = "../shop.html"; // Redirect to the replenishment page
}
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('deleteProductBtn').addEventListener('click', deleteProduct);
    document.getElementById('replenishProductBtn').addEventListener('click', replenishProduct);
    document.getElementById('cancelBtn').addEventListener('click', hideConfirmationModal);
});

window.hideConfirmationModal = hideConfirmationModal;

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

// Example product to test adding a new product to Firestore
// function createAndAddProduct() {
//     if (userUID) {
//         const newProduct = {
//             name: 'Sample Product 2',
//             expiry: '2024-12-31',
//             added: '2024-10-26',
//             price: 10.99,
//             quantity: 10,
//             image: 'https://example.com/product.jpg',
//         };

//         // Add the new product to Firestore
//         addProductToFirestore(newProduct);
//     } else {
//         console.error("User UID is not available. Ensure the user is logged in before adding a product.");
//     }
// }

