$(document).ready(() => {
    const prevButton = document.getElementById('prev-button');
    const nextButton = document.getElementById('next-button');
    const pageNumber = document.getElementById('page-number');
    let totalPages = parseInt(document.getElementById('total-pages').textContent);

    $('.view-product-modal').hide();

    const loadPage = async (page) => {
        const target = document.body;
        try {
            const response = await fetch(`/orders?page=${page}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            const { orders } = result;
            const tbody = document.getElementById('orders-body');
            tbody.innerHTML = '';
            orders.forEach(order => {
                const orderNumber = order.orderNumber || 'N/A';
                const dateCreated = order.dateCreated ? new Date(order.dateCreated).toLocaleDateString() : 'N/A';
                const totalOrderQuantity = order.totalOrderQuantity || 'N/A';
                const paymentMethod = order.paymentMethod || 'N/A';
                const fulfillmentStatus = order.fulfillmentStatus || 'N/A';
                const paymentStatus = order.paymentStatus || 'N/A';
                const total = order.total ? `₱${order.total}` : 'N/A';
                const shippingRate = order.shippingRate || 'N/A';
                const orderedFrom = order.orderedFrom || 'N/A';
                const tr = document.createElement('tr');
                tr.classList.add('orders-row');
                tr.innerHTML = `
                    <td>${orderNumber}</td>
                    <td>${dateCreated}</td>
                    <td>${totalOrderQuantity}</td>
                    <td>${paymentMethod}</td>
                    <td>${fulfillmentStatus}</td>
                    <td>${paymentStatus}</td>
                    <td>${total}</td>
                    <td>${shippingRate}</td>
                    <td>${orderedFrom}</td>
                `;
                tbody.appendChild(tr);

                // Add event listener for click to open the modal
                tr.addEventListener('click', () => openViewModal(orderNumber));
                // Set the cursor to pointer
                tr.style.cursor = 'pointer';
            });
            pageNumber.textContent = page;
            if (page === 1) {
                prevButton.style.display = 'none';
            } else {
                prevButton.style.display = 'inline';
            }
            if (page === totalPages) {
                nextButton.style.display = 'none';
            } else {
                nextButton.style.display = 'inline';
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    };

    nextButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent);
        if (currentPage < totalPages) {
            loadPage(currentPage + 1);
        }
    });

    prevButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent);
        if (currentPage > 1) {
            loadPage(currentPage - 1);
        }
    });

    // Initial load
    loadPage(1);

    function openViewModal(orderNumber){
        fetchOrderDetails(orderNumber);
        $('.view-product-modal').show();
    }

    const fetchOrderDetails = (orderNumber) => {
        $.ajax({
            url: '/api/orders/' + orderNumber,
            type: 'GET',
            success: function(response) {
                console.log(response);
            },
            error: function(error) {
                console.error('Error fetching order:', error);
            }
        });
    };

    const addOrderModal = document.getElementById('add-order-modal');
    const productListModal = document.getElementById('product-list-modal');
    const productGallery = document.getElementById('product-gallery');
    const addButton = document.querySelector('.grid-header-add-button');
    const closeButton = document.querySelector('.exitordermodal');
    const plusSign = document.querySelector('.plus-sign');
    const productCloseButton = document.querySelector('.exit-product-list');
    const productDetailsModal = document.getElementById('product-details-modal');
    const exitProductDetailsButton = document.querySelector('.exit-product-details');

    const openModal = (modal) => {
        modal.style.display = 'flex';
        document.body.classList.add('modal-open');
    };

    const closeModal = (modal) => {
        modal.style.display = 'none';
        document.body.classList.remove('modal-open');
    };

    addButton.addEventListener('click', () => openModal(addOrderModal));

    closeButton.addEventListener('click', () => closeModal(addOrderModal));

    plusSign.addEventListener('click', async () => {
        closeModal(addOrderModal);
        openModal(productListModal);

        try {
            const response = await fetch('api/getAbstrakInvento', {
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) throw new Error('Network response was not ok');

            const products = await response.json();
            productGallery.innerHTML = '';
            products.forEach(product => {
                const productDiv = document.createElement('div');
                productDiv.classList.add('container');
                productDiv.dataset.id = product._id;
                productDiv.dataset.name = product.name;
                productDiv.dataset.price = product.price;
                productDiv.dataset.sku = product.SKU;
                productDiv.dataset.materials = product.material;
                productDiv.dataset.picture = `/uploads/products/${product.picture}`;
                
                productDiv.innerHTML = `
                    <div class="product-pic-container">
                        <div class="product-actual-photo-container">
                            <img src="/uploads/products/${product.picture}" alt="" class="product-pic">
                        </div>
                    </div>
                    <div class="product-name">
                        <p class="product-name-text">${product.name}</p>
                        <p class="product-stock ${product.totalStock > 0 ? 'high-stock' : 'no-stock'}">${product.totalStock} in stock</p>            
                    </div>
                `;
                productGallery.appendChild(productDiv);
            });
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    });

    productCloseButton.addEventListener('click', () => {
        closeModal(productListModal);
        openModal(addOrderModal);
    });

    window.addEventListener('click', (event) => {
        if (event.target === addOrderModal) closeModal(addOrderModal);
        if (event.target === productListModal) closeModal(productListModal);
    });
    
    const openProductDetailsModal = (product) => {
        console.log(product);

        const productName = product.dataset.name;
        const productPrice = product.dataset.price;
        const productMaterials = product.dataset.materials;
        const productSku = product.dataset.sku;
        const productImgSrc = product.querySelector('.product-pic').src;
    
        document.querySelector('.samplenamee').textContent = `Name: ${productName}`;
        document.querySelector('.product-price').textContent = `Price: ${productPrice}`;
        document.querySelector('.product-materials').textContent = `Materials: ${productMaterials}`;
        document.querySelector('.product-sku').textContent = `SKU: ${productSku}`;
        document.querySelector('.product-img').src = productImgSrc;
    
        openModal(productDetailsModal);
        closeModal(productListModal);
    };
    
    
    productGallery.addEventListener('click', (event) => {
        const product = event.target.closest('.container');
        if (product) {
            openProductDetailsModal(product);
        }
    });
    
    exitProductDetailsButton.addEventListener('click', () => {
        closeModal(productDetailsModal);
        openModal(productListModal);
    });

    const initialize = () => {
        loadPage(parseInt(pageNumber.textContent));
        setupPagination();
    };

    const uploadForm = document.getElementById('upload-form');
    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(uploadForm);
        try {
            const response = await fetch('/upload-csv', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            console.log('CSV uploaded successfully:', result);
            window.location.reload();
        } catch (error) {
            console.error('Error uploading CSV:', error);
        }
    });

    initialize();
});
