
$(document).ready(() => {
    const prevButton = $('#prev-button');
    const nextButton = $('#next-button');
    const pageNumber = $('#page-number');
    const totalPages = parseInt($('#total-pages').text());


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
        $('.exit').click(function(){
            $('.view-product-modal').hide();
        });

    }

    const fetchOrderDetails = (orderNumber) => {
        $.ajax({
            url: '/api/orders/' + orderNumber,
            type: 'GET',
            success: function(response) {
                console.log(response);
    
                $('#order-number').text(response.orderNumber);
                $('#date').text(moment(response.dateCreated).format('MMMM D, YYYY'));
                $('#time').text(response.time);
    
                // Clear existing items
                $('.items').empty();
    
                // Append new items
                response.items.forEach(item => {
                    const itemDetails = `
                        <div class="itemdetails">
                            <div class="nameandpic">
                                <img src="/uploads/products/${item.picture}" alt="$item.itemName}" class='itempic'>
                                <p>${item.itemName}</p>
                            </div>
                            <span class="price">${item.price}</span>
                            <span class="quantity">${item.quantity}</span>
                            <span class="variation">${item.variant}</span>
                        </div>
                    `;
                    $('.items').append(itemDetails);
                });
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

    

    const setupAddModal = () => {
        const modal = $('#add-order-modal');
        const addButton = $('.grid-header-add-button');
        const closeButton = $('.exit');

        addButton.on('click', () => {
            modal.css('display', 'flex');
        });

        closeButton.on('click', () => {
            modal.css('display', 'none');
        });

        $(window).on('click', (event) => {
            if ($(event.target).is(modal)) {
                modal.css('display', 'none');
            }
        });
    };

    const initialize = () => {
        loadPage(parseInt(pageNumber.text()));
        setupPagination();
        setupAddModal();
    };

    initialize();
});
