document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("expense-modal");
    const addBtn = document.getElementById("add-expense-btn");
    const closeBtn = document.getElementsByClassName("close")[0];
    const form = document.getElementById("expense-form");

    const openModal = () => {
        console.log('Opening modal');
        modal.style.display = "block";
    };

    const closeModal = () => {
        console.log('Closing modal');
        modal.style.display = "none";
        form.reset();
    };

    addBtn.addEventListener('click', async () => {
        document.getElementById("modal-title").innerText = "Add Expense";
        form.reset();
        await fetchCollections();  // Fetch collections when opening the modal
        openModal();
    });

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const expenseId = document.getElementById("expense-id").value;
        const expenseData = {
            name: form.name.value,
            collectionName: form.collection.value,
            date: form.date.value,
            amount: parseFloat(form.amount.value),
            quantity: parseInt(form.quantity.value),
            paymentMethod: form["payment-method"].value,
            category: form.category.value,
            description: form.description.value,
            receiptUrl: form["receipt-url"].value
        };

        // Input validation
        if (expenseData.amount <= 0 || expenseData.quantity <= 0) {
            alert("Amount and Quantity must be greater than zero.");
            return;
        }

        try {
            let response;
            if (expenseId) {
                // Edit expense
                response = await fetch(`/api/expenses/${expenseId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(expenseData)
                });
            } else {
                // Add expense
                response = await fetch('/api/expenses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(expenseData)
                });
            }

            if (response.ok) {
                const successMessage = expenseId ? 'Expense edited successfully!' : 'Expense added successfully!';
                Swal.fire({
                    title: 'Success',
                    text: successMessage,
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.reload();
                });
            } else {
                throw new Error('Failed to save the expense');
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });

    // Function to fetch expense details and populate the form
    const fetchExpenseDetails = (expenseId) => {
        console.log(`Fetching details for expense ID: ${expenseId}`);
        $.ajax({
            url: `/api/expenses/${expenseId}`,
            type: 'GET',
            success: function(response) {
                console.log('Expense details fetched successfully:', response);

                // Populate the form with expense details
                populateForm(response);
            },
            error: function(error) {
                console.error('Error fetching expense:', error);
            }
        });
    };

    // Function to fetch collection data and populate the dropdown
    const fetchCollections = () => {
        console.log('Fetching collections...');
        $.ajax({
            url: '/api/collections',
            type: 'GET',
            success: function(response) {
                console.log('Collections data fetched successfully:', response);
                const collectionSelect = document.getElementById("collection");
                collectionSelect.innerHTML = ""; // Clear any existing options
                response.forEach(collection => {
                    const option = document.createElement('option');
                    option.value = collection.name;
                    option.textContent = collection.name;
                    collectionSelect.appendChild(option);
                });
                console.log('Collections dropdown populated successfully');
            },
            error: function(error) {
                console.error('Error fetching collections:', error);
            }
        });
    };
    

    // Function to populate the form with expense details
    const populateForm = async (expense) => {
        console.log('Populating form with data:', expense);
        await fetchCollections(); // Ensure collections are fetched before populating the form
        $('#expense-id').val(expense._id);
        $('#name').val(expense.name).removeClass('correct-input wrong-input');
        $('#collection').val(expense.collectionName).removeClass('correct-input wrong-input');
        $('#date').val(new Date(expense.date).toISOString().split('T')[0]).removeClass('correct-input wrong-input');
        $('#amount').val(expense.amount).removeClass('correct-input wrong-input');
        $('#quantity').val(expense.quantity).removeClass('correct-input wrong-input');
        $('#payment-method').val(expense.paymentMethod).removeClass('correct-input wrong-input');
        $('#category').val(expense.category).removeClass('correct-input wrong-input');
        $('#description').val(expense.description).removeClass('correct-input wrong-input');
        $('#receipt-url').val(expense.receiptUrl).removeClass('correct-input wrong-input');

        // Update modal title
        $('#modal-title').text('Edit Expense');
    };

    // Attach event listeners to edit buttons
    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            event.preventDefault();
            const expenseId = event.target.dataset.id;
            console.log(`Edit button clicked for expense ID: ${expenseId}`);
            document.getElementById("modal-title").innerText = "Edit Expense";
            openModal();
            fetchExpenseDetails(expenseId);
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const expenseId = event.target.dataset.id;
            const expenseName = event.target.dataset.name;
            console.log(`Delete button clicked for expense ID: ${expenseId}`);
            Swal.fire({
                title: 'Are you sure?',
                text: `Do you want to delete the expense "${expenseName}"?`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, delete it!',
                cancelButtonText: 'No, keep it'
            }).then((result) => {
                if (result.isConfirmed) {
                    fetch(`/api/expenses/${expenseId}`, {
                        method: 'DELETE'
                    }).then(response => {
                        if (response.ok) {
                            Swal.fire(
                                'Deleted!',
                                'Your expense has been deleted.',
                                'success'
                            ).then(() => {
                                window.location.reload();
                            });
                        } else {
                            Swal.fire(
                                'Error!',
                                'Failed to delete the expense.',
                                'error'
                            );
                        }
                    }).catch(error => {
                        console.error("Error deleting expense:", error);
                        Swal.fire(
                            'Error!',
                            'Failed to delete the expense.',
                            'error'
                        );
                    });
                }
            });
        });
    });

    // Fetch collections on page load
    fetchCollections();
});
