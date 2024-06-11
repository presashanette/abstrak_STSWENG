$(document).ready(() => {
    const prevButton = $('#prev-button');
    const nextButton = $('#next-button');
    const pageNumber = $('#page-number');
    const totalPages = parseInt($('#total-pages').text());

    $('.view-product-modal').hide();

    const fetchOrders = async (page) => {
        const response = await fetch(`/orders?page=${page}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return await response.json();
    };

    const updateTable = (orders) => {
        const tbody = $('#orders-body');
        tbody.empty();

        orders.forEach(order => {
            const orderNumber = order.orderNumber || 'N/A';
            const dateCreated = order.dateCreated ? new Date(order.dateCreated).toLocaleDateString() : 'N/A';
            const totalOrderQuantity = order.totalOrderQuantity || 'N/A';
            const paymentMethod = order.paymentMethod || 'N/A';
            const fulfillmentStatus = order.fulfillmentStatus || 'N/A';
            const paymentStatus = order.paymentStatus || 'N/A';
            const total = order.total || 'N/A';
            const items = order.items && Array.isArray(order.items)
                ? order.items.map(item => `<li>${item.itemName} - ${item.quantity} (${item.variant || 'No Variant'})</li>`).join('')
                : '<li>N/A</li>';

            const tr = $('<tr></tr>').html(`
                <td>${orderNumber}</td>
                <td>${dateCreated}</td>
                <td>${totalOrderQuantity}</td>
                <td>${paymentMethod}</td>
                <td>${fulfillmentStatus}</td>
                <td>${paymentStatus}</td>
                <td>${total}</td>
                <td>
                    <ul>${items}</ul>
                </td>
            `);
            tbody.append(tr);

            tr.on('click', () => openViewModal(orderNumber));
            tr.css('cursor', 'pointer');
        });
    };

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

    const updatePagination = (page) => {
        pageNumber.text(page);
        prevButton.css('display', page <= 1 ? 'none' : 'inline-block');
        nextButton.css('display', page >= totalPages ? 'none' : 'inline-block');
    };

    const loadPage = async (page) => {
        try {
            const result = await fetchOrders(page);
            updateTable(result.orders);
            updatePagination(page);
        } catch (error) {
            console.error('Error fetching more orders:', error);
        }
    };

    const setupPagination = () => {
        nextButton.on('click', () => {
            const currentPage = parseInt(pageNumber.text());
            if (currentPage < totalPages) {
                loadPage(currentPage + 1);
            }
        });

        prevButton.on('click', () => {
            const currentPage = parseInt(pageNumber.text());
            if (currentPage > 1) {
                loadPage(currentPage - 1);
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
        loadPage(parseInt(pageNumber.text()));
        setupPagination();
    };

    initialize();
});
