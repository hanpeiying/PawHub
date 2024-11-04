
export async function testadd(){
    const product={
        name: product.name
        expiry:
    }

    try{


        }
    catch{
        console.error("")
    }
}

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