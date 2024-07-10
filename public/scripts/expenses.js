document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById("expense-modal");
    const addBtn = document.getElementById("add-expense-btn");
    const closeBtn = document.getElementsByClassName("close")[0];
    const form = document.getElementById("expense-form");

    const openModal = () => {
        modal.style.display = "block";
    }

    const closeModal = () => {
        modal.style.display = "none";
        form.reset();
    }

    addBtn.addEventListener('click', () => {
        document.getElementById("modal-title").innerText = "Add Expense";
        openModal();
    });

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            closeModal();
        }
    });

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        const expenseId = document.getElementById("expense-id").value;
        const expenseData = {
            name: form.name.value,
            date: form.date.value,
            amount: form.amount.value,
            paymentMethod: form["payment-method"].value,
            category: form.category.value,
            description: form.description.value,
            receiptUrl: form["receipt-url"].value
        };

        try {
            if (expenseId) {
                // Edit expense
                await fetch(`/api/expenses/${expenseId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(expenseData)
                });
            } else {
                // Add expense
                await fetch('/api/expenses', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(expenseData)
                });
            }
            window.location.reload();
        } catch (error) {
            console.error("Error:", error);
        }
    });

    document.querySelectorAll('.edit-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const expenseId = event.target.dataset.id;
            const response = await fetch(`/api/expenses/${expenseId}`);
            const expense = await response.json();

            document.getElementById("expense-id").value = expense._id;
            form.name.value = expense.name;
            form.date.value = new Date(expense.date).toISOString().split('T')[0];
            form.amount.value = expense.amount;
            form["payment-method"].value = expense.paymentMethod;
            form.category.value = expense.category;
            form.description.value = expense.description;
            form["receipt-url"].value = expense.receiptUrl;

            document.getElementById("modal-title").innerText = "Edit Expense";
            openModal();
        });
    });

    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async (event) => {
            const expenseId = event.target.dataset.id;
            if (confirm("Are you sure you want to delete this expense?")) {
                await fetch(`/api/expenses/${expenseId}`, {
                    method: 'DELETE'
                });
                window.location.reload();
            }
        });
    });
});
