document.addEventListener('DOMContentLoaded', () => {
    const prevButton = document.getElementById('prev-audit-button');
    const nextButton = document.getElementById('next-audit-button');
    const pageNumber = document.getElementById('audit-page-number');

    let totalPagesPagination = parseInt(document.getElementById('total-audit-pages').textContent);

    let currentFilters = {
        sort: '',
        paymentMethod: '',
        collection: '',
        category: '',
        startDate: '',
        endDate: ''
    };


    const loadPage = async (page) => {
        try {
            const response = await fetch(`/auditLog?page=${page}`, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const result = await response.json();
            const { changes, totalPages } = result;
            const tbody = document.getElementById('audits-list');
            tbody.innerHTML = '';
            document.getElementById('total-audit-pages').textContent = totalPages;
            changes.forEach(audit => {
                const username = audit.username || 'N/A';
                const page = audit.page || 'N/A';
                const dateTime = audit.dateTime || 'N/A';
                const action = audit.action || 'N/A';
                const oldData = audit.oldData || 'N/A';
                const newData = audit.newData || 'N/A';
                const tr = document.createElement('tr');
                tr.classList.add('audits-row');
                tr.innerHTML = `
                    <td>${dateTime}</td>
                    <td>${username}</td>
                    <td>${page}</td>
                    <td>${action}</td>
                    <td>${oldData}</td>
                    <td>${newData}</td>
                `;
                tbody.appendChild(tr);
            });
    
            pageNumber.textContent = page;
            if (totalPages === 0 || totalPages === 1) {
                prevButton.style.display = 'none';
                nextButton.style.display = 'none';
            } else {
                prevButton.style.display = (page === 1) ? 'none' : 'inline';
                nextButton.style.display = (page === totalPages) ? 'none' : 'inline';
            }
        } catch (error) {
            console.error('Error loading page:', error);
        }
    };

    const initialize = () => {
        loadPage(parseInt(pageNumber.textContent));
    };
    

    nextButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent);
        if (currentPage < totalPagesPagination) {
            loadPage(currentPage + 1);
        }
    });

    prevButton.addEventListener('click', () => {
        const currentPage = parseInt(pageNumber.textContent);
        if (currentPage > 1) {
            loadPage(currentPage - 1);
        }
        console.log("CLICKED");
    });

    console.log("CURRENT PAGE: " + parseInt(pageNumber.textContent));
    initialize();
})