import { app } from "./firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-storage.js";

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let userUID = null

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, get the UID
        userUID = user.uid;
        console.log("Logged-in user UID:", userUID);

        // Load user-specific products after confirming user is logged in
    } else {
        console.log("No user is logged in");
        alert("You need to be logged in to list an item.");
    }
});

export default {
    data() {
        return {
            isVisible: false,
            productName: '',
            price: '',
            quantity: '',
            expiryDate: '',
            imageFile: '',
            downloadURL: '',
            alertMessage: '', // Add this for alert messages
            showAlert: false
        };
    },
    methods: {
        openModal() {
            this.isVisible = true;
            console.log("Modal Appear")
        },
        closeModal() {
            this.isVisible = false;
            console.log("closee")
        },
        triggerFileInput() {
            this.$refs.fileInput.click();
        },
        handleImageUpload(event) {
            const file = event.target.files[0];
            if (file) {
                this.imageFile = file;  // store the file for uploading
                this.uploadImageToFirebase(file);
            }
        },
        deleteImage() {
            this.imageFile = null;
            this.downloadURL = '';
            console.log("Image deleted");
        },
        formatPriceInput() {
            if (this.price) {
                // Allow only valid number input with up to 2 decimal places
                const formattedValue = this.price.replace(/[^0-9.]/g, ''); // Remove non-numeric characters except '.'
                const parts = formattedValue.split('.');
    
                if (parts.length > 2) {
                    // Prevent multiple decimal points
                    this.price = parts[0] + '.' + parts.slice(1).join('');
                } else if (parts[1] && parts[1].length > 2) {
                    // Limit to 2 decimal places
                    this.price = `${parts[0]}.${parts[1].slice(0, 2)}`;
                } else {
                    this.price = formattedValue;
                }
            }
        },
    
        async uploadImageToFirebase(file) {
            if (!file) return;
            const storageRef = ref(storage, `inventory/productImages/${userUID}/${file.name}_${Date.now()}`);
            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on('state_changed',
                snapshot => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                error => console.error("Error uploading file:", error),
                async () => {
                    this.downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    console.log("File available at:", this.downloadURL);
                }
            );
        },

        validateExpiryDate() {
            if (this.expiryDate) {
                const selectedDate = new Date(this.expiryDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Clear time to compare dates only
                
                // Set date 20 years from today
                const maxDate = new Date();
                maxDate.setFullYear(today.getFullYear() + 20);

                if (selectedDate < today) {
                    this.alertMessage = "Expiry date cannot be in the past.";
                    this.showAlert = true; // Show the alert message
                    return false;
                } else if (selectedDate > maxDate) {
                    this.alertMessage = "Expiry date must be within 20 years from today.";
                    this.showAlert = true; // Show the alert message
                    return false;
                } else {
                    this.alertMessage = ''; // Clear error if date is valid
                    this.showAlert = false; // Hide the alert
                    return true;
                }
            }
            return false;
        },
        async addProduct() {
            if (!this.productName || !this.quantity || !this.expiryDate || !this.downloadURL) {
                alert('Please fill out all fields and upload an image.');
                return;

            }
            if (!this.validateExpiryDate()) {
                // alert(this.expiryError);
                return;
            }

            const newProduct = {
                name: this.productName,
                price: parseFloat(this.price),
                expiry: this.expiryDate,
                image: this.downloadURL, 
                added: new Date().toISOString().split('T')[0], 
                quantity: this.quantity
            };

            this.$emit('add-product', newProduct);
            this.closeModal();
            this.resetForm();
        },
        resetForm() {
            this.productName = '';
            this.price = '';
            this.quantity = '';
            this.expiryDate = '';
            this.imageFile = null;
            this.downloadURL = '';
            this.alertMessage = ''; // Clear any alert message when form is reset
            this.showAlert = false; //
        }
    },
    // Inside your Vue component
template: `
<div>
    <button id="addNewProduct" @click="openModal"><i class="fas fa-paw"></i>Add New Product</button>
    <div v-if="isVisible" class="modal">
        <div class="modal-content">
            <span class="close-btn" @click="closeModal">&times;</span>
            <h2>New Product</h2>
            <div v-if="showAlert" class="alert" style="color: red; font-weight: bold;">{{ alertMessage }}</div>
            <form @submit.prevent="addProduct">
                <div class="image-upload">
                    <div class="image-placeholder">
                        <div v-if="downloadURL" class="uploaded-image-container">
                            <img :src="downloadURL" alt="Uploaded Image" class="uploaded-image" />
                            <div class="delete-icon" @click="deleteImage"><i class="fas fa-trash"></i></div>
                        </div>
                        <div v-else>
                            Drag image here<br>or<br>
                            <a href="#" @click="triggerFileInput">Browse image</a>
                            <input type="file" ref="fileInput" @change="handleImageUpload" style="display:none;" />
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label for="productName">Product Name</label>
                    <input v-model="productName" type="text" placeholder="Enter product name" required />
                </div>
                <div class="form-group">
                    <label for="price">Buying Price</label>
                    <input 
                    v-model="price" 
                    type="text" 
                    placeholder="Enter buying price" 
                   @input="formatPriceInput" 
                    required
                />
                </div>
                <div class="form-group">
                    <label for="serving">Servings</label>
                    <input v-model="quantity" type="number" placeholder="Enter servings quantity" required />
                </div>
                <div class="form-group">
                    <label for="expiryDate">Expiry Date</label>
                    <input v-model="expiryDate" type="date" required />
                </div>
                <div class="modal-actions">
                    <button type="button" @click="closeModal" class="discard-btn">Discard</button>
                    <button type="submit" class="add-btn">Add Product</button>
                </div>
            </form>
        </div>
    </div>
</div>
`

};