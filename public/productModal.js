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
                this.imageFile = file;
                this.downloadURL = URL.createObjectURL(file);
                this.uploadImageToFirebase(file);
            }
        },
        uploadImageToFirebase(file) {
            // Simulate Firebase upload logic (or integrate with Firebase Storage)
            console.log("Image uploading...");

            // Simulate an image upload with a fixed URL or a placeholder
        },
        async addProduct() {
            if (!this.productName || !this.quantity || !this.expiryDate) {
                alert('Please fill out all required fields.');
                return;
            }

            const newProduct = {
                name: this.productName,
                price: parseFloat(this.price),
                expiry: this.expiryDate,
                image: this.downloadURL, // Assuming upload logic for image returns a URL
                added: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
                quantity: this.quantity
            };

            // Use a custom event to send product data to the parent
            this.$emit('add-product', newProduct);

            alert('Product added successfully!');
            this.closeModal();
            this.resetForm();
        },
        removeImage() {
            this.downloadURL = '';
            this.imageFile = null;
        },
        resetForm() {
            this.productName = '';
            this.price = '';
            this.quantity = '';
            this.expiryDate = '';
            this.downloadURL = '';
            this.imageFile = null;
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
                            <div v-if="downloadURL" class="image-preview-container">
                                <img :src="downloadURL" alt="Uploaded Image" class="uploaded-image" />
                                <div class="delete-icon" @click="removeImage">
                                    <i class="fas fa-trash"></i>
                                </div>
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