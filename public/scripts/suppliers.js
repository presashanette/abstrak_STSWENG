document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("supplier-modal");
    const addBtn = document.getElementById("add-supplier-btn");
    const form = document.getElementById("supplier-form");
    const closeBtn = modal.querySelector(".close");
    const pageNumber = document.getElementById('supplier-page-number');
    const suppliersList = document.getElementById('suppliers-list');
    const prevButton = document.getElementById('prev-supplier-button');
    const nextButton = document.getElementById('next-supplier-button');
    const productsContainer = document.getElementById('products-container');
    const addProductButton = document.getElementById('add-product-button');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    const clearSearchButton = document.getElementById('clear-search-button');
    const filterSortModal = document.getElementById('filter-sort-modal');
    const openFilterSortModalBtn = document.getElementById('open-filter-sort-modal');
    const closeFilterSortModalBtn = document.getElementById('filter-sort-close');
    const applyFiltersButton = document.getElementById('apply-filters-button');
    const clearFiltersButton = document.getElementById('clear-filters-button');

    let suppliersData = []; // Store all suppliers for filtering
    let totalPages = 1;
    const limit = 10;
       // Open "Add Supplier" Modal
       addBtn.addEventListener('click', () => {
        modal.style.display = 'flex';
    });

    // Open the modal
    openFilterSortModalBtn.addEventListener('click', () => {
        filterSortModal.style.display = 'flex';
    });

    // Close the modal
    closeFilterSortModalBtn.addEventListener('click', () => {
        filterSortModal.style.display = 'none';
    });

    // Close the modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === filterSortModal) {
            filterSortModal.style.display = 'none';
        }
    });

    // Apply Filters
    applyFiltersButton.addEventListener('click', () => {
        const category = document.getElementById('filter-category').value;
        const subCategory = document.getElementById('filter-subcategory').value;
        const sortOption = document.getElementById('sort-type').value;

        loadSuppliersWithFilters(1, category, subCategory, sortOption); // Use filters
        filterSortModal.style.display = 'none'; // Close modal after applying
    });

    // Clear Filters
    clearFiltersButton.addEventListener('click', () => {
        document.getElementById('filter-category').value = '';
        document.getElementById('filter-subcategory').value = '';
        document.getElementById('sort-type').value = '';
        loadSuppliersWithFilters(1); // Reload without filters
        filterSortModal.style.display = 'none'; // Close modal after clearing
    });
    // Open Modal
    const openModal = () => {
        modal.style.display = "block";

    };

    // Close Modal
    const closeModal = () => {
        modal.style.display = "none";
        form.reset();
        productsContainer.innerHTML = ''; // Clear product rows
    };

    // Add Supplier Button Event
    addBtn.addEventListener('click', () => {
        form.reset();
        openModal();
    });

    // Close Modal Button Event
    closeBtn.addEventListener('click', closeModal);

    // Close Modal When Clicking Outside of It
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Add Product Row
    addProductButton.addEventListener('click', () => {
        const productRow = `
            <div class="product-row">
                <input type="text" placeholder="Product Name" class="product-name" required>
                <select class="product-category" required>
                    <option value="">Select Category</option>
                    <option value="Fabric">Fabric</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                    <option value="Other">Other</option>
                </select>
                <input type="text" placeholder="Subcategory (e.g., Cotton, Caps)" class="product-subcategory">
                <input type="number" placeholder="Price" class="product-price" required>
                <input type="number" placeholder="Stocks Supplied" class="product-stocks" required>
                <button type="button" class="remove-product-button">Remove</button>
            </div>`;
        productsContainer.innerHTML += productRow;
    });
    

    // Remove Product Row
    productsContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-product-button')) {
            event.target.parentElement.remove();
        }
    });

    // Reload Suppliers Table
    const reloadSuppliersTable = async () => {
        try {
            const currentPage = parseInt(pageNumber.textContent, 10);
            const response = await fetch(`/api/suppliers?page=${currentPage}&limit=${limit}`);
            const data = await response.json();

            suppliersData = data.suppliers; // Cache updated data
            renderSuppliersTable(suppliersData);
            totalPages = data.totalPages;

            prevButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage === totalPages;
        } catch (error) {
            console.error('Error reloading suppliers table:', error);
        }
    };

    // Submit Form (Add/Edit Supplier)
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
    
        const productsSupplied = Array.from(productsContainer.querySelectorAll('.product-row')).map(row => ({
            productName: row.querySelector('.product-name').value,
            category: row.querySelector('.product-category').value,
            subCategory: row.querySelector('.product-subcategory').value || null,
            price: parseFloat(row.querySelector('.product-price').value),
            stocksSupplied: parseInt(row.querySelector('.product-stocks').value, 10),
        }));
    
        const supplierData = {
            name: form.name.value,
            contactInfo: form["contact-info"].value,
            address: form.address.value,
            productsSupplied,
            notes: form.notes.value,
        };
    
        try {
            const response = await fetch('/api/suppliers', {
                method: form["supplier-id"].value ? 'PUT' : 'POST', // Add or Edit
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplierData),
            });
    
            if (response.ok) {
                closeModal();
                reloadSuppliersTable(); // Reload the updated table
            } else {
                console.error('Failed to save supplier.');
            }
        } catch (error) {
            console.error('Error saving supplier:', error);
        }
    });
    

    // Fetch Supplier Details for Editing
    const fetchSupplierDetails = async (supplierId) => {
        try {
            const response = await fetch(`/api/suppliers/${supplierId}`);
            if (!response.ok) throw new Error('Failed to fetch supplier details.');

            const supplier = await response.json();
            populateForm(supplier);
            document.getElementById("modal-title").innerText = "Edit Supplier"; // Update the title here
            openModal();
            modal.style.display = 'flex';
        } catch (error) {
            console.error("Error fetching supplier details:", error);
        }
    };

    // Populate Modal Form
    const populateForm = (supplier) => {
        document.getElementById("supplier-id").value = supplier._id;
        form.name.value = supplier.name;
        form["contact-info"].value = supplier.contactInfo;
        form.address.value = supplier.address;
        form.notes.value = supplier.notes;
        document.getElementById("modal-title").innerText = "Edit Supplier"; // Update the title here
        modal.style.display = 'flex';

        productsContainer.innerHTML = supplier.productsSupplied.map(product => `
            <div class="product-row">
                <input type="text" placeholder="Product Name" class="product-name" value="${product.productName}" required>
                <input type="text" placeholder="Type (e.g., Cotton, Floral)" class="product-type" value="${product.type}">
                <input type="number" placeholder="Price" class="product-price" value="${product.price}" required>
                <input type="number" placeholder="Stocks Supplied" class="product-stocks" value="${product.stocksSupplied}" required>
                <button type="button" class="remove-product-button">Remove</button>
            </div>
        `).join('');
    };

    // Delete Supplier
    const deleteSupplier = async (supplierId) => {
        try {
            const confirmation = await Swal.fire({
                title: 'Are you sure?',
                text: "This will permanently delete the supplier.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!',
            });

            if (!confirmation.isConfirmed) return;

            const response = await fetch(`/api/suppliers/${supplierId}`, { method: 'DELETE' });
            if (response.ok) {
                Swal.fire('Deleted!', 'Supplier has been deleted.', 'success');
                reloadSuppliersTable(); // Reload the updated table
            } else {
                console.error('Failed to delete supplier.');
            }
        } catch (error) {
            console.error('Error deleting supplier:', error);
        }
    };

    // Render Table
    const renderSuppliersTable = (suppliers) => {
        suppliersList.innerHTML = suppliers.map(supplier => `
            <tr>
                <td>${supplier.name}</td>
                <td>${supplier.contactInfo}</td>
                <td>${supplier.address}</td>
                <td>
                    ${supplier.productsSupplied.map(product => `
                        ${product.productName} (${product.category || "N/A"} - ${product.subCategory || "N/A"}) - ${product.stocksSupplied} units
                    `).join('<br>')}
                </td>
                <td>${supplier.notes}</td>
                <td>
                    <button class="edit-btn" data-id="${supplier._id}">Edit</button>
                    <button class="delete-btn" data-id="${supplier._id}">Delete</button>
                </td>
            </tr>
        `).join('');
    };
    

    // Pagination Controls
    prevButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent, 10);
        if (currentPage > 1) loadSuppliersPage(currentPage - 1);
    });

    nextButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent, 10);
        if (currentPage < totalPages) loadSuppliersPage(currentPage + 1);
    });

    // Edit/Delete Events
    suppliersList.addEventListener('click', (event) => {
        const supplierId = event.target.getAttribute('data-id');
        if (event.target.classList.contains('edit-btn')) {
            fetchSupplierDetails(supplierId);
        } else if (event.target.classList.contains('delete-btn')) {
            deleteSupplier(supplierId);
        }
    });

    searchButton.addEventListener('click', () => {
        const keyword = searchInput.value.trim();
        if (keyword) {
            searchSuppliers(keyword);
        }
    });
    
    clearSearchButton.addEventListener('click', () => {
        searchInput.value = '';
        reloadSuppliersTable(); // Reload all suppliers
    });
    

    // Load Suppliers Page
    const loadSuppliersPage = async (page) => {
        try {
            const response = await fetch(`/api/suppliers?page=${page}&limit=${limit}`);
            const data = await response.json();
    
            suppliersData = data.suppliers; // Cache data for search
            renderSuppliersTable(suppliersData);
            pageNumber.textContent = page;
            totalPages = data.totalPages;
    
            // Update the total pages in the pagination
            document.getElementById('total-pages').textContent = totalPages;
    
            prevButton.disabled = page === 1;
            nextButton.disabled = page === totalPages;
        } catch (error) {
            console.error('Error loading suppliers page:', error);
        }
    };
    
    const loadSuppliersWithFilters = async (page = 1, category = '', subCategory = '', sort = '') => {
        try {
            const response = await fetch(
                `/api/suppliers?page=${page}&limit=${limit}&filter=${encodeURIComponent(category)}&subCategory=${encodeURIComponent(subCategory)}&sort=${encodeURIComponent(sort)}`
            );
            const data = await response.json();
    
            suppliersData = data.suppliers; // Cache filtered data
            renderSuppliersTable(suppliersData);
    
            pageNumber.textContent = page;
            totalPages = data.totalPages;
    
            // Update the total pages in the pagination
            document.getElementById('total-pages').textContent = totalPages;
    
            prevButton.disabled = page === 1;
            nextButton.disabled = page === totalPages;
        } catch (error) {
            console.error('Error loading suppliers with filters:', error);
        }
    };
    
    
    
    const searchSuppliers = async (keyword) => {
        try {
            const currentPage = 1; // Reset to the first page for new search
            const response = await fetch(`/api/suppliers?page=${currentPage}&limit=${limit}&keyword=${encodeURIComponent(keyword)}`);
            const data = await response.json();
    
            suppliersData = data.suppliers; // Cache search results
            renderSuppliersTable(suppliersData);
    
            pageNumber.textContent = currentPage;
            totalPages = data.totalPages;
    
            prevButton.disabled = currentPage === 1;
            nextButton.disabled = currentPage === totalPages;
        } catch (error) {
            console.error('Error searching suppliers:', error);
        }
    };
    
    // Apply Filters and Sorting
    applyFiltersButton.addEventListener('click', () => {
        const category = document.getElementById('filter-category').value; // Filter by category
        const subCategory = document.getElementById('filter-subcategory').value; // Filter by subcategory
        const sortOption = document.getElementById('sort-type').value; // Sorting option
    
        loadSuppliersWithFilters(1, category, subCategory, sortOption); // Pass filters to the function
    });
    

    // Pagination Controls (Updated to use filters and sorting)
    prevButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent, 10);
        if (currentPage > 1) loadSuppliersWithFilters(currentPage - 1);
    });

    nextButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent, 10);
        if (currentPage < totalPages) loadSuppliersWithFilters(currentPage + 1);
    });

    const updatePaginationControls = (currentPage, totalPages) => {
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
    pageNumber.textContent = currentPage;
};


    // Initial Load
    loadSuppliersWithFilters();
    loadSuppliersPage(1); // Initial Load
});
