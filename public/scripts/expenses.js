document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("expense-modal");
    const addBtn = document.getElementById("add-expense-btn");
    const form = document.getElementById("expense-form");
    const prevButton = document.getElementById('prev-expense-button');
    const nextButton = document.getElementById('next-expense-button');
    const pageNumber = document.getElementById('expense-page-number');
    const closeBtn = modal.querySelector(".close");

    const filterModal = document.getElementById('filter-sort-modal-expense');
    const filterBtn = document.getElementById('expense-filter-sort-btn');
    const closeFilterBtn = filterModal.querySelector(".close");
    const doneBtn = document.getElementById('filter-sort-done-expense');
    const clearBtn = document.getElementById('filter-sort-clear-expense');  

    let totalPagesPagination = parseInt(document.getElementById('total-expense-pages').textContent);

    let categoryChart;
    let totalCostsChart;
    let collectionData = [];
    let currentCollectionIndex = 0;

    let currentFilters = {
        sort: '',
        paymentMethod: '',
        collection: '',
        category: '',
        startDate: '',
        endDate: ''
    };

    const openModal = () => {
        modal.style.display = "block";
    };

    const closeModal = () => {
        modal.style.display = "none";
        form.reset();
    };

    const openFilterModal = () => {
        filterModal.style.display = "block";
    };

    const closeFilterModal = () => {
        filterModal.style.display = "none";
        document.getElementById("filter-sort-form-expense").reset();
    };

    addBtn.addEventListener('click', async () => {
        document.getElementById("modal-title").innerText = "Add Expense";
        form.reset();
        await fetchCollections();
        openModal();
    });

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    filterBtn.addEventListener('click', openFilterModal);
    closeFilterBtn.addEventListener('click', closeFilterModal);

    window.addEventListener('click', (event) => {
        if (event.target === filterModal) {
            closeFilterModal();
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
                    reloadExpensesTable();
                    closeModal();
                });
            } else {
                throw new Error('Failed to save the expense');
            }
        } catch (error) {
            console.error("Error:", error);
        }
    });

    const fetchExpenseDetails = (expenseId) => {
        $.ajax({
            url: `/api/expenses/${expenseId}`,
            type: 'GET',
            success: function(response) {
                populateForm(response);
            },
            error: function(error) {
                console.error('Error fetching expense:', error);
            }
        });
    };

    const fetchCollections = () => {
        $.ajax({
            url: '/api/collections',
            type: 'GET',
            success: function(response) {
                populateCollectionSelect(document.getElementById("collection"), response, false);
                populateCollectionSelect(document.getElementById("filter-collection"), response, true);
            },
            error: function(error) {
                console.error('Error fetching collections:', error);
            }
        });
    };

    const populateCollectionSelect = (selectElement, collections, includeAllOption) => {
        selectElement.innerHTML = "";
        if (includeAllOption) {
            const allOption = document.createElement('option');
            allOption.value = 'All';
            allOption.textContent = 'All';
            selectElement.appendChild(allOption);
        }

        collections.forEach(collection => {
            const option = document.createElement('option');
            option.value = collection.name;
            option.textContent = collection.name;
            selectElement.appendChild(option);
        });
    };

    const populateForm = async (expense) => {
        await fetchCollections();
        $('#expense-id').val(expense._id);
        $('#name').val(expense.name);
        $('#collection').val(expense.collectionName);
        $('#date').val(new Date(expense.date).toISOString().split('T')[0]);
        $('#amount').val(expense.amount);
        $('#quantity').val(expense.quantity);
        $('#payment-method').val(expense.paymentMethod);
        $('#category').val(expense.category);
        $('#description').val(expense.description);
        $('#receipt-url').val(expense.receiptUrl);
        $('#modal-title').text('Edit Expense');
    };

    function fetchExpenseGraphs() {
        $.ajax({
            url: '/api/expense-graphs',
            method: 'GET',
            success: function(response) {
                var expenseAggregations = response.expenseAggregations;
                var collectionAggregations = response.collectionAggregations;

                var categoryData = calculateCategoryData(expenseAggregations);
                var collectionData = calculateCollectionData(collectionAggregations);

                createCategoryPieChart(categoryData);
                createCollectionBarChart(collectionData);
                createOrUpdateTotalCostsChart(collectionData);
            },
            error: function(xhr, status, error) {
                console.error("Error fetching expense graphs:", error);
            }
        });
    }

    function calculateCategoryData(expenseAggregations) {
        const labels = expenseAggregations.map(data => data.category);
        const data = expenseAggregations.map(data => data.totalAmount);

        return { labels, data };
    }

    function calculateCollectionData(collectionAggregations) {
        const collections = [...new Set(collectionAggregations.map(data => data.collectionName))];
        const datasets = collections.map(collection => {
            const data = collectionAggregations.filter(item => item.collectionName === collection)
                                                .map(item => item.totalAmount);
            const labels = collectionAggregations.filter(item => item.collectionName === collection)
                                                 .map(item => item.category);
            return { collection, labels, data };
        });

        return datasets;
    }

    function createCategoryPieChart(categoryData) {
        var categoryChartCtx = document.getElementById('categoryChart').getContext('2d');

        categoryChart = new Chart(categoryChartCtx, {
            type: 'pie',
            data: {
                labels: categoryData.labels,
                datasets: [{
                    data: categoryData.data,
                    backgroundColor: ['#033f63', '#28666e', '#7c9885', '#b5b682', '#fedc97']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 10,
                                color: '#000'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                var label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.raw.toLocaleString();
                                return label;
                            }
                        }
                    },
                    datalabels: {
                        color: '#fff',
                        font: {
                            size: 10
                        },
                        formatter: (value, context) => {
                            let sum = 0;
                            let dataArr = context.chart.data.datasets[0].data;
                            dataArr.map(data => {
                                sum += data;
                            });
                            let percentage = (value * 100 / sum).toFixed(2) + "%";
                            return percentage;
                        }
                    }
                }
            },
            plugins: [ChartDataLabels]
        });
    }

    function createCollectionBarChart(data) {
        collectionData = data;
        var collectionChartCtx = document.getElementById('collectionChart').getContext('2d');

        collectionChart = new Chart(collectionChartCtx, {
            type: 'bar',
            data: {
                labels: collectionData[currentCollectionIndex].labels,
                datasets: [{
                    label: collectionData[currentCollectionIndex].collection,
                    data: collectionData[currentCollectionIndex].data,
                    backgroundColor: ['#033f63', '#28666e', '#7c9885', '#b5b682', '#fedc97']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        stacked: true
                    },
                    y: {
                        stacked: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            font: {
                                size: 10,
                                color: '#000'
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                var label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                label += context.raw.toLocaleString();
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    function updateCollectionBarChart(index) {
        const data = collectionData[index];
        window.collectionChart.data.labels = data.labels;
        window.collectionChart.data.datasets[0].label = data.collection;
        window.collectionChart.data.datasets[0].data = data.data;
        window.collectionChart.update();
    }

    document.getElementById('prevCollection').addEventListener('click', () => {
        currentCollectionIndex = (currentCollectionIndex - 1 + collectionData.length) % collectionData.length;
        updateCollectionBarChart(currentCollectionIndex);
    });

    document.getElementById('nextCollection').addEventListener('click', () => {
        currentCollectionIndex = (currentCollectionIndex + 1) % collectionData.length;
        updateCollectionBarChart(currentCollectionIndex);
    });

    function createOrUpdateTotalCostsChart(data) {
        var totalCostsChartCtx = document.getElementById('totalCostsChart').getContext('2d');

        // Calculate the total costs for all collections
        let labels = data.map(item => item.collection);
        let totalCosts = data.map(item => item.data.reduce((a, b) => a + b, 0));

        if (totalCostsChart) {
            totalCostsChart.data.labels = labels;
            totalCostsChart.data.datasets[0].data = totalCosts;
            totalCostsChart.update();
        } else {
            totalCostsChart = new Chart(totalCostsChartCtx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Total Costs for Collections',
                        data: totalCosts,
                        backgroundColor: '#033f63'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'top',
                            labels: {
                                font: {
                                    size: 10,
                                    color: '#000'
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    var label = context.label || '';
                                    if (label) {
                                        label += ': ';
                                    }
                                    label += context.raw.toLocaleString();
                                    return label;
                                }
                            }
                        }
                    }
                }
            });
        }

        console.log('Total costs chart created or updated:', totalCostsChart);
    }

    const reloadExpensesTable = async () => {
        const page = parseInt(pageNumber.textContent);
        await filterResultExpenses(page);
    };

    const filterResultExpenses = async (page) => {
        const filters = { ...currentFilters };
        if (filters.collection === 'All') {
            delete filters.collection;
        }
        const query = $.param({ ...filters, page });
        try {
            const response = await fetch(`/api/expenses?${query}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            const { expenses, totalPages } = result;
            const tbody = document.getElementById('expenses-list');
            tbody.innerHTML = '';
            document.getElementById('total-expense-pages').textContent = totalPages;
            expenses.forEach(expense => {
                const name = expense.name || 'N/A';
                const collectionName = expense.collectionName || 'N/A';
                const date = expense.date ? new Date(expense.date).toLocaleDateString() : 'N/A';
                const amount = expense.amount || 'N/A';
                const quantity = expense.quantity || 'N/A';
                const paymentMethod = expense.paymentMethod || 'N/A';
                const category = expense.category || 'N/A';
                const description = expense.description || 'N/A';
                const receiptUrl = expense.receiptUrl ? `<a href="${expense.receiptUrl}" target="_blank">View Receipt</a>` : 'No Receipt';
                const tr = document.createElement('tr');
                tr.classList.add('expenses-row');
                tr.innerHTML = `
                    <td>${name}</td>
                    <td>${collectionName}</td>
                    <td>${date}</td>
                    <td>${amount}</td>
                    <td>${quantity}</td>
                    <td>${paymentMethod}</td>
                    <td>${category}</td>
                    <td>${description}</td>
                    <td>${receiptUrl}</td>
                    <td>
                        <button class="edit-btn btn" data-id="${expense._id}">Edit</button>
                        <button class="delete-btn btn" data-id="${expense._id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);

                // Add event listener for edit and delete buttons
                tr.querySelector('.edit-btn').addEventListener('click', () => {
                    document.getElementById("modal-title").innerText = "Edit Expense";
                    openModal();
                    fetchExpenseDetails(expense._id);
                });

                tr.querySelector('.delete-btn').addEventListener('click', () => {
                    const expenseName = name;
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
                            fetch(`/api/expenses/${expense._id}`, {
                                method: 'DELETE'
                            }).then(response => {
                                if (response.ok) {
                                    Swal.fire(
                                        'Deleted!',
                                        'Your expense has been deleted.',
                                        'success'
                                    ).then(() => {
                                        reloadExpensesTable();
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

            pageNumber.textContent = page;
            if (totalPages <= 1) {
                prevButton.style.display = 'none';
                nextButton.style.display = 'none';
            } else {
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
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    };

    nextButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent);
        if (currentPage < totalPagesPagination) {
            if (isFiltersApplied(currentFilters)) {
                filterResultExpenses(currentPage + 1);
            } else {
                loadExpensesPage(currentPage + 1);
            }
        }
    });

    prevButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent);
        if (currentPage > 1) {
            if (isFiltersApplied(currentFilters)) {
                filterResultExpenses(currentPage - 1);
            } else {
                loadExpensesPage(currentPage - 1);
            }
        }
    });

    const loadExpensesPage = async (page) => {
        filterResultExpenses(page);
    };

    // Function to check if filters are applied
    const isFiltersApplied = (filters) => {
        return Object.values(filters).some(value => value);
    };

    doneBtn.addEventListener('click', () => {
        currentFilters.sort = document.getElementById('sorting-expense').value;
        currentFilters.paymentMethod = document.getElementById('filter-payment-method').value;
        currentFilters.collection = document.getElementById('filter-collection').value;
        currentFilters.category = document.getElementById('filter-category').value;
        currentFilters.startDate = document.getElementById('start-date-expense').value;
        currentFilters.endDate = document.getElementById('end-date-expense').value;
        
        reloadExpensesTable();
        closeFilterModal();
    });
    
    clearBtn.addEventListener('click', () => {
        document.getElementById('filter-sort-form-expense').reset();
        currentFilters = {
            sort: '',
            paymentMethod: '',
            collection: '',
            category: '',
            startDate: '',
            endDate: ''
        };
        
        reloadExpensesTable();
        closeFilterModal();
    });

    loadExpensesPage(1);
    fetchExpenseGraphs();
    fetchCollections();
});
