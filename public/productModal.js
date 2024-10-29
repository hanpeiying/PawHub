import { app } from "./firebase.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.3/firebase-auth.js";
import { getFirestore, addDoc, collection, doc, updateDoc, query, where, getDocs} from "https://www.gstatic.com/firebasejs/10.12.3/firebase-firestore.js";
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
            downloadURL: ''
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
        async addProduct() {
            if (!this.productName || !this.quantity || !this.expiryDate || !this.downloadURL) {
                alert('Please fill out all fields and upload an image.');
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
        }
    },
    template: `
    <div>
        <button @click="openModal">Add New Product</button>
        <div v-if="isVisible" class="modal">
            <div class="modal-content">
                <span class="close-btn" @click="closeModal">&times;</span>
                <h2>New Product</h2>
                <form @submit.prevent="addProduct">
                    <div class="image-upload">
                        <div class="image-placeholder">
                            <div v-if="downloadURL" class="uploaded-image-container">
                                <img :src="downloadURL" alt="Uploaded Image" style="max-width: 100%; height: auto;" class="uploaded-image" />
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
                        <input v-model="price" type="number" placeholder="Enter buying price" required />
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