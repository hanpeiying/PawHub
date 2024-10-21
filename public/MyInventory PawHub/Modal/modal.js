import { db } from '../../..firebase.js'; 

document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('productModal');
    const openModalBtn = document.getElementById('openModalBtn');
    const closeBtn = document.querySelector('.close-btn');
    const discardBtn = document.querySelector('.discard-btn');

    openModalBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    discardBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    const form = document.getElementById('productForm');
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
       // Capture form data
       const productName = document.getElementById('productName').value;
       const category = document.getElementById('category').value;
       const quantity = document.getElementById('quantity').value;
       const unit = document.getElementById('unit').value;
       const expiryDate = document.getElementById('expiryDate').value;

       // Prepare product data to be stored in Firestore
       const productData = {
           productName,
           category,
           quantity: parseInt(quantity),  // Ensure it's stored as a number
           unit,
           expiryDate,  // ISO Date format will be stored
           dateAdded: firebase.firestore.FieldValue.serverTimestamp()  // Store current timestamp
       };

       try {
           // Add data to Firestore
           await db.collection('products').add(productData);

           alert('Product added successfully!');

           // Close the modal
           modal.style.display = 'none';

           // Optionally clear the form
           form.reset();
       } catch (error) {
           console.error("Error adding product: ", error);
           alert("Error adding product. Please try again.");
       }
   });


    });