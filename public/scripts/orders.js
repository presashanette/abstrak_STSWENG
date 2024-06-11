$(document).ready(() => {
    let cart = [];
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
    
    // const openProductDetailsModal = async (product) => {
    //     const productName = product.dataset.name;
    //     const productSku = product.dataset.sku;
    //     const productImgSrc = product.querySelector('.product-pic').src;
    
    //     document.querySelector('.name').textContent = `${productName}`;
    //     document.querySelector('.sku').textContent = `SKU: ${productSku}`;
    //     document.querySelector('.img').src = productImgSrc;
    
    //     try {
    //         const response = await fetch(`/api/product?sku=${productSku}`);
    //         if (!response.ok) {
    //             throw new Error('Product not found');
    //         }
    //         const productData = await response.json();
    
    //         const variationSelect = document.querySelector('.variations');
    //         const quantityDisplay = document.querySelector('.quantity');
    //         const priceDisplay = document.querySelector('.price-value');
    
    //         variationSelect.innerHTML = '';
    //         productData.variations.forEach(variation => {
    //             const option = document.createElement('option');
    //             option.value = variation.variation;
    //             option.textContent = variation.variation;
    //             variationSelect.appendChild(option);
    //         });
    
    //         const updatePrice = () => {
    //             const selectedVariation = productData.variations.find(variation => variation.variation === variationSelect.value);
    //             const quantity = parseInt(quantityDisplay.textContent, 10);
    //             const totalPrice = productData.price * quantity;
    //             priceDisplay.textContent = totalPrice.toFixed(2);
    //         };
    
    //         const minusButton = document.querySelector('.minus');
    //         const plusButton = document.querySelector('.plus');
    //         const addToCartButton = document.querySelector('.add-to-cart');
    
    //         // Remove previous event listeners
    //         minusButton.replaceWith(minusButton.cloneNode(true));
    //         plusButton.replaceWith(plusButton.cloneNode(true));
    //         addToCartButton.replaceWith(addToCartButton.cloneNode(true));
    
    //         // Re-select the buttons after replacing
    //         const newMinusButton = document.querySelector('.minus');
    //         const newPlusButton = document.querySelector('.plus');
    //         const newAddToCartButton = document.querySelector('.add-to-cart');
    
    //         newMinusButton.addEventListener('click', () => {
    //             let quantity = parseInt(quantityDisplay.textContent, 10);
    //             if (quantity > 1) {
    //                 quantity--;
    //                 quantityDisplay.textContent = quantity;
    //                 updatePrice();
    //             }
    //         });
    
    //         newPlusButton.addEventListener('click', () => {
    //             let quantity = parseInt(quantityDisplay.textContent, 10);
    //             quantity++;
    //             quantityDisplay.textContent = quantity;
    //             updatePrice();
    //         });
    
    //         variationSelect.addEventListener('change', updatePrice);
    //         updatePrice(); // Initial price update
    
    //         newAddToCartButton.addEventListener('click', () => {
    //             const selectedVariation = productData.variations.find(variation => variation.variation === variationSelect.value);
    //             const quantity = parseInt(quantityDisplay.textContent, 10);
    //             const order = {
    //                 name: productName,
    //                 sku: productSku,
    //                 variation: selectedVariation.variation,
    //                 quantity: quantity,
    //                 price: productData.price,
    //                 total: productData.price * quantity,
    //                 picture: productImgSrc
    //             };
    //             cart.push(order);
                
    //             console.log('Order added to cart:', order);
    //         });
    
    //     } catch (error) {
    //         console.error('Error fetching variations:', error);
    //     }
    
    //     openModal(productDetailsModal);
    //     closeModal(productListModal);
    // }; 
    const openProductDetailsModal = async (product) => {
        const productName = product.dataset.name;
        const productSku = product.dataset.sku;
        const productImgSrc = product.querySelector('.product-pic').src;
    
        document.querySelector('.name').textContent = `${productName}`;
        document.querySelector('.sku').textContent = `SKU: ${productSku}`;
        document.querySelector('.img').src = productImgSrc;
    
        try {
            const response = await fetch(`/api/product?sku=${productSku}`);
            if (!response.ok) {
                throw new Error('Product not found');
            }
            const productData = await response.json();
    
            const variationSelect = document.querySelector('.variations');
            const quantityDisplay = document.querySelector('.quantity');
            const priceDisplay = document.querySelector('.price-value');
    
            variationSelect.innerHTML = '';
            productData.variations.forEach(variation => {
                const option = document.createElement('option');
                option.value = variation.variation;
                option.textContent = variation.variation;
                variationSelect.appendChild(option);
            });
    
            const updatePrice = () => {
                const selectedVariation = productData.variations.find(variation => variation.variation === variationSelect.value);
                const quantity = parseInt(quantityDisplay.textContent, 10);
                const totalPrice = productData.price * quantity;
                priceDisplay.textContent = totalPrice.toFixed(2);
            };
    
            const minusButton = document.querySelector('.minus');
            const plusButton = document.querySelector('.plus');
            const addToCartButton = document.querySelector('.add-to-cart');
    
            // Remove previous event listeners
            minusButton.replaceWith(minusButton.cloneNode(true));
            plusButton.replaceWith(plusButton.cloneNode(true));
            addToCartButton.replaceWith(addToCartButton.cloneNode(true));
    
            // Re-select the buttons after replacing
            const newMinusButton = document.querySelector('.minus');
            const newPlusButton = document.querySelector('.plus');
            const newAddToCartButton = document.querySelector('.add-to-cart');
    
            newMinusButton.addEventListener('click', () => {
                let quantity = parseInt(quantityDisplay.textContent, 10);
                if (quantity > 1) {
                    quantity--;
                    quantityDisplay.textContent = quantity;
                    updatePrice();
                }
            });
    
            newPlusButton.addEventListener('click', () => {
                let quantity = parseInt(quantityDisplay.textContent, 10);
                quantity++;
                quantityDisplay.textContent = quantity;
                updatePrice();
            });
    
            variationSelect.addEventListener('change', updatePrice);
            updatePrice(); // Initial price update
    
            newAddToCartButton.addEventListener('click', () => {
                const selectedVariation = productData.variations.find(variation => variation.variation === variationSelect.value);
                const quantity = parseInt(quantityDisplay.textContent, 10);
                const order = {
                    name: productName,
                    sku: productSku,
                    variation: selectedVariation.variation,
                    quantity: quantity,
                    price: productData.price,
                    total: productData.price * quantity,
                    imgSrc: productImgSrc
                };
                cart.push(order);
                renderCartItems();
                console.log('Order added to cart:', order);
            });
    
        } catch (error) {
            console.error('Error fetching variations:', error);
        }
    
        openModal(productDetailsModal);
        closeModal(productListModal);
    }; 

    const renderCartItems = () => {
        const cartItemsContainer = document.getElementById('cartitems');
        cartItemsContainer.innerHTML = '';

        cart.forEach(item => {
            const itemDetails = document.createElement('div');
            itemDetails.classList.add('itemdetails');
            itemDetails.innerHTML = `
                <div class="nameandpic">
                    <img src="${item.imgSrc}" alt="${item.name}" class="itempic">
                    <span>${item.name}</span>
                </div>
                <span class="priceperitem">₱${item.price.toFixed(2)}</span>
                <span class="quantity">${item.quantity} pc</span>
                <span class="totalprice">₱${(item.price * item.quantity).toFixed(2)}</span>
            `;
            cartItemsContainer.appendChild(itemDetails);
        });
    };
    
    document.querySelector('.exit-product-details').addEventListener('click', () => {
        document.getElementById('product-details-modal').style.display = 'none';
    });
    
    
    
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
    };
    const uploadButton = document.getElementById('toggle-upload');
    const uploadContainer = document.querySelector('.upload-container');
    const lastUpdatedDate = document.getElementById('last-updated-date');
    const uploadForm = document.getElementById('upload-form');

    uploadButton.addEventListener('click', () => {
        if (uploadContainer.style.display === 'none' || !uploadContainer.style.display) {
            uploadContainer.style.display = 'block';
        } else {
            uploadContainer.style.display = 'none';
        }
    });

    //search
    $('#toggle-search').click(function() {
        $('#search-bar').toggle();
    });

    $('#search-button').click(function() {
        const searchText = $('#search-input').val().toLowerCase();
        $('.orders-row').each(function() {
            const rowText = $(this).text().toLowerCase();
            if (rowText.includes(searchText)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
        $('.pagination-container').hide();
    });
    $('#clear-search-button').click(function() {
        $('#search-input').val(''); 
        $('.orders-row').show(); 
        $('.pagination-container').show();
    });
    
    //loader
    const loader = document.getElementById('loader');
    const successMessage = document.getElementById('success-message');

    uploadForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const formData = new FormData(uploadForm);

        loader.style.display = 'flex';
        console.log('Uploading file...'); 

        try {
            const response = await fetch('/upload-csv', {
                method: 'POST',
                body: formData
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
                const result = await response.json();
                console.log('CSV uploaded successfully:', result); 

                const currentDate = new Date().toLocaleDateString();
                lastUpdatedDate.textContent = currentDate;
                successMessage.style.display = 'block';
                loader.style.display = 'none';
                setTimeout(() => {
                    window.location.href = '/orders';
                }, 2000);
            } else {
                throw new Error("Unexpected response format");
            }
        } catch (error) {
            console.error('Error uploading CSV:', error);
            loader.style.display = 'none';
        }
    });

    


    initialize();
});
