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
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        alert('Product added successfully!');
        modal.style.display = 'none';
    });
});